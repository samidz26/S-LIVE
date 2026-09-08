"use strict";

console.log(
    "S-LIVE HOME JS loaded"
);


/* =========================================
   STATE
========================================= */

let eventSource = null;

let memberTimer = null;

let eventTimer = null;

let homeCleanedUp = false;


/* =========================================
   ELEMENTS
========================================= */

const memberProfile =
    document.getElementById(
        "member-profile"
    );

const memberName =
    document.getElementById(
        "member-name"
    );

const memberUsername =
    document.getElementById(
        "member-username"
    );

const liveEventCard =
    document.getElementById(
        "live-event-card"
    );


const liveEventsCenter =
    document.getElementById(
        "live-events-center"
    );

const liveEventType =
    document.getElementById(
        "live-event-type"
    );

const liveEventAvatar =
    document.getElementById(
        "live-event-avatar"
    );

const liveEventUser =
    document.getElementById(
        "live-event-user"
    );

const liveEventContent =
    document.getElementById(
        "live-event-content"
    );

const liveEventValue =
    document.getElementById(
        "live-event-value"
    );


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
   SHOW MEMBER
========================================= */

function showMember(member) {

    if (
        homeCleanedUp ||
        !member
    ) {

        return;
    }


    const nickname =
        member.nickname ||
        member.uniqueId ||
        member.username ||
        "شخص جديد";


    const username =
        member.uniqueId
            ? "@" +
              String(
                  member.uniqueId
              ).replace(/^@/, "")
            : "";


    const profilePicture =
        member.profilePictureUrl ||
        member.profilePicture ||
        member.avatar ||
        "";


    if (memberName) {

        memberName.textContent =
            nickname;
    }


    if (memberUsername) {

        memberUsername.textContent =
            username ||
            "عضو جديد في اللايف";
    }


    if (
        memberProfile &&
        profilePicture
    ) {

        memberProfile.src =
            getImageUrl(
                profilePicture
            );
    }


    if (liveEventCard) {

        liveEventCard.classList.add(
            "show"
        );


        clearTimeout(
            memberTimer
        );


        memberTimer =
            setTimeout(
                function () {

                    if (
                        !homeCleanedUp &&
                        liveEventCard
                    ) {

                        liveEventCard.classList.remove(
                            "show"
                        );
                    }

                },
                5000
            );
    }
}


/* =========================================
   PLAY LIVE EVENT
========================================= */

function playLiveEvent(event) {

    if (
        homeCleanedUp ||
        !event ||
        !liveEventsCenter
    ) {

        return;
    }


    const type =
        event.type ||
        event.eventType ||
        "";


    const user =
        event.nickname ||
        event.uniqueId ||
        event.username ||
        "مستخدم";


    const content =
        event.content ||
        event.message ||
        event.text ||
        "";


    const value =
        event.value ||
        event.amount ||
        event.count ||
        "";


    const profilePicture =
        event.profilePictureUrl ||
        event.profilePicture ||
        event.avatar ||
        "";


    /* نوع الحدث */

    const eventLabels = {

        member:
            "👋 دخل اللايف",

        gift:
            "🎁 دعم جديد",

        follow:
            "➕ متابعة جديدة",

        subscribe:
            "🔔 اشتراك جديد",

        share:
            "🔄 مشاركة",

        like:
            "❤️ تكبيس",

        comment:
            "💬 تعليق"
    };


    if (liveEventType) {

        liveEventType.textContent =
            eventLabels[type] ||
            "✨ حدث جديد";
    }


    /* الصورة */

    if (
        liveEventAvatar &&
        profilePicture
    ) {

        liveEventAvatar.src =
            getImageUrl(
                profilePicture
            );
    }


    /* الاسم */

    if (liveEventUser) {

        liveEventUser.textContent =
            user;
    }


    /* المحتوى */

    if (liveEventContent) {

        liveEventContent.textContent =
            content;
    }


    /* القيمة */

    if (liveEventValue) {

        liveEventValue.textContent =
            value
                ? String(value)
                : "";
    }


    /* إظهار الحدث */

    liveEventsCenter.classList.add(
        "show"
    );


    clearTimeout(
        eventTimer
    );


    eventTimer =
        setTimeout(
            function () {

                if (
                    !homeCleanedUp &&
                    liveEventsCenter
                ) {

                    liveEventsCenter.classList.remove(
                        "show"
                    );
                }

            },
            4000
        );
}


/* =========================================
   CLOSE SSE
========================================= */

function closeEventSource() {

    if (!eventSource) {
        return;
    }


    console.log(
        "S-LIVE: closing SSE"
    );


    try {

        eventSource.close();

    } catch (error) {

        console.warn(
            "S-LIVE SSE close error:",
            error
        );
    }


    eventSource =
        null;
}


/* =========================================
   CLEAR HOME TIMERS
========================================= */

function clearHomeTimers() {

    if (memberTimer) {

        clearTimeout(
            memberTimer
        );

        memberTimer =
            null;
    }


    if (eventTimer) {

        clearTimeout(
            eventTimer
        );

        eventTimer =
            null;
    }
}


/* =========================================
   CONNECT SSE
========================================= */

function connectEvents() {

    /*
     * إغلاق أي اتصال قديم أولًا.
     */

    closeEventSource();


    if (homeCleanedUp) {
        return;
    }


    console.log(
        "S-LIVE: connecting SSE..."
    );


    eventSource =
        new EventSource(
            "/api/connection/events"
        );


    /* =====================================
       MEMBER
    ===================================== */

    eventSource.addEventListener(
        "member",
        function (event) {

            if (homeCleanedUp) {
                return;
            }


            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "S-LIVE MEMBER:",
                    data
                );


                showMember(
                    data
                );

            } catch (error) {

                console.error(
                    "S-LIVE MEMBER parse error:",
                    error
                );
            }
        }
    );


    /* =====================================
       GIFT
    ===================================== */

    eventSource.addEventListener(
        "gift",
        function (event) {

            if (homeCleanedUp) {
                return;
            }


            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "S-LIVE GIFT:",
                    data
                );


                playLiveEvent({

                    ...data,

                    type:
                        "gift"
                });

            } catch (error) {

                console.error(
                    "S-LIVE GIFT parse error:",
                    error
                );
            }
        }
    );


    /* =====================================
       FOLLOW
    ===================================== */

    eventSource.addEventListener(
        "follow",
        function (event) {

            if (homeCleanedUp) {
                return;
            }


            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "S-LIVE FOLLOW:",
                    data
                );


                playLiveEvent({

                    ...data,

                    type:
                        "follow"
                });

            } catch (error) {

                console.error(
                    "S-LIVE FOLLOW parse error:",
                    error
                );
            }
        }
    );


    /* =====================================
       SUBSCRIBE
    ===================================== */

    eventSource.addEventListener(
        "subscribe",
        function (event) {

            if (homeCleanedUp) {
                return;
            }


            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                console.log(
                    "S-LIVE SUBSCRIBE:",
                    data
                );


                playLiveEvent({

                    ...data,

                    type:
                        "subscribe"
                });

            } catch (error) {

                console.error(
                    "S-LIVE SUBSCRIBE parse error:",
                    error
                );
            }
        }
    );


    /* =====================================
       SHARE
    ===================================== */

    eventSource.addEventListener(
        "share",
        function (event) {

            if (homeCleanedUp) {
                return;
            }


            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                playLiveEvent({

                    ...data,

                    type:
                        "share"
                });

            } catch (error) {

                console.error(
                    "S-LIVE SHARE parse error:",
                    error
                );
            }
        }
    );


    /* =====================================
       LIKE
    ===================================== */

    eventSource.addEventListener(
        "like",
        function (event) {

            if (homeCleanedUp) {
                return;
            }


            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                playLiveEvent({

                    ...data,

                    type:
                        "like"
                });

            } catch (error) {

                console.error(
                    "S-LIVE LIKE parse error:",
                    error
                );
            }
        }
    );


    /* =====================================
       COMMENT
    ===================================== */

    eventSource.addEventListener(
        "comment",
        function (event) {

            if (homeCleanedUp) {
                return;
            }


            try {

                const data =
                    JSON.parse(
                        event.data
                    );


                playLiveEvent({

                    ...data,

                    type:
                        "comment"
                });

            } catch (error) {

                console.error(
                    "S-LIVE COMMENT parse error:",
                    error
                );
            }
        }
    );


    /* =====================================
       OPEN
    ===================================== */

    eventSource.onopen =
        function () {

            if (homeCleanedUp) {
                return;
            }


            console.log(
                "S-LIVE SSE connected"
            );
        };


    /* =====================================
       ERROR
    ===================================== */

    eventSource.onerror =
        function (error) {

            if (homeCleanedUp) {
                return;
            }


            console.warn(
                "S-LIVE SSE error:",
                error
            );
        };
}


/* =========================================
   CLEANUP HOME
========================================= */

function cleanupHome() {

    if (homeCleanedUp) {
        return;
    }


    console.log(
        "S-LIVE HOME cleanup"
    );


    homeCleanedUp =
        true;


    /*
     * إغلاق SSE
     */

    closeEventSource();


    /*
     * إلغاء المؤقتات
     */

    clearHomeTimers();


    /*
     * إخفاء العناصر المتحركة.
     */

    if (liveEventCard) {

        liveEventCard.classList.remove(
            "show"
        );
    }


    if (liveEventsCenter) {

        liveEventsCenter.classList.remove(
            "show"
        );
    }
}


/* =========================================
   APP CLEANUP EVENT
========================================= */

window.addEventListener(
    "s-live-cleanup",
    cleanupHome
);


/* =========================================
   PAGE CHANGING
========================================= */

window.addEventListener(
    "s-live-page-changing",
    function (event) {

        /*
         * إذا كانت الصفحة الحالية Home،
         * نظفها قبل الانتقال.
         */

        if (
            event.detail &&
            event.detail.page ===
                "home"
        ) {

            cleanupHome();
        }
    }
);


/* =========================================
   INITIALIZE HOME
========================================= */

function initHome() {

    console.log(
        "S-LIVE HOME initialized"
    );


    /*
     * نضمن أن الحالة جديدة
     * عند تحميل Home مرة أخرى.
     */

    homeCleanedUp =
        false;


    clearHomeTimers();


    closeEventSource();


    /*
     * بدء SSE جديد.
     */

    connectEvents();
}


/* =========================================
   START
========================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initHome
    );

} else {

    initHome();
} 
