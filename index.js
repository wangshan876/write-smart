import { initDB, saveApiKeys, getData, saveModel, savePrompt, saveProvider, saveSubTaskPrompt } from './scripts/dataStorage.mjs';
import {
    ollamaModels,
    deepseekApiKeyInput,
    deepseekApiKey,
    modelSelect,
    setPromptBtn,
    AIStart,
    modalOverlay,
    promptModal,
    closeModalBtn,
    promptInput,
    subPromptInput,
    editableContent,
    output,
    clearBtn,
    aiClearBtn,
    AIColumn,
    AIColumnOutput,
    apiSelect,
    floatmenu,
    floatbutton,
    inputMode,
    aiCopyBtn,
    studyPromptInput
} from './scripts/dom.mjs'
import { copyToClipboard } from './scripts/common.js';

import {
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
} from './scripts/handles.mjs'
floatmenu.classList.add('floatmenu');
// 初始化设置
async function setup() {
    await initDB();
    console.log('Database initialized');

    // 从本地 Ollama 接口获取可用模型
    const models = await fetchModels();
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });

    // 取得本地存储变量
    await loadConfigs()

    // 事件监听
    setupEventListeners();
}
async function loadConfigs() {
    // 获取存储的默认模型和 Prompt
    const data = await getData() || {};
    const {provider,model,prompt,subTaskPrompt,apikeys} = data;
    apiSelect.value = provider;
    modelSelect.value = model;
    promptInput.value = prompt;
    subPromptInput.value = subTaskPrompt;
    deepseekApiKey.value = apikeys?.deepseek;
}

// 设置事件监听
function setupEventListeners() {
    modelSelect.addEventListener('change', async () => {
        await saveModel(modelSelect.value);
    });

    setPromptBtn.addEventListener('click', () => {
        modalOverlay.style.display = 'block';
        promptModal.style.display = 'block';
    });

    AIStart.addEventListener('click', async () => {
        switch (inputMode.value) {
            case '0': //分段
                await fetchDataSequentially();
                break;
            case '2': //全文
                await fetchAllData();
                break;
            case '3': //全文
                await handleStudyType();
                break;
            default:
                break;
        }
    });

    closeModalBtn.addEventListener('click', async () => {
        modalOverlay.style.display = 'none';
        promptModal.style.display = 'none';
        await savePrompt(promptInput.value);
        await saveSubTaskPrompt(subPromptInput.value);
    });


    // modalOverlay.addEventListener('click', () => {
    //     modalOverlay.style.display = 'none';
    //     promptModal.style.display = 'none';
    // });

    apiSelect.addEventListener('change', async () => {
        if (apiSelect.value === "ollama") {
            ollamaModels.style.display = "block";
            deepseekApiKeyInput.style.display = "none";
        } else if (apiSelect.value === "deepseek") {
            ollamaModels.style.display = "none";
            deepseekApiKeyInput.style.display = "block";
        }
        await saveProvider(apiSelect.value);
    });
    inputMode.addEventListener('change', async () => {
        if (inputMode.value === '3') {
            studyPromptInput.style.display = "block";
            promptInput.value = studyPromptInput.value;
        } else {
            studyPromptInput.style.display = "none";
        }
    });
    if (apiSelect.value === "ollama") {
        ollamaModels.style.display = "block";
        deepseekApiKeyInput.style.display = "none";
    } else if (apiSelect.value === "deepseek") {
        ollamaModels.style.display = "none";
        deepseekApiKeyInput.style.display = "block";
    }

    deepseekApiKey.addEventListener('change', async () => {
        await saveApiKeys(apiSelect.value,deepseekApiKey.value);
    })

    editableContent.addEventListener('paste', handlePaste);

    editableContent.addEventListener('keyup', handleInput);

    clearBtn.addEventListener('click', clearOutput);
    aiClearBtn.addEventListener('click', clearAIOutput);
    output.addEventListener('mouseover', handleOutputMouseOver);
    AIColumn.addEventListener('mouseover', handleAIColumnMouseOver);
    aiCopyBtn.addEventListener('click', () => copyToClipboard(AIColumnOutput.textContent));
    delObserver()
}

// 启动设置
setup();
