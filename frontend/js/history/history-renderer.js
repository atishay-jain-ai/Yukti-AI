/* =========================================================
   Yukti AI — Chat History Renderer

   Department:
   Chat History

   Responsibility:
   - Sidebar में chat history list render करना
   - प्रत्येक chat का visual item बनाना
   - Active chat को visually highlight करना
   - Empty chats को history list से छिपाना

   इस file में:
   - Chat create/update/delete logic नहीं होगा
   - Event listeners नहीं होंगे
   - localStorage operations नहीं होंगे
   - API calls नहीं होंगी
========================================================= */

import {
    chats,
    activeChatId
} from "./history-state.js";

import {
    chatHistoryList
} from "../ui/dom-elements.js";


/* =========================================================
   Create Chat History Item
========================================================= */

/**
 * एक chat के लिए sidebar history element बनाता है.
 *
 * यह function केवल element तैयार करता है.
 * Chat select और menu click events को history-events.js
 * event delegation की मदद से संभालेगा.
 *
 * @param {Object} chat - Render की जाने वाली chat
 * @returns {HTMLElement} तैयार chat history element
 */
function createHistoryItem(chat) {
    /*
     * Main chat item container.
     */
    const historyItem = document.createElement("div");

    historyItem.className = "chat-item";
    historyItem.dataset.chatId = chat.id;


    /*
     * Active chat को अलग CSS class दें,
     * ताकि sidebar में selected chat दिखाई दे.
     */
    if (chat.id === activeChatId) {
        historyItem.classList.add("active");
    }


    /* ---------------------------------------------------------
       Chat Title
    --------------------------------------------------------- */

    const titleElement = document.createElement("span");

    titleElement.className = "chat-title";

    /*
     * textContent का उपयोग user-generated titles को HTML की तरह
     * parse होने से रोकता है.
     */
    titleElement.textContent =
        chat.title || "New Chat";


    /* ---------------------------------------------------------
       Chat Menu Button
    --------------------------------------------------------- */

    const menuButton = document.createElement("button");

    menuButton.className = "chat-menu";
    menuButton.type = "button";
    menuButton.dataset.action = "open-chat-menu";
    menuButton.dataset.chatId = chat.id;
    menuButton.setAttribute(
        "aria-label",
        `Open menu for ${chat.title || "New Chat"}`
    );


    /*
     * Remix Icon का menu icon.
     */
    const menuIcon = document.createElement("i");

    menuIcon.className = "ri-more-2-fill";
    menuIcon.setAttribute(
        "aria-hidden",
        "true"
    );

    menuButton.appendChild(menuIcon);


    /* ---------------------------------------------------------
       Assemble Chat Item
    --------------------------------------------------------- */

    historyItem.appendChild(titleElement);
    historyItem.appendChild(menuButton);

    return historyItem;
}


/* =========================================================
   Get Visible Chats
========================================================= */

/**
 * केवल उन chats को return करता है जिनमें पहला message
 * send हो चुका है.
 *
 * @returns {Array} Sidebar में दिखाई जाने वाली chats
 */
function getVisibleChats() {
    return chats.filter(
        chat => !chat.isEmpty
    );
}


/* =========================================================
   Render Chat History
========================================================= */

/**
 * Sidebar की पूरी chat history list render करता है.
 *
 * जब chat create, select, rename या delete होगी,
 * तब इस function को दोबारा call किया जाएगा.
 *
 * @returns {void}
 */
export function renderChatHistory() {
    if (!chatHistoryList) {
        console.error(
            "Yukti AI: Chat history list element was not found."
        );

        return;
    }


    /*
     * पुरानी rendered list clear करें,
     * ताकि duplicate items दिखाई न दें.
     */
    chatHistoryList.innerHTML = "";


    const visibleChats = getVisibleChats();


    /*
     * अगर कोई visible chat नहीं है, तो sidebar list empty रहेगी.
     */
    if (visibleChats.length === 0) {
        return;
    }


    /*
     * DocumentFragment का उपयोग multiple DOM insertions को
     * एक साथ perform करने के लिए किया जाता है.
     */
    const historyFragment =
        document.createDocumentFragment();


    visibleChats.forEach(chat => {
        const historyItem =
            createHistoryItem(chat);

        historyFragment.appendChild(
            historyItem
        );
    });


    chatHistoryList.appendChild(
        historyFragment
    );
}