"use strict";

/* =========================================
   S-LIVE APP
========================================= */

const PAGE_STORAGE = "s_live_current_page";

const pages = ["home", "games", "settings"];

let currentPage = null;
let pageScript = null;
let pageStyle = null;


/* =========================================
   ELEMENTS
========================================= */

const container = () =>
    document.getElementById("s-live-page-container");

const account = () =>
    document.getElementById("s-live-fixed-account");

const dropdown = () =>
    document.getElementById("live-dropdown");


/* =========================================
   ACCOUNT
========================================= */

function updateAccount() {

    const username =
        localStorage.getItem("s_live_username");

    const picture =
        localStorage.getItem("s_live_profile_picture");

    const nameElement =
        document.getElementById("live-username");

    const imageElement =
        document.getElementById("live-profile-image");


    if (nameElement) {
        nameElement.textContent =
            username
                ? "@" + username.replace(/^@/, "")
                : "@username";
    }


    if (imageElement) {

        if (picture) {

            imageElement.src =
                picture.startsWith("/api/")
                    ? picture
                    : "/api/connection/proxy-image?url=" +
                      encodeURIComponent(picture);

        } else {

            imageElement.removeAttribute("src");
        }
    }
}


function showAccount() {

    const element = account();

    if (element) {
        element.style.display = "block";
    }

    updateAccount();
}


function hideAccount() {

    const element = account();

    if (element) {
        element.style.display = "none";
    }

    closeMenu();
}


/* =========================================
   MENU
========================================= */

function openMenu() {

    const menu = dropdown();

    if (!menu) return;

    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");

    const button =
        document.getElementById("live-account-button");

    if (button) {
        button.setAttribute("aria-expanded", "true");
    }
}


function closeMenu() {

    const menu = dropdown();

    if (menu) {
        menu.classList.remove("open");
        menu.setAttribute("aria-hidden", "true");
    }

    const button =
        document.getElementById("live-account-button");

    if (button) {
        button.setAttribute("aria-expanded", "false");
    }
}


function toggleMenu() {

    const menu = dropdown();

    if (!menu) return;

    menu.classList.contains("open")
        ? closeMenu()
        : openMenu();
}


/* =========================================
   PAGE CLEANUP
========================================= */

function cleanupPage() {

    if (pageScript) {
        pageScript.remove();
        pageScript = null;
    }

    if (pageStyle) {
        pageStyle.remove();
        pageStyle = null;
    }

    currentPage = null;
}


/* =========================================
   LOAD PAGE
========================================= */

async function loadPage(name) {

    if (
        name !== "connection" &&
        !pages.includes(name)
    ) {
        return;
    }


    const target = container();

    if (!target) return;


    cleanupPage();
    closeMenu();


    try {

        const response =
            await fetch(
                `pages/${name}/${name}.html`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error(
                `Failed to load ${name}`
            );
        }


        target.innerHTML =
            await response.text();


        /* CSS */

        const style =
            document.createElement("link");

        style.rel = "stylesheet";
        style.href =
            `pages/${name}/${name}.css`;

        document.head.appendChild(style);

        pageStyle = style;


        /* JS */

        const script =
            document.createElement("script");

        script.src =
            `pages/${name}/${name}.js?${Date.now()}`;

        document.body.appendChild(script);

        pageScript = script;


        currentPage = name;


        /* Account */

        if (name === "connection") {

            hideAccount();

        } else {

            showAccount();

            localStorage.setItem(
                PAGE_STORAGE,
                name
            );
        }


    } catch (error) {

        console.error(
            "S-LIVE page error:",
            error
        );

        target.innerHTML = "";
    }
}


/* =========================================
   SESSION
========================================= */

function saveSession(data) {

    if (!data) return;


    if (data.username) {

        localStorage.setItem(
            "s_live_username",
            String(data.username).replace(/^@/, "")
        );
    }


    if (data.profilePicture) {

        localStorage.setItem(
            "s_live_profile_picture",
            data.profilePicture
        );
    }


    if (data.roomId) {

        localStorage.setItem(
            "s_live_room_id",
            data.roomId
        );
    }


    localStorage.setItem(
        "s_live_connected",
        "true"
    );
}


function clearSession() {

    localStorage.removeItem(
        "s_live_username"
    );

    localStorage.removeItem(
        "s_live_profile_picture"
    );

    localStorage.removeItem(
        "s_live_room_id"
    );

    localStorage.removeItem(
        "s_live_connected"
    );

    localStorage.removeItem(
        PAGE_STORAGE
    );
}


/* =========================================
   CONNECTION
========================================= */

async function connect(username) {

    const cleanName =
        String(username || "")
            .trim()
            .replace(/^@/, "");


    if (!cleanName) {
        throw new Error(
            "اسم المستخدم مطلوب"
        );
    }


    const response =
        await fetch(
            "/api/connection/connect",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    username: cleanName
                })
            }
        );


    const data =
        await response.json();


    if (
        !response.ok ||
        !data.success
    ) {
        throw new Error(
            data.message ||
            "فشل الاتصال"
        );
    }


    saveSession(data);
    updateAccount();

    return data;
}


/* =========================================
   DISCONNECT
========================================= */

async function disconnect() {

    hideAccount();


    try {

        await fetch(
            "/api/connection/disconnect",
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.error(
            "Disconnect error:",
            error
        );
    }


    clearSession();

    await loadPage("connection");
}


/* =========================================
   STATUS
========================================= */

async function getStatus() {

    const response =
        await fetch(
            "/api/connection/status",
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {
        throw new Error(
            "Status error"
        );
    }


    return response.json();
}


/* =========================================
   MENU EVENTS
========================================= */

function setupMenu() {

    const accountButton =
        document.getElementById(
            "live-account-button"
        );

    if (accountButton) {

        accountButton.onclick = function (event) {

            event.stopPropagation();
            toggleMenu();
        };
    }


    document.addEventListener(
        "click",
        closeMenu
    );


    const home =
        document.getElementById("home-button");

    const games =
        document.getElementById("games-button");

    const settings =
        document.getElementById("settings-button");

    const disconnectButton =
        document.getElementById("disconnect-button");


    if (home) {
        home.onclick = () =>
            loadPage("home");
    }

    if (games) {
        games.onclick = () =>
            loadPage("games");
    }

    if (settings) {
        settings.onclick = () =>
            loadPage("settings");
    }

    if (disconnectButton) {
        disconnectButton.onclick =
            disconnect;
    }
}


/* =========================================
   START
========================================= */

async function startApp() {

    setupMenu();


    const username =
        localStorage.getItem(
            "s_live_username"
        );


    /* لا توجد جلسة */

    if (!username) {

        await loadPage("connection");
        return;
    }


    try {

        const status =
            await getStatus();


        if (
            status.success &&
            status.connected
        ) {

            saveSession(status);

            await loadPage(
                localStorage.getItem(PAGE_STORAGE) ||
                "home"
            );

            return;
        }


        /* إعادة الاتصال */

        await connect(username);

        await loadPage(
            localStorage.getItem(PAGE_STORAGE) ||
            "home"
        );


    } catch (error) {

        console.error(
            "S-LIVE startup error:",
            error
        );

        clearSession();

        await loadPage("connection");
    }
}


/* =========================================
   PUBLIC API
========================================= */

window.SLive = {

    loadPage,
    connect,
    disconnect,
    getStatus,
    saveSession,
    clearSession,
    updateAccount
};


/* =========================================
   RUN
========================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startApp
    );

} else {

    startApp();
}
