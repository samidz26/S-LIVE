/* =========================================
   S-LIVE APP
========================================= */

(function () {

    "use strict";


    /* =========================================
       GLOBAL STATE
    ========================================= */

    let activePage = null;
    let activePageScript = null;
    let activePageStyle = null;


    /* =========================================
       ELEMENTS
    ========================================= */

    function getAppScreen() {

        return document.getElementById(
            "app-screen"
        );
    }


    /* =========================================
       GET / CREATE FIXED ACCOUNT BAR
    ========================================= */

    function getFixedAccount() {

        let account =
            document.getElementById(
                "s-live-fixed-account"
            );


        if (account) {
            return account;
        }


        account =
            document.createElement(
                "div"
            );


        account.id =
            "s-live-fixed-account";


        account.innerHTML = `

            <div class="live-account">

                <button
                    class="live-account-button"
                    id="live-account-button"
                    type="button"
                    aria-expanded="false"
                >

                    <div class="live-avatar-wrapper">

                        <img
                            id="live-profile-image"
                            class="live-profile-image"
                            src=""
                            alt="TikTok"
                            referrerpolicy="no-referrer"
                        >

                        <span
                            class="live-status-dot"
                            title="متصل"
                        ></span>

                    </div>


                    <div class="live-account-info">

                        <span
                            id="live-username"
                            class="live-username"
                        >
                            @username
                        </span>

                        <span class="live-status-text">
                            LIVE
                        </span>

                    </div>


                    <span
                        class="live-arrow"
                        aria-hidden="true"
                    >
                        ▾
                    </span>

                </button>


                <!-- القائمة المنسدلة -->

                <div
                    class="live-dropdown"
                    id="live-dropdown"
                    aria-hidden="true"
                >

                    <button
                        class="dropdown-icon-button"
                        id="home-button"
                        type="button"
                        aria-label="Home"
                        title="Home"
                    >
                        🏠
                    </button>


                    <button
                        class="dropdown-icon-button"
                        id="games-button"
                        type="button"
                        aria-label="Games"
                        title="Games"
                    >
                        🎮
                    </button>


                    <button
                        class="dropdown-icon-button"
                        id="settings-button"
                        type="button"
                        aria-label="Settings"
                        title="Settings"
                    >
                        ⚙️
                    </button>


                    <button
                        class="dropdown-icon-button disconnect-button"
                        id="disconnect-button"
                        type="button"
                        aria-label="Disconnect"
                        title="Disconnect"
                    >
                        ❌
                    </button>

                </div>

            </div>
        `;


        /*
         * نضع الحساب داخل app-screen
         * لكنه خارج منطقة الصفحات المتغيرة.
         */

        const appScreen =
            getAppScreen();


        if (appScreen) {

            appScreen.appendChild(
                account
            );
        }


        return account;
    }


    /* =========================================
       GET PAGE CONTAINER
    ========================================= */

    function getPageContainer() {

        const appScreen =
            getAppScreen();


        if (!appScreen) {
            return null;
        }


        let container =
            document.getElementById(
                "s-live-page-container"
            );


        if (container) {
            return container;
        }


        container =
            document.createElement(
                "div"
            );


        container.id =
            "s-live-page-container";


        /*
         * الصفحة ستكون هي الجزء المتغير فقط.
         */

        appScreen.insertBefore(
            container,
            appScreen.firstChild
        );


        return container;
    }


    /* =========================================
       LOAD PAGE
    ========================================= */

    async function loadPage(pageName) {

        const appScreen =
            getAppScreen();


        if (!appScreen) {

            console.error(
                "S-LIVE: #app-screen غير موجود"
            );

            return false;
        }


        try {

            /*
             * تأكد من وجود الحساب الثابت
             */

            getFixedAccount();


            /*
             * الحصول على حاوية الصفحات
             */

            const pageContainer =
                getPageContainer();


            if (!pageContainer) {

                throw new Error(
                    "تعذر إنشاء حاوية الصفحة"
                );
            }


            /*
             * تنظيف الصفحة السابقة
             */

            cleanupCurrentPage();


            /*
             * تحميل HTML
             */

            const response =
                await fetch(
                    `pages/${pageName}/${pageName}.html`,
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `تعذر تحميل الصفحة: ${pageName}`
                );
            }


            const html =
                await response.text();


            /*
             * مهم:
             * لا نستخدم appScreen.innerHTML
             *
             * بل نغير محتوى الصفحة فقط.
             */

            pageContainer.innerHTML =
                html;


            /*
             * تحميل CSS
             */

            await loadPageStyles(
                pageName
            );


            /*
             * تحميل JS
             */

            await loadPageScript(
                pageName
            );


            activePage =
                pageName;


            return true;


        } catch (error) {

            console.error(
                "S-LIVE loadPage error:",
                error
            );


            const pageContainer =
                getPageContainer();


            if (pageContainer) {

                pageContainer.innerHTML = `
                    <div style="
                        width:100%;
                        height:100%;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        text-align:center;
                        color:#fff;
                        font-family:inherit;
                        padding:20px;
                        box-sizing:border-box;
                    ">
                        تعذر تحميل الصفحة
                    </div>
                `;
            }


            return false;
        }
    }


    /* =========================================
       LOAD PAGE CSS
    ========================================= */

    function loadPageStyles(
        pageName
    ) {

        return new Promise(
            (resolve) => {

                const link =
                    document.createElement(
                        "link"
                    );


                link.id =
                    "active-page-style";


                link.rel =
                    "stylesheet";


                link.href =
                    `pages/${pageName}/${pageName}.css`;


                link.onload =
                    function () {

                        activePageStyle =
                            link;

                        resolve();
                    };


                link.onerror =
                    function () {

                        console.warn(
                            `S-LIVE: تعذر تحميل CSS لـ ${pageName}`
                        );

                        resolve();
                    };


                document.head.appendChild(
                    link
                );
            }
        );
    }


    /* =========================================
       LOAD PAGE JS
    ========================================= */

    function loadPageScript(
        pageName
    ) {

        return new Promise(
            (resolve) => {

                const script =
                    document.createElement(
                        "script"
                    );


                script.id =
                    "active-page-script";


                script.src =
                    `pages/${pageName}/${pageName}.js`;


                script.onload =
                    function () {

                        activePageScript =
                            script;

                        resolve();
                    };


                script.onerror =
                    function () {

                        console.warn(
                            `S-LIVE: تعذر تحميل JS لـ ${pageName}`
                        );

                        resolve();
                    };


                document.body.appendChild(
                    script
                );
            }
        );
    }


    /* =========================================
       CLEANUP CURRENT PAGE
    ========================================= */

    function cleanupCurrentPage() {

        /*
         * إشعار للصفحة الحالية
         */

        window.dispatchEvent(
            new CustomEvent(
                "s-live-page-changing",
                {
                    detail: {
                        page:
                            activePage
                    }
                }
            )
        );


        /*
         * حذف JS الخاص بالصفحة
         */

        if (activePageScript) {

            activePageScript.remove();

            activePageScript =
                null;
        }


        /*
         * حذف CSS الخاص بالصفحة
         */

        if (activePageStyle) {

            activePageStyle.remove();

            activePageStyle =
                null;

        } else {

            const oldStyle =
                document.getElementById(
                    "active-page-style"
                );

            if (oldStyle) {

                oldStyle.remove();
            }
        }


        /*
         * إغلاق SSE
         */

        window.dispatchEvent(
            new CustomEvent(
                "s-live-cleanup"
            )
        );
    }


    /* =========================================
       SESSION
    ========================================= */

    function getSavedUsername() {

        return localStorage.getItem(
            "s_live_username"
        );
    }


    function saveSession(data) {

        if (!data) {
            return;
        }


        if (data.username) {

            localStorage.setItem(
                "s_live_username",
                String(data.username)
                    .replace(/^@/, "")
            );
        }


        if (data.roomId) {

            localStorage.setItem(
                "s_live_room_id",
                String(data.roomId)
            );
        }


        if (data.profilePicture) {

            localStorage.setItem(
                "s_live_profile_picture",
                data.profilePicture
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
            "s_live_connected"
        );

        localStorage.removeItem(
            "s_live_room_id"
        );

        localStorage.removeItem(
            "s_live_profile_picture"
        );
    }


    /* =========================================
       CONNECT
    ========================================= */

    async function connect(username) {

        const cleanUsername =
            String(username || "")
                .trim()
                .replace(/^@/, "");


        if (!cleanUsername) {

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

                    body:
                        JSON.stringify({
                            username:
                                cleanUsername
                        })
                }
            );


        const data =
            await response.json()
                .catch(() => ({}));


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


        return data;
    }


    /* =========================================
       DISCONNECT
    ========================================= */

    async function disconnect() {

        try {

            window.dispatchEvent(
                new CustomEvent(
                    "s-live-cleanup"
                )
            );


            const response =
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


            const data =
                await response.json()
                    .catch(() => ({}));


            if (
                !response.ok ||
                data.success === false
            ) {

                throw new Error(
                    data.message ||
                    "تعذر قطع الاتصال"
                );
            }


            return true;


        } finally {

            clearSession();
        }
    }


    /* =========================================
       CHECK SERVER STATUS
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


        return await response.json();
    }


    /* =========================================
       AUTOMATIC RECONNECT
    ========================================= */

    async function reconnectAutomatically(
        username
    ) {

        if (!username) {
            return false;
        }


        try {

            const data =
                await connect(
                    username
                );


            await loadPage(
                "home"
            );


            return !!data.success;


        } catch (error) {

            console.error(
                "S-LIVE automatic reconnect error:",
                error
            );


            clearSession();


            await loadPage(
                "connection"
            );


            return false;
        }
    }


    /* =========================================
       INITIALIZE APP
    ========================================= */

    async function initializeApp() {

        const savedUsername =
            getSavedUsername();


        /*
         * لا توجد جلسة
         */

        if (!savedUsername) {

            await loadPage(
                "connection"
            );

            return;
        }


        try {

            const status =
                await getStatus();


            /*
             * السيرفر متصل
             */

            if (
                status.success &&
                status.connected
            ) {

                if (status.username) {

                    localStorage.setItem(
                        "s_live_username",
                        String(status.username)
                            .replace(/^@/, "")
                    );
                }


                if (status.roomId) {

                    localStorage.setItem(
                        "s_live_room_id",
                        String(status.roomId)
                    );
                }


                if (status.profilePicture) {

                    localStorage.setItem(
                        "s_live_profile_picture",
                        status.profilePicture
                    );
                }


                localStorage.setItem(
                    "s_live_connected",
                    "true"
                );


                await loadPage(
                    "home"
                );


                return;
            }


            /*
             * توجد جلسة ولكن السيرفر
             * غير متصل
             */

            await reconnectAutomatically(
                savedUsername
            );


        } catch (error) {

            console.error(
                "S-LIVE startup status error:",
                error
            );


            await reconnectAutomatically(
                savedUsername
            );
        }
    }


    /* =========================================
       PUBLIC API
    ========================================= */

    window.SLive = {

        loadPage,

        initializeApp,

        connect,

        disconnect,

        getStatus,

        reconnectAutomatically,

        clearSession
    };


    /* =========================================
       START
    ========================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeApp
        );

    } else {

        initializeApp();
    }

})();
