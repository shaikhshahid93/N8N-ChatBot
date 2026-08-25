/* ==========================================
   N8N CONFIGURATION
========================================== */

const N8N_WEBHOOK =
    "https://shahid62.app.n8n.cloud/webhook/ae9c7103-947f-47bf-a345-59f3b3cc9960/chat";


/* ==========================================
   ELEMENTS
========================================== */

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const clearButton = document.getElementById("clearChat");
const suggestions = document.querySelectorAll(".suggestion");


/* ==========================================
   SESSION
========================================== */

let sessionId = localStorage.getItem("admissions_chat_session");

if (!sessionId) {
    sessionId = generateSessionId();

    localStorage.setItem(
        "admissions_chat_session",
        sessionId
    );
}


function generateSessionId() {

    if (
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ) {
        return crypto.randomUUID();
    }

    return (
        "session-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    );
}


/* ==========================================
   TEXT SAFETY
========================================== */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* ==========================================
   ADD MESSAGE
========================================== */

function addMessage(
    text,
    sender = "assistant"
) {

    const row = document.createElement("div");

    row.className =
        sender === "user"
            ? "message-row user-row"
            : "message-row assistant-row";


    const avatar = document.createElement("div");

    avatar.className =
        sender === "user"
            ? "avatar user-avatar"
            : "avatar assistant-avatar";

    if (sender === "user") {
          avatar.innerHTML = `
              <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
              >
                  <circle cx="12" cy="8" r="4"></circle>
                  <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"></path>
              </svg>
          `;
    } else {
          avatar.textContent = "AI";
    }


    const content = document.createElement("div");

    content.className = "message-content";


    const senderName = document.createElement("div");

    senderName.className = "sender";
   
    if (sender === "assistant") {
       senderName.textContent = "Admissions Assistant";
    }


    const message = document.createElement("div");

    message.className =
        sender === "user"
            ? "message user-message"
            : "message assistant-message";


    message.innerHTML = escapeHTML(text);


    content.appendChild(senderName);
    content.appendChild(message);

    row.appendChild(avatar);
    row.appendChild(content);

    messages.appendChild(row);

    scrollToBottom();
}


/* ==========================================
   TYPING INDICATOR
========================================== */

function showTyping() {

    removeTyping();


    const row = document.createElement("div");

    row.id = "typingIndicator";

    row.className =
        "message-row assistant-row";


    const avatar = document.createElement("div");

    avatar.className =
        "avatar assistant-avatar";

    avatar.textContent = "AI";


    const content = document.createElement("div");

    content.className = "message-content";


    const sender = document.createElement("div");

    sender.className = "sender";

    sender.textContent =
        "Admissions Assistant";


    const bubble = document.createElement("div");

    bubble.className =
        "message assistant-message typing-message";


    for (let i = 0; i < 3; i++) {

        const dot =
            document.createElement("span");

        dot.className = "typing-dot";

        bubble.appendChild(dot);
    }


    content.appendChild(sender);
    content.appendChild(bubble);

    row.appendChild(avatar);
    row.appendChild(content);

    messages.appendChild(row);

    scrollToBottom();
}


function removeTyping() {

    const typing =
        document.getElementById(
            "typingIndicator"
        );

    if (typing) {
        typing.remove();
    }
}


/* ==========================================
   LOADING STATE
========================================== */

function setLoading(loading) {

    sendButton.disabled = loading;
    messageInput.disabled = loading;

    if (!loading) {
        messageInput.focus();
    }
}


/* ==========================================
   SCROLL
========================================== */

function scrollToBottom() {

    requestAnimationFrame(() => {

        messages.scrollTop =
            messages.scrollHeight;

    });
}


/* ==========================================
   GET N8N RESPONSE
========================================== */

function extractResponse(data) {

    /*
        n8n can return different structures
        depending on configuration/version.
    */


    if (Array.isArray(data)) {

        if (data.length === 0) {
            return null;
        }

        return extractResponse(data[0]);
    }


    if (!data || typeof data !== "object") {

        if (typeof data === "string") {
            return data;
        }

        return null;
    }


    if (
        typeof data.output === "string"
    ) {
        return data.output;
    }


    if (
        typeof data.text === "string"
    ) {
        return data.text;
    }


    if (
        typeof data.response === "string"
    ) {
        return data.response;
    }


    if (
        typeof data.message === "string"
    ) {
        return data.message;
    }


    if (
        data.data &&
        typeof data.data === "object"
    ) {
        return extractResponse(data.data);
    }


    return null;
}


/* ==========================================
   SEND MESSAGE
========================================== */

async function sendMessage(text) {

    text = text.trim();

    if (!text) {
        return;
    }

    hideSuggestions();


    addMessage(
        text,
        "user"
    );


    messageInput.value = "";

    autoResize();


    setLoading(true);

    showTyping();


    try {

        const response =
            await fetch(
                N8N_WEBHOOK,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        action:
                            "sendMessage",

                        sessionId:
                            sessionId,

                        chatInput:
                            text

                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        removeTyping();


        const answer =
            extractResponse(data);


        if (!answer) {

            throw new Error(
                "The chatbot returned an empty response."
            );
        }


        addMessage(
            answer,
            "assistant"
        );


    } catch (error) {

        console.error(
            "Chat error:",
            error
        );


        removeTyping();


        addMessage(
            "Sorry, I couldn't process that request right now. Please try again.",
            "assistant"
        );

    } finally {

        setLoading(false);

    }

}

function hideSuggestions() {
    const suggestionBox =
        document.querySelector(".suggestions-wrapper");

    if (suggestionBox) {
        suggestionBox.style.display = "none";
    }
}

/* ==========================================
   SEND BUTTON
========================================== */

sendButton.addEventListener(
    "click",
    () => {

        sendMessage(
            messageInput.value
        );

    }
);


/* ==========================================
   ENTER TO SEND
========================================== */

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage(
                messageInput.value
            );

        }

    }
);


/* ==========================================
   AUTO RESIZE TEXTAREA
========================================== */

function autoResize() {

    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            130
        ) + "px";
}


messageInput.addEventListener(
    "input",
    autoResize
);


/* ==========================================
   SUGGESTED QUESTIONS
========================================== */

suggestions.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    button.textContent.trim();

                sendMessage(question);

            }
        );

    }
);


/* ==========================================
   CLEAR CHAT
========================================== */

clearButton.addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "Clear this conversation?"
            );


        if (!confirmed) {
            return;
        }


        messages.innerHTML = "";


        sessionId =
            generateSessionId();


        localStorage.setItem(
            "admissions_chat_session",
            sessionId
        );


        addMessage(
            "Hi! I'm your admissions assistant. How can I help you today?",
            "assistant"
        );


        addSuggestions();


        messageInput.focus();

    }
);


/* ==========================================
   RECREATE SUGGESTIONS
========================================== */

function addSuggestions() {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "suggestions-wrapper";


    const title =
        document.createElement("div");

    title.className =
        "suggestions-title";

    title.textContent =
        "Try asking";


    const container =
        document.createElement("div");

    container.className =
        "suggestions";


    const questions = [

        "What are the admission fees?",

        "When are applications open?",

        "What is the refund policy?",

        "Is there an age limit for admission?"

    ];


    questions.forEach(
        (question) => {

            const button =
                document.createElement("button");

            button.className =
                "suggestion";

            button.textContent =
                question;


            button.addEventListener(
                "click",
                () => {

                    sendMessage(
                        question
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );


    wrapper.appendChild(title);

    wrapper.appendChild(container);

    messages.appendChild(wrapper);

}


/* ==========================================
   INITIALIZE
========================================== */

messageInput.focus();

scrollToBottom();

.message {
    text-align: left;
}
