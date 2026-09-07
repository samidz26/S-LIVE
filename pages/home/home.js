(function () {
"use strict";

console.log("S-LIVE HOME JS loaded");

let eventSource = null;

/*

ACCOUNT ELEMENTS

*/

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

/*

MEMBER ELEMENTS

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

CENTER EVENT ELEMENTS

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

IMAGE HELPER

*/

function getImageUrl(url) {

if (!url) {
    return "";
}

/*
 * استخدام البروكسي الخاص بالسيرفر
 * لتقليل مشاكل صور TikTok الخارجية.
 */
return (
    "/api/connection/proxy-image?url=" +
    encodeURIComponent(url)
);

}

/*

GET USER DATA

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

ACCOUNT

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


if (profilePicture && liveProfileImage) {

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

SHOW LAST MEMBER

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

EVENT QUEUE

*/

function queueEvent(type, data) {

if (!data) {
    return;
}


/*
 * التعليقات واللايكات قد تصل
 * بكميات ضخمة جدًا.
 *
 * لذلك لا نسمح للطابور بالتضخم.
 */
if (
    type === "chat" ||
    type === "like"
) {

    if (eventQueue.length > 8) {
        return;
    }
}


/*
 * الهدايا أهم من اللايكات والتعليقات.
 *
 * إذا كانت هدية نضعها في بداية
 * الطابور.
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


processEventQueue();

}

/*

PROCESS QUEUE

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

EVENT DURATION

*/

function getEventDuration(type) {

switch (type) {

    case "gift":
        return 3500;

    case "subscribe":
        return 3000;

    case "follow":
        return 2500;

    case "share":
        return 2500;

    case "like":
        return 1800;

    case "chat":
        return 2200;

    default:
        return 2200;
}

}

/*

GIFT TIER

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

PLAY LIVE EVENT

*/

function playLiveEvent(
type,
data
) {

if (!liveEventsCenter) {

    console.warn(
        "Center event container not found"
    );

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
 * إزالة الكلاسات القديمة
 */
liveEventsCenter.className =
    "live-events-center";


/*
 * إعادة تشغيل الأنيميشن
 */
void liveEventsCenter.offsetWidth;


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

        liveEventAvatar.removeAttribute(
            "src"
        );

        liveEventAvatar.style.display =
            "none";
    }
}


/*
 * CLEAR VALUES
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
 ========================================
 MEMBER
 ========================================
 */

if (type === "member") {

    if (liveEventType) {
        liveEventType.textContent =
            "👋 دخول جديد";
    }

    if (liveEventContent) {
        liveEventContent.textContent =
            "نورت اللايف ✨";
    }
}


/*
 ========================================
 CHAT
 ========================================
 */

else if (type === "chat") {

    if (liveEventType) {
        liveEventType.textContent =
            "💬 تعليق";
    }

    if (liveEventContent) {

        liveEventContent.textContent =
            data.comment ||
            data.message ||
            data.text ||
            "";
    }
}


/*
 ========================================
 LIKE
 ========================================
 */

else if (type === "like") {

    const count =
        Number(
            data.likeCount ||
            data.count ||
            data.totalLikeCount ||
            1
        );


    if (liveEventType) {
        liveEventType.textContent =
            "❤️ لايك";
    }


    if (liveEventContent) {

        liveEventContent.textContent =
            "أرسل " +
            count +
            " إعجاب";
    }


    if (
        liveEventsCenter
    ) {

        liveEventsCenter.classList.add(
            "like-effect"
        );
    }
}


/*
 ========================================
 FOLLOW
 ========================================
 */

else if (type === "follow") {

    if (liveEventType) {
        liveEventType.textContent =
            "➕ متابعة جديدة";
    }

    if (liveEventContent) {
        liveEventContent.textContent =
            "شكرًا على المتابعة ❤️";
    }
}


/*
 ========================================
 SUBSCRIBE
 ========================================
 */

else if (type === "subscribe") {

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
 ========================================
 SHARE
 ========================================
 */

else if (type === "share") {

    if (liveEventType) {
        liveEventType.textContent =
            "🔄 مشاركة";
    }

    if (liveEventContent) {
        liveEventContent.textContent =
            "شكرًا على مشاركة اللايف ❤️";
    }
}


/*
 ========================================
 GIFT
 ========================================
 */

else if (type === "gift") {

    const giftName =
        data.giftName ||
        data.gift ||
        data.giftName ||
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


    /*
     * إضافة مستوى الهدية
     */
    liveEventsCenter.classList.add(
        "gift-" + tier
    );


    if (liveEventType) {

        if (tier === "legendary") {

            liveEventType.textContent =
                "👑🎁 هدية أسطورية";

        } else if (
            tier === "large"
        ) {

            liveEventType.textContent =
                "🔥🎁 هدية كبيرة";

        } else if (
            tier === "medium"
        ) {

            liveEventType.textContent =
                "🎁 هدية";

        } else {

            liveEventType.textContent =
                "🎁 دعم جديد";
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
                totalValue +
                " ألماسة";

        } else {

            liveEventValue.textContent =
                "";
        }
    }


    /*
     * تأثيرات الهدايا
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
 * FORCE AVATAR ANIMATION
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
 * إخفاء الحدث بعد المدة
 */
const duration =
    getEventDuration(type);


setTimeout(
    function () {

        hideLiveEvent();

    },
    duration
);

}

/*

HIDE EVENT

*/

function hideLiveEvent() {

if (liveEventsCenter) {

    liveEventsCenter.classList.remove(
        "show"
    );

    liveEventsCenter.classList.remove(
        "event-active"
    );

    liveEventsCenter.classList.remove(
        "like-effect"
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


/*
 * تشغيل الحدث التالي
 */
setTimeout(
    function () {

        processEventQueue();

    },
    180
);

}

/*

TIKTOK EVENTS

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
 =====================================
 MEMBER
 =====================================
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


            /*
             * الدخول يظهر أيضًا
             * في منتصف الشاشة.
             */
            queueEvent(
                "member",
                member
            );

        } catch (error) {

            console.error(
                "Member event parse error:",
                error
            );
        }
    }
);


/*
 =====================================
 CHAT
 =====================================
 */

eventSource.addEventListener(
    "chat",
    function (event) {

        try {

            const data =
                JSON.parse(
                    event.data
                );


            console.log(
                "CHAT:",
                data
            );


            queueEvent(
                "chat",
                data
            );

        } catch (error) {

            console.error(
                "Chat event parse error:",
                error
            );
        }
    }
);


/*
 =====================================
 GIFT
 =====================================
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
                "Gift event parse error:",
                error
            );
        }
    }
);


/*
 =====================================
 LIKE
 =====================================
 */

eventSource.addEventListener(
    "like",
    function (event) {

        try {

            const data =
                JSON.parse(
                    event.data
                );


            console.log(
                "LIKE:",
                data
            );


            queueEvent(
                "like",
                data
            );

        } catch (error) {

            console.error(
                "Like event parse error:",
                error
            );
        }
    }
);


/*
 =====================================
 FOLLOW
 =====================================
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
                "Follow event parse error:",
                error
            );
        }
    }
);


/*
 =====================================
 SUBSCRIBE
 =====================================
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
                "Subscribe event parse error:",
                error
            );
        }
    }
);


/*
 =====================================
 SHARE
 =====================================
 */

eventSource.addEventListener(
    "share",
    function (event) {

        try {

            const data =
                JSON.parse(
                    event.data
                );


            console.log(
                "SHARE:",
                data
            );


            queueEvent(
                "share",
                data
            );

        } catch (error) {

            console.error(
                "Share event parse error:",
                error
            );
        }
    }
);


/*
 =====================================
 CONNECTION EVENTS
 =====================================
 */

eventSource.addEventListener(
    "connected",
    function (event) {

        console.log(
            "S-LIVE connected:",
            event.data
        );
    }
);


eventSource.addEventListener(
    "disconnected",
    function (event) {

        console.log(
            "S-LIVE disconnected:",
            event.data
        );
    }
);


eventSource.addEventListener(
    "error",
    function (event) {

        console.error(
            "S-LIVE server error:",
            event.data
        );
    }
);


/*
 =====================================
 STREAM ERROR
 =====================================
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
