const roomName = JSON.parse(document.getElementById('json-roomname').textContent);
const userName = JSON.parse(document.getElementById('json-username').textContent);
const chatSocket = new WebSocket('ws://'+ window.location.host+ '/ws/'+ roomName+ '/');

function setusername(){
    chatSocket.send(JSON.stringify({
          "code": "setusername",
          username: userName,
        })
    );
}

function show_text(msg, username){
    var node = document.createElement("div");
    const textnode = document.createTextNode(username + " : " + msg);
    node.appendChild(textnode);
    document.getElementById("chat-messages").appendChild(node);
    scrollToBottom();
}

function Return_login(){
    console.log("Go back to login screen")
    window.location.replace('/')
}

chatSocket.onclose = function(e) {
    console.error('The socket closed unexpectedly');
};
chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    switch(data['code']){
        case "getusername":
            setusername();
            break;
        case "printtext":
            show_text(data['msg'], data['username']);
            break;
        case "exit":
            Return_login();
            break;
        default:
            alert("This should not happen")
    }
};

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.keyCode === 13) {
        document.querySelector('#chat-message-submit').click();
    }
};
document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        'code':"text",
        'message': message,
        'username': userName,
    }));
    messageInputDom.value = '';
};


/**
 * A function for findind the messages element, and scroll to the bottom of it.
 */
function scrollToBottom() {
    let objDiv = document.getElementById("chat-messages");
    objDiv.scrollTop = objDiv.scrollHeight;
}

// Add this below the function to trigger the scroll on load.
scrollToBottom();