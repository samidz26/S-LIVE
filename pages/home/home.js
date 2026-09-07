(function () {
"use strict";

console.log("S-LIVE HOME JS loaded");

let eventSource = null;

/*

ACCOUNT

*/

const liveAccount =
document.getElementById("live-account");

const accountButton =
document.getElementById("live-account-button");

const disconnectButton =
document.getElementById("disconnect-button");

const liveUsername =
document.getElementById("live-username");

const liveProfileImage =
document.getElementById("live-profile-image");

/*

MEMBER

*/

const liveEventCard =
document.getElementById("live-event-card");

const memberProfile =
document.getElementById("member-profile");

const memberName =
document.getElementById("member-name");

const memberUsername =
document.getElementById("member-username");

/*

CENTER EVENT

*/

const liveEventsCenter =
document.getElementById("live-events-center");

const liveEventType =
document.getElementById("live-event-type");

const liveEventAvatar =
document.getElementById("live-event-avatar");

const liveEventAvatarWrapper =
document.getElementById("live-event-avatar-wrapper");

const liveEventUser =
document.getElementById("live-event-user");

const liveEventContent =
document.getElementById("live-event-content");

const liveEventValue =
document.getElementById("live-event-value");

/*

EVENT QUEUE

*/

const eventQueue = [];

let eventIsPlaying = false;

/*

IMAGE

*/

function getImageUrl(url) {

if (!url) {
    return "";
}

return (
    "/api/connection/proxy-image?url=" +
    encodeURIComponent(url)
);

}

/*

USER

*/

function getUserName(data) {

if (!data) {
    return "زائر";
}

return (
    data.nickname ||
    data.name ||
    data.uniqueId ||
    data.username ||
    "زائر"
);

}

function getUserUsername(data) {

if (!data) {
    return "";
}

return (
    data.uniqueId ||
    data.username ||
    ""
);

}

function getUserProfile(data) {

if (!data) {
    return "";
}

return (
    data.profilePictureUrl ||
    data.profilePicture ||
    data.avatar ||
    data.avatarUrl ||
    data.userAvatar ||
    ""
);

}

/*

ACCOUNT SETUP

*/

function setupAccount() {

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
        username.startsWith("@")
            ? username
            : "@" + username;
}


if (
    profilePicture &&
    liveProfileImage
) {

    liveProfileImage.src =
        profilePicture;
}


if (accountButton) {

    accountButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            if (!liveAccount) {
                return;
            }

            liveAccount.classList.toggle(
                "open"
            );
        }
    );
}


document.addEventListener(
    "click",
    function (event) {

        if (
            liveAccount &&
            !liveAccount.contains(
                event.target
            )
        ) {

            liveAccount.classList.remove(
                "open"
            );
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

/*

DISCONNECT

*/

async function disconnectLive() {

if (liveAccount) {

    liveAccount.classList.remove(
        "open"
    );
}


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

/*

CLEAR SESSION

*/

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

/*

LAST MEMBER

*/

function showMember(member) {

if (!member) {
    return;
}


const name =
    getUserName(member);

const username =
    getUserUsername(member);

const profilePicture =
    getUserProfile(member);


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
            getImageUrl(
                profilePicture
            );
    }

    memberProfile.style.opacity =
        "1";
}


if (liveEventCard) {

    liveEventCard.classList.add(
        "has-member"
    );

    liveEventCard.classList.remove(
        "new-member"
    );

    void liveEventCard.offsetWidth;

    liveEventCard.classList.add(
        "new-member"
    );
}

}

/*

QUEUE ONLY IMPORTANT EVENTS

*/

function queueEvent(type, data) {

/*
 * فقط:
 * gift
 * follow
 * subscribe
 */

if (
    type !== "gift" &&
    type !== "follow" &&
    type !== "subscribe"
) {
    return;
}


if (!data) {
    return;
}


/*
 * الهدايا لها الأولوية
 */

if (type === "gift") {

    eventQueue.unshift({
        type: type,
        data: data
    });

} else {

    eventQueue.push({
        type: type,
        data: data
    });
}


/*
 * منع الطابور من التضخم
 */

if (eventQueue.length > 10) {

    eventQueue.splice(
        10
    );
}


processEventQueue();

}

/*

QUEUE PROCESS

*/

function processEventQueue() {

if (eventIsPlaying) {
    return;
}


if (
    eventQueue.length === 0
) {
    return;
}


const event =
    eventQueue.shift();


playLiveEvent(
    event.type,
    event.data
);

}

/*

DURATION

*/

function getEventDuration(type) {

switch (type) {

    case "gift":
        return 4000;

    case "subscribe":
        return 3000;

    case "follow":
        return 2800;

    default:
        return 3000;
}

}

/*

GIFT LEVEL

*/

function getGiftTier(value) {

value =
    Number(value) || 0;


if (value >= 1000) {
    return "legendary";
}


if (value >= 500) {
    return "large";
}


if (value >= 100) {
    return "medium";
}


return "small";

}

/*

PLAY EVENT

*/

function playLiveEvent(
type,
data
) {

if (!liveEventsCenter) {
    return;
}


eventIsPlaying = true;


const name =
    getUserName(data);

const username =
    getUserUsername(data);

const profilePicture =
    getUserProfile(data);


/*
 * RESET
 */

liveEventsCenter.className =
    "live-events-center";


void liveEventsCenter.offsetWidth;


/*
 * SHOW
 */

liveEventsCenter.classList.add(
    "show"
);

liveEventsCenter.classList.add(
    "event-" + type
);


/*
 * USER
 */

if (liveEventUser) {

    liveEventUser.textContent =
        username
            ? "@" + username
            : name;
}


/*
 * AVATAR
 */

if (liveEventAvatar) {

    if (profilePicture) {

        liveEventAvatar.src =
            getImageUrl(
                profilePicture
            );

        liveEventAvatar.style.display =
            "block";

    } else {

        liveEventAvatar.style.display =
            "none";
    }
}


/*
 * CLEAR
 */

if (liveEventType) {
    liveEventType.textContent = "";
}

if (liveEventContent) {
    liveEventContent.textContent = "";
}

if (liveEventValue) {
    liveEventValue.textContent = "";
}


/*
 ======================================
 FOLLOW
 ======================================
 */

if (type === "follow") {

    liveEventCenterStyle(
        "follow"
    );


    if (liveEventType) {

        liveEventType.textContent =
            "❤️ متابعة جديدة";
    }


    if (liveEventContent) {

        liveEventContent.textContent =
            "شكرًا على المتابعة";
    }
}


/*
 ======================================
 SUBSCRIBE
 ======================================
 */

else if (type === "subscribe") {

    liveEventCenterStyle(
        "subscribe"
    );


    if (liveEventType) {

        liveEventType.textContent =
            "⭐ اشتراك جديد";
    }


    if (liveEventContent) {

        liveEventContent.textContent =
            "أهلًا بك في العائلة 👑";
    }
}


/*
 ======================================
 GIFT
 ======================================
 */

else if (type === "gift") {

    const giftName =
        data.giftName ||
        data.gift ||
        "هدية";


    const repeatCount =
        Number(
            data.repeatCount
        ) || 1;


    const diamondCount =
        Number(
            data.diamondCount
        ) || 0;


    const totalValue =
        Number(
            data.totalValue
        ) ||
        diamondCount *
        repeatCount;


    const tier =
        getGiftTier(
            totalValue
        );


    liveEventsCenter.classList.add(
        "gift-" + tier
    );


    if (liveEventType) {

        if (
            tier === "legendary"
        ) {

            liveEventType.textContent =
                "👑 دعم أسطوري";

        } else if (
            tier === "large"
        ) {

            liveEventType.textContent =
                "🔥 دعم كبير";

        } else if (
            tier === "medium"
        ) {

            liveEventType.textContent =
                "🎁 دعم جديد";

        } else {

            liveEventType.textContent =
                "🎁 دعم";
        }
    }


    if (liveEventContent) {

        liveEventContent.textContent =
            giftName +
            (
                repeatCount > 1
                    ? " × " +
                      repeatCount
                    : ""
            );
    }


    if (liveEventValue) {

        if (totalValue > 0) {

            liveEventValue.textContent =
                "💎 " +
                totalValue;

        }
    }


    /*
     * إضافة تأثير حسب قيمة الدعم
     */

    if (
        tier === "legendary"
    ) {

        liveEventsCenter.classList.add(
            "gift-legendary-effect"
        );

    } else if (
        tier === "large"
    ) {

        liveEventsCenter.classList.add(
            "gift-large-effect"
        );

    } else if (
        tier === "medium"
    ) {

        liveEventsCenter.classList.add(
            "gift-medium-effect"
        );
    }
}


/*
 * AVATAR ANIMATION
 */

if (liveEventAvatarWrapper) {

    liveEventAvatarWrapper.classList.remove(
        "avatar-event"
    );

    void liveEventAvatarWrapper.offsetWidth;

    liveEventAvatarWrapper.classList.add(
        "avatar-event"
    );
}


/*
 * HIDE
 */

setTimeout(
    function () {

        hideLiveEvent();

    },
    getEventDuration(type)
);

}

/*

CENTER STYLE

*/

function liveEventCenterStyle(
type
) {

if (!liveEventsCenter) {
    return;
}

liveEventsCenter.classList.add(
    "event-" + type
);

}

/*

HIDE

*/

function hideLiveEvent() {

if (liveEventsCenter) {

    liveEventsCenter.classList.remove(
        "show"
    );

    liveEventsCenter.classList.remove(
        "event-follow",
        "event-subscribe",
        "event-gift"
    );

    liveEventsCenter.classList.remove(
        "gift-small",
        "gift-medium",
        "gift-large",
        "gift-legendary"
    );

    liveEventsCenter.classList.remove(
        "gift-medium-effect",
        "gift-large-effect",
        "gift-legendary-effect"
    );
}


eventIsPlaying = false;


setTimeout(
    function () {

        processEventQueue();

    },
    180
);

}

/*

CONNECT SSE

*/

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


/*
 * MEMBER
 *
 * يبقى في البطاقة السفلية فقط.
 */

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
                "Member event error:",
                error
            );
        }
    }
);


/*
 * GIFT
 */

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


            queueEvent(
                "gift",
                data
            );

        } catch (error) {

            console.error(
                "Gift event error:",
                error
            );
        }
    }
);


/*
 * FOLLOW
 */

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


            queueEvent(
                "follow",
                data
            );

        } catch (error) {

            console.error(
                "Follow event error:",
                error
            );
        }
    }
);


/*
 * SUBSCRIBE
 */

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


            queueEvent(
                "subscribe",
                data
            );

        } catch (error) {

            console.error(
                "Subscribe event error:",
                error
            );
        }
    }
);


/*
 * تجاهل:
 *
 * chat
 * like
 * share
 *
 * لأنها لا تظهر في وسط الشاشة.
 */


eventSource.onerror =
    function () {

        console.log(
            "S-LIVE event stream reconnecting..."
        );
    };

}

/*

CLEANUP

*/

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

/*

START

*/

setupAccount();

connectEvents();

})();
