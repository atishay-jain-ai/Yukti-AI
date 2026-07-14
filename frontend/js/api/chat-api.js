/* =========================================================
   Yukti AI — Chat API
========================================================= */


/* ================= API Configuration ================= */

const API_BASE_URL =
    "http://127.0.0.1:8000";

const STREAM_ENDPOINT =
    "/stream";


/* ================= Prepare Messages ================= */

function prepareMessages(
    messages
) {
    if (!Array.isArray(messages)) {
        return [];
    }

    return messages
        .filter(message => {
            return (
                message &&
                (
                    message.role === "user" ||
                    message.role === "assistant"
                ) &&
                String(message.content).trim()
            );
        })
        .map(message => {
            return {
                role: message.role,
                content:
                    String(
                        message.content
                    ).trim()
            };
        });
}


/* ================= Stream Request ================= */

export async function streamChatResponse(
    messages,
    onChunk
) {
    const conversation =
        prepareMessages(
            messages
        );

    if (conversation.length === 0) {
        throw new Error(
            "Conversation empty nahi ho sakti."
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

    const response = await fetch(
        requestUrl,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                messages:
                    conversation
            })
        }
    );

    if (!response.ok) {
        const errorMessage =
            await response.text();

        throw new Error(
            errorMessage ||
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

            const chunk =
                decoder.decode(
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
            completeResponse +=
                finalChunk;

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