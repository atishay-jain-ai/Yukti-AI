export function openChat() {

    document.getElementById("hero").style.display = "none";

    document.getElementById("featureGrid").style.display = "none";

    document.getElementById("chatPage").style.display = "flex";

    document
        .getElementById("promptSection")
        .classList.add("chat-mode");

}