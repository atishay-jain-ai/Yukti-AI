/* =========================================================
   Yukti AI — New Chat
========================================================= */

import {
    createChat
} from "../history/history-service.js";

import {
    renderChatHistory
} from "../history/history-renderer.js";

import {
    clearCurrentConversation,
    isResponseStreaming
} from "./chat-session-state.js";

import {
    clearRenderedMessages
} from "./chat-renderer.js";

import {
    newChatButton
} from "../ui/dom-elements.js";

import {
    openHomePage
} from "../ui/page-navigation.js";

import {
    focusPromptInput,
    resetPromptInput
} from "../ui/textarea.js";


/* ================= Initialization State ================= */

let newChatInitialized = false;


/* ================= Start New Chat ================= */

export function startNewChat() {
    if (isResponseStreaming) {
        return;
    }

    clearCurrentConversation();
    clearRenderedMessages();

    createChat();

    renderChatHistory();

    resetPromptInput();
    openHomePage();
    focusPromptInput();
}


/* ================= Initialize New Chat ================= */

export function initializeNewChat() {
    if (newChatInitialized) {
        return;
    }

    if (!newChatButton) {
        console.error(
            "Yukti AI: New chat button nahi mila."
        );

        return;
    }

    newChatButton.addEventListener(
        "click",
        startNewChat
    );

    newChatInitialized = true;
}