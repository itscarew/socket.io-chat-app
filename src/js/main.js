//get form element
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//initialize socket.io here
const socket = io();

//Join Chat room
socket.emit("joinRoom", { username, room });

//Get room and users
socket.on("roomusers", ({ room, users }) => {
  outputRoomName(room);
  outputUser(users);
});

// Output Message from Server
socket.on("message", (message) => {
  outputMessage(message);


  //Scroll down everythime w eget a message
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submission
chatForm.addEventListener("submit", (e) => {
  //prevent page from reloading
  e.preventDefault();

  //get message text from input
  const msg = e.target.elements.msg.value;

  //emit message to server
  socket.emit("chat-message", msg);

  //CLear out the input
  e.target.elements.msg.value = "";
  //Focus on the input after submission
  e.target.elements.msg.focus;
});

//output mesage function
const outputMessage = (message) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

  document.querySelector(".chat-messages").appendChild(div);
};

//Add room name to dom
const outputRoomName = (room) => {
  roomName.innerText = room;
};

//Add List of users
const outputUser = (users) => {
  userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join("")}`;
};
