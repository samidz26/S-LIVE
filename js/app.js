/* =========================================
   S-LIVE APP
========================================= */

(function () {

    "use strict";


    /* =========================================
       STATE
    ========================================= */

    let activePage = null;
    let activePageScript = null;
    let activePageStyle = null;

    const PAGE_STORAGE_KEY =
        "s_live_current_page";


    const AVAILABLE_PAGES = [
        "home",
        "games",
        "settings"
    ];


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
       ACCOUNT
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


    function showAccount() {

        const account =
            getFixedAccount();


        if (!account) {
            return;
        }


        account.style.display =
            "block";


        updateAccountInfo();
    }


    function hideAccount() {

        const account =
            getFixedAccount();


        if (account) {

            account.style.display =
                "none";
        }


        closeAccountDropdown();


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


    function updateAccountVisibility(
        pageName
    ) {

        if (
            pageName === "connection"
        ) {

            hideAccount();

            return;
        }


        showAccount();
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
            return;
        }


        if (
            accountButton.dataset
                .sLiveInitialized === "true"
        ) {

            return;
        }


        accountButton.dataset
            .sLiveInitialized = "true";


        /* Account */

        accountButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                toggleAccountDropdown();
            }
        );


        /* Dropdown */

        if (dropdown) {

            dropdown.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();
                }
            );
        }


        /* Outside */

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

                    await handleDisconnect();
                }
            );
        }
    }


    /* =========================================
       PAGE STORAGE
    ========================================= */

    function saveCurrentPage(
        pageName
    ) {

        if (
            AVAILABLE_PAGES.includes(
                pageName
            )
        ) {

            localStorage.setItem(
                PAGE_STORAGE_KEY,
                pageName
            );
        }
    }


    function getSavedPage() {

        const savedPage =
            localStorage.getItem(
                PAGE_STORAGE_KEY
            );


        if (
            AVAILABLE_PAGES.includes(
                savedPage
            )
        ) {

            return savedPage;
        }


        return "home";
    }


    function clearSavedPage() {

        localStorage.removeItem(
            PAGE_STORAGE_KEY
        );
    }


    /* =========================================
       PAGE CLEANUP
    ========================================= */

    function cleanupCurrentPage() {

        if (activePage) {

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
        }


        window.dispatchEvent(
            new CustomEvent(
                "s-live-cleanup"
            )
        );


        if (activePageScript) {

            activePageScript.remove();

            activePageScript =
                null;
        }


        if (activePageStyle) {

            activePageStyle.remove();

            activePageStyle =
                null;
        }


        const oldStyle =
            document.getElementById(
                "active-page-style"
            );


        if (oldStyle) {

            oldStyle.remove();
        }


        activePage =
            null;
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
                "S-LIVE: page container not found"
            );

            return false;
        }


        try {

            cleanupCurrentPage();

            closeAccountDropdown();


            if (
                pageName ===
                "connection"
            ) {

                hideAccount();
            }


            const response =
                await fetch(
                    `pages/${pageName}/${pageName}.html`,
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Page could not be loaded"
                );
            }


            const html =
                await response.text();


            pageContainer.innerHTML =
                html;


            await loadPageStyles(
                pageName
            );


            await loadPageScript(
                pageName
            );


            activePage =
                pageName;


            if (
                pageName !==
                "connection"
            ) {

                saveCurrentPage(
                    pageName
                );
            }


            updateAccountVisibility(
                pageName
            );


            return true;


        } catch (error) {

            console.error(
                "S-LIVE page error:",
                error
            );


            pageContainer.innerHTML =
                "";


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
            function (resolve) {

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
            function (resolve) {

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

                        resolve();
                    };


                document.body.appendChild(
                    script
                );
            }
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


    function saveSession(
        data
    ) {

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


        clearSavedPage();
    }


    /* =========================================
       CONNECT
    ========================================= */

    async function connect(
        username
    ) {

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
                .catch(
                    function () {
                        return {};
                    }
                );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "فشل الاتصال باللايف"
            );
        }


        saveSession(
            data
        );


        updateAccountInfo();


        return data;
    }


    /* =========================================
       DISCONNECT
    ========================================= */

    async function handleDisconnect() {

        /*
         * نخفي الحساب فورًا.
         */

        hideAccount();


        /*
         * تنظيف الصفحة الحالية.
         */

        cleanupCurrentPage();


        /*
         * الانتقال مباشرة إلى Connection.
         */

        await loadPage(
            "connection"
        );


        /*
         * قطع اتصال TikTok.
         */

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
                    .catch(
                        function () {
                            return {};
                        }
                    );


            if (
                !response.ok ||
                data.success === false
            ) {

                throw new Error(
                    data.message ||
                    "تعذر قطع الاتصال"
                );
            }


        } catch (error) {

            console.error(
                "S-LIVE disconnect error:",
                error
            );

        } finally {

            clearSession();

            hideAccount();
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


            if (!data.success) {
                return false;
            }


            await loadPage(
                getSavedPage()
            );


            return true;


        } catch (error) {

            console.error(
                "S-LIVE reconnect error:",
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
       INITIALIZE
    ========================================= */

    async function initializeApp() {

        initializeAccountMenu();


        const savedUsername =
            getSavedUsername();


        /*
         * لا توجد جلسة.
         */

        if (!savedUsername) {

            hideAccount();


            await loadPage(
                "connection"
            );


            return;
        }


        try {

            const status =
                await getStatus();


            /*
             * الاتصال ما زال موجودًا.
             */

            if (
                status.success &&
                status.connected
            ) {

                if (status.username) {

                    localStorage.setItem(
                        "s_live_username",
                        String(
                            status.username
                        ).replace(
                            /^@/,
                            ""
                        )
                    );
                }


                if (status.roomId) {

                    localStorage.setItem(
                        "s_live_room_id",
                        String(
                            status.roomId
                        )
                    );
                }


                if (
                    status.profilePicture
                ) {

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
                    getSavedPage()
                );


                return;
            }


            /*
             * الجلسة محفوظة لكن الاتصال
             * غير موجود.
             */

            await reconnectAutomatically(
                savedUsername
            );


        } catch (error) {

            console.error(
                "S-LIVE startup error:",
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

        connect,

        disconnect:
            handleDisconnect,

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
