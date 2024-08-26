// dataStorage.mjs

const DB_NAME = 'AIModelDB';
const STORE_NAME = 'models';
const VERSION = 1;

let db;
function storeCheck(currentData,key='default') {
    let data = currentData || {};
    data['id'] = key;
    return data;
}

// 初始化 IndexedDB
export function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };

        request.onerror = (event) => {
            reject('Database error: ' + event.target.errorCode);
        };
    });
}



// 通用的读取数据函数
export function getData(id="default") {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id); // 获取固定 ID 的数据

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject('Error retrieving data: ' + event.target.errorCode);
        };
    });
}

// 存储数据的通用函数
export function saveData(data,id="default") {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        data['id'] = id; 
        const request = store.put(data);

        request.onsuccess = () => {
            resolve('Data saved successfully');
        };

        request.onerror = (event) => {
            reject('Error saving data: ' + event.target.errorCode);
        };
    });
}

// 存储提供者
export function saveProvider(provider) {
    return getData().then(currentData => {
        let data = storeCheck(currentData)
        data['provider'] = provider
        return saveData(data);
    });
}

// 存储模型
export function saveModel(model) {
    return getData().then(currentData => {
        let data = storeCheck(currentData)
        data['model'] = model
        return saveData(data);
    });
}
export function saveApiKeys(provider='deepseek',apikey) {
    return getData().then(currentData => {
        let data = storeCheck(currentData)
        let apikeyData = currentData.apikeys || {};
        apikeyData[provider] = apikey;
        data['apikeys'] = apikeyData
        return saveData(data);
    });
}

// 存储提示
export function savePrompt(prompt) {
    return getData().then(currentData => {
        
        let data = storeCheck(currentData)
        data['prompt'] = prompt
        return saveData(data);
    });
}
// 存储提示
export function saveSubTaskPrompt(prompt) {
    return getData().then(currentData => {
        let data = storeCheck(currentData)
        data['subTaskPrompt'] = prompt
        return saveData(data);
    });
}
export function addToPromptCollection(prompt) {
    return getData('prompt-collection').then(currentData => {
        let collection = currentData&&currentData.collection?[].concat(currentData.collection,prompt):[prompt]
        const data = {
            id: 'prompt-collection', // 使用固定的 ID
            collection: collection,
        };
        return saveData(data,"prompt-collection");
    });
}

export function deleteFromPromptCollection(index) {
    if(typeof index !== 'number' || index < 0) return;
    return getData('prompt-collection').then(currentData => {
       let collection = currentData&&currentData.collection?currentData.collection:[]
        const data = {
            id: 'prompt-collection', // 使用固定的 ID
            collection: [].concat(collection.slice(0,index),collection.slice(index+1)),
        };
        return saveData(data,"prompt-collection");
    });
}