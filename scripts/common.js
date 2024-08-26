const style = document.createElement('style')
style.innerHTML = `
.toast {
    visibility: visible;
    opacity: 1;
    margin-left: -125px; /* 居中 */
    background-color: #333;
    color: yellow;
    text-align: center;
    border-radius: 5px;
    padding: 5px 20px;
    position: fixed;
    z-index: 9999;
    left: 50%;
    bottom: 30px; /* 距离底部的距离 */
    font-size: 17px;
    transition: visibility 0s, opacity 0.5s linear;
    opacity: 0.8;
}
.loading:after {
    content: "";
    position: absolute;
    bottom: 1px;
    right: 1px;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border: 3px solid #943434;
    border-top: 3px solid #ff0000;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    box-sizing: border-box;
}
`
document.head.appendChild(style)

function toast(text, duration = 3000, isconsole = false) {
    const toastNode = document.createElement('div')
    toastNode.classList.add('toast')
    if(isconsole){
        toastNode.style.left = '50% !important'
        toastNode.style.bottom = '30px !important'
        toastNode.style.backgroundColor = '#333 !important'
        toastNode.style.color = '#yellow !important'
    }
    toastNode.textContent = text
    document.body.appendChild(toastNode)
    setTimeout(() => {
        toastNode.remove();
    }, 3000);
}


function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        toast('复制成功！')
    })
}

function loadingStyle(node,finish_flag = '') {
    if(finish_flag = "finished") {
        node.classList.remove('loading')
    } else {
        node.classList.add('loading')
    }
}

export {
    toast,
    copyToClipboard,
    loadingStyle
}