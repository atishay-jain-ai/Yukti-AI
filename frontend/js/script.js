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

    addCopyButtons(message);

}

    message.scrollIntoView({
        behavior: "smooth",
        block: "end"
    });

}

function addCopyButtons(container) {

    container.querySelectorAll("pre").forEach((pre) => {

        const button = document.createElement("button");

        button.className = "copy-btn";

        button.innerText = "📋 Copy";

        button.onclick = async () => {

            const code = pre.querySelector("code").innerText;

            await navigator.clipboard.writeText(code);

            button.innerText = "✅ Copied";

            setTimeout(() => {

                button.innerText = "📋 Copy";

            }, 2000);

        };

        pre.style.position = "relative";

        pre.appendChild(button);

    });

}

function createStreamingMessage() {

    const message = document.createElement("div");

    message.className = "message ai";

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    message.appendChild(bubble);

    chatContainer.appendChild(message);

    return { message, bubble };

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

    hideTyping();

    const { message, bubble } = createStreamingMessage();

    let fullResponse = "";

    await askYukti(prompt, (chunk) => {

        fullResponse += chunk;

        bubble.innerHTML = marked.parse(fullResponse);

        bubble.querySelectorAll("pre code").forEach((block) => {
            hljs.highlightElement(block);
        });

        message.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });

    });

    addCopyButtons(message);

    addToConversation("assistant", fullResponse);

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