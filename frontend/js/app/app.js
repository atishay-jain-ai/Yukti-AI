/* =========================================================
   Yukti AI — Application
========================================================= */

import {
    renderChatHistory
} from "../history/history-renderer.js";

import {
    initializeHistoryEvents
} from "../history/history-events.js";

import {
    initializeChatBranchService
} from "../history/chat-branch-service.js";

import {
    initializeChatLoader
} from "../chat/chat-loader.js";

import {
    initializeNewChat
} from "../chat/new-chat.js";

import {
    initializeChatEvents
} from "../chat/chat-events.js";

import {
    initializeMessageActions
} from "../chat/message-actions.js";

import {
    initializeHistoryToggle
} from "../ui/history-toggle.js";

import {
    focusPromptInput
} from "../ui/textarea.js";


/* ================= Initialization State ================= */

let applicationInitialized = false;


/* ================= Initialize Application ================= */

export function initializeApplication() {
    if (applicationInitialized) {
        return;
    }


    /* ================= Chat History ================= */

    renderChatHistory();

    initializeHistoryEvents();

    initializeHistoryToggle();

    initializeChatBranchService();


    /* ================= Chat System ================= */

    initializeChatLoader();

    initializeNewChat();

    initializeChatEvents();

    initializeMessageActions();


    /* ================= Prompt Input ================= */

    focusPromptInput();


    applicationInitialized = true;
}