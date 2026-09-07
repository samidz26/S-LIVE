(function () {
"use strict";

console.log("S-LIVE HOME JS loaded");

let eventSource = null;

const liveAccount =
    document.getElementById("live-account");

const accountButton =
    document.getElementById("live-account-button");

const liveDropdown =
    document.getElementById("live-dropdown");

const disconnectButton =
    document.getElementById("disconnect-button");

const liveUsername =
    document.getElementById("live-username");

const liveProfileImage =
    document.getElementById("live-profile-image");

const liveEventCard =
    document.getElementById("live-event-card");

const memberProfile =
    document.getElementById("member-profile");

const memberName =
    document.getElementById("member-name");

const memberUsername =
    document.getElementById("member-username");


/* =========================================
   ACCOUNT
========================================= */

function setupAccount() {

    const username =
        localStorage.getItem("s_live_username");

    const profilePicture =
        localStorage.getItem("s_live_profile_picture");


    if (username && liveUsername) {

        liveUsername.textContent =
            username.startsWith("@")
                ? username
                : "@" + username;
    }


    if (profilePicture && liveProfileImage) {

        liveProfileImage.src =
            profilePicture;
    }


    if (accountButton) {

        accountButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                if (!liveAccount) return;

                liveAccount.classList.toggle("open");
            }
        );
    }


    document.addEventListener(
        "click",
        function (event) {

            if (
                liveAccount &&
                !liveAccount.contains(event.target)
            ) {
                liveAccount.classList.remove("open");
            }
        }
    );


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
}


/* =========================================
   DISCONNECT
========================================= */

async function disconnectLive() {

    if (liveAccount) {
        liveAccount.classList.remove("open");
    }


    try {

        await fetch(
            "/api/connection/disconnect",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
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
        typeof window.SLive.loadPage === "function"
    ) {

        window.SLive.loadPage("connection");

    } else {

        window.location.reload();
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
   SHOW LAST MEMBER
========================================= */

function showMember(member) {

    if (!member) return;


    const name =
        member.nickname ||
        member.name ||
        member.uniqueId ||
        member.username ||
        "زائر";


    const username =
        member.uniqueId ||
        member.username ||
        "";


    const profilePicture =
        member.profilePictureUrl ||
        member.profilePicture ||
        member.avatar ||
        member.avatarUrl ||
        "";


    console.log(
        "New member:",
        name,
        profilePicture
    );


    if (memberName) {

        memberName.textContent =
            name;
    }


    if (memberUsername) {

        memberUsername.textContent =
            username
                ? "@" + username
                : "";
    }


    if (memberProfile) {

        if (profilePicture) {

            memberProfile.src =
                profilePicture;
        }

        /*
         * لا نجعل الصورة opacity = 0
         * حتى لا تختفي بعد الأنيميشن.
         */
        memberProfile.style.opacity = "1";
    }


    if (liveEventCard) {

        /*
         * إظهار العنصر بشكل دائم
         * بعد أول دخول.
         */
        liveEventCard.classList.add(
            "has-member"
        );


        /*
         * إعادة تشغيل الأنيميشن فقط
         * عند دخول شخص جديد.
         */
        liveEventCard.classList.remove(
            "new-member"
        );


        void liveEventCard.offsetWidth;


        liveEventCard.classList.add(
            "new-member"
        );
    }
}


/* =========================================
   TIKTOK EVENTS
========================================= */

function connectEvents() {

    if (eventSource) {

        try {
            eventSource.close();
        } catch (error) {}
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
                    JSON.parse(event.data);

                showMember(member);

            } catch (error) {

                console.error(
                    "Member event parse error:",
                    error
                );
            }
        }
    );


    eventSource.onerror =
        function () {

            console.log(
                "S-LIVE event stream reconnecting..."
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

            try {
                eventSource.close();
            } catch (error) {}

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
