"use strict";

/* =========================================
   S-LIVE — CONNECTION
========================================= */

const usernameInput =
    document.getElementById("username");

const connectButton =
    document.getElementById("connect-btn");

const connectionStatus =
    document.getElementById("connection-status");


/* =========================================
   STATUS
========================================= */

function setStatus(message, state = "") {

    const text =
        connectionStatus?.querySelector(
            "span:last-child"
        );

    const dot =
        connectionStatus?.querySelector(
            ".status-dot"
        );


    if (text) {
        text.textContent = message;
    }


    if (dot) {

        dot.className = "status-dot";

        if (state) {
            dot.classList.add(state);
        }
    }
}


/* =========================================
   CONNECT
========================================= */

async function startConnection() {

    let username =
        usernameInput.value
            .trim()
            .replace(/^@+/, "")
            .replace(/\s+/g, "");


    if (!username) {

        setStatus(
            "يرجى إدخال اسم مستخدم TikTok",
            "error"
        );

        usernameInput.focus();

        return;
    }


    usernameInput.value =
        "@" + username;


    connectButton.disabled = true;

    connectButton.textContent =
        "جاري الاتصال...";


    setStatus(
        "جاري الاتصال باللايف...",
        "connecting"
    );


    try {

        await SLive.connect(username);


        setStatus(
            "تم الاتصال بنجاح",
            "connected"
        );


        connectButton.textContent =
            "تم الاتصال";


        setTimeout(
            () => SLive.loadPage("home"),
            300
        );


    } catch (error) {

        console.error(
            "S-LIVE connection error:",
            error
        );


        setStatus(
            error.message ||
            "تعذر الاتصال باللايف",
            "error"
        );


        connectButton.disabled =
            false;

        connectButton.textContent =
            "اتصال باللايف";
    }
}


/* =========================================
   EVENTS
========================================= */

connectButton?.addEventListener(
    "click",
    startConnection
);


usernameInput?.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            startConnection();
        }
    }
);
