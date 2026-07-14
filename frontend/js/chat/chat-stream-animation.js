/* =========================================================
   Yukti AI — Chat Stream Animation
========================================================= */


/* ================= Animation Settings ================= */

const WORD_DELAY = 45;


/* ================= Stream State ================= */

let streamElement = null;
let streamTextNode = null;

let streamQueue = [];
let queuedContentLength = 0;

let streamTimer = null;
let frameCallback = null;

let drainResolvers = [];


/* ================= Tokenizer ================= */

function splitIntoWords(content) {
    return (
        content.match(/\S+\s*|\s+/g) ||
        []
    );
}


/* ================= Drain Resolve ================= */

function resolveDrain() {
    if (
        streamQueue.length ||
        streamTimer
    ) {
        return;
    }

    drainResolvers.forEach(resolve => {
        resolve();
    });

    drainResolvers = [];
}


/* ================= Render Word ================= */

function renderNextWord() {
    streamTimer = null;

    if (
        !streamTextNode ||
        !streamQueue.length
    ) {
        resolveDrain();
        return;
    }

    const nextWord =
        streamQueue.shift();

    streamTextNode.appendData(
        nextWord
    );

    if (
        typeof frameCallback ===
        "function"
    ) {
        frameCallback();
    }

    scheduleNextWord();
}


/* ================= Schedule Word ================= */

function scheduleNextWord() {
    if (
        streamTimer ||
        !streamQueue.length
    ) {
        resolveDrain();
        return;
    }

    streamTimer = setTimeout(
        renderNextWord,
        WORD_DELAY
    );
}


/* ================= Start Stream ================= */

export function startWordStream(
    element,
    onFrame = null
) {
    stopWordStream();

    streamElement = element;
    frameCallback = onFrame;

    streamQueue = [];
    queuedContentLength = 0;

    streamElement.innerHTML = "";

    streamTextNode =
        document.createTextNode("");

    streamElement.appendChild(
        streamTextNode
    );
}


/* ================= Queue Content ================= */

export function queueStreamContent(
    completeContent
) {
    if (!streamTextNode) {
        return;
    }

    const normalizedContent =
        String(completeContent || "");

    const newContent =
        normalizedContent.slice(
            queuedContentLength
        );

    if (!newContent) {
        return;
    }

    queuedContentLength =
        normalizedContent.length;

    streamQueue.push(
        ...splitIntoWords(newContent)
    );

    scheduleNextWord();
}


/* ================= Wait For Stream ================= */

export function waitForWordStream() {
    if (
        !streamQueue.length &&
        !streamTimer
    ) {
        return Promise.resolve();
    }

    return new Promise(resolve => {
        drainResolvers.push(resolve);
    });
}


/* ================= Stop Stream ================= */

export function stopWordStream() {
    if (streamTimer) {
        clearTimeout(streamTimer);
        streamTimer = null;
    }

    streamQueue = [];
    queuedContentLength = 0;

    streamElement = null;
    streamTextNode = null;
    frameCallback = null;

    drainResolvers.forEach(resolve => {
        resolve();
    });

    drainResolvers = [];
}