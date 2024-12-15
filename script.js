const $prompt  = document.getElementById('prompt-input');
const $chatbox = document.getElementById('chatbox');

$prompt.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const prompt = $prompt.value;
        createPromptCard();
        await sendPrompt(prompt);
    }
});

function createPromptCard() {
    const promptCard = document.createElement('div');
    promptCard.className = 'prompt-card';
    const span = document.createElement('span');
    span.innerHTML = $prompt.value;
    promptCard.appendChild(span);
    $chatbox.appendChild(promptCard);
    $prompt.value = '';
}

function createResponseCard(response) {
    const responseCard = document.createElement('div');
    responseCard.className = 'response-card';
    const span = document.createElement('span');
    span.innerHTML = response;
    responseCard.appendChild(span);
    $chatbox.appendChild(responseCard);
}

async function sendPrompt(content) {
    const url = 'http://localhost:11434/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
        model: "llama3.1:8b",
        messages: [
            {
                role: 'user',
                content,
            }
        ],
        stream: false
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body,
        });

        if (!response.ok) throw new Error(JSON.stringify(response));

        const data = await response.json();
        createResponseCard(data.choices[0].message.content);
    } catch (error) {
        createResponseCard(error.message);
    }
}