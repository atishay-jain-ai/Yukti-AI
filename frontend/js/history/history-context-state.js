/* =========================================================
   Yukti AI — History Context State

   Department:
   Chat History

   Responsibility:
   - Context menu ke liye selected chat ki ID store karna
   - Selected chat ID ko update karna
   - Selected chat ID ko doosri history files ko provide karna
   - Context menu close hone par selection reset karna

   Is file mein:
   - DOM manipulation nahi hoga
   - Event listeners nahi honge
   - Chat rename ya delete logic nahi hoga
   - localStorage operations nahi hongi
========================================================= */


/* =========================================================
   Selected Chat State
========================================================= */

/*
 * Jis chat ka three-dot menu open kiya gaya hai,
 * us chat ki ID yahan temporarily store hogi.
 *
 * Default value null hai kyunki application start hone par
 * koi context-menu chat selected nahi hoti.
 */
let selectedContextChatId = null;


/* =========================================================
   Set Selected Context Chat
========================================================= */

/**
 * Context menu ke liye selected chat ID update karta hai.
 *
 * @param {string} chatId - Selected chat ki unique ID
 * @returns {boolean} State update successful raha ya nahi
 */
export function setSelectedContextChatId(chatId) {
    if (
        typeof chatId !== "string" ||
        !chatId.trim()
    ) {
        console.error(
            "Yukti AI: Selected context chat ID valid string honi chahiye."
        );

        return false;
    }

    selectedContextChatId = chatId;

    return true;
}


/* =========================================================
   Get Selected Context Chat
========================================================= */

/**
 * Context menu ke liye currently selected chat ID return karta hai.
 *
 * @returns {string|null} Selected chat ID ya null
 */
export function getSelectedContextChatId() {
    return selectedContextChatId;
}


/* =========================================================
   Check Context Selection
========================================================= */

/**
 * Check karta hai ki context menu ke liye koi chat
 * selected hai ya nahi.
 *
 * @returns {boolean} Chat selected hone par true
 */
export function hasSelectedContextChat() {
    return selectedContextChatId !== null;
}


/* =========================================================
   Clear Context Selection
========================================================= */

/**
 * Context menu ki selected chat ID reset karta hai.
 *
 * Context menu close hone, rename complete hone ya delete
 * complete hone ke baad is function ko call kiya jayega.
 *
 * @returns {void}
 */
export function clearSelectedContextChat() {
    selectedContextChatId = null;
}