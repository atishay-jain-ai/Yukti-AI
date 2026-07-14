/* =========================================================
   Yukti AI — Chat History Service

   Department:
   Chat History

   Responsibility:
   - नई chat create करना
   - किसी chat को active बनाना
   - Active chat प्राप्त करना
   - Chat messages update करना
   - Chat title generate/update करना
   - Chat rename और delete करना
   - Changes को localStorage में save करना

   इस file में DOM rendering या event listeners नहीं होंगे.
========================================================= */

import {
    saveChats
} from "../storage/chat-storage.js";

import {
    chats,
    activeChatId,
    setChats,
    setActiveChatId
} from "./history-state.js";


/* =========================================================
   Internal Utilities
========================================================= */

/**
 * नई chat के लिए unique ID बनाता है.
 *
 * Modern browsers में crypto.randomUUID() उपयोग होगा.
 * पुराने browsers के लिए fallback ID भी उपलब्ध है.
 *
 * @returns {string} Unique chat ID
 */
function generateChatId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `chat-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
}


/**
 * Chat history को localStorage में persist करता है.
 *
 * यह छोटा internal helper history operations में
 * saveChats(chats) को बार-बार लिखने से बचाता है.
 *
 * @returns {boolean} Save successful रहा या नहीं
 */
function persistHistory() {
    return saveChats(chats);
}


/* =========================================================
   Find Chat
========================================================= */

/**
 * ID की मदद से किसी chat को प्राप्त करता है.
 *
 * @param {string} chatId - खोजी जाने वाली chat की ID
 * @returns {Object|null} Matching chat या null
 */
export function getChatById(chatId) {
    if (!chatId) {
        return null;
    }

    return chats.find(
        chat => chat.id === chatId
    ) || null;
}


/* =========================================================
   Get Active Chat
========================================================= */

/**
 * इस समय active chat को प्राप्त करता है.
 *
 * @returns {Object|null} Active chat या null
 */
export function getActiveChat() {
    return getChatById(activeChatId);
}


/* =========================================================
   Create Chat
========================================================= */

/**
 * एक नई empty chat बनाता है और उसे active करता है.
 *
 * Empty chat शुरुआत में sidebar history में दिखाई नहीं जाएगी.
 * पहला message send होने के बाद उसका title और isEmpty state
 * update की जाएगी.
 *
 * @returns {Object} नई बनाई गई chat
 */
export function createChat() {
    const newChat = {
        id: generateChatId(),
        title: "",
        messages: [],
        isEmpty: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    /*
     * नई chat को array की शुरुआत में रखते हैं,
     * ताकि latest chat history में सबसे ऊपर दिखाई दे.
     */
    chats.unshift(newChat);

    setActiveChatId(newChat.id);

    return newChat;
}


/* =========================================================
   Select Chat
========================================================= */

/**
 * Existing chat को active बनाता है.
 *
 * @param {string} chatId - Select की जाने वाली chat की ID
 * @returns {Object|null} Selected chat या null
 */
export function selectChat(chatId) {
    const selectedChat = getChatById(chatId);

    if (!selectedChat) {
        console.warn(
            `Yukti AI: Chat not found for ID "${chatId}".`
        );

        return null;
    }

    setActiveChatId(selectedChat.id);

    return selectedChat;
}


/* =========================================================
   Update Chat Title
========================================================= */

/**
 * Active chat के पहले message से title बनाता है.
 *
 * Title केवल empty chat के लिए generate किया जाएगा.
 * पहले से titled chat का title हर message पर नहीं बदलेगा.
 *
 * @param {string} message - User का पहला message
 * @returns {string|null} Updated title या null
 */
export function updateActiveChatTitle(message) {
    const activeChat = getActiveChat();

    if (!activeChat || !activeChat.isEmpty) {
        return null;
    }

    const cleanMessage = String(message).trim();

    if (!cleanMessage) {
        return null;
    }

    const maximumTitleLength = 20;

    activeChat.title =
        cleanMessage.length > maximumTitleLength
            ? `${cleanMessage.slice(0, maximumTitleLength)}...`
            : cleanMessage;

    /*
     * पहला valid message मिलने के बाद chat अब empty नहीं है
     * और sidebar history में दिखाई जा सकती है.
     */
    activeChat.isEmpty = false;
    activeChat.updatedAt = Date.now();

    persistHistory();

    return activeChat.title;
}


/* =========================================================
   Update Chat Messages
========================================================= */

/**
 * Active chat के messages update करके history save करता है.
 *
 * Message objects को clone किया जाता है, ताकि current chat
 * state और saved history accidentally same objects share न करें.
 *
 * @param {Array} messages - Current conversation messages
 * @returns {boolean} Update successful रहा या नहीं
 */
export function updateActiveChatMessages(messages) {
    const activeChat = getActiveChat();

    if (!activeChat) {
        console.warn(
            "Yukti AI: Cannot update messages because no chat is active."
        );

        return false;
    }

    if (!Array.isArray(messages)) {
        console.error(
            "Yukti AI: Chat messages must be an array."
        );

        return false;
    }

    activeChat.messages = messages.map(
        message => ({ ...message })
    );

    activeChat.updatedAt = Date.now();

    return persistHistory();
}


/* =========================================================
   Rename Chat
========================================================= */

/**
 * Existing chat का title manually rename करता है.
 *
 * @param {string} chatId - Rename की जाने वाली chat की ID
 * @param {string} newTitle - नया chat title
 * @returns {boolean} Rename successful रहा या नहीं
 */
export function renameChat(chatId, newTitle) {
    const chat = getChatById(chatId);
    const cleanTitle = String(newTitle).trim();

    if (!chat) {
        console.warn(
            `Yukti AI: Cannot rename missing chat "${chatId}".`
        );

        return false;
    }

    if (!cleanTitle) {
        console.warn(
            "Yukti AI: Chat title cannot be empty."
        );

        return false;
    }

    chat.title = cleanTitle;
    chat.isEmpty = false;
    chat.updatedAt = Date.now();

    return persistHistory();
}


/* =========================================================
   Delete Chat
========================================================= */

/**
 * History से एक chat delete करता है.
 *
 * अगर deleted chat active थी, तो activeChatId को null
 * कर दिया जाएगा.
 *
 * @param {string} chatId - Delete की जाने वाली chat की ID
 * @returns {boolean} Delete successful रहा या नहीं
 */
export function deleteChat(chatId) {
    const chatExists = Boolean(
        getChatById(chatId)
    );

    if (!chatExists) {
        console.warn(
            `Yukti AI: Cannot delete missing chat "${chatId}".`
        );

        return false;
    }

    const updatedChats = chats.filter(
        chat => chat.id !== chatId
    );

    setChats(updatedChats);

    if (activeChatId === chatId) {
        setActiveChatId(null);
    }

    /*
     * setChats() के बाद imported chats live binding नई array को
     * point करती है, इसलिए persistHistory latest state save करेगा.
     */
    return persistHistory();
}