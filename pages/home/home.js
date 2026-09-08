(function () {
    "use strict";

    console.log("S-LIVE HOME JS loaded");

    let eventSource = null;

    /* =========================================================
       ACCOUNT
    ========================================================= */

    const liveAccount =
        document.getElementById("live-account");

    const accountButton =
        document.getElementById("live-account-button");

    const disconnectButton =
        document.getElementById("disconnect-button");

    const homeButton =
        document.getElementById("home-button");

    const gamesButton =
        document.getElementById("games-button");

    const settingsButton =
        document.getElementById("settings-button");

    const liveUsername =
        document.getElementById("live-username");

    const liveProfileImage =
        document.getElementById("live-profile-image");


    /* =========================================================
       MEMBER
    ========================================================= */

    const memberName =
        document.getElementById("member-name");

    const memberAvatar =
        document.getElementById("member-avatar");


    /* =========================================================
       CENTER EVENT
    ========================================================= */

    const liveEventCard =
        document.getElementById("live-event-card");

    const liveEventAvatar =
        document.getElementById("live-event-avatar");

    const liveEventUsername =
        document.getElementById("live-event-username");

    const liveEventText =
        document.getElementById("live-event-text");


    /* =========================================================
       EVENT QUEUE
    ========================================================= */

    const eventQueue = [];

    let processingEventQueue = false;


    /* =========================================================
       IMAGE
    ========================================================= */

    function getImageUrl(url) {

        if (!url) {
            return "";
        }

        if (
            url.startsWith("/") ||
            url.startsWith("data:") ||
            url.startsWith("blob:")
        ) {
            return url;
        }

        return (
            "/api/connection/proxy-image?url=" +
            encodeURIComponent(url)
        );
    }


    /* =========================================================
       USER HELPERS
    ========================================================= */

    function getUsername(user) {

        if (!user) {
            return "@unknown";
        }

        return (
            user.nickname ||
            user.uniqueId ||
            user.username ||
            "@unknown"
        );
    }


    function getProfilePicture(user) {

        if (!user) {
            return "";
        }

        return (
            user.profilePictureUrl ||
            user.profilePicture ||
            user.avatar ||
            ""
        );
    }


    /* =========================================================
       ACCOUNT SETUP
    ========================================================= */

    function setupAccount() {

        const username =
            localStorage.getItem(
                "s_live_username"
            );

        const profilePicture =
            localStorage.getItem(
                "s_live_profile_picture"
            );


        /* Username */

        if (liveUsername) {

            liveUsername.textContent =
                username
                    ? "@" + username.replace(/^@/, "")
                    : "@username";
        }


        /* Profile picture */

        if (
            liveProfileImage &&
            profilePicture
        ) {

            liveProfileImage.src =
                getImageUrl(profilePicture);

            liveProfileImage.onerror =
                function () {

                    console.warn(
                        "Failed to load live profile image"
                    );

                    this.removeAttribute("src");
                };
        }


        /* =====================================================
           ACCOUNT DROPDOWN
        ===================================================== */

        if (accountButton) {

            accountButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    if (!liveAccount) {
                        return;
                    }

                    const isOpen =
                        liveAccount.classList.contains(
                            "open"
                        );

                    liveAccount.classList.toggle(
                        "open",
                        !isOpen
                    );

                    accountButton.setAttribute(
                        "aria-expanded",
                        String(!isOpen)
                    );
                }
            );
        }


        /* =====================================================
           HOME
        ===================================================== */

        if (homeButton) {

            homeButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    closeAccountMenu();

                    if (
                        window.SLive &&
                        typeof window.SLive.loadPage ===
                            "function"
                    ) {

                        window.SLive.loadPage(
                            "home"
                        );
                    }
                }
            );
        }


        /* =====================================================
           GAMES
        ===================================================== */

        if (gamesButton) {

            gamesButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    closeAccountMenu();

                    if (
                        window.SLive &&
                        typeof window.SLive.loadPage ===
                            "function"
                    ) {

                        window.SLive.loadPage(
                            "games"
                        );
                    }
                }
            );
        }


        /* =====================================================
           SETTINGS
        ===================================================== */

        if (settingsButton) {

            settingsButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    closeAccountMenu();

                    if (
                        window.SLive &&
                        typeof window.SLive.loadPage ===
                            "function"
                    ) {

                        window.SLive.loadPage(
                            "settings"
                        );
                    }
                }
            );
        }


        /* =====================================================
           DISCONNECT
        ===================================================== */

        if (disconnectButton) {

            disconnectButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    disconnectLive();
                }
            );
        }


        /* =====================================================
           CLOSE DROPDOWN WHEN CLICKING OUTSIDE
        ===================================================== */

        document.addEventListener(
            "click",
            handleOutsideAccountClick
        );
    }


    function closeAccountMenu() {

        if (liveAccount) {

            liveAccount.classList.remove(
                "open"
            );
        }

        if (accountButton) {

            accountButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    function handleOutsideAccountClick(event) {

        if (!liveAccount) {
            return;
        }

        if (
            !liveAccount.contains(
                event.target
            )
        ) {

            closeAccountMenu();
        }
    }


    /* =========================================================
       DISCONNECT
    ========================================================= */

    async function disconnectLive() {

        closeAccountMenu();

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
                "Disconnect error:",
                error
            );
        }


        clearSession();


        if (
            window.SLive &&
            typeof window.SLive.loadPage ===
                "function"
        ) {

            window.SLive.loadPage(
                "connection"
            );

        } else {

            window.location.reload();
        }
    }


    /* =========================================================
       CLEAR SESSION
    ========================================================= */

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


    /* =========================================================
       SHOW MEMBER
    ========================================================= */

    function showMember(user) {

        if (!memberName) {
            return;
        }

        const username =
            getUsername(user);

        memberName.textContent =
            username;


        if (memberAvatar) {

            const image =
                getProfilePicture(user);

            if (image) {

                memberAvatar.src =
                    getImageUrl(image);
            }
        }
    }


    /* =========================================================
       EVENT QUEUE
    ========================================================= */

    function queueEvent(event) {

        eventQueue.push(event);

        processEventQueue();
    }


    async function processEventQueue() {

        if (processingEventQueue) {
            return;
        }

        processingEventQueue = true;


        while (eventQueue.length > 0) {

            const event =
                eventQueue.shift();

            try {

                await playLiveEvent(
                    event
                );

            } catch (error) {

                console.error(
                    "Event error:",
                    error
                );
            }
        }


        processingEventQueue = false;
    }


    /* =========================================================
       EVENT DURATION
    ========================================================= */

    function getEventDuration(event) {

        if (!event) {
            return 2500;
        }

        if (
            event.type === "gift"
        ) {
            return 3500;
        }

        if (
            event.type === "subscribe"
        ) {
            return 3000;
        }

        if (
            event.type === "follow"
        ) {
            return 2500;
        }

        if (
            event.type === "member"
        ) {
            return 2200;
        }

        return 2500;
    }


    /* =========================================================
       GIFT TIER
    ========================================================= */

    function getGiftTier(event) {

        const diamondCount =
            Number(
                event?.diamondCount ||
                event?.diamondCountValue ||
                event?.repeatCount ||
                0
            );


        if (diamondCount >= 1000) {
            return "legendary";
        }

        if (diamondCount >= 500) {
            return "epic";
        }

        if (diamondCount >= 100) {
            return "rare";
        }

        return "normal";
    }


    /* =========================================================
       PLAY LIVE EVENT
    ========================================================= */

    function playLiveEvent(event) {

        return new Promise(
            function (resolve) {

                if (!liveEventCard) {

                    resolve();
                    return;
                }


                const username =
                    getUsername(
                        event?.user ||
                        event
                    );


                const profilePicture =
                    getProfilePicture(
                        event?.user ||
                        event
                    );


                if (liveEventUsername) {

                    liveEventUsername.textContent =
                        username;
                }


                if (liveEventAvatar) {

                    if (profilePicture) {

                        liveEventAvatar.src =
                            getImageUrl(
                                profilePicture
                            );

                    } else {

                        liveEventAvatar.removeAttribute(
                            "src"
                        );
                    }
                }


                if (liveEventText) {

                    let text =
                        "نورت اللايف ❤️";


                    switch (event?.type) {

                        case "member":
                            text =
                                "نورت اللايف ❤️";
                            break;

                        case "follow":
                            text =
                                "شكراً على المتابعة 💛";
                            break;

                        case "subscribe":
                            text =
                                "شكراً على الاشتراك 👑";
                            break;

                        case "gift":
                            text =
                                "شكراً على الهدية 🎁";
                            break;

                        case "like":
                            text =
                                "شكراً على التكبيس ❤️";
                            break;

                        case "share":
                            text =
                                "شكراً على المشاركة 🔥";
                            break;

                        default:
                            text =
                                "نورت اللايف ❤️";
                    }


                    liveEventText.textContent =
                        text;
                }


                /* Gift class */

                liveEventCard.classList.remove(
                    "gift-normal",
                    "gift-rare",
                    "gift-epic",
                    "gift-legendary"
                );


                if (
                    event?.type === "gift"
                ) {

                    liveEventCard.classList.add(
                        "gift-" +
                        getGiftTier(event)
                    );
                }


                /* Show */

                liveEventCard.classList.add(
                    "show"
                );


                const duration =
                    getEventDuration(
                        event
                    );


                setTimeout(
                    function () {

                        hideLiveEvent();

                        resolve();

                    },
                    duration
                );
            }
        );
    }


    /* =========================================================
       HIDE LIVE EVENT
    ========================================================= */

    function hideLiveEvent() {

        if (!liveEventCard) {
            return;
        }

        liveEventCard.classList.remove(
            "show"
        );
    }


    /* =========================================================
       EVENT STYLE
    ========================================================= */

    function liveEventCenterStyle(
        event
    ) {

        if (!liveEventCard) {
            return;
        }

        liveEventCard.dataset.type =
            event?.type || "";
    }


    /* =========================================================
       CONNECT SSE EVENTS
    ========================================================= */

    function connectEvents() {

        if (eventSource) {

            try {
                eventSource.close();
            } catch (error) {
                console.warn(error);
            }

            eventSource = null;
        }


        eventSource =
            new EventSource(
                "/api/connection/events"
            );


        /* =====================================================
           MEMBER
        ===================================================== */

        eventSource.addEventListener(
            "member",
            function (event) {

                try {

                    const data =
                        JSON.parse(
                            event.data
                        );

                    console.log(
                        "MEMBER:",
                        data
                    );

                    showMember(
                        data.user ||
                        data
                    );

                    queueEvent({
                        type: "member",
                        user:
                            data.user ||
                            data
                    });

                } catch (error) {

                    console.error(
                        "Member event error:",
                        error
                    );
                }
            }
        );


        /* =====================================================
           GIFT
        ===================================================== */

        eventSource.addEventListener(
            "gift",
            function (event) {

                try {

                    const data =
                        JSON.parse(
                            event.data
                        );

                    console.log(
                        "GIFT:",
                        data
                    );

                    liveEventCenterStyle(
                        data
                    );

                    queueEvent({
                        type: "gift",
                        ...data
                    });

                } catch (error) {

                    console.error(
                        "Gift event error:",
                        error
                    );
                }
            }
        );


        /* =====================================================
           FOLLOW
        ===================================================== */

        eventSource.addEventListener(
            "follow",
            function (event) {

                try {

                    const data =
                        JSON.parse(
                            event.data
                        );

                    console.log(
                        "FOLLOW:",
                        data
                    );

                    queueEvent({
                        type: "follow",
                        ...data
                    });

                } catch (error) {

                    console.error(
                        "Follow event error:",
                        error
                    );
                }
            }
        );


        /* =====================================================
           SUBSCRIBE
        ===================================================== */

        eventSource.addEventListener(
            "subscribe",
            function (event) {

                try {

                    const data =
                        JSON.parse(
                            event.data
                        );

                    console.log(
                        "SUBSCRIBE:",
                        data
                    );

                    queueEvent({
                        type: "subscribe",
                        ...data
                    });

                } catch (error) {

                    console.error(
                        "Subscribe event error:",
                        error
                    );
                }
            }
        );


        /* =====================================================
           OTHER EVENTS
        ===================================================== */

        eventSource.onmessage =
            function (event) {

                try {

                    const data =
                        JSON.parse(
                            event.data
                        );

                    console.log(
                        "SSE EVENT:",
                        data
                    );

                } catch (error) {

                    console.log(
                        "SSE MESSAGE:",
                        event.data
                    );
                }
            };


        /* =====================================================
           ERROR
        ===================================================== */

        eventSource.onerror =
            function (error) {

                console.warn(
                    "SSE connection error:",
                    error
                );
            };
    }


    /* =========================================================
       CLEANUP
    ========================================================= */

    function cleanup() {

        if (eventSource) {

            try {
                eventSource.close();
            } catch (error) {
                console.warn(error);
            }

            eventSource = null;
        }


        document.removeEventListener(
            "click",
            handleOutsideAccountClick
        );
    }


    /* =========================================================
       START
    ========================================================= */

    setupAccount();

    connectEvents();


    /* =========================================================
       PAGE CLEANUP FOR S-LIVE SPA
    ========================================================= */

    window.SLiveHomeCleanup =
        cleanup;

})();
