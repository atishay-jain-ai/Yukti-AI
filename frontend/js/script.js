const input = document.getElementById("prompt");
const chatBox = document.getElementById("chat-box");
const sendButton = document.querySelector("button");

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function renderMarkdown(text) {
    return marked.parse(text);
}

function highlightCode(container) {
    container.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
    });
}

function addMessage(type, text) {

    const wrapper = document.createElement("div");
    wrapper.className = type;

    const message = document.createElement("div");
    message.className = "message";

    if (type === "bot") {
        message.innerHTML = renderMarkdown(text);
    } else {
        message.textContent = text;
    }

    wrapper.appendChild(message);
    chatBox.appendChild(wrapper);

    if (type === "bot") {
        highlightCode(wrapper);
    }

    scrollToBottom();

    return wrapper;
}

async function askAI() {

    const prompt = input.value.trim();

    if (prompt === "") return;

    addMessage("user", prompt);

    input.value = "";
    input.focus();

    sendButton.disabled = true;

    const thinking = addMessage(
        "bot",
        "🤖 **Yukti is thinking...**"
    );

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/ask?prompt=${encodeURIComponent(prompt)}`
        );

        if (!response.ok) {
            throw new Error("Backend Error");
        }

        const data = await response.json();

        thinking.remove();

        addMessage("bot", data.answer);

    } catch (err) {

        thinking.remove();

        addMessage(
            "bot",
            "❌ **Connection Failed**\n\nPlease make sure the FastAPI backend is running."
        );

        console.error(err);

    } finally {

        sendButton.disabled = false;

        input.focus();

    }
}

input.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        askAI();

    }

});