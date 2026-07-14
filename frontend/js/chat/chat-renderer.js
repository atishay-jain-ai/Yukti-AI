/* =========================================================
   Yukti AI — Chat Renderer
========================================================= */

import {
    chatContainer
} from "../ui/dom-elements.js";

import {
    currentBubbleElement,
    currentMessageElement,
    setCurrentBubbleElement,
    setCurrentMessageElement
} from "./chat-session-state.js";


/* ================= Scroll ================= */

export function scrollChatToBottom(
    smooth = true
) {
    if (!chatContainer) {
        return;
    }

    requestAnimationFrame(() => {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: smooth
                ? "smooth"
                : "auto"
        });
    });
}


/* ================= Message Element ================= */

function createMessageElement(
    messageType
) {
    if (!chatContainer) {
        return null;
    }

    const messageElement =
        document.createElement("div");

    messageElement.className =
        `message ${messageType}`;

    const bubbleElement =
        document.createElement("div");

    bubbleElement.className = "bubble";

    messageElement.appendChild(
        bubbleElement
    );

    chatContainer.appendChild(
        messageElement
    );

    setCurrentMessageElement(
        messageElement
    );

    setCurrentBubbleElement(
        bubbleElement
    );

    scrollChatToBottom();

    return {
        messageElement,
        bubbleElement
    };
}


/* ================= User Message ================= */

export function renderUserMessage(
    message
) {
    const messageElements =
        createMessageElement("user");

    if (!messageElements) {
        return null;
    }

    messageElements.bubbleElement.textContent =
        String(message);

    scrollChatToBottom();

    return messageElements.bubbleElement;
}


/* ================= Assistant Message ================= */

export function renderAssistantMessage(
    message
) {
    const messageElements =
        createMessageElement("ai");

    if (!messageElements) {
        return null;
    }

    renderMarkdown(
        messageElements.bubbleElement,
        String(message)
    );

    addCodeCopyButtons(
        messageElements.messageElement
    );

    scrollChatToBottom(false);

    return messageElements.bubbleElement;
}


/* ================= Typing Indicator ================= */

export function renderTypingIndicator() {
    const messageElements =
        createMessageElement("ai");

    if (!messageElements) {
        return null;
    }

    const {
        bubbleElement
    } = messageElements;

    bubbleElement.classList.add(
        "typing-bubble"
    );

    for (
        let dotIndex = 0;
        dotIndex < 3;
        dotIndex += 1
    ) {
        const typingDot =
            document.createElement("div");

        typingDot.className =
            "typing-dot";

        bubbleElement.appendChild(
            typingDot
        );
    }

    return bubbleElement;
}


/* ================= Start Stream ================= */

export function prepareAssistantStream() {
    if (!currentBubbleElement) {
        return false;
    }

    currentBubbleElement.classList.remove(
        "typing-bubble"
    );

    currentBubbleElement.innerHTML = "";

    return true;
}


/* ================= Render Stream ================= */

export function renderAssistantStream(
    completeResponse
) {
    if (!currentBubbleElement) {
        return;
    }

    renderMarkdown(
        currentBubbleElement,
        completeResponse
    );

    scrollChatToBottom();
}


/* ================= Complete Stream ================= */

export function completeAssistantStream() {
    if (!currentMessageElement) {
        return;
    }

    addCodeCopyButtons(
        currentMessageElement
    );

    scrollChatToBottom();
}


/* ================= Stream Error ================= */

export function renderStreamError(
    message = "❌ Unable to connect to Yukti AI."
) {
    if (!currentBubbleElement) {
        return;
    }

    currentBubbleElement.classList.remove(
        "typing-bubble"
    );

    currentBubbleElement.textContent =
        message;

    scrollChatToBottom();
}


/* ================= Markdown ================= */

function renderMarkdown(
    container,
    content
) {
    if (
        window.marked &&
        typeof window.marked.parse === "function"
    ) {
        container.innerHTML =
            window.marked.parse(content);
    } else {
        container.textContent =
            content;
    }

    highlightCodeBlocks(
        container
    );
}


/* ================= Code Highlight ================= */

function highlightCodeBlocks(
    container
) {
    if (
        !window.hljs ||
        typeof window.hljs.highlightElement !== "function"
    ) {
        return;
    }

    container
        .querySelectorAll("pre code")
        .forEach(codeBlock => {
            window.hljs.highlightElement(
                codeBlock
            );
        });
}


/* ================= Copy Buttons ================= */

function addCodeCopyButtons(
    messageElement
) {
    messageElement
        .querySelectorAll("pre")
        .forEach(codeContainer => {
            const oldButton =
                codeContainer.querySelector(
                    ".copy-btn"
                );

            if (oldButton) {
                return;
            }

            const copyButton =
                createCopyButton(
                    codeContainer
                );

            codeContainer.style.position =
                "relative";

            codeContainer.appendChild(
                copyButton
            );
        });
}


/* ================= Copy Button ================= */

function createCopyButton(
    codeContainer
) {
    const copyButton =
        document.createElement("button");

    copyButton.type = "button";
    copyButton.className = "copy-btn";
    copyButton.textContent = "📋 Copy";

    copyButton.addEventListener(
        "click",
        async () => {
            const codeElement =
                codeContainer.querySelector(
                    "code"
                );

            if (!codeElement) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    codeElement.innerText
                );

                copyButton.textContent =
                    "✅ Copied";

                setTimeout(() => {
                    copyButton.textContent =
                        "📋 Copy";
                }, 2000);
            } catch (error) {
                console.error(
                    "Yukti AI: Code copy nahi hua.",
                    error
                );

                copyButton.textContent =
                    "❌ Failed";
            }
        }
    );

    return copyButton;
}


/* ================= Clear Messages ================= */

export function clearRenderedMessages() {
    if (!chatContainer) {
        return;
    }

    chatContainer.innerHTML = "";
}