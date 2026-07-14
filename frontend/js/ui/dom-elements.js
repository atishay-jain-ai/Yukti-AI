/* =========================================================
   Yukti AI — DOM Elements

   Department:
   User Interface (UI)

   Responsibility:
   - HTML elements ko ID ke through select karna
   - Selected DOM elements ko doosri files ke liye export karna
   - Saare common DOM selectors ko ek jagah manage karna

   Is file mein:
   - Event listeners nahi honge
   - Chat history logic nahi hoga
   - API calls nahi hongi
   - Message send logic nahi hoga
========================================================= */


/* =========================================================
   Home Screen Elements
========================================================= */

/*
 * Ye main landing/home screen hai.
 */
export const homeScreen =
    document.getElementById("homeScreen");


/*
 * Hero section ko future UI features ke liye export kiya gaya hai.
 */
export const heroSection =
    document.getElementById("hero");


/*
 * Features cards ka main container.
 */
export const featureGrid =
    document.getElementById("featureGrid");


/* =========================================================
   Chat Page Elements
========================================================= */

/*
 * Ye poora chat page container hai.
 */
export const chatPage =
    document.getElementById("chatPage");


/*
 * User aur assistant ke messages is container mein render honge.
 */
export const chatContainer =
    document.getElementById("chatContainer");


/* =========================================================
   Prompt Input Elements
========================================================= */

/*
 * User message type karne ke liye textarea/input.
 */
export const promptInput =
    document.getElementById("prompt-input");


/*
 * Message send karne wala button.
 */
export const sendButton =
    document.getElementById("send-btn");


/*
 * Prompt area ka parent section.
 */
export const promptSection =
    document.getElementById("promptSection");


/*
 * Future toolbar options ke liye more button.
 */
export const moreButton =
    document.getElementById("more-btn");


/* =========================================================
   Sidebar Elements
========================================================= */

/*
 * Nayi chat start karne wala sidebar button.
 */
export const newChatButton =
    document.getElementById("new-chat");


/*
 * History section ko open aur close karne wala button.
 */
export const toggleHistoryButton =
    document.getElementById("toggle-history");


/*
 * Chat history list ka wrapper.
 */
export const chatHistoryWrapper =
    document.getElementById("chat-history-wrapper");


/*
 * Individual chat history items is list ke andar render honge.
 */
export const chatHistoryList =
    document.getElementById("chat-history-list");


/*
 * History toggle button ke andar arrow icon.
 *
 * Button available hone par hi querySelector call kiya jayega,
 * taaki missing element ki wajah se app crash na ho.
 */
export const historyToggleIcon =
    toggleHistoryButton
        ? toggleHistoryButton.querySelector("i")
        : null;


/* =========================================================
   Chat Context Menu Elements
========================================================= */

/*
 * Chat ke three-dot button par open hone wala context menu.
 */
export const chatContextMenu =
    document.getElementById("chatContextMenu");


/*
 * Context menu ka rename option.
 */
export const renameChatButton =
    document.getElementById("renameChat");


/*
 * Context menu ka delete option.
 */
export const deleteChatButton =
    document.getElementById("deleteChat");


/* =========================================================
   Rename Modal Elements
========================================================= */

/*
 * Chat rename karne wala modal.
 */
export const renameModal =
    document.getElementById("renameModal");


/*
 * Naya chat title enter karne wala input.
 */
export const renameInput =
    document.getElementById("renameInput");


/*
 * Rename save karne wala button.
 */
export const saveRenameButton =
    document.getElementById("saveRename");


/*
 * Rename operation cancel karne wala button.
 */
export const cancelRenameButton =
    document.getElementById("cancelRename");


/* =========================================================
   Delete Modal Elements
========================================================= */

/*
 * Chat delete confirmation modal.
 */
export const deleteModal =
    document.getElementById("deleteModal");


/*
 * Chat delete confirm karne wala button.
 */
export const confirmDeleteButton =
    document.getElementById("confirmDelete");


/*
 * Chat delete operation cancel karne wala button.
 */
export const cancelDeleteButton =
    document.getElementById("cancelDelete");


/* =========================================================
   DOM Validation
========================================================= */

/*
 * Required elements ki list.
 *
 * Agar HTML mein kisi required element ki ID galat ho jaye,
 * to console warning se problem ko jaldi identify kiya ja sakega.
 */
const requiredElements = {
    homeScreen,
    chatPage,
    chatContainer,
    promptInput,
    sendButton,
    newChatButton,
    toggleHistoryButton,
    chatHistoryWrapper,
    chatHistoryList,
    chatContextMenu,
    renameModal,
    deleteModal
};


/*
 * Har required DOM element ko check karein.
 */
Object.entries(requiredElements).forEach(
    ([elementName, element]) => {
        if (!element) {
            console.warn(
                `Yukti AI: Required DOM element "${elementName}" nahi mila.`
            );
        }
    }
);