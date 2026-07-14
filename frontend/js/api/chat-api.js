/* =========================================================
   Yukti AI — Chat API
========================================================= */


/* ================= API Configuration ================= */

const API_BASE_URL =
    "http://127.0.0.1:8000";

const STREAM_ENDPOINT =
    "/stream";


/* ================= Stream Request ================= */

export async function streamChatResponse(
    prompt,
    onChunk
) {
    const cleanPrompt =
        String(prompt).trim();

    if (!cleanPrompt) {
        throw new Error(
            "Prompt empty nahi ho sakta."
        );
    }

    if (typeof onChunk !== "function") {
        throw new Error(
            "Stream callback function required hai."
        );
    }

    const requestUrl = new URL(
        STREAM_ENDPOINT,
        API_BASE_URL
    );

    requestUrl.searchParams.set(
        "prompt",
        cleanPrompt
    );

    const response = await fetch(
        requestUrl
    );

    if (!response.ok) {
        throw new Error(
            `Backend request failed: ${response.status}`
        );
    }

    if (!response.body) {
        throw new Error(
            "Backend stream available nahi hai."
        );
    }

    return readResponseStream(
        response.body,
        onChunk
    );
}


/* ================= Stream Reader ================= */

async function readResponseStream(
    responseBody,
    onChunk
) {
    const reader =
        responseBody.getReader();

    const decoder =
        new TextDecoder();

    let completeResponse = "";

    try {
        while (true) {
            const {
                done,
                value
            } = await reader.read();

            if (done) {
                break;
            }

            const chunk = decoder.decode(
                value,
                {
                    stream: true
                }
            );

            if (!chunk) {
                continue;
            }

            completeResponse += chunk;

            onChunk(
                chunk,
                completeResponse
            );
        }

        const finalChunk =
            decoder.decode();

        if (finalChunk) {
            completeResponse += finalChunk;

            onChunk(
                finalChunk,
                completeResponse
            );
        }

        return completeResponse;
    } finally {
        reader.releaseLock();
    }
}