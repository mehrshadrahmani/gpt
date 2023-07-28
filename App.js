// Get DOM elements
var chatInput = document.getElementById("chatInput");
var chatContent = document.getElementById("chatContent");

// Load chat history from local storage or create empty array
var chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

// Render chat history
chatHistory.forEach(function (message) {
    if (message.sender === "user") {
        renderUserMessage(message.text);
    } else {
        renderBotMessage(message.text);
    }
});

// Send message when Enter key is pressed (without Shift)
chatInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// Send message when Send button is clicked
document.getElementById("sendButton").addEventListener("click", function () {
    sendMessage();
});

// Send message to chatbot API and render messages in chat history
function sendMessage() {
    var text = chatInput.value;
    var url = `https://api.fasttube.ir/?text=${encodeURIComponent(text)}&key=RayaxKey`;

    // Render user message in chat history
    renderUserMessage(text);

    // Render "Please wait..." message in chat history
    renderBotMessage("Please wait...");

    try {
        // Send message to chatbot API and render bot message in chat history
        fetch(url)
            .then(res => res.json())
            .then(data => {
                // Remove "Please wait..." message from chat history
                chatContent.removeChild(chatContent.lastChild);

                renderBotMessage(data.message);

                // Save chat message to local storage
                chatHistory.push({ sender: "user", text });
                chatHistory.push({ sender: "bot", text: data.message });
                localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

                // Clear input field
                chatInput.value = "";

                // Scroll to bottom of chat history
                chatContent.scrollTop = chatContent.scrollHeight;
            })
            .catch(err => {
                console.error("Error fetching chatbot response:", err);
                // Remove "Please wait..." message from chat history
                chatContent.removeChild(chatContent.lastChild);
                // Render error message in chat history
                renderBotMessage("Error fetching chatbot response.");
            });
    } catch (err) {
        // Remove "Please wait..." message from chat history
        chatContent.removeChild(chatContent.lastChild);
        renderBotMessage("Error sending message.");
        console.error("Error sending message:", err);
    }
}

// Render user message in chat history
function renderUserMessage(text) {
    var lines = text.match(/(.|[\r\n]){1,44}/g) || [];
    var userMessage = document.createElement("div");
    userMessage.className = "flex items-end mb-4";
    userMessage.innerHTML = `
        <div class="flex justify-end items-center w-full">
            <div class="bg-blue-500 rounded-lg px-4 py-2 max-w-xs">
                ${lines.map(line => `<p class="text-sm text-white">${line.replace(/\n/g, "<br>")}</p>`).join('')}
            </div>
            <img class="w-10 h-10 rounded-full ml-3" src="images/user.png" alt="User Avatar">
        </div>
    `;
    chatContent.appendChild(userMessage);
}

// Render bot message in chat history
function renderBotMessage(text) {
    var lines = text.match(/(.|[\r\n]){1,44}/g) || [];
    var botMessage = document.createElement("div");
    botMessage.className = "flex items-start mb-4";
    botMessage.innerHTML = `
        <img class="w-10 h-10 rounded-full mr-3" src="images/bot.png" alt="Bot Avatar">
        <div class="bg-gray-200 text-gray-600 rounded-lg px-4 py-2 max-w-xs relative">
            ${lines.map(line => `<p class="text-sm">${line.replace(/\n/g, "<br>")}</p>`).join('')}
            <button class="bg-white text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-lg text-xs font-medium shadow-md mt-3 sm:mr-3 sm:px-3 sm:py-2" onclick="copyBotMessage(this)">Copy</button>
        </div>
    `;
    chatContent.appendChild(botMessage);
}

// Copy bot message to clipboard
function copyBotMessage(button) {
    var message = button.parentNode.querySelector("p").textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message)
            .then(() => {
                alert('Copied bot message to clipboard');
                console.log("Copied bot message to clipboard:", message);
            })
            .catch(err => {
                console.error("Error copying bot message to clipboard:", err);
                fallbackCopyTextToClipboard(message);
            });
    } else {
        fallbackCopyTextToClipboard(message);
    }
}

// Fallback method using execCommand
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'Copied bot message to clipboard' : 'Unable to copy bot message';
        alert(msg);
        console.log(msg, text);
    } catch (err) {
        console.error("Error copying bot message to clipboard:", err);
    }

    document.body.removeChild(textArea);
}


// Scroll to the chatContent div
var chatContentDiv = document.getElementById('chatContent');
if (chatContentDiv) {
    chatContentDiv.scrollIntoView(false);
}


// Scroll to the bottom of the page
window.scrollTo(0, document.body.scrollHeight);


// Delete Chat History
var deleteButton = document.getElementById("deleteButton");
deleteButton.addEventListener("click", function () {
    var confirmed = confirm("Are you sure you want to delete your chat history?");
    if (confirmed) {
        localStorage.removeItem("chatHistory");
        chatContent.innerHTML = "";
    }
});