/* =========================================================
   Yukti AI — Chat History Events

   Department:
   Chat History

   Responsibility:
   - History item click handle karna
   - Chat context menu open aur close karna
   - Chat rename events handle karna
   - Chat delete events handle karna
   - Active chat change hone par custom event dispatch karna

   Is file mein history ka data directly modify nahi hoga.
   Saare data operations history-service.js ke through honge.
========================================================= */

import {
    activeChatId
} from "./history-state.js";

import {
    deleteChat,
    getChatById,
    renameChat,
    selectChat
} from "./history-service.js";

import {
    clearSelectedContextChat,
    getSelectedContextChatId,
    setSelectedContextChatId
} from "./history-context-state.js";

import {
    renderChatHistory
} from "./history-renderer.js";

import {
    chatContextMenu,
    chatHistoryList,
    renameChatButton,
    deleteChatButton,
    renameModal,
    renameInput,
    saveRenameButton,
    cancelRenameButton,
    deleteModal,
    confirmDeleteButton,
    cancelDeleteButton
} from "../ui/dom-elements.js";


/* =========================================================
   Initialization State
========================================================= */

/*
 * Ye flag same event listeners ko multiple times register
 * hone se rokega.
 */
let historyEventsInitialized = false;


/* =========================================================
   Chat Changed Event
========================================================= */

/**
 * Application ko batata hai ki active chat change ho gayi hai.
 *
 * Chat renderer future step mein is custom event ko listen karega
 * aur selected chat ke messages screen par render karega.
 *
 * @param {string|null} chatId - Active chat ID
 * @returns {void}
 */
function dispatchChatChangedEvent(chatId) {
    window.dispatchEvent(
        new CustomEvent("yukti:chat-changed", {
            detail: {
                chatId
            }
        })
    );
}


/* =========================================================
   Context Menu Helpers
========================================================= */

/**
 * Chat context menu ko close karta hai.
 *
 * @param {boolean} clearSelection
 * Selected chat ID bhi clear karni hai ya nahi
 *
 * @returns {void}
 */
function closeChatContextMenu(clearSelection = false) {
    if (chatContextMenu) {
        chatContextMenu.style.display = "none";
    }

    if (clearSelection) {
        clearSelectedContextChat();
    }
}


/**
 * Selected chat ke three-dot button ke paas context menu
 * open karta hai.
 *
 * @param {HTMLElement} menuButton - Click kiya gaya menu button
 * @returns {void}
 */
function openChatContextMenu(menuButton) {
    const chatId = menuButton.dataset.chatId;

    if (!chatId || !chatContextMenu) {
        return;
    }

    const selectedChat = getChatById(chatId);

    if (!selectedChat) {
        console.warn(
            `Yukti AI: Context menu ke liye chat "${chatId}" nahi mili.`
        );

        return;
    }

    setSelectedContextChatId(chatId);

    const buttonRect =
        menuButton.getBoundingClientRect();

    /*
     * Menu ko clicked button ke neeche position karein.
     */
    chatContextMenu.style.display = "flex";
    chatContextMenu.style.left =
        `${buttonRect.left}px`;
    chatContextMenu.style.top =
        `${buttonRect.bottom + 6}px`;


    /*
     * Agar menu screen ke right side se bahar ja raha ho,
     * to use right edge ke andar shift karein.
     */
    const menuRect =
        chatContextMenu.getBoundingClientRect();

    const pagePadding = 12;

    if (
        menuRect.right >
        window.innerWidth - pagePadding
    ) {
        const adjustedLeft =
            window.innerWidth -
            menuRect.width -
            pagePadding;

        chatContextMenu.style.left =
            `${Math.max(pagePadding, adjustedLeft)}px`;
    }


    /*
     * Agar menu screen ke bottom se bahar ja raha ho,
     * to use button ke upar show karein.
     */
    if (
        menuRect.bottom >
        window.innerHeight - pagePadding
    ) {
        const adjustedTop =
            buttonRect.top -
            menuRect.height -
            6;

        chatContextMenu.style.top =
            `${Math.max(pagePadding, adjustedTop)}px`;
    }
}


/* =========================================================
   History List Events
========================================================= */

/**
 * History list ke clicks ko event delegation se handle karta hai.
 *
 * Har chat item par alag listener lagane ki jagah poori list par
 * sirf ek listener use kiya gaya hai.
 *
 * @param {MouseEvent} event - History list click event
 * @returns {void}
 */
function handleHistoryListClick(event) {
    const menuButton = event.target.closest(
        '[data-action="open-chat-menu"]'
    );


    /* ---------------------------------------------------------
       Three-dot Menu Click
    --------------------------------------------------------- */

    if (menuButton) {
        event.preventDefault();
        event.stopPropagation();

        openChatContextMenu(menuButton);

        return;
    }


    /* ---------------------------------------------------------
       Chat Item Click
    --------------------------------------------------------- */

    const historyItem = event.target.closest(
        ".chat-item"
    );

    if (!historyItem) {
        return;
    }

    const chatId =
        historyItem.dataset.chatId;

    const selectedChat =
        selectChat(chatId);

    if (!selectedChat) {
        return;
    }

    closeChatContextMenu(true);

    /*
     * Active class update karne ke liye sidebar ko re-render karein.
     */
    renderChatHistory();

    /*
     * Chat renderer ko selected chat load karne ka signal dein.
     */
    dispatchChatChangedEvent(selectedChat.id);
}


/* =========================================================
   Rename Chat Events
========================================================= */

/**
 * Selected chat ke liye rename modal open karta hai.
 *
 * @returns {void}
 */
function openRenameModal() {
    const selectedChatId =
        getSelectedContextChatId();

    const selectedChat =
        getChatById(selectedChatId);

    if (
        !selectedChat ||
        !renameModal ||
        !renameInput
    ) {
        return;
    }

    closeChatContextMenu();

    /*
     * Current title input mein pehle se show karein.
     */
    renameInput.value =
        selectedChat.title;

    renameModal.classList.add("show");

    renameInput.focus();
    renameInput.select();
}


/**
 * Rename modal ko close karta hai.
 *
 * @param {boolean} clearSelection
 * Selected chat ID clear karni hai ya nahi
 *
 * @returns {void}
 */
function closeRenameModal(clearSelection = true) {
    if (renameModal) {
        renameModal.classList.remove("show");
    }

    if (renameInput) {
        renameInput.value = "";
    }

    if (clearSelection) {
        clearSelectedContextChat();
    }
}


/**
 * Rename input ka title selected chat mein save karta hai.
 *
 * @returns {void}
 */
function saveRenamedChat() {
    const selectedChatId =
        getSelectedContextChatId();

    const newTitle =
        renameInput?.value.trim();

    if (!selectedChatId || !newTitle) {
        renameInput?.focus();

        return;
    }

    const renameSuccessful =
        renameChat(
            selectedChatId,
            newTitle
        );

    if (!renameSuccessful) {
        return;
    }

    closeRenameModal(true);

    renderChatHistory();
}


/**
 * Rename input mein Enter press hone par rename save karta hai
 * aur Escape press hone par modal close karta hai.
 *
 * @param {KeyboardEvent} event - Input keyboard event
 * @returns {void}
 */
function handleRenameInputKeydown(event) {
    if (event.key === "Enter") {
        event.preventDefault();

        saveRenamedChat();
    }

    if (event.key === "Escape") {
        closeRenameModal(true);
    }
}


/* =========================================================
   Delete Chat Events
========================================================= */

/**
 * Selected chat ke liye delete confirmation modal open karta hai.
 *
 * @returns {void}
 */
function openDeleteModal() {
    const selectedChatId =
        getSelectedContextChatId();

    if (!getChatById(selectedChatId)) {
        return;
    }

    closeChatContextMenu();

    deleteModal?.classList.add("show");
}


/**
 * Delete modal close karta hai.
 *
 * @param {boolean} clearSelection
 * Selected chat ID clear karni hai ya nahi
 *
 * @returns {void}
 */
function closeDeleteModal(clearSelection = true) {
    deleteModal?.classList.remove("show");

    if (clearSelection) {
        clearSelectedContextChat();
    }
}


/**
 * Selected chat ko permanently history se delete karta hai.
 *
 * @returns {void}
 */
function confirmSelectedChatDelete() {
    const selectedChatId =
        getSelectedContextChatId();

    if (!selectedChatId) {
        return;
    }

    /*
     * Delete se pehle check karein ki selected chat active thi ya nahi.
     */
    const deletedChatWasActive =
        activeChatId === selectedChatId;

    const deleteSuccessful =
        deleteChat(selectedChatId);

    if (!deleteSuccessful) {
        return;
    }

    closeDeleteModal(true);

    renderChatHistory();

    /*
     * Active chat delete hone par chat screen ko reset karne ke liye
     * renderer ko null chatId ke saath signal bhejein.
     */
    if (deletedChatWasActive) {
        dispatchChatChangedEvent(null);
    }
}


/* =========================================================
   Global Events
========================================================= */

/**
 * Context menu ke bahar click hone par menu close karta hai.
 *
 * @param {MouseEvent} event - Document click event
 * @returns {void}
 */
function handleDocumentClick(event) {
    const clickedInsideMenu =
        chatContextMenu?.contains(event.target);

    const clickedMenuButton =
        event.target.closest(
            '[data-action="open-chat-menu"]'
        );

    if (
        !clickedInsideMenu &&
        !clickedMenuButton
    ) {
        closeChatContextMenu(true);
    }
}


/**
 * Escape key se open context menu aur modals close karta hai.
 *
 * @param {KeyboardEvent} event - Document keyboard event
 * @returns {void}
 */
function handleDocumentKeydown(event) {
    if (event.key !== "Escape") {
        return;
    }

    closeChatContextMenu(true);
    closeRenameModal(true);
    closeDeleteModal(true);
}


/* =========================================================
   Initialize History Events
========================================================= */

/**
 * Chat history se related saare event listeners initialize karta hai.
 *
 * Is function ko application startup par sirf ek baar call karna hai.
 *
 * @returns {void}
 */
export function initializeHistoryEvents() {
    if (historyEventsInitialized) {
        return;
    }

    if (!chatHistoryList) {
        console.error(
            "Yukti AI: History events initialize nahi hue kyunki history list nahi mili."
        );

        return;
    }


    /* ---------------------------------------------------------
       History List
    --------------------------------------------------------- */

    chatHistoryList.addEventListener(
        "click",
        handleHistoryListClick
    );


    /* ---------------------------------------------------------
       Context Menu Buttons
    --------------------------------------------------------- */

    renameChatButton?.addEventListener(
        "click",
        openRenameModal
    );

    deleteChatButton?.addEventListener(
        "click",
        openDeleteModal
    );


    /* ---------------------------------------------------------
       Rename Modal
    --------------------------------------------------------- */

    saveRenameButton?.addEventListener(
        "click",
        saveRenamedChat
    );

    cancelRenameButton?.addEventListener(
        "click",
        () => closeRenameModal(true)
    );

    renameInput?.addEventListener(
        "keydown",
        handleRenameInputKeydown
    );


    /* ---------------------------------------------------------
       Delete Modal
    --------------------------------------------------------- */

    confirmDeleteButton?.addEventListener(
        "click",
        confirmSelectedChatDelete
    );

    cancelDeleteButton?.addEventListener(
        "click",
        () => closeDeleteModal(true)
    );


    /* ---------------------------------------------------------
       Global Listeners
    --------------------------------------------------------- */

    document.addEventListener(
        "click",
        handleDocumentClick
    );

    document.addEventListener(
        "keydown",
        handleDocumentKeydown
    );

    /*
     * Window resize ya page scroll hone par context menu close
     * karna safer hai, kyunki uski old position incorrect ho sakti hai.
     */
    window.addEventListener(
        "resize",
        () => closeChatContextMenu(true)
    );

    window.addEventListener(
        "scroll",
        () => closeChatContextMenu(true),
        true
    );


    historyEventsInitialized = true;
}