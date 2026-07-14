/* =========================================================
   Yukti AI — Prompt Textarea
========================================================= */

import {
    promptInput
} from "./dom-elements.js";


/* ================= Textarea Resize ================= */

export function resizePromptInput() {
    if (!promptInput) {
        return;
    }

    promptInput.style.height = "auto";
    promptInput.style.height =
        `${promptInput.scrollHeight}px`;
}


/* ================= Textarea Reset ================= */

export function resetPromptInput() {
    if (!promptInput) {
        return;
    }

    promptInput.value = "";
    promptInput.style.height = "auto";
}


/* ================= Textarea Focus ================= */

export function focusPromptInput() {
    if (!promptInput) {
        return;
    }

    promptInput.focus();
}


/* ================= Input Value ================= */

export function getPromptValue() {
    if (!promptInput) {
        return "";
    }

    return promptInput.value.trim();
}


/* ================= Textarea Events ================= */

export function initializeTextareaEvents() {
    if (!promptInput) {
        return;
    }

    promptInput.addEventListener(
        "input",
        resizePromptInput
    );
}