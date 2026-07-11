export async function askYukti(prompt, onChunk) {

    const response = await fetch(
        `http://127.0.0.1:8000/stream?prompt=${encodeURIComponent(prompt)}`
    );

    if (!response.ok) {
        throw new Error("Backend Error");
    }

    const reader = response.body.getReader();

    const decoder = new TextDecoder();

    while (true) {

        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);

        onChunk(chunk);

    }

}