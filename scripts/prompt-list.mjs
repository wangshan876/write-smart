import {addToPromptCollection, getData, deleteFromPromptCollection,savePrompt,saveSubTaskPrompt } from './dataStorage.mjs';
import { toast,copyToClipboard } from './common.js';
const apiSelect = document.getElementById('api-select');
const promptInput = document.getElementById('prompt-input');
const subPromptInput = document.getElementById('sub-prompt-input');
const modelSelect = document.getElementById('model-select');
const modalHtml = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h4>添加新的Prompt</h4>
            <div class="promptInputArea">
                <textarea  id="promptInput" placeholder="输入提示"></textarea>
                <button id="addPrompt">添加提示</button>
            </div>
            <br>
            <h4>这里是Prompt列表</h4>
            <ul id="promptList"></ul>
        </div>
`
const modalView = document.getElementById('modal')
const openModalBtn = document.getElementById('open-modal')

async function update(){ 
    // 获取存储的默认模型和 Prompt
    const data = await getData();
    if (data) {
        apiSelect.value = data.provider;
        modelSelect.value = data.model;
        promptInput.value = data.prompt;
        subPromptInput.value = data.subTaskPrompt;
    }
}
openModalBtn.onclick =  function() {
    if(!modalView.querySelector('.modal-content')) {
        modalView.innerHTML = modalHtml;
        modalView.querySelector('.close').onclick = function() {
            document.getElementById('modal').style.display = 'none';
        }
        modalView.querySelector('#addPrompt').onclick =async function() {
            const promptInput = modalView.querySelector('#promptInput').value;
            if (promptInput) {
                await addToPromptCollection(promptInput);
                toast('添加成功!');
                modalView.querySelector('#promptInput').value = '';
                loadPrompts();
            }
        }
    }
    modalView.style.display = 'block';
    loadPrompts();
}

async function loadPrompts() {
    const promptList = modalView.querySelector('#promptList');
    promptList.innerHTML = ''; // 清空列表
    const prompts = await getData('prompt-collection');
    if (!(prompts && prompts.collection)) {
        return [];
    }
    prompts.collection.forEach((prompt, index) => {
        const li = document.createElement('li');
        const btns = document.createElement('div');
        btns.classList.add('group')
        li.textContent = prompt;
        //删除按钮
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.onclick = async  function() {
            await deleteFromPromptCollection(index);
            toast('删除成功');
            loadPrompts(); // 重新加载列表
        };
        //设置全局prompt的button
        const setGlobalPromptButton = document.createElement('button');
        setGlobalPromptButton.textContent = '全局';
        setGlobalPromptButton.onclick = async  function() {
            const text = li.childNodes[0].textContent
            if(text) {
                await savePrompt(text);
                toast('设置全局Prompt成功!');
                await update()
            }
            
        };
        //子任务prompt button
        const setSubTaskPromptButton = document.createElement('button');
        setSubTaskPromptButton.textContent = '子任务';
        setSubTaskPromptButton.onclick = async  function() {
            const text = li.childNodes[0].textContent
            if(text) {
                await saveSubTaskPrompt(text);
                toast('设置子任务Prompt成功!');
                await update()
            }
        };
        
        //copy
        const copyButton = document.createElement('button');
        copyButton.textContent = '复制';
        copyButton.onclick = function() {
            const text = li.childNodes[0].textContent
            text && copyToClipboard(text);
        }
        btns.appendChild(deleteButton);
        btns.appendChild(copyButton);
        btns.appendChild(setGlobalPromptButton);
        btns.appendChild(setSubTaskPromptButton);
        li.appendChild(btns);

        promptList.appendChild(li);
    });
}