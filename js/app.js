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


    function getPageContainer() {

        return document.getElementById(
            "s-live-page-container"
        );
    }


    /* =========================================
       FIXED ACCOUNT
       الحساب الثابت
    ========================================= */

    function getFixedAccount() {

        return document.getElementById(
            "s-live-fixed-account"
        );
    }


    function getAccountButton() {

        return document.getElementById(
            "live-account-button"
        );
    }


    function getAccountDropdown() {

        return document.getElementById(
            "live-dropdown"
        );
    }


    /* =========================================
       ACCOUNT VISIBILITY
    ========================================= */

    function updateFixedAccountVisibility(
        pageName
    ) {

        const account =
            getFixedAccount();


        if (!account) {
            return;
        }


        /*
         * الحساب لا يظهر في صفحة الاتصال
         */

        if (pageName === "connection") {

            account.style.display =
                "none";

            closeAccountDropdown();

            return;
        }


        /*
         * يظهر في Home / Games / Settings
         */

        account.style.display =
            "block";


        updateAccountInfo();
    }


    /* =========================================
       ACCOUNT INFO
    ========================================= */

    function updateAccountInfo() {

        const usernameElement =
            document.getElementById(
                "live-username"
            );

        const profileImage =
            document.getElementById(
                "live-profile-image"
            );


        const username =
            localStorage.getItem(
                "s_live_username"
            );


        const profilePicture =
            localStorage.getItem(
                "s_live_profile_picture"
            );


        if (usernameElement) {

            usernameElement.textContent =
                username
                    ? "@" + username.replace(/^@/, "")
                    : "@username";
        }


        if (
            profileImage &&
            profilePicture
        ) {

            profileImage.src =
                getImageUrl(
                    profilePicture
                );
        }
    }


    /* =========================================
       IMAGE URL
    ========================================= */

    function getImageUrl(url) {

        if (!url) {
            return "";
        }


        if (
            url.startsWith("/api/") ||
            url.startsWith("data:")
        ) {

            return url;
        }


        return (
            "/api/connection/proxy-image?url=" +
            encodeURIComponent(url)
        );
    }


    /* =========================================
       ACCOUNT DROPDOWN
    ========================================= */

    function openAccountDropdown() {

        const dropdown =
            getAccountDropdown();

        const button =
            getAccountButton();


        if (!dropdown) {
            return;
        }


        dropdown.classList.add(
            "open"
        );


        dropdown.setAttribute(
            "aria-hidden",
            "false"
        );


        if (button) {

            button.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    }


    function closeAccountDropdown() {

        const dropdown =
            getAccountDropdown();

        const button =
            getAccountButton();


        if (!dropdown) {
            return;
        }


        dropdown.classList.remove(
            "open"
        );


        dropdown.setAttribute(
            "aria-hidden",
            "true"
        );


        if (button) {

            button.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    function toggleAccountDropdown() {

        const dropdown =
            getAccountDropdown();


        if (!dropdown) {
            return;
        }


        if (
            dropdown.classList.contains(
                "open"
            )
        ) {

            closeAccountDropdown();

        } else {

            openAccountDropdown();
        }
    }


    /* =========================================
       ACCOUNT EVENTS
    ========================================= */

    function initializeAccountMenu() {

        const accountButton =
            getAccountButton();

        const dropdown =
            getAccountDropdown();


        if (!accountButton) {

            console.warn(
                "S-LIVE: live-account-button غير موجود"
            );

            return;
        }


        /*
         * منع تكرار الأحداث
         */

        if (
            accountButton.dataset
                .sLiveInitialized === "true"
        ) {

            return;
        }


        accountButton.dataset
            .sLiveInitialized = "true";


        /*
         * فتح / إغلاق القائمة
         */

        accountButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleAccountDropdown();
            }
        );


        /*
         * منع إغلاق القائمة عند الضغط داخلها
         */

        if (dropdown) {

            dropdown.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();
                }
            );
        }


        /*
         * الضغط خارج القائمة
         */

        document.addEventListener(
            "click",
            function () {

                closeAccountDropdown();
            }
        );


        /*
         * Home
         */

        const homeButton =
            document.getElementById(
                "home-button"
            );


        if (homeButton) {

            homeButton.addEventListener(
                "click",
                async function () {

                    closeAccountDropdown();

                    await loadPage(
                        "home"
                    );
                }
            );
        }


        /*
         * Games
         */

        const gamesButton =
            document.getElementById(
                "games-button"
            );


        if (gamesButton) {

            gamesButton.addEventListener(
                "click",
                async function () {

                    closeAccountDropdown();

                    await loadPage(
                        "games"
                    );
                }
            );
        }


        /*
         * Settings
         */

        const settingsButton =
            document.getElementById(
                "settings-button"
            );


        if (settingsButton) {

            settingsButton.addEventListener(
                "click",
                async function () {

                    closeAccountDropdown();

                    await loadPage(
                        "settings"
                    );
                }
            );
        }


        /*
         * Disconnect
         */

        const disconnectButton =
            document.getElementById(
                "disconnect-button"
            );


        if (disconnectButton) {

            disconnectButton.addEventListener(
                "click",
                async function () {

                    closeAccountDropdown();

                    await disconnect();

                    await loadPage(
                        "connection"
                    );
                }
            );
        }


        /*
         * تحديث بيانات الحساب
         */

        updateAccountInfo();
    }


    /* =========================================
       LOAD PAGE
    ========================================= */

    async function loadPage(pageName) {

        const pageContainer =
            getPageContainer();


        if (!pageContainer) {

            console.error(
                "S-LIVE: #s-live-page-container غير موجود"
            );

            return false;
        }


        try {

            /*
             * تنظيف الصفحة السابقة
             */

            cleanupCurrentPage();


            /*
             * إغلاق القائمة
             */

            closeAccountDropdown();


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
             * تحميل محتوى الصفحة فقط
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


            /*
             * الصفحة الحالية
             */

            activePage =
                pageName;


            /*
             * إظهار / إخفاء الحساب
             */

            updateFixedAccountVisibility(
                pageName
            );


            return true;


        } catch (error) {

            console.error(
                "S-LIVE loadPage error:",
                error
            );


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
         * إشعار الصفحة الحالية
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
         * حذف JS الصفحة
         */

        if (activePageScript) {

            activePageScript.remove();

            activePageScript =
                null;
        }


        /*
         * حذف CSS الصفحة
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

        updateAccountInfo();


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

            updateAccountInfo();

            closeAccountDropdown();
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

        /*
         * تشغيل قائمة الحساب مرة واحدة
         */

        initializeAccountMenu();


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


                updateAccountInfo();


                await loadPage(
                    "home"
                );


                return;
            }


            /*
             * إعادة الاتصال
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
