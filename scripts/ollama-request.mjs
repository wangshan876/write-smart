export async function generateChatCompletion(model = "deepseek-chat",apiKey='', system='', messages, displayNodeId, stream = true,responsetype="display") {
    const headers = { 'Content-Type': 'application/json' };
    let url = 'http://localhost:11434/api/chat';
    if (model === 'deepseek-chat') {
        headers['Authorization'] = `Bearer ${apiKey}`;
        url = 'https://api.deepseek.com/chat/completions';
    }


    const payload = createPayload(model, system, messages,stream);
    let response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    })
    if (responsetype=="display") {
        await handleResponse(response, model, displayNodeId);
    } else {
        const result = await response.json();
        if (model === 'deepseek-chat') {
            return result.choices[0].message.content;
        }
        else {
            return  result.message.content;

        }
    }
}

function createPayload(model, system, messages,stream) {
    return {
        model: model,
        messages: [
            { "role": "system", "content": system },
            { "role": "user", "content": messages }
        ],
        stream: stream,
        frequency_penalty: 1,
        temperature: 0.5,
        top_p: 0.2
    };
}

async function handleResponse(response, model, displayNodeId) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const displayNode = document.getElementById(displayNodeId);
    const displayTextNode = displayNode.childElementCount > 0 ? displayNode.childNodes[0] : displayNode;

    let isHandling = true;

    while (isHandling) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        isHandling = model === 'deepseek-chat' ? handleDeepSeekChatChunk(chunk, displayNode, displayTextNode) : handleOtherModelChunk(chunk, displayNode);
    }
}

function handleDeepSeekChatChunk(chunk, displayNode, displayTextNode) {
    let isHandling = true;

    for (const line of chunk.trim().split('data:')) {
        if (line) {
            if (line.match('[DONE]')) {
                isHandling = false;
                break;
            } else {
                const chunkJson = JSON.parse(line);
                const chatId = displayNode.getAttribute('chatid');

                if (chatId !== chunkJson.id) {
                    displayTextNode.textContent = '';
                }

                displayNode.setAttribute('chatid', chunkJson.id);
                chunkJson.choices.forEach(choice => {
                    if (choice.delta.content) {
                        displayTextNode.textContent += choice.delta.content;
                    }
                });
            }
        }
    }

    return isHandling;
}

function handleOtherModelChunk(chunk, displayNode) {
    const chunkJson = JSON.parse(chunk);
    if (chunkJson.message.content) {
        displayNode.innerText += chunkJson.message.content;
    }
    return true; // Assuming we want to continue handling
}
