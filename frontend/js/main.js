/* =========================================================
   Yukti AI — Main Entry
========================================================= */

import {
    initializeApplication
} from "./app/app.js";


/* ================= Start Application ================= */

function startApplication() {
    try {
        initializeApplication();
    } catch (error) {
        console.error(
            "Yukti AI: Application start nahi hui.",
            error
        );
    }
}


/* ================= DOM Ready ================= */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        startApplication,
        {
            once: true
        }
    );
} else {
    startApplication();
}