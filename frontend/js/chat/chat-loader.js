/* =========================================================
   Yukti AI — Chat Loader
========================================================= */

import {
    getActiveChat
} from "../history/history-service.js";

import {
    clearCurrentConversation,
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
                message.content
            );

            return;
        }

        renderUserMessage(
            message.content
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

    const messages =
        Array.isArray(activeChat.messages)
            ? activeChat.messages
            : [];

    setCurrentConversation(
        messages
    );

    renderConversation(
        messages
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