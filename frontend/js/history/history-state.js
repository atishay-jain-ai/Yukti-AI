/* =========================================================
   Yukti AI — Chat History State

   Department:
   Chat History

   Responsibility:
   - सभी chats की in-memory state रखना
   - Active chat की ID रखना
   - History state को controlled functions से update करना

   इस file में:
   - DOM manipulation नहीं होगी
   - Sidebar rendering नहीं होगी
   - Event listeners नहीं होंगे
   - API calls नहीं होंगी
========================================================= */

import {
    loadChats
} from "../storage/chat-storage.js";


/* =========================================================
   Initial History State
========================================================= */

/*
 * Application load होते समय saved chats को localStorage
 * से प्राप्त करके memory में रखा जाता है.
 */
export let chats = loadChats();


/*
 * इस समय open/selected chat की ID.
 *
 * शुरुआत में कोई chat active नहीं होती, इसलिए इसकी
 * default value null रखी गई है.
 */
export let activeChatId = null;


/* =========================================================
   Chats State Setter
========================================================= */

/**
 * पूरी chats array को replace करता है.
 *
 * इसका उपयोग सामान्यतः chat delete करने या future में
 * history import करने के समय किया जाएगा.
 *
 * @param {Array} updatedChats - नई chat history array
 * @returns {boolean} State update successful रहा या नहीं
 */
export function setChats(updatedChats) {
    if (!Array.isArray(updatedChats)) {
        console.error(
            "Yukti AI: History state must be an array."
        );

        return false;
    }

    chats = updatedChats;

    return true;
}


/* =========================================================
   Active Chat State Setter
========================================================= */

/**
 * Active chat की ID update करता है.
 *
 * null देने पर इसका अर्थ है कि अभी कोई chat active नहीं है.
 *
 * @param {string|null} chatId - Active chat की ID
 * @returns {boolean} State update successful रहा या नहीं
 */
export function setActiveChatId(chatId) {
    const isValidId =
        typeof chatId === "string" ||
        chatId === null;

    if (!isValidId) {
        console.error(
            "Yukti AI: Active chat ID must be a string or null."
        );

        return false;
    }

    activeChatId = chatId;

    return true;
}


/* =========================================================
   Reset History State
========================================================= */

/**
 * Memory में मौजूद chat history state को reset करता है.
 *
 * ध्यान दें:
 * यह function localStorage को clear नहीं करता.
 * यह केवल current in-memory state reset करता है.
 */
export function resetHistoryState() {
    chats = [];
    activeChatId = null;
}