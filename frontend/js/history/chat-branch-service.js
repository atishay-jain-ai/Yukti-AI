/* =========================================================
   Yukti AI — Chat Branch Service
========================================================= */

import {
    createChat,
    updateActiveChatMessages,
    updateActiveChatTitle
} from "./history-service.js";

import {
    renderChatHistory
} from "./history-renderer.js";

import {
    getConversationBranch
} from "../chat/chat-session-state.js";


/* ================= Initialization State ================= */

let chatBranchInitialized = false;


/* ================= Branch Title ================= */

function getBranchTitle(
    branchMessages
) {
    const firstUserMessage =
        branchMessages.find(
            message =>
                message.role === "user"
        );

    if (!firstUserMessage) {
        return "Branched Chat";
    }

    return firstUserMessage.content;
}


/* ================= Create Chat Branch ================= */

function createChatBranch(
    messageId
) {
    const branchMessages =
        getConversationBranch(
            messageId
        );

    if (branchMessages.length === 0) {
        console.error(
            "Yukti AI: Chat branch create nahi hui."
        );

        return;
    }

    createChat();

    updateActiveChatTitle(
        getBranchTitle(
            branchMessages
        )
    );

    updateActiveChatMessages(
        branchMessages
    );

    renderChatHistory();

    window.dispatchEvent(
        new CustomEvent(
            "yukti:chat-changed"
        )
    );
}


/* ================= Split Event ================= */

function handleChatSplit(
    event
) {
    const messageId =
        event.detail?.messageId;

    if (!messageId) {
        return;
    }

    createChatBranch(
        messageId
    );
}


/* ================= Initialize Branch Service ================= */

export function initializeChatBranchService() {
    if (chatBranchInitialized) {
        return;
    }

    window.addEventListener(
        "yukti:split-chat",
        handleChatSplit
    );

    chatBranchInitialized = true;
}