/* =========================================================
   Yukti AI — Message Actions
========================================================= */

import {
    chatContainer
} from "../ui/dom-elements.js";

import {
    currentConversation,
    getConversationMessage,
    updateMessageFeedback
} from "./chat-session-state.js";

import {
    updateActiveChatMessages
} from "../history/history-service.js";


/* ================= Initialization State ================= */

let messageActionsInitialized = false;


/* ================= Like Action ================= */

function handleLikeAction(
    messageId,
    actionsContainer
) {
    const message =
        getConversationMessage(
            messageId
        );

    if (!message) {
        return;
    }

    const newFeedback =
        message.feedback === "like"
            ? null
            : "like";

    updateMessageFeedback(
        messageId,
        newFeedback
    );

    updateActiveChatMessages(
        currentConversation
    );

    updateFeedbackButtons(
        actionsContainer,
        newFeedback
    );
}


/* ================= Dislike Action ================= */

function handleDislikeAction(
    messageId,
    actionsContainer
) {
    const message =
        getConversationMessage(
            messageId
        );

    if (!message) {
        return;
    }

    const newFeedback =
        message.feedback === "dislike"
            ? null
            : "dislike";

    updateMessageFeedback(
        messageId,
        newFeedback
    );

    updateActiveChatMessages(
        currentConversation
    );

    updateFeedbackButtons(
        actionsContainer,
        newFeedback
    );
}


/* ================= Feedback Buttons ================= */

function updateFeedbackButtons(
    actionsContainer,
    feedback
) {
    const likeButton =
        actionsContainer.querySelector(
            '[data-action="like"]'
        );

    const dislikeButton =
        actionsContainer.querySelector(
            '[data-action="dislike"]'
        );

    likeButton?.classList.toggle(
        "active",
        feedback === "like"
    );

    dislikeButton?.classList.toggle(
        "active",
        feedback === "dislike"
    );
}


/* ================= Share Action ================= */

async function handleShareAction(
    messageId,
    shareButton
) {
    const message =
        getConversationMessage(
            messageId
        );

    if (!message) {
        return;
    }

    const shareData = {
        title: "Yukti AI Response",
        text: message.content
    };

    try {
        if (
            navigator.share &&
            navigator.canShare?.(
                shareData
            )
        ) {
            await navigator.share(
                shareData
            );
        } else {
            await navigator.clipboard.writeText(
                message.content
            );
        }

        showActionSuccess(
            shareButton
        );
    } catch (error) {
        if (error.name !== "AbortError") {
            console.error(
                "Yukti AI: Response share nahi hua.",
                error
            );
        }
    }
}


/* ================= Share Success ================= */

function showActionSuccess(
    actionButton
) {
    const icon =
        actionButton.querySelector("i");

    if (!icon) {
        return;
    }

    const oldIconClass =
        icon.className;

    actionButton.classList.add(
        "success"
    );

    icon.className =
        "ri-check-line";

    setTimeout(() => {
        actionButton.classList.remove(
            "success"
        );

        icon.className =
            oldIconClass;
    }, 1800);
}


/* ================= Split Action ================= */

function handleSplitAction(
    messageId
) {
    window.dispatchEvent(
        new CustomEvent(
            "yukti:split-chat",
            {
                detail: {
                    messageId
                }
            }
        )
    );
}


/* ================= Action Click ================= */

function handleMessageActionClick(
    event
) {
    const actionButton =
        event.target.closest(
            ".message-action-button"
        );

    if (!actionButton) {
        return;
    }

    const actionsContainer =
        actionButton.closest(
            ".message-actions"
        );

    const messageId =
        actionsContainer?.dataset.messageId;

    if (!messageId) {
        return;
    }

    const action =
        actionButton.dataset.action;

    if (action === "like") {
        handleLikeAction(
            messageId,
            actionsContainer
        );

        return;
    }

    if (action === "dislike") {
        handleDislikeAction(
            messageId,
            actionsContainer
        );

        return;
    }

    if (action === "share") {
        handleShareAction(
            messageId,
            actionButton
        );

        return;
    }

    if (action === "split") {
        handleSplitAction(
            messageId
        );
    }
}


/* ================= Initialize Actions ================= */

export function initializeMessageActions() {
    if (messageActionsInitialized) {
        return;
    }

    if (!chatContainer) {
        console.error(
            "Yukti AI: Message actions initialize nahi hue."
        );

        return;
    }

    chatContainer.addEventListener(
        "click",
        handleMessageActionClick
    );

    messageActionsInitialized = true;
}