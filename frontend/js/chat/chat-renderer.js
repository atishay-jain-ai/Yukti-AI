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

import {
    queueStreamContent,
    startWordStream,
    stopWordStream,
    waitForWordStream
} from "./chat-stream-animation.js";

/* ================= Stream State ================= */

let pendingStreamContent = "";
let scrollAnimationFrame = null;


/* ================= Smooth Scroll ================= */

function animateChatScroll() {
    if (!chatContainer) {
        scrollAnimationFrame = null;
        return;
    }

    const targetScroll =
        chatContainer.scrollHeight -
        chatContainer.clientHeight;

    const currentScroll =
        chatContainer.scrollTop;

    const distance =
        targetScroll - currentScroll;

    if (Math.abs(distance) <= 1) {
        chatContainer.scrollTop =
            targetScroll;

        scrollAnimationFrame = null;
        return;
    }

    const direction =
        Math.sign(distance);

    const scrollStep =
        Math.min(
            Math.max(
                Math.abs(distance) * 0.14,
                1
            ),
            18
        );

    chatContainer.scrollTop =
        currentScroll +
        direction * scrollStep;

    scrollAnimationFrame =
        requestAnimationFrame(
            animateChatScroll
        );
}


/* ================= Scroll ================= */

export function scrollChatToBottom() {
    if (
        !chatContainer ||
        scrollAnimationFrame
    ) {
        return;
    }

    scrollAnimationFrame =
        requestAnimationFrame(
            animateChatScroll
        );
}


/* ================= Message Data ================= */

function getMessageData(message) {
    if (
        message &&
        typeof message === "object"
    ) {
        return {
            id: message.id || null,
            content: String(
                message.content || ""
            ),
            feedback:
                message.feedback || null
        };
    }

    return {
        id: null,
        content: String(message || ""),
        feedback: null
    };
}


/* ================= Message Element ================= */

function createMessageElement(
    messageType,
    messageId = null
) {
    if (!chatContainer) {
        return null;
    }

    const messageElement =
        document.createElement("div");

    messageElement.className =
        `message ${messageType}`;

    if (messageId) {
        messageElement.dataset.messageId =
            messageId;
    }

    const messageContent =
        document.createElement("div");

    messageContent.className =
        "message-content";

    const bubbleElement =
        document.createElement("div");

    bubbleElement.className = "bubble";

    messageContent.appendChild(
        bubbleElement
    );

    messageElement.appendChild(
        messageContent
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
        messageContent,
        bubbleElement
    };
}


/* ================= User Message ================= */

export function renderUserMessage(
    message
) {
    const messageData =
        getMessageData(message);

    const messageElements =
        createMessageElement(
            "user",
            messageData.id
        );

    if (!messageElements) {
        return null;
    }

    messageElements.bubbleElement.textContent =
        messageData.content;

    return messageElements.bubbleElement;
}


/* ================= Assistant Message ================= */

export function renderAssistantMessage(
    message
) {
    const messageData =
        getMessageData(message);

    const messageElements =
        createMessageElement(
            "ai",
            messageData.id
        );

    if (!messageElements) {
        return null;
    }

    renderMarkdown(
        messageElements.bubbleElement,
        messageData.content,
        true
    );

    addCodeCopyButtons(
        messageElements.messageElement
    );

    if (messageData.id) {
        addMessageActions(
            messageElements.messageContent,
            messageData
        );
    }

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

    pendingStreamContent = "";

    currentBubbleElement.classList.remove(
        "typing-bubble"
    );

    currentBubbleElement.classList.add(
        "streaming"
    );

    startWordStream(
        currentBubbleElement,
        scrollChatToBottom
    );

    return true;
}


/* ================= Render Stream ================= */

export function renderAssistantStream(
    completeResponse
) {
    if (!currentBubbleElement) {
        return;
    }

    pendingStreamContent =
        String(completeResponse || "");

    queueStreamContent(
        pendingStreamContent
    );
}

/* ================= Complete Stream ================= */

export async function completeAssistantStream(
    assistantMessage = null
) {
    if (
        !currentMessageElement ||
        !currentBubbleElement
    ) {
        return;
    }

    await waitForWordStream();

    stopWordStream();

    renderMarkdown(
        currentBubbleElement,
        pendingStreamContent,
        true
    );

    currentBubbleElement.classList.remove(
        "streaming"
    );

    addCodeCopyButtons(
        currentMessageElement
    );

    if (assistantMessage?.id) {
        currentMessageElement.dataset.messageId =
            assistantMessage.id;

        const messageContent =
            currentMessageElement.querySelector(
                ".message-content"
            );

        addMessageActions(
            messageContent,
            assistantMessage
        );
    }

    pendingStreamContent = "";

    scrollChatToBottom();
}


/* ================= Stream Error ================= */

export function renderStreamError(
    message = "❌ Unable to connect to Yukti AI."
) {
    if (!currentBubbleElement) {
        return;
    }

    stopWordStream();
    pendingStreamContent = "";

    currentBubbleElement.classList.remove(
        "typing-bubble",
        "streaming"
    );

    currentBubbleElement.textContent =
        message;

    scrollChatToBottom();
}

/* ================= Message Actions ================= */

function addMessageActions(
    messageContent,
    message
) {
    if (!messageContent) {
        return;
    }

    const oldActions =
        messageContent.querySelector(
            ".message-actions"
        );

    if (oldActions) {
        oldActions.remove();
    }

    const actionsContainer =
        document.createElement("div");

    actionsContainer.className =
        "message-actions";

    actionsContainer.dataset.messageId =
        message.id;

    actionsContainer.append(
        createActionButton(
            "like",
            "ri-thumb-up-line",
            "Like response",
            message.feedback === "like"
        ),

        createActionButton(
            "dislike",
            "ri-thumb-down-line",
            "Dislike response",
            message.feedback === "dislike"
        ),

        createActionButton(
            "share",
            "ri-share-forward-line",
            "Share response"
        ),

        createActionButton(
            "split",
            "ri-git-branch-line",
            "Split into new chat"
        )
    );

    messageContent.appendChild(
        actionsContainer
    );
}


/* ================= Action Button ================= */

function createActionButton(
    action,
    iconClass,
    label,
    isActive = false
) {
    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "message-action-button";

    button.dataset.action =
        action;

    button.setAttribute(
        "aria-label",
        label
    );

    button.setAttribute(
        "title",
        label
    );

    if (isActive) {
        button.classList.add(
            "active"
        );
    }

    const icon =
        document.createElement("i");

    icon.className =
        iconClass;

    button.appendChild(icon);

    return button;
}


/* ================= Markdown ================= */

function renderMarkdown(
    container,
    content,
    highlight = false
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

    if (highlight) {
        highlightCodeBlocks(container);
    }
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


/* ================= Code Copy Buttons ================= */

function addCodeCopyButtons(
    messageElement
) {
    messageElement
        .querySelectorAll("pre")
        .forEach(codeContainer => {
            if (
                codeContainer.querySelector(
                    ".copy-btn"
                )
            ) {
                return;
            }

            const copyButton =
                createCodeCopyButton(
                    codeContainer
                );

            codeContainer.style.position =
                "relative";

            codeContainer.appendChild(
                copyButton
            );
        });
}


/* ================= Copy Button Content ================= */

function setCopyButtonContent(
    copyButton,
    iconClass,
    label
) {
    const icon =
        document.createElement("i");

    icon.className = iconClass;

    const text =
        document.createElement("span");

    text.textContent = label;

    copyButton.replaceChildren(
        icon,
        text
    );
}


/* ================= Code Copy Button ================= */

function createCodeCopyButton(
    codeContainer
) {
    const copyButton =
        document.createElement("button");

    copyButton.type = "button";
    copyButton.className = "copy-btn";

    copyButton.setAttribute(
        "aria-label",
        "Copy code"
    );

    copyButton.setAttribute(
        "title",
        "Copy code"
    );

    setCopyButtonContent(
        copyButton,
        "ri-file-copy-line",
        "Copy"
    );

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

                copyButton.classList.add(
                    "copied"
                );

                setCopyButtonContent(
                    copyButton,
                    "ri-check-line",
                    "Copied"
                );

                setTimeout(() => {
                    copyButton.classList.remove(
                        "copied"
                    );

                    setCopyButtonContent(
                        copyButton,
                        "ri-file-copy-line",
                        "Copy"
                    );
                }, 1800);

            } catch (error) {
                console.error(
                    "Yukti AI: Code copy nahi hua.",
                    error
                );

                copyButton.classList.add(
                    "copy-failed"
                );

                setCopyButtonContent(
                    copyButton,
                    "ri-error-warning-line",
                    "Failed"
                );

                setTimeout(() => {
                    copyButton.classList.remove(
                        "copy-failed"
                    );

                    setCopyButtonContent(
                        copyButton,
                        "ri-file-copy-line",
                        "Copy"
                    );
                }, 1800);
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

    stopWordStream();
    pendingStreamContent = "";

    chatContainer.innerHTML = "";
}