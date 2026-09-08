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

    const PAGE_STORAGE_KEY =
        "s_live_current_page";


    /* =========================================
       ELEMENTS
    ========================================= */

    function getPageContainer() {

        return document.getElementById(
            "s-live-page-container"
        );
    }


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
       IMAGE
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
         * في صفحة الاتصال:
         * نخفي الحساب مباشرة.
         */

        if (pageName === "connection") {

            account.style.display =
                "none";

            closeAccountDropdown();

            return;
        }


        /*
         * باقي الصفحات:
         * يظهر الحساب.
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
                    ? "@" +
                      username.replace(/^@/, "")
                    : "@username";
        }


        if (profileImage) {

            if (profilePicture) {

                profileImage.src =
                    getImageUrl(
                        profilePicture
                    );

            } else {

                profileImage.removeAttribute(
                    "src"
                );
            }
        }
    }


    /* =========================================
       DROPDOWN
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


        if (dropdown) {

            dropdown.classList.remove(
                "open"
            );

            dropdown.setAttribute(
                "aria-hidden",
                "true"
            );
        }


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
       ACCOUNT MENU
    ========================================= */

    function initializeAccountMenu() {

        const accountButton =
            getAccountButton();


        const dropdown =
            getAccountDropdown();


        if (!accountButton) {

            console.warn(
                "S-LIVE: account button not found"
            );

            return;
        }


        /*
         * منع تسجيل الأحداث أكثر من مرة.
         */

        if (
            accountButton.dataset
                .sLiveInitialized === "true"
        ) {

            updateAccountInfo();

            return;
        }


        accountButton.dataset
            .sLiveInitialized = "true";


        /* فتح القائمة */

        accountButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleAccountDropdown();
            }
        );


        /* منع إغلاقها عند الضغط داخل القائمة */

        if (dropdown) {

            dropdown.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();
                }
            );
        }


        /* الضغط خارج القائمة */

        document.addEventListener(
            "click",
            function () {

                closeAccountDropdown();
            }
        );


        /* Home */

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


        /* Games */

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


        /* Settings */

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


        /* Disconnect */

        const disconnectButton =
            document.getElementById(
                "disconnect-button"
            );


        if (disconnectButton) {

            disconnectButton.addEventListener(
                "click",
                async function () {

                    closeAccountDropdown();


                    /*
                     * نخفي الحساب فورًا.
                     */

                    hideAccountImmediately();


                    /*
                     * ننتقل فورًا إلى Connection
                     * من ناحية الواجهة.
                     */

                    await loadPage(
                        "connection"
                    );


                    /*
                     * ثم نقطع الاتصال في الخلفية.
                     */

                    try {

                        await disconnect();

                    } catch (error) {

                        console.error(
                            "S-LIVE disconnect error:",
                            error
                        );
                    }
                }
            );
        }


        updateAccountInfo();
    }


    /* =========================================
       HIDE ACCOUNT IMMEDIATELY
    ========================================= */

    function hideAccountImmediately() {

        const account =
            getFixedAccount();


        if (account) {

            account.style.display =
                "none";
        }


        closeAccountDropdown();


        /*
         * إزالة صورة واسم الحساب
         * فورًا من الواجهة.
         */

        const usernameElement =
            document.getElementById(
                "live-username"
            );

        const profileImage =
            document.getElementById(
                "live-profile-image"
            );


        if (usernameElement) {

            usernameElement.textContent =
                "@username";
        }


        if (profileImage) {

            profileImage.removeAttribute(
                "src"
            );
        }
    }


    /* =========================================
       SAVE CURRENT PAGE
    ========================================= */

    function saveCurrentPage(
        pageName
    ) {

        if (!pageName) {
            return;
        }


        if (pageName === "connection") {
            return;
        }


        localStorage.setItem(
            PAGE_STORAGE_KEY,
            pageName
        );
    }


    /* =========================================
       GET SAVED PAGE
    ========================================= */

    function getSavedPage() {

        const page =
            localStorage.getItem(
                PAGE_STORAGE_KEY
            );


        const allowedPages = [
            "home",
            "games",
            "settings"
        ];


        if (
            allowedPages.includes(
                page
            )
        ) {

            return page;
        }


        return "home";
    }


    /* =========================================
       LOAD PAGE
    ========================================= */

    async function loadPage(
        pageName
    ) {

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
             * تنظيف الصفحة الحالية
             */

            cleanupCurrentPage();


            /*
             * إغلاق القائمة
             */

            closeAccountDropdown();


            /*
             * إذا كانت Connection:
             * أخف الحساب فورًا.
             */

            if (
                pageName ===
                "connection"
            ) {

                hideAccountImmediately();
            }


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
             * وضع الصفحة الجديدة
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
             * تحديث الصفحة الحالية
             */

            activePage =
                pageName;


            /*
             * حفظ الصفحة
             */

            saveCurrentPage(
                pageName
            );


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
       LOAD CSS
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
       LOAD JS
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
                    `pages/${pageName}/${pageName}.js?ts=${Date.now()}`;


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
         * اطلب من الصفحة الحالية
         * تنظيف كل مواردها.
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


        window.dispatchEvent(
            new CustomEvent(
                "s-live-cleanup"
            )
        );


        /*
         * حذف JS
         */

        if (activePageScript) {

            activePageScript.remove();

            activePageScript =
                null;
        }


        /*
         * حذف CSS
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


        localStorage.removeItem(
            PAGE_STORAGE_KEY
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

        /*
         * الحساب يختفي قبل أي انتظار.
         */

        hideAccountImmediately();


        /*
         * تنظيف الصفحة الحالية.
         */

        window.dispatchEvent(
            new CustomEvent(
                "s-live-cleanup"
            )
        );


        try {

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

            hideAccountImmediately();
        }
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


            const savedPage =
                getSavedPage();


            await loadPage(
                savedPage
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
         * تهيئة قائمة الحساب مرة واحدة.
         */

        initializeAccountMenu();


        const savedUsername =
            getSavedUsername();


        /*
         * لا توجد جلسة.
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
             * السيرفر متصل.
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


                /*
                 * العودة إلى الصفحة
                 * التي كان المستخدم فيها.
                 */

                const savedPage =
                    getSavedPage();


                await loadPage(
                    savedPage
                );


                return;
            }


            /*
             * إعادة الاتصال.
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

        clearSession,

        updateAccountInfo
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
