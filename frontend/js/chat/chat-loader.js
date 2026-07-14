/* =========================================================
   Yukti AI — Chat Loader
========================================================= */

import {
    getActiveChat,
    updateActiveChatMessages
} from "../history/history-service.js";

import {
    clearCurrentConversation,
    currentConversation,
    setCurrentConversation
} from "./chat-session-state.js";

import {
    clearRenderedMessages,
    renderAssistantMessage,
    renderUserMessage
} from "./chat-renderer.js";

import {
    openChatPage,
    openHomePage
} from "../ui/page-navigation.js";


/* ================= Initialization State ================= */

let chatLoaderInitialized = false;


/* ================= Render Conversation ================= */

function renderConversation(
    messages
) {
    clearRenderedMessages();

    messages.forEach(message => {
        if (message.role === "assistant") {
            renderAssistantMessage(
                message
            );

            return;
        }

        renderUserMessage(
            message
        );
    });
}


/* ================= Load Active Chat ================= */

export function loadActiveChat() {
    const activeChat =
        getActiveChat();

    if (!activeChat) {
        clearCurrentConversation();
        clearRenderedMessages();
        openHomePage();

        return;
    }

    const savedMessages =
        Array.isArray(activeChat.messages)
            ? activeChat.messages
            : [];

    setCurrentConversation(
        savedMessages
    );

    updateActiveChatMessages(
        currentConversation
    );

    renderConversation(
        currentConversation
    );

    openChatPage();
}


/* ================= Chat Changed Event ================= */

function handleChatChanged() {
    loadActiveChat();
}


/* ================= Initialize Chat Loader ================= */

export function initializeChatLoader() {
    if (chatLoaderInitialized) {
        return;
    }

    window.addEventListener(
        "yukti:chat-changed",
        handleChatChanged
    );

    chatLoaderInitialized = true;
}