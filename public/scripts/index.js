const search = document.querySelector('.search');
const rooms = Array.from(document.querySelectorAll('.room'));
const roomsContainer = document.querySelector('.rooms');
const closeSidebarButton = document.querySelector('.cross');
const openSidebarButton = document.querySelector('.user');
const sidebar = document.querySelector('.sidebar');



sidebar.style.right = (-(screen.width / 2) - 10) + 'px';


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

for (let room of rooms) {
    const roomName = room.children[0];
    const joinForm = room.children[1];

    joinForm.addEventListener('submit', async function (e) {
        e.preventDefault();
    });

    const joinBtnIdx = joinForm.length < 3 ? 0 : 1;
    const backBtnIdx = joinBtnIdx + 1;

    const joinBtn = joinForm.children[joinBtnIdx].children[0];
    joinBtn.addEventListener('click', function (e) {
        const password = joinForm.password.value;
        this.href += password;
    });

    roomName.addEventListener('click', (e) => {
        e.preventDefault();
        joinForm.style.display = 'flex';
        roomName.style.display = 'none';
    });

    const backButton = joinForm.children[backBtnIdx];
    backButton.addEventListener('click', (e) => {
        joinForm.style.display = 'none';
        roomName.style.display = 'inline';
        joinForm.elements.password.value = "";
    });
}

search.addEventListener('input', function (e) {
    const query = this.value;
    const matchingRooms = rooms.filter(room => {
        const roomName = room.children[0].innerText;
        if (roomName.slice(0, query.length).toLowerCase() === query.toLowerCase()) return true;
        return false;
    });

    roomsContainer.innerHTML = '';
    matchingRooms.forEach(room => roomsContainer.appendChild(room));
});