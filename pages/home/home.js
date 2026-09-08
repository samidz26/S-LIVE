"use strict";

/* =========================================================
   S-LIVE HOME
   الأحداث الحالية:
   - 🎁 Rose
   - ✨ Follow
========================================================= */


/* =========================================================
   Gift
========================================================= */

let giftEventSource = null;
let giftHideTimer = null;


/* =========================================================
   Follow
========================================================= */

let followEventSource = null;
let followHideTimer = null;


/* =========================================================
   أدوات عامة
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


/* =========================================================
   تحميل تأثير الورود
========================================================= */

function loadRoseEffect() {

    if (!document.getElementById("rose-effect-css")) {

        const link = document.createElement("link");

        link.id = "rose-effect-css";
        link.rel = "stylesheet";

        link.href =
            "/effects/gifts/rose/rose.css";

        document.head.appendChild(link);
    }

    if (window.RoseEffect) {
        return;
    }

    const script = document.createElement("script");

    script.src =
        "/effects/gifts/rose/rose.js";

    script.onload = () => {

        console.log(
            "S-LIVE: Rose Effect loaded"
        );

    };

    script.onerror = () => {

        console.error(
            "S-LIVE: Failed to load Rose Effect"
        );

    };

    document.body.appendChild(script);
}


/* =========================================================
   تحميل تأثير المتابعة
========================================================= */

function loadFollowEffect() {

    if (!document.getElementById("follow-effect-css")) {

        const link = document.createElement("link");

        link.id = "follow-effect-css";

        link.rel = "stylesheet";

        link.href =
            "/effects/follow/follow.css";

        document.head.appendChild(link);
    }

    if (window.FollowEffect) {
        return;
    }

    const script = document.createElement("script");

    script.src =
        "/effects/follow/follow.js";

    script.onload = () => {

        console.log(
            "S-LIVE: Follow Effect loaded"
        );

    };

    script.onerror = () => {

        console.error(
            "S-LIVE: Failed to load Follow Effect"
        );

    };

    document.body.appendChild(script);
}


/* =========================================================
   عرض الهدية
========================================================= */

function showGift(gift) {

    const center =
        getElement("gift-center");

    const image =
        getElement("gift-user-image");

    const name =
        getElement("gift-user-name");

    const message =
        getElement("gift-message");

    if (
        !center ||
        !image ||
        !name ||
        !message
    ) {
        console.warn(
            "S-LIVE: Gift UI elements not found"
        );

        return;
    }

    const username =
        gift.nickname ||
        gift.uniqueId ||
        "مستخدم TikTok";

    const profilePicture =
        gift.profilePictureUrl ||
        "";

    const giftName =
        gift.giftName ||
        "هدية";

    const quantity =
        Number(gift.repeatCount) > 0
            ? Number(gift.repeatCount)
            : 1;


    /* الاسم */

    name.textContent =
        `@${String(username).replace(/^@/, "")}`;


    /* الصورة */

    if (profilePicture) {

        image.src =
            profilePicture.startsWith("/api/")
                ? profilePicture
                : `/api/connection/proxy-image?url=${encodeURIComponent(profilePicture)}`;

        image.style.display =
            "block";

    } else {

        image.removeAttribute("src");

        image.style.display =
            "none";
    }


    /* الرسالة */

    message.textContent =
        `🎁 أرسل ${giftName} ×${quantity}`;


    /* Animation */

    clearTimeout(giftHideTimer);

    center.classList.remove("show");

    void center.offsetWidth;

    center.classList.add("show");


    /* مدة العرض */

    giftHideTimer =
        setTimeout(() => {

            center.classList.remove("show");

        }, 5000);
}


/* =========================================================
   تشغيل تأثير الوردة
========================================================= */

function playRoseGift() {

    if (
        window.RoseEffect &&
        typeof window.RoseEffect.play === "function"
    ) {

        window.RoseEffect.play();

    } else {

        console.warn(
            "S-LIVE: RoseEffect is not ready"
        );
    }
}


/* =========================================================
   معالجة الهدية
========================================================= */

function handleGift(gift) {

    if (!gift) {
        return;
    }

    const giftName =
        String(gift.giftName || "")
            .trim()
            .toLowerCase();


    console.log(
        "S-LIVE: Processing gift:",
        gift
    );


    /*
     * حاليًا نربط Rose فقط.
     */

    if (
        giftName === "rose" ||
        giftName === "roses" ||
        giftName === "وردة" ||
        giftName === "ورد"
    ) {

        showGift(gift);

        playRoseGift();

    }
}


/* =========================================================
   الاتصال بأحداث الهدايا
========================================================= */

function connectGiftEvents() {

    if (giftEventSource) {

        giftEventSource.close();

        giftEventSource = null;
    }


    giftEventSource =
        new EventSource(
            "/api/connection/events"
        );


    giftEventSource.addEventListener(
        "gift",
        event => {

            try {

                const gift =
                    JSON.parse(event.data);

                console.log(
                    "S-LIVE GIFT:",
                    gift
                );

                handleGift(gift);

            } catch (error) {

                console.error(
                    "S-LIVE gift parse error:",
                    error
                );

            }

        }
    );


    giftEventSource.onerror = () => {

        console.warn(
            "S-LIVE: Gift SSE connection lost"
        );

    };
}


/* =========================================================
   عرض المتابعة
========================================================= */

function showFollow(follow) {

    const center =
        getElement("follow-center");

    const image =
        getElement("follow-user-image");

    const name =
        getElement("follow-user-name");


    if (
        !center ||
        !image ||
        !name
    ) {

        console.warn(
            "S-LIVE: Follow UI elements not found"
        );

        return;
    }


    const username =
        follow.nickname ||
        follow.uniqueId ||
        "مستخدم TikTok";


    const profilePicture =
        follow.profilePictureUrl ||
        "";


    /* الاسم */

    name.textContent =
        `@${String(username).replace(/^@/, "")}`;


    /* الصورة */

    if (profilePicture) {

        image.src =
            profilePicture.startsWith("/api/")
                ? profilePicture
                : `/api/connection/proxy-image?url=${encodeURIComponent(profilePicture)}`;

        image.style.display =
            "block";

    } else {

        image.removeAttribute("src");

        image.style.display =
            "none";
    }


    /* إعادة تشغيل Animation */

    clearTimeout(followHideTimer);

    center.classList.remove("show");

    void center.offsetWidth;

    center.classList.add("show");


    /* تشغيل النجوم */

    if (
        window.FollowEffect &&
        typeof window.FollowEffect.play === "function"
    ) {

        window.FollowEffect.play();

    } else {

        console.warn(
            "S-LIVE: FollowEffect is not ready"
        );
    }


    /* 5 ثوانٍ */

    followHideTimer =
        setTimeout(() => {

            center.classList.remove("show");

        }, 5000);
}


/* =========================================================
   الاتصال بأحداث المتابعة
========================================================= */

function connectFollowEvents() {

    if (followEventSource) {

        followEventSource.close();

        followEventSource = null;
    }


    /*
     * نستخدم SSE نفسه.
     */

    followEventSource =
        new EventSource(
            "/api/connection/events"
        );


    followEventSource.addEventListener(
        "follow",
        event => {

            try {

                const follow =
                    JSON.parse(event.data);


                console.log(
                    "S-LIVE FOLLOW:",
                    follow
                );


                showFollow(follow);

            } catch (error) {

                console.error(
                    "S-LIVE follow parse error:",
                    error
                );

            }

        }
    );


    followEventSource.onerror = () => {

        console.warn(
            "S-LIVE: Follow SSE connection lost"
        );

    };
}


/* =========================================================
   تشغيل Home
========================================================= */

function initHome() {

    console.log(
        "S-LIVE HOME JS loaded"
    );


    /*
     * تحميل المؤثرات
     */

    loadRoseEffect();

    loadFollowEffect();


    /*
     * ننتظر قليلًا حتى يتم تحميل
     * ملفات المؤثرات.
     */

    setTimeout(() => {

        connectGiftEvents();

        connectFollowEvents();

    }, 300);
}


/* =========================================================
   تشغيل الصفحة
========================================================= */

initHome(); 
