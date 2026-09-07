/*

S-LIVE APP
Main Application Controller

*/

(function () {

"use strict";


/*
=====================================
CONFIGURATION
=====================================
*/

const APP_CONFIG = {

    defaultPage: "connection",

    pagesPath: "pages",

    connectionPage: "connection",

    homePage: "home"

};


/*
=====================================
GLOBAL STATE
=====================================
*/

let currentPage = null;

let loadingPage = false;


/*
=====================================
DOM
=====================================
*/

function getPageContainer() {

    return document.getElementById(
        "middle-section"
    );

}


/*
=====================================
LOAD CSS
=====================================
*/

function loadPageCSS(
    pageName
) {

    const existing =
        document.querySelector(
            `link[data-s-live-page-css="${pageName}"]`
        );


    if (existing) {
        return;
    }


    const link =
        document.createElement(
            "link"
        );


    link.rel =
        "stylesheet";

    link.href =
        `${APP_CONFIG.pagesPath}/${pageName}/${pageName}.css`;

    link.dataset.sLivePageCss =
        pageName;


    document.head.appendChild(
        link
    );

}


/*
=====================================
REMOVE OLD PAGE CSS
=====================================
*/

function removePageCSS(
    exceptPage
) {

    document
        .querySelectorAll(
            "link[data-s-live-page-css]"
        )
        .forEach(
            (link) => {

                if (
                    link.dataset.sLivePageCss !==
                    exceptPage
                ) {

                    link.remove();

                }

            }
        );

}


/*
=====================================
LOAD JAVASCRIPT
=====================================
*/

function loadPageJS(
    pageName
) {

    return new Promise(
        (resolve) => {

            const oldScript =
                document.querySelector(
                    `script[data-s-live-page-js="${pageName}"]`
                );


            /*
            إذا كان الملف موجودًا
            فلا نعيد تحميله
            */

            if (oldScript) {

                resolve();

                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                `${APP_CONFIG.pagesPath}/${pageName}/${pageName}.js`;


            script.dataset.sLivePageJs =
                pageName;


            script.onload =
                () => {

                    resolve();

                };


            script.onerror =
                () => {

                    console.error(
                        `S-LIVE: Failed to load ${pageName}.js`
                    );

                    resolve();

                };


            document.body.appendChild(
                script
            );

        }
    );

}


/*
=====================================
LOAD HTML
=====================================
*/

async function loadPage(
    pageName
) {

    if (
        loadingPage
    ) {

        return;

    }


    if (
        !pageName
    ) {

        pageName =
            APP_CONFIG.defaultPage;

    }


    const container =
        getPageContainer();


    if (!container) {

        console.error(
            "S-LIVE: #middle-section not found"
        );

        return;

    }


    loadingPage =
        true;


    try {

        console.log(
            `S-LIVE: Loading page → ${pageName}`
        );


        /*
        =================================
        LOAD HTML
        =================================
        */

        const response =
            await fetch(
                `${APP_CONFIG.pagesPath}/${pageName}/${pageName}.html`,
                {
                    cache: "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const html =
            await response.text();


        /*
        =================================
        PUT HTML
        =================================
        */

        container.innerHTML =
            html;


        /*
        =================================
        CSS
        =================================
        */

        removePageCSS(
            pageName
        );

        loadPageCSS(
            pageName
        );


        /*
        =================================
        JAVASCRIPT
        =================================
        */

        await loadPageJS(
            pageName
        );


        currentPage =
            pageName;


        console.log(
            `S-LIVE: Page loaded → ${pageName}`
        );


        /*
        =================================
        PAGE EVENT
        =================================
        */

        window.dispatchEvent(
            new CustomEvent(
                "s-live-page-loaded",
                {
                    detail: {
                        page:
                            pageName
                    }
                }
            )
        );


    } catch (error) {

        console.error(
            `S-LIVE: Failed to load page "${pageName}"`,
            error
        );


        /*
        لا نترك الشاشة فارغة
        */

        if (
            pageName !==
            APP_CONFIG.connectionPage
        ) {

            try {

                await loadPage(
                    APP_CONFIG.connectionPage
                );

            } catch (
                connectionError
            ) {

                console.error(
                    connectionError
                );

            }

        } else {

            container.innerHTML = `

                <div style="
                    width:100%;
                    height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    color:white;
                    font-family:Arial,sans-serif;
                    padding:20px;
                ">

                    <div>

                        <h2>
                            S-LIVE
                        </h2>

                        <p>
                            تعذر تحميل صفحة الاتصال
                        </p>

                        <button
                            onclick="location.reload()"
                            style="
                                padding:10px 20px;
                                cursor:pointer;
                            "
                        >
                            إعادة المحاولة
                        </button>

                    </div>

                </div>

            `;

        }


    } finally {

        loadingPage =
            false;

    }

}


/*
=====================================
CHECK SAVED SESSION
=====================================
*/

async function initializeApp() {

    console.log(
        "S-LIVE: Initializing application..."
    );


    const username =
        localStorage.getItem(
            "s_live_username"
        );


    const connected =
        localStorage.getItem(
            "s_live_connected"
        );


    /*
    =================================
    NO SAVED SESSION
    =================================
    */

    if (
        !username ||
        connected !== "true"
    ) {

        console.log(
            "S-LIVE: No saved session"
        );


        await loadPage(
            APP_CONFIG.connectionPage
        );


        return;

    }


    /*
    =================================
    CHECK SERVER
    =================================
    */

    try {

        const response =
            await fetch(
                "/api/connection/status",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        /*
        =================================
        SERVER CONNECTED
        =================================
        */

        if (
            data &&
            data.connected === true
        ) {

            console.log(
                "S-LIVE: Active TikTok connection found"
            );


            /*
            تحديث البيانات
            */

            if (
                data.username
            ) {

                localStorage.setItem(
                    "s_live_username",
                    data.username
                );

            }


            if (
                data.roomId
            ) {

                localStorage.setItem(
                    "s_live_room_id",
                    data.roomId
                );

            }


            if (
                data.profilePictureUrl
            ) {

                localStorage.setItem(
                    "s_live_profile_picture",
                    data.profilePictureUrl
                );

            }


            localStorage.setItem(
                "s_live_connected",
                "true"
            );


            /*
            Home
            */

            await loadPage(
                APP_CONFIG.homePage
            );


            return;

        }


        /*
        =================================
        SERVER NOT CONNECTED
        =================================
        */

        console.log(
            "S-LIVE: Saved session is no longer active"
        );


        clearSavedSession();


        await loadPage(
            APP_CONFIG.connectionPage
        );


    } catch (error) {

        console.warn(
            "S-LIVE: Could not verify server session:",
            error
        );


        /*
        إذا لم يستطع المتصفح الوصول للسيرفر
        لا نذهب إلى Home الوهمية.
        */

        clearSavedSession();


        await loadPage(
            APP_CONFIG.connectionPage
        );

    }

}


/*
=====================================
CLEAR SESSION
=====================================
*/

function clearSavedSession() {

    localStorage.removeItem(
        "s_live_username"
    );

    localStorage.removeItem(
        "s_live_connected"
    );

    localStorage.removeItem(
        "s_live_room_id"
    );

    localStorage.removeItem(
        "s_live_profile_picture"
    );

}


/*
=====================================
LOGOUT / DISCONNECT
=====================================
*/

async function disconnect() {

    try {

        await fetch(
            "/api/connection/disconnect",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    } catch (error) {

        console.error(
            "S-LIVE: Disconnect request failed:",
            error
        );

    }


    clearSavedSession();


    await loadPage(
        APP_CONFIG.connectionPage
    );

}


/*
=====================================
GET CURRENT PAGE
=====================================
*/

function getCurrentPage() {

    return currentPage;

}


/*
=====================================
PUBLIC API
=====================================
*/

window.SLive = {

    loadPage,

    disconnect,

    clearSavedSession,

    getCurrentPage,

    getUsername: function () {

        return localStorage.getItem(
            "s_live_username"
        );

    },

    getProfilePicture: function () {

        return localStorage.getItem(
            "s_live_profile_picture"
        );

    },

    isConnected: function () {

        return (
            localStorage.getItem(
                "s_live_connected"
            ) === "true"
        );

    }

};


/*
=====================================
START APPLICATION
=====================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApp();

    }
);

})();
