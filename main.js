const socket = io.connect("http://localhost:4000");

let username = prompt("Enter Your name");

username = username.toUpperCase();

// new user join the room
socket.emit("join", username);

const joinedContainer = document.getElementById("joined-container");
const sendButton = document.getElementById("send-button");
const chatInput = document.getElementById("chat-input");
const chatContainer = document.getElementById("chat-container");
const notification = document.getElementById("notification");

// formatting the date to give only time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// updates the users in the joined-container
const updateUsersList = (users) => {
  joinedContainer.innerHTML = "";
  users.forEach((user) => {
    const userElement = document.createElement("div");
    const userName = document.createElement("h1");
    userName.textContent = user.name;
    const status = document.createElement("span");
    userElement.appendChild(userName);
    userElement.appendChild(status);
    joinedContainer.appendChild(userElement);
  });
};

// Loads the previous message

socket.on("load", (data) => {
  const { users, chats } = data;
  joinedContainer.innerHTML = "";
  chatContainer.innerHTML = "";
  // Display joined users
  users.forEach((user) => {
    const userElement = document.createElement("div");
    const userName = document.createElement("h1");
    userName.textContent = user.name;
    const status = document.createElement("span");
    userElement.appendChild(userName);
    userElement.appendChild(status);
    joinedContainer.appendChild(userElement);
  });

  // Display previous chats
  chats.forEach((chat) => {
    const user = users.find((user) => user.name === chat.name);
    const profileImg = user ? user.profileImage : "";
    const chatElement = document.createElement("div");
    if (chat.name === username) {
      chatElement.classList.add("my-message");
      chatElement.innerHTML = `
        <div class="user">
                <img src="${profileImg}" alt="${
        chat.name
      }" class="profile-image">
        </div>
        <div class="chat-detail">
        <p>${chat.name}</p>
        <p>${chat.message}</p>
        <p>${formatTime(chat.createdOn)}</p>
        </div>
        `;
    } else {
      chatElement.classList.add("other-message");
      chatElement.innerHTML = `
        <div class="user">
                <img src="${chat.profileImage}" alt="${
        chat.name
      }" class="profile-image">
        </div>
        <div class="chat-detail">
        <p>${chat.name}</p>
        <p>${chat.message}</p>
        <p>${formatTime(chat.createdOn)}</p>
        </div>
        `;
    }

    chatContainer.appendChild(chatElement);
  });
  notification.innerHTML = `<h1>Welcome ${username}</h1>`;
  chatContainer.scrollTop = chatContainer.scrollHeight;
});

// displays the new message to every active user
socket.on("newMessage", (data) => {
  const profileImg = data.profileImage;
  const chatElement = document.createElement("div");
  chatElement.classList.add(
    data.name === username ? "my-message" : "other-message"
  );
  chatElement.innerHTML = `
        <div class="user">
                <img src="${profileImg}" alt="${
    data.name
  }" class="profile-image">
            </div>
        <div class="chat-detail">
            <p>${data.name}</p>
            <p>${data.message}</p>
            <p>${formatTime(data.createdOn)}</p>
        </div>
    `;
  chatContainer.appendChild(chatElement);
  chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom
  notification.innerHTML = `<h1>Welcome ${username}</h1>`; // Reset to welcome message
});

// Listen for typing events from the server
socket.on("typing", (data) => {
  if (data !== username) {
    notification.innerHTML = `<h1>Welcome ${username} <span id="typing-indicator">${data} is typing...</span></h1>`;
    notification.style.display = "block";
  }
});

// Listen for stop typing events from the server
socket.on("stopTyping", (data) => {
  if (data !== username) {
    notification.innerHTML = `<h1>Welcome ${username}</h1>`;
  }
});

// when new user gets added message displays in the notification pannel
socket.on("newUser", (newUser) => {
  notification.innerHTML = `<h1>Welcome ${username} <span id="typing-indicator">${newUser} has joined!</span></h1>`;
  notification.style.display = "block";
  setTimeout(() => {
    notification.innerHTML = `<h1>Welcome ${username}</h1>`;
  }, 5000);
});

socket.on("newUserAdded", (users) => {
  updateUsersList(users);
});

// when user disconnects user left displays on the notification containner
socket.on("userDisconnected", (users) => {
  updateUsersList(users);
  notification.innerHTML = `<h1>Welcome ${username} <span id="typing-indicator">A user left the chat</span> </h1>`;
  notification.style.display = "block";
  setTimeout(() => {
    notification.innerHTML = `<h1>Welcome ${username}</h1>`;
  }, 5000); // Hide the notification after 5 seconds
});

// Emit typing event when user types in the chat input
chatInput.addEventListener("input", () => {
  if (chatInput.value.trim()) {
    socket.emit("typing", username);
  } else {
    socket.emit("stopTyping", username);
  }
});

// Function to handle sending messages
const sendMessage = () => {
  const message = chatInput.value;
  if (message.trim()) {
    socket.emit("message", { name: username, message });
    // const chatElement = document.createElement('div');
    // chatElement.classList.add('my-message');
    // chatElement.innerHTML = `
    //     <div class="user">${username.charAt(0)}</div>
    //     <div class="chat-detail">
    //         <p>${username}</p>
    //         <p>${message}</p>
    //         <p>${formatTime(new Date())}</p>
    //     </div>
    // `;
    // chatContainer.appendChild(chatElement);
    chatInput.value = "";
    chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to the bottom
  }
};

// Handle send button click
sendButton.addEventListener("click", sendMessage);

// Handle Enter key press
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
