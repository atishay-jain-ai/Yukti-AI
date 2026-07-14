/* =========================================================
   Yukti AI — Chat Session State
========================================================= */


/* ================= Conversation State ================= */

export let currentConversation = [];


/* ================= Streaming State ================= */

export let isResponseStreaming = false;


/* ================= Message Elements ================= */

export let currentMessageElement = null;

export let currentBubbleElement = null;


/* ================= Message ID ================= */

function generateMessageId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `message-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}


/* ================= Normalize Message ================= */

function normalizeMessage(message) {
    return {
        id:
            message.id ||
            generateMessageId(),

        role:
            message.role,

        content:
            String(message.content || ""),

        time:
            message.time ||
            Date.now(),

        feedback:
            message.feedback ||
            null
    };
}


/* ================= Add Message ================= */

export function addConversationMessage(
    role,
    content
) {
    const allowedRoles = [
        "user",
        "assistant"
    ];

    if (!allowedRoles.includes(role)) {
        console.error(
            `Yukti AI: Invalid message role "${role}".`
        );

        return null;
    }

    const message = normalizeMessage({
        role,
        content,
        time: Date.now(),
        feedback: null
    });

    currentConversation.push(
        message
    );

    return message;
}


/* ================= Set Conversation ================= */

export function setCurrentConversation(
    messages
) {
    if (!Array.isArray(messages)) {
        console.error(
            "Yukti AI: Conversation messages array honi chahiye."
        );

        return false;
    }

    currentConversation =
        messages.map(
            normalizeMessage
        );

    return true;
}


/* ================= Get Message ================= */

export function getConversationMessage(
    messageId
) {
    return currentConversation.find(
        message =>
            message.id === messageId
    ) || null;
}


/* ================= Update Feedback ================= */

export function updateMessageFeedback(
    messageId,
    feedback
) {
    const allowedFeedback = [
        "like",
        "dislike",
        null
    ];

    if (!allowedFeedback.includes(feedback)) {
        return false;
    }

    const message =
        getConversationMessage(
            messageId
        );

    if (!message) {
        return false;
    }

    message.feedback = feedback;

    return true;
}


/* ================= Conversation Branch ================= */

export function getConversationBranch(
    messageId
) {
    const messageIndex =
        currentConversation.findIndex(
            message =>
                message.id === messageId
        );

    if (messageIndex === -1) {
        return [];
    }

    return currentConversation
        .slice(
            0,
            messageIndex + 1
        )
        .map(
            message => ({ ...message })
        );
}


/* ================= Clear Conversation ================= */

export function clearCurrentConversation() {
    currentConversation = [];
}


/* ================= Set Streaming ================= */

export function setResponseStreaming(value) {
    isResponseStreaming =
        Boolean(value);
}


/* ================= Set Message Element ================= */

export function setCurrentMessageElement(
    element
) {
    currentMessageElement =
        element;
}


/* ================= Set Bubble Element ================= */

export function setCurrentBubbleElement(
    element
) {
    currentBubbleElement =
        element;
}


/* ================= Reset Streaming State ================= */

export function resetStreamingState() {
    isResponseStreaming = false;
    currentMessageElement = null;
    currentBubbleElement = null;
}