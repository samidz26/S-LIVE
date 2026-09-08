"use strict";

/* =========================================
   S-LIVE APP
========================================= */

const PAGE_STORAGE = "s_live_current_page";

const PAGES = [
    "home",
    "games",
    "settings"
];

let currentPage = null;
let currentScript = null;
let currentStyle = null;
let loadingPage = false;


/* =========================================
   ELEMENTS
========================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================
   ACCOUNT
========================================= */

function updateAccount() {

    const username =
        localStorage.getItem("s_live_username");

    const picture =
        localStorage.getItem(
            "s_live_profile_picture"
        );

    const name =
        $("live-username");

    const image =
        $("live-profile-image");


    if (name) {

        name.textContent =
            username
                ? "@" + username.replace(/^@/, "")
                : "@username";
    }


    if (image) {

        if (picture) {

            image.src =
                picture.startsWith("/api/")
                    ? picture
                    : "/api/connection/proxy-image?url=" +
                      encodeURIComponent(picture);

        } else {

            image.removeAttribute("src");
        }
    }
}


function showAccount() {

    const element =
        $("s-live-fixed-account");

    if (element) {
        element.style.display = "block";
    }

    updateAccount();
}


function hideAccount() {

    const element =
        $("s-live-fixed-account");

    if (element) {
        element.style.display = "none";
    }

    closeMenu();
}


/* =========================================
   MENU
========================================= */

function openMenu() {

    const menu = $("live-dropdown");

    if (!menu) return;

    menu.classList.add("open");
    menu.setAttribute(
        "aria-hidden",
        "false"
    );

    const button =
        $("live-account-button");

    if (button) {
        button.setAttribute(
            "aria-expanded",
            "true"
        );
    }
}


function closeMenu() {

    const menu = $("live-dropdown");

    if (menu) {

        menu.classList.remove("open");

        menu.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    const button =
        $("live-account-button");

    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


function toggleMenu() {

    const menu = $("live-dropdown");

    if (!menu) return;

    if (menu.classList.contains("open")) {
        closeMenu();
    } else {
        openMenu();
    }
}


/* =========================================
   CLEAN CURRENT PAGE
========================================= */

function cleanupPage() {

    if (currentScript) {
        currentScript.remove();
        currentScript = null;
    }

    if (currentStyle) {
        currentStyle.remove();
        currentStyle = null;
    }

    currentPage = null;
}


/* =========================================
   LOAD CSS
========================================= */

function loadPageCSS(name) {

    const link =
        document.createElement("link");

    link.rel = "stylesheet";

    link.href =
        `pages/${name}/${name}.css`;

    document.head.appendChild(link);

    currentStyle = link;
}


/* =========================================
   LOAD JS
========================================= */

function loadPageJS(name) {

    const script =
        document.createElement("script");

    script.src =
        `pages/${name}/${name}.js?${Date.now()}`;

    /*
     * لا ننتظر تحميل JS
     */

    document.body.appendChild(script);

    currentScript = script;
}


/* =========================================
   LOAD PAGE
========================================= */

async function loadPage(name) {

    if (
        name !== "connection" &&
        !PAGES.includes(name)
    ) {
        return;
    }


    if (loadingPage) {
        return;
    }


    const target =
        $("s-live-page-container");

    if (!target) {
        return;
    }


    loadingPage = true;

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
                "تعذر تحميل الصفحة"
            );
        }


        const html =
            await response.text();


        /*
         * إزالة الصفحة القديمة
         */

        cleanupPage();


        /*
         * عرض الصفحة الجديدة فورًا
         */

        target.innerHTML = html;

        currentPage = name;


        /*
         * CSS و JS يتم تحميلهما
         * بعد ظهور HTML
         */

        loadPageCSS(name);

        loadPageJS(name);


        /*
         * الحساب
         */

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

    } finally {

        loadingPage = false;
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
            String(data.username)
                .replace(/^@/, "")
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
            String(data.roomId)
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
   CONNECT
========================================= */

async function connect(username) {

    const cleanName =
        String(username || "")
            .trim()
            .replace(/^@+/, "")
            .replace(/\s+/g, "");


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
            "فشل الاتصال باللايف"
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

    cleanupPage();

    clearSession();


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


    await loadPage(
        "connection"
    );
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
            "تعذر معرفة حالة الاتصال"
        );
    }


    return response.json();
}


/* =========================================
   MENU EVENTS
========================================= */

function setupMenu() {

    const accountButton =
        $("live-account-button");


    if (accountButton) {

        accountButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleMenu();
            }
        );
    }


    document.addEventListener(
        "click",
        closeMenu
    );


    const home =
        $("home-button");

    const games =
        $("games-button");

    const settings =
        $("settings-button");

    const disconnectButton =
        $("disconnect-button");


    if (home) {

        home.addEventListener(
            "click",
            () => loadPage("home")
        );
    }


    if (games) {

        games.addEventListener(
            "click",
            () => loadPage("games")
        );
    }


    if (settings) {

        settings.addEventListener(
            "click",
            () => loadPage("settings")
        );
    }


    if (disconnectButton) {

        disconnectButton.addEventListener(
            "click",
            disconnect
        );
    }
}


/* =========================================
   START APP
========================================= */

async function startApp() {

    setupMenu();


    const username =
        localStorage.getItem(
            "s_live_username"
        );


    /*
     * لا توجد جلسة
     */

    if (!username) {

        await loadPage(
            "connection"
        );

        return;
    }


    try {

        const status =
            await getStatus();


        /*
         * الاتصال ما زال موجودًا
         */

        if (
            status.success &&
            status.connected
        ) {

            saveSession(status);

            await loadPage(
                localStorage.getItem(
                    PAGE_STORAGE
                ) || "home"
            );

            return;
        }


        /*
         * محاولة إعادة الاتصال
         */

        await connect(username);

        await loadPage(
            localStorage.getItem(
                PAGE_STORAGE
            ) || "home"
        );


    } catch (error) {

        console.error(
            "S-LIVE startup error:",
            error
        );

        clearSession();

        await loadPage(
            "connection"
        );
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
