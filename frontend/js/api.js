export async function askYukti(prompt) {

    const response = await fetch(
        `http://127.0.0.1:8000/ask?prompt=${encodeURIComponent(prompt)}`
    );

    if (!response.ok) {

        throw new Error("Backend Error");

    }

    return await response.json();

}