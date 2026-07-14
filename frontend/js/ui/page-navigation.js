/* =========================================================
   Yukti AI — Page Navigation
========================================================= */

import {
    homeScreen,
    chatPage
} from "./dom-elements.js";


/* Home se Chat Page */

export function openChatPage() {
    if (!homeScreen || !chatPage) {
        return;
    }

    homeScreen.classList.add("hide");

    setTimeout(() => {
        homeScreen.style.display = "none";
        chatPage.style.display = "flex";
    }, 350);
}


/* Chat se Home Page */

export function openHomePage() {
    if (!homeScreen || !chatPage) {
        return;
    }

    chatPage.style.display = "none";
    homeScreen.style.display = "flex";

    setTimeout(() => {
        homeScreen.classList.remove("hide");
    }, 10);
}


/* Direct Chat Page */

export function showChatPageImmediately() {
    if (!homeScreen || !chatPage) {
        return;
    }

    homeScreen.classList.add("hide");
    homeScreen.style.display = "none";
    chatPage.style.display = "flex";
}


/* Direct Home Page */

export function showHomePageImmediately() {
    if (!homeScreen || !chatPage) {
        return;
    }

    chatPage.style.display = "none";
    homeScreen.style.display = "flex";
    homeScreen.classList.remove("hide");
}