const socket = io();
let userId = null;

const getUserId = async () => {
    try {
        const res = await fetch('http://localhost:3000/api/getUserId');
        const data = await res.json();
        userId = data.userId;
    }
    catch (e) {
        console.log(e);
    }
}

getUserId();

const usernameForm = document.querySelector('.usernameForm');
const inputTextForm = document.querySelector('.inputTextForm');
const chats = document.querySelector('.chats');
const userCounter = document.querySelector('.userCounter');
const fontSizeInput = document.querySelector('.fontControl input');
const closeSidebarButton = document.querySelector('.cross');
const openSidebarButton = document.querySelector('.hamBurger');
const sidebar = document.querySelector('.sidebar');
const messageInput = document.querySelector('textarea');


sidebar.style.right = (-(screen.width / 2) - 10) + 'px';

let baseFontSize = 25;

if (screen.width > 1280) {
    baseFontSize = 25;
}
else if (screen.width > 768) {
    baseFontSize = 21;
}
else if (screen.width > 560) {
    baseFontSize = 18;
}
else {
    baseFontSize = 15;
}

let multiplier = 1;




openSidebarButton.addEventListener('click', function (e) {
    sidebar.style.display = 'block';
    sidebar.style.right = '0';
    this.style.pointerEvents = 'none';
    closeSidebarButton.style.pointerEvents = 'all';
});

closeSidebarButton.addEventListener('click', function (e) {
    sidebar.style.right = (-(screen.width / 2) - 10) + 'px';
    this.style.pointerEvents = 'none';
    openSidebarButton.style.pointerEvents = 'all';
    sidebar.style.display = 'none';
});

fontSizeInput.addEventListener('input', function (e) {
    multiplier = this.value;
    for (let chat of chats.children) {
        chat.children[0].children[1].style.fontSize = baseFontSize * multiplier + 'px';
    }
});

usernameForm.addEventListener('submit', function (e) {

    e.preventDefault();
    document.querySelector('.room').style.display = 'flex';
    document.querySelector('.prompt').style.display = 'none';
    let username = usernameForm.elements.username.value.trim();
    if (username === '') {
        username = 'anonymous';
    }
    let roomId = usernameForm.elements.roomId.value;
    const data = { userId, username, roomId };
    socket.emit('clientInfo', data);
    openSidebarButton.style.display = 'block';
});


const sendMessage = (inputText) => {
    inputText = inputText.trim();
    if (inputText !== "") {
        socket.emit('chatMessage', inputText);
    }
    inputTextForm.elements.inputText.value = "";
}


messageInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messageInput.value);
    }
});


inputTextForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(messageInput.value);
});


const createChat = (data) => {
    const chat = document.createElement('li');
    const div = document.createElement('div');
    chat.append(div);
    const name = document.createElement('h4');
    const text = document.createElement('h3');

    const { userId: uId, socketId, message, username } = data;

    name.innerText = username;
    text.innerText = message;
    div.append(name);
    div.append(text);

    chat.classList.add('chat');
    name.style.fontWeight = '300';
    text.style.fontWeight = '400';
    text.style.fontSize = baseFontSize * multiplier + 'px';

    if (socketId === socket.id || (uId && uId === userId)) {
        console.log(socketId, socket.id, uId, userId);
        chat.style.flexDirection = 'row-reverse';
        chat.style.color = '#FFDFD6';
        name.innerText = 'You';
    }

    chats.appendChild(chat);
}

socket.on('redirect', (redirectUrl) => {
    window.location.href = redirectUrl;
});

socket.on('roomDeleted', (redirectUrl) => {
    window.location.href = redirectUrl + '?flash=The room has been deleted !';
});

socket.on('oldMessages', (data) => {
    for (let msg of data) {
        createChat(msg);
    }
});

socket.on('chatMessage', (data) => {
    createChat(data);
});


socket.on('userConnected', (data) => {
    userCounter.innerText = data + ' online';
});

socket.on('userDisconnected', (data) => {
    userCounter.innerText = data + ' online';
});
