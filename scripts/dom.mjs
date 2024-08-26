// DOM 元素选择
const ollamaModels = document.getElementById('ollama-models-select');
const modelSelect = document.getElementById('model-select');
const deepseekApiKeyInput = document.getElementById('deepseek-apikey-input');
const deepseekApiKey = deepseekApiKeyInput.querySelector('#apikey')

const setPromptBtn = document.getElementById('set-prompt-btn');
const AIStart = document.getElementById('ai-start');
const modalOverlay = document.getElementById('modal-overlay');
const promptModal = document.getElementById('prompt-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const promptInput = document.getElementById('prompt-input');
const subPromptInput = document.getElementById('sub-prompt-input');

const editableContent = document.getElementById('editable-content');
const output = document.getElementById('output');
const clearBtn = document.getElementById('clear-btn');
const aiCopyBtn = document.getElementById('ai-copy');
const aiClearBtn = document.getElementById('ai-clear-btn');
const AIColumn = document.getElementById('ai-output-column');
const AIColumnOutput = AIColumn.querySelector('.output');
const apiSelect = document.getElementById('api-select');
const floatmenu = document.createElement('div');
const floatbutton = document.createElement('button');
const inputMode = document.getElementById('input-mode');
const studyPromptInput = document.getElementById('study-prompt-input');

export {
  ollamaModels,
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
  studyPromptInput,
  deepseekApiKeyInput,
  deepseekApiKey
}