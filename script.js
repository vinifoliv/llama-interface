const $prompt  = document.getElementById('prompt-input');
const $chatbox = document.getElementById('chatbox');
let id = 0;

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

function createResponseCard() {
    const responseCard = document.createElement('div');
    responseCard.className = 'response-card';
    responseCard.id = id + 1;
    id ++;
    const span = document.createElement('span');
    responseCard.appendChild(span);
    $chatbox.appendChild(responseCard);
    return responseCard.id;
}

function updateResponseCard(id, response) {
    const responseCard = document.getElementById(id);
    const span = responseCard.children[0];
    span.innerHTML += response;
}

async function sendPrompt(content) {
    const responseCardId = createResponseCard();

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
        stream: true
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body,
        });

        if (!response.ok) throw new Error(JSON.stringify(response));

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let chunk = '';

        reader.read().then(function processStream({ done, value }) {
            if (done) {
                return;
            }

            chunk = JSON.parse(decoder.decode(value, {stream: true}).split("data: ")[1]);
            const content = chunk.choices[0].delta.content;
            updateResponseCard(responseCardId, content);
            reader.read().then(processStream);
        });

    } catch (error) {
        createResponseCard(error.message);
    }
}