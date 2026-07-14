/* =========================================================
   Yukti AI — Chat Storage

   Responsibility:
   - Chat history को localStorage में save करना
   - Saved chat history को localStorage से load करना
   - जरूरत पड़ने पर पूरी history clear करना

   इस file में UI, DOM या message rendering का code नहीं आएगा.
========================================================= */

const CHAT_STORAGE_KEY = "yukti_chats";


/* =========================================================
   Load Chats
========================================================= */

/**
 * Browser के localStorage से saved chats प्राप्त करता है.
 *
 * @returns {Array} Saved chats की array
 */
export function loadChats() {
    try {
        const storedChats = localStorage.getItem(CHAT_STORAGE_KEY);

        // पहली बार app खुलने पर कोई history मौजूद नहीं होगी.
        if (!storedChats) {
            return [];
        }

        const parsedChats = JSON.parse(storedChats);

        // Invalid saved value के कारण app को crash होने से बचाएँ.
        if (!Array.isArray(parsedChats)) {
            console.warn(
                "Yukti AI: Saved chat history is not a valid array."
            );

            return [];
        }

        return parsedChats;
    } catch (error) {
        /*
         * JSON corrupt होने या localStorage unavailable होने पर
         * application को empty history के साथ चलने दें.
         */
        console.error(
            "Yukti AI: Unable to load chat history.",
            error
        );

        return [];
    }
}


/* =========================================================
   Save Chats
========================================================= */

/**
 * पूरी chat history को localStorage में save करता है.
 *
 * @param {Array} chats - Save की जाने वाली chats
 * @returns {boolean} Save successful रहा या नहीं
 */
export function saveChats(chats) {
    if (!Array.isArray(chats)) {
        console.error(
            "Yukti AI: Cannot save chat history because chats is not an array."
        );

        return false;
    }

    try {
        const serializedChats = JSON.stringify(chats);

        localStorage.setItem(
            CHAT_STORAGE_KEY,
            serializedChats
        );

        return true;
    } catch (error) {
        console.error(
            "Yukti AI: Unable to save chat history.",
            error
        );

        return false;
    }
}


/* =========================================================
   Clear Chats
========================================================= */

/**
 * Browser से Yukti AI की पूरी saved chat history remove करता है.
 *
 * @returns {boolean} Remove operation successful रहा या नहीं
 */
export function clearChats() {
    try {
        localStorage.removeItem(CHAT_STORAGE_KEY);

        return true;
    } catch (error) {
        console.error(
            "Yukti AI: Unable to clear chat history.",
            error
        );

        return false;
    }
}