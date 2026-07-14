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

    const cleanContent =
        String(content);

    const message = {
        role,
        content: cleanContent,
        time: Date.now()
    };

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
            message => ({ ...message })
        );

    return true;
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