/* =========================================================
   Yukti AI — Chat Events
========================================================= */

import {
    promptInput,
    sendButton
} from "../ui/dom-elements.js";

import {
    sendChatMessage
} from "./chat-engine.js";

import {
    resizePromptInput
} from "../ui/textarea.js";


/* ================= Initialization State ================= */

let chatEventsInitialized = false;


/* ================= Enter Key ================= */

function handlePromptKeydown(event) {
    const isEnterKey =
        event.key === "Enter";

    const isNewLine =
        event.shiftKey;

    const isTextComposing =
        event.isComposing;

    if (
        isEnterKey &&
        !isNewLine &&
        !isTextComposing
    ) {
        event.preventDefault();

        sendChatMessage();
    }
}


/* ================= Initialize Chat Events ================= */

export function initializeChatEvents() {
    if (chatEventsInitialized) {
        return;
    }

    if (!promptInput || !sendButton) {
        console.error(
            "Yukti AI: Chat input ya send button nahi mila."
        );

        return;
    }

    sendButton.addEventListener(
        "click",
        sendChatMessage
    );

    promptInput.addEventListener(
        "keydown",
        handlePromptKeydown
    );

    promptInput.addEventListener(
        "input",
        resizePromptInput
    );

    chatEventsInitialized = true;
}