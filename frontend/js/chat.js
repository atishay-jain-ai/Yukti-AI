export let conversations = [];

export let currentChat = [];

export function addToConversation(role, content) {

    currentChat.push({
        role,
        content,
        time: Date.now()
    });

}

export function clearConversation() {

    currentChat = [];

}

export function saveConversation() {

    if (currentChat.length === 0) return;

    conversations.unshift([...currentChat]);

}