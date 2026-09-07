/* =========================================
   S-LIVE HOME
========================================= */

(function () {

    "use strict";

    console.log("S-LIVE HOME JS loaded");


    /* =========================================
       ELEMENTS
    ========================================= */

    const account =
        document.getElementById("live-account");

    const accountButton =
        document.getElementById("live-account-button");

    const dropdown =
        document.getElementById("live-dropdown");

    const disconnectButton =
        document.getElementById("disconnect-button");

    const liveUsername =
        document.getElementById("live-username");

    const liveProfileImage =
        document.getElementById("live-profile-image");

    const eventCard =
        document.getElementById("live-event-card");

    const memberProfile =
        document.getElementById("member-profile");

    const memberName =
        document.getElementById("member-name");

    const memberUsername =
        document.getElementById("member-username");


    /* =========================================
       LIVE ACCOUNT
    ========================================= */

    function setupAccount() {

        if (!account || !accountButton || !dropdown) {

            console.error(
                "S-LIVE: عناصر حساب اللايف غير موجودة"
            );

            return;
        }


        const username =
            localStorage.getItem(
                "s_live_username"
            );


        const profilePicture =
            localStorage.getItem(
                "s_live_profile_picture"
            );


        if (username && liveUsername) {

            liveUsername.textContent =
                "@" +
                username.replace(/^@/, "");
        }


        if (
            profilePicture &&
            liveProfileImage
        ) {

            liveProfileImage.src =
                profilePicture;
        }


        /* فتح / إغلاق القائمة */

        accountButton.onclick =
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                const isOpen =
                    account.classList.contains(
                        "open"
                    );


                if (isOpen) {

                    closeDropdown();

                } else {

                    openDropdown();
                }
            };


        /* إغلاق عند الضغط خارج القائمة */

        document.addEventListener(
            "click",
            function (event) {

                if (
                    !account.contains(
                        event.target
                    )
                ) {

                    closeDropdown();
                }
            }
        );


        /* قطع الاتصال */

        if (disconnectButton) {

            disconnectButton.onclick =
                async function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    await disconnectLive();
                };
        }
    }


    /* =========================================
       OPEN DROPDOWN
    ========================================= */

    function openDropdown() {

        account.classList.add(
            "open"
        );

        accountButton.setAttribute(
            "aria-expanded",
            "true"
        );

        dropdown.setAttribute(
            "aria-hidden",
            "false"
        );

        console.log(
            "S-LIVE: dropdown opened"
        );
    }


    /* =========================================
       CLOSE DROPDOWN
    ========================================= */

    function closeDropdown() {

        if (!account) return;

        account.classList.remove(
            "open"
        );

        accountButton.setAttribute(
            "aria-expanded",
            "false"
        );

        dropdown.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    /* =========================================
       DISCONNECT
    ========================================= */

    async function disconnectLive() {

        console.log(
            "S-LIVE: disconnecting..."
        );


        if (disconnectButton) {

            disconnectButton.disabled =
                true;

            disconnectButton.textContent =
                "جاري قطع الاتصال...";
        }


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


            if (!response.ok) {

                throw new Error(
                    "فشل قطع الاتصال"
                );
            }


            console.log(
                "S-LIVE: disconnected"
            );


        } catch (error) {

            console.error(
                "S-LIVE disconnect error:",
                error
            );

        } finally {

            clearSession();


            /*
             * العودة إلى صفحة الاتصال
             */

            if (
                window.SLive &&
                typeof window.SLive.loadPage ===
                    "function"
            ) {

                await window.SLive.loadPage(
                    "connection"
                );

            } else {

                window.location.reload();
            }
        }
    }


    /* =========================================
       CLEAR SESSION
    ========================================= */

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
       MEMBER IMAGE
    ========================================= */

    function setMemberImage(url) {

        if (
            !memberProfile ||
            !url
        ) {
            return;
        }


        memberProfile.onload =
            function () {

                memberProfile.style.opacity =
                    "1";
            };


        memberProfile.onerror =
            function () {

                memberProfile.style.opacity =
                    "0";
            };


        memberProfile.src =
            url;
    }


    /* =========================================
       SHOW MEMBER
    ========================================= */

    function showMember(member) {

        if (!member) return;


        const name =
            member.nickname ||
            member.name ||
            member.uniqueId ||
            "مستخدم TikTok";


        const username =
            member.uniqueId ||
            member.username ||
            "";


        const image =
            member.profilePictureUrl ||
            member.profilePicture ||
            member.avatar ||
            "";


        if (memberName) {

            memberName.textContent =
                name;
        }


        if (memberUsername) {

            memberUsername.textContent =
                username
                    ? "@" +
                      String(username)
                        .replace(/^@/, "")
                    : "";
        }


        if (image) {

            setMemberImage(image);
        }


        if (eventCard) {

            eventCard.classList.remove(
                "new-member"
            );


            void eventCard.offsetWidth;


            eventCard.classList.add(
                "new-member"
            );
        }
    }


    /* =========================================
       SSE
    ========================================= */

    let eventSource = null;


    function connectEvents() {

        if (eventSource) {

            eventSource.close();
        }


        eventSource =
            new EventSource(
                "/api/connection/events"
            );


        eventSource.addEventListener(
            "member",
            function (event) {

                try {

                    const member =
                        JSON.parse(
                            event.data
                        );


                    showMember(member);

                } catch (error) {

                    console.error(
                        "S-LIVE member event error:",
                        error
                    );
                }
            }
        );


        eventSource.onerror =
            function () {

                console.warn(
                    "S-LIVE: SSE connection error"
                );
            };
    }


    /* =========================================
       CLEANUP
    ========================================= */

    window.addEventListener(
        "s-live-cleanup",
        function () {

            if (eventSource) {

                eventSource.close();

                eventSource = null;
            }
        }
    );


    /* =========================================
       START
    ========================================= */

    setupAccount();

    connectEvents();


})();
