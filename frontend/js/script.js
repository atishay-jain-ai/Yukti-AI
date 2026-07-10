import { askYukti } from "./api.js";
import { addToConversation } from "./chat.js";
import { openChat } from "./ui.js";

const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("prompt-input");
const sendButton = document.getElementById("send-btn");

function addMessage(text, type = "user") {

    const message = document.createElement("div");

    message.className = `message ${type}`;

    message.innerHTML = `
    <div class="bubble">
        ${
            type === "ai"
                ? marked.parse(text)
                : text
        }
    </div>
`;

    chatContainer.appendChild(message);

    if (type === "ai") {

    message.querySelectorAll("pre code").forEach((block) => {

        hljs.highlightElement(block);

    });

}

    message.scrollIntoView({
        behavior: "smooth",
        block: "end"
    });

}

function showTyping() {

    const typing = document.createElement("div");

    typing.className = "message ai";

    typing.id = "typing";

    typing.innerHTML = `
        <div class="bubble typing-bubble">

            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>

        </div>
    `;

    chatContainer.appendChild(typing);

    typing.scrollIntoView({
        behavior: "smooth",
        block: "end"
    });

}

function hideTyping() {

    document.getElementById("typing")?.remove();

}

async function sendMessage() {

    const prompt = input.value.trim();

    if (!prompt) return;

    openChat();

    addMessage(prompt, "user");

    addToConversation("user", prompt);

    input.value = "";
    input.style.height = "auto";

    // Cursor wapas textarea me aa jayega
    input.focus();

    showTyping();

    try {

        const data = await askYukti(prompt);

        hideTyping();

        addMessage(data.answer, "ai");

        addToConversation("assistant", data.answer);

    }

    catch (err) {

        hideTyping();

        addMessage(
            "❌ Unable to connect to Yukti AI.",
            "ai"
        );

        console.error(err);

    }

}

sendButton.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});

// ================= Auto Grow Textarea =================

input.addEventListener("input", () => {

    input.style.height = "auto";

    input.style.height = input.scrollHeight + "px";

});