/* =========================================================
   Yukti AI — Chat Engine
========================================================= */

import {
    streamChatResponse
} from "../api/chat-api.js";

import {
    createChat,
    getActiveChat,
    updateActiveChatMessages,
    updateActiveChatTitle
} from "../history/history-service.js";

import {
    renderChatHistory
} from "../history/history-renderer.js";

import {
    addConversationMessage,
    currentConversation,
    isResponseStreaming,
    resetStreamingState,
    setResponseStreaming
} from "./chat-session-state.js";

import {
    completeAssistantStream,
    prepareAssistantStream,
    renderAssistantStream,
    renderStreamError,
    renderTypingIndicator,
    renderUserMessage
} from "./chat-renderer.js";

import {
    openChatPage
} from "../ui/page-navigation.js";

import {
    focusPromptInput,
    getPromptValue,
    resetPromptInput
} from "../ui/textarea.js";


/* ================= Send Message ================= */

export async function sendChatMessage() {
    if (isResponseStreaming) {
        return;
    }

    const prompt =
        getPromptValue();

    if (!prompt) {
        return;
    }

    setResponseStreaming(true);

    openChatPage();

    if (!getActiveChat()) {
        createChat();
    }


    /* ================= User Message ================= */

    renderUserMessage(
        prompt
    );

    addConversationMessage(
        "user",
        prompt
    );

    updateActiveChatTitle(
        prompt
    );

    updateActiveChatMessages(
        currentConversation
    );

    renderChatHistory();

    resetPromptInput();


    /* ================= Assistant Loading ================= */

    renderTypingIndicator();

    let firstChunkReceived = false;

    try {
        const completeResponse =
            await streamChatResponse(
                prompt,
                (
                    chunk,
                    streamedResponse
                ) => {
                    if (!firstChunkReceived) {
                        prepareAssistantStream();

                        firstChunkReceived = true;
                    }

                    renderAssistantStream(
                        streamedResponse
                    );
                }
            );


        /* ================= Assistant Message ================= */

        completeAssistantStream();

        addConversationMessage(
            "assistant",
            completeResponse
        );

        updateActiveChatMessages(
            currentConversation
        );

        renderChatHistory();
    } catch (error) {
        renderStreamError();

        console.error(
            "Yukti AI: Message send nahi hua.",
            error
        );
    } finally {
        resetStreamingState();
        focusPromptInput();
    }
}