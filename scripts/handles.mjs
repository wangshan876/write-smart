import { generateChatCompletion } from './ollama-request.mjs';

import {
    modelSelect,
    promptInput,
    editableContent,
    output,
    AIColumn,
    AIColumnOutput,
    apiSelect,
    floatmenu,
    floatbutton,
    inputMode,
    deepseekApiKey
} from './dom.mjs'

import { toast, loadingStyle } from './common.js';
const splitRegex = /[\.\!\?;。！？；]/g;
// const sentenceSeparators = ['Enter', '.', '!', '?', ',', ';', '。', '！', '？', '，', '；'];
const sentenceSeparators = ['Enter', '.', '!', '?', ';', '。', '！', '？', , '；'];

async function handleInput(event) {
    if (sentenceSeparators.includes(event.key) || (event.shiftKey && (event.code == 'Digit1' || event.code == 'Slash'))) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            //输出栏添加换行符
            AIColumnOutput.innerHTML += '<br>';
        } else {
            if (inputMode.value === '1') {
                event.preventDefault(); // 阻止默认粘贴行为
                const last_child_index = editableContent.childNodes.length - 1;
                if (last_child_index < 0) return;
                const last_child = editableContent.childNodes[last_child_index];
                const last_symbol = last_child.textContent[last_child.textContent.length - 1].match(splitRegex)?.filter(Boolean)
                if (last_symbol) {
                    const strs = last_child.textContent.split(splitRegex).filter(Boolean);
                    const last_sentence = strs[strs.length - 1] + last_symbol[0]
                    const content = editableContent.textContent;

                    const startIndex = content.indexOf(last_sentence);
                    const endIndex = startIndex + last_sentence.length;
                    const outspanid = 'out-' + startIndex + '-' + endIndex
                    if (document.getElementById(outspanid)) {
                        return;
                    }
                    const span = document.createElement('span')
                    span.id = outspanid
                    span.setAttribute("endIndex", endIndex)
                    span.setAttribute("startIndex", startIndex)
                    AIColumnOutput.appendChild(span)
                    const response = await generateChatCompletion(getModel(),deepseekApiKey.value, promptInput.value, last_sentence, outspanid);

                }


            }
        }

    }


}

function selectionText(textnode, startIndex, endIndex) {
    const range = document.createRange();
    // 设置 Range 对象的起始和结束位置
    range.setStart(textnode.childNodes[0], startIndex);
    range.setEnd(textnode.childNodes[0], endIndex);

    // 获取 Selection 对象
    const selection = window.getSelection();

    // 清除当前的选择
    selection.removeAllRanges();

    // 添加新的 Range 对象到 Selection 中
    selection.addRange(range);

}


// 处理粘贴事件
function handlePaste(event) {
    if (inputMode.value === '0') { //分段
        event.preventDefault(); // 阻止默认粘贴行为
        const text = event.clipboardData.getData('text/plain'); // 获取粘贴的文本
        const lines = text.split('\n'); // 按换行符分组

        // 清空可编辑元素内容
        editableContent.innerHTML = '';
        editableContent.style.display = 'none';

        // 将分组的文字插入到输出区域
        output.innerHTML = lines.map((line, i) => {
            if (line.trim().length == 0) return '';
            return `<p id="input${i}">${line}</p>`;
        }).join('');
    }

}

// 清空输出区域
function clearOutput() {
    output.innerHTML = '';
    editableContent.style.display = 'block';
    editableContent.innerHTML = '';
    editableContent.focus(); // 聚焦到可编辑元素
}
// 清空输出区域
function clearAIOutput() {
    AIColumnOutput.innerHTML = '';
}

// 处理输出区域鼠标悬停事件
function handleOutputMouseOver(e) {
    if (e.target.tagName.toLowerCase() === 'p') {
        const hoverElements = document.querySelectorAll('.hover');
        hoverElements.forEach(element => {
            element.classList.remove('hover');
        });

        e.target.classList.add('hover');

        const aid = e.target.id.replace('input', 'ai-output');
        const AI_text = AIColumn.querySelector('#' + aid);
        AI_text && AI_text.scrollIntoView({ behavior: 'smooth', block: 'start' })
        AI_text?.classList.add('hover');
    }
}

// 处理 AI 列表鼠标悬停事件
function handleAIColumnMouseOver(e) {
    if (e.target.tagName.toLowerCase() === 'p') { //分段
        const hoverElements = document.querySelectorAll('.hover');
        hoverElements.forEach(element => {
            element.classList.remove('hover');
        });
        e.target.classList.add('hover');

        const aid = e.target.id.replace('ai-output', 'input');
        const textnode = output.querySelector('#' + aid);
        textnode && textnode.scrollIntoView({ behavior: 'smooth', block: 'start' })

        textnode?.classList.add('hover');
    } else if (e.target.tagName.toLowerCase() === 'span' && e.target.hasAttribute('startindex')) {
        const startIndex = e.target.getAttribute('startindex');
        const endIndex = e.target.getAttribute('endindex');
        selectionText(editableContent, startIndex, endIndex)
    } else {
        const selection = window.getSelection();
        selection.removeAllRanges();
    }
}
// 全文
async function fetchAllData() {
    const text = editableContent.textContent
    if (!text) toast('内容为空！')
    const response = await generateChatCompletion(getModel(),deepseekApiKey.value, promptInput.value, text, AIColumnOutput.id);

}
// 按顺序获取数据
async function fetchDataSequentially() {
    const pNodes = output.querySelectorAll('p');
    for (const p of pNodes) {
        if (p.textContent.trim().length == 0) continue;
        const outp = document.createElement('p');
        const id = p.id.replace('input', 'ai-output');
        outp.id = id;

        outp.addEventListener('click', function () {
            const existingFloat = document.querySelector('.floatmenu');
            existingFloat?.remove();
            outp.appendChild(cloneWithEvents());
        });

        AIColumnOutput.appendChild(outp);
        const text = p.textContent;
        p.classList.add('loading');
        const response = await generateChatCompletion(getModel(),deepseekApiKey.value, promptInput.value, text, id);
        p.classList.remove('loading');

        await new Promise(resolve => setTimeout(resolve, 600));
    }

    toast('所有请求已完成');
}

// 获取模型
async function fetchModels() {
    return fetch('http://localhost:11434/api/tags')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => data.models)
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            return [];
        });
}

function getModel() {
    const provider = apiSelect.value;
    const model = modelSelect.value;
    if (provider == 'deepseek') {
        return 'deepseek-chat';
    } else if (provider == 'ollama') {
        return model;
    }
    return null;
}

// 克隆带事件的浮动菜单
function cloneWithEvents() {
    const menu = floatmenu.cloneNode(true);
    const floatAIUpdateBtn = createFloatButton("重新生成", handleAIUpdate);
    const floatEditBtn = createFloatButton("编辑", handleEdit);
    const floatDelBtn = createFloatButton("删除", handleDelete);

    menu.append(floatAIUpdateBtn, floatEditBtn, floatDelBtn);
    return menu;
}

// 创建浮动按钮
function createFloatButton(text, clickHandler) {
    const button = floatbutton.cloneNode(true);
    button.textContent = text;
    button.addEventListener('click', clickHandler);
    return button;
}

// 处理 AI 更新
async function handleAIUpdate(e) {
    const target = e.target.closest('p');
    const buttonTexts = target.querySelector('.floatmenu').textContent;
    const text = target.textContent.replaceAll(buttonTexts, '');
    const model = modelSelect.value;
    const id = target.id;
    const subPrompt = '只输出结果，模仿鲁迅文章风格，润色用户输入文字'; //@test
    await generateChatCompletion(getModel(),deepseekApiKey.value, subPrompt, text, id);
}

// 处理编辑
function handleEdit(e) {
    const target = e.target.closest('p');
    target.classList.add("editable");
    target.setAttribute("contenteditable", "true");
}

// 处理删除
function handleDelete(e) {
    const target = e.target.closest('p');
    target?.remove();
}
function delObserver() {

    // 创建 MutationObserver 对象
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // 检查是否有文本被删除
            if (mutation.type === 'characterData' && mutation.oldValue.length >= editableContent.textContent.length) {
                // 获取被删除的文本
                const deletedText = mutation.oldValue.substring(editableContent.textContent.length);
                // 输出被删除的文本
                if (deletedText.match(splitRegex)) {
                    const endIndex = mutation.oldValue.indexOf(deletedText) + 1
                    const rmnode = document.querySelector('span[endIndex="' + endIndex + '"]')
                    rmnode && rmnode.remove();
                }

            }
        });
    });

    // 配置 MutationObserver 观察选项
    const observerConfig = {
        characterData: true,
        characterDataOldValue: true,
        subtree: true
    };

    // 开始观察 editableElement 的变化
    observer.observe(editableContent, observerConfig);

}
async function generateSentens(len = 5, lang = '日语') {
    const response = await generateChatCompletion(getModel(),deepseekApiKey.value, '', promptInput.value, null, false, 'result');
    if (!response) return;
    const jsonstr = response.slice(response.indexOf("{"),response.lastIndexOf('}')+1)
    const result = JSON.parse(jsonstr)
    return result.data
}
async function handleStudyType() {
    // 清空可编辑元素内容
    const data = await generateSentens()
    editableContent.innerHTML = '';
    editableContent.style.display = 'none';
    // 将分组的文字插入到输出区域
    const p = document.createElement('p')
    p.textContent = data[1]
    p.setAttribute('text', data[0])
    p.id = "input-"+btoa(unescape(encodeURIComponent(data[0]))).replace( /[^a-zA-Z0-9_.-]/g,'');
    output.appendChild(p);
    const p2 = document.createElement('p')
    p2.id = "ai-output" +btoa(unescape(encodeURIComponent(data[0]))).replace( /[^a-zA-Z0-9_.-]/g,'')
    p2.setAttribute('text', data[0])
    p2.setAttribute('contenteditable', 'true')
    p2.setAttribute('prompt', `扮演打字机，请校验用户的输入是否遵从原文"${data[0]}"，用中文回答`)
    p2.addEventListener('input', handleInputCheck);
    AIColumnOutput.appendChild(p2);
}
async function handleInputCheck(e) {
    const target = e.target;
    const text = target.textContent;
    if (text.match(/a-z/)　|| text[text.length - 1] !== '。') return;
    const prompt = target.getAttribute('prompt');
    const id = target.id;
    const model = modelSelect.value;
    const result = await generateChatCompletion(model,deepseekApiKey.value, prompt, text, null,false, 'result');
    toast(result,4000,true)
}
export {
    handleInput,
    handlePaste,
    clearOutput,
    clearAIOutput,
    handleOutputMouseOver,
    handleAIColumnMouseOver,
    fetchDataSequentially,
    fetchModels,
    delObserver,
    fetchAllData,
    handleStudyType

}