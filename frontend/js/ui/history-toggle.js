/* =========================================================
   Yukti AI — History Toggle
========================================================= */

import {
    chatHistoryWrapper,
    historyToggleIcon,
    toggleHistoryButton
} from "./dom-elements.js";


/* ================= Initialization State ================= */

let historyToggleInitialized = false;


/* ================= Toggle History ================= */

export function toggleChatHistory() {
    if (
        !chatHistoryWrapper ||
        !historyToggleIcon
    ) {
        return;
    }

    chatHistoryWrapper.classList.toggle(
        "show"
    );

    const historyIsOpen =
        chatHistoryWrapper.classList.contains(
            "show"
        );

    historyToggleIcon.className =
        historyIsOpen
            ? "ri-arrow-down-s-line"
            : "ri-arrow-right-s-line";
}


/* ================= Initialize History Toggle ================= */

export function initializeHistoryToggle() {
    if (historyToggleInitialized) {
        return;
    }

    if (!toggleHistoryButton) {
        console.error(
            "Yukti AI: History toggle button nahi mila."
        );

        return;
    }

    toggleHistoryButton.addEventListener(
        "click",
        toggleChatHistory
    );

    historyToggleInitialized = true;
}