"use strict";

/* =========================================================
   S-LIVE HOME
   - 🎁 Rose
   - ✨ Follow
========================================================= */

let giftEventSource = null;
let followEventSource = null;

let giftHideTimer = null;
let followHideTimer = null;


/* =========================================================
   أدوات عامة
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


/* =========================================================
   تحميل ملف CSS
========================================================= */

function loadCSS(id, href) {

    return new Promise((resolve) => {

        if (document.getElementById(id)) {
            resolve();
            return;
        }

        const link =
            document.createElement("link");

        link.id = id;
        link.rel = "stylesheet";
        link.href = href;

        link.onload = () => {
            resolve();
        };

        link.onerror = () => {

            console.error(
                "S-LIVE: CSS failed to load:",
                href
            );

            resolve();
        };

        document.head.appendChild(link);
    });
}


/* =========================================================
   تحميل JavaScript
========================================================= */

function loadScript(id, src) {

    return new Promise((resolve) => {

        if (window[id]) {
            resolve();
            return;
        }

        const script =
            document.createElement("script");

        script.src = src;

        script.onload = () => {

            console.log(
                "S-LIVE: Effect loaded:",
                id
            );

            resolve();
        };

        script.onerror = () => {

            console.error(
                "S-LIVE: Effect failed:",
                src
            );

            resolve();
        };

        document.body.appendChild(script);
    });
}


/* =========================================================
   تحميل تأثير Rose
========================================================= */

async function loadRoseEffect() {

    await loadCSS(
        "rose-effect-css",
        "/effects/gifts/rose/rose.css"
    );

    await loadScript(
        "RoseEffect",
        "/effects/gifts/rose/rose.js"
    );
}


/* =========================================================
   تحميل تأثير Follow
========================================================= */

async function loadFollowEffect() {

    await loadCSS(
        "follow-effect-css",
        "/effects/follow/follow.css"
    );

    await loadScript(
        "FollowEffect",
        "/effects/follow/follow.js"
    );
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


    name.textContent =
        `@${String(username).replace(/^@/, "")}`;


    if (profilePicture) {

        image.src =
            profilePicture.startsWith("/api/")
                ? profilePicture
                : `/api/connection/proxy-image?url=${encodeURIComponent(profilePicture)}`;

        image.style.display = "block";

    } else {

        image.removeAttribute("src");
        image.style.display = "none";
    }


    message.textContent =
        `🎁 أرسل ${giftName} ×${quantity}`;


    clearTimeout(giftHideTimer);

    center.classList.remove("show");

    void center.offsetWidth;

    center.classList.add("show");


    giftHideTimer =
        setTimeout(() => {

            center.classList.remove("show");

        }, 5000);
}


/* =========================================================
   تشغيل Rose
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
   SSE - الهدايا
========================================================= */

function connectGiftEvents() {

    if (giftEventSource) {
        giftEventSource.close();
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
                    "S-LIVE gift error:",
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
            "S-LIVE: Follow UI not found"
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


    name.textContent =
        `@${String(username).replace(/^@/, "")}`;


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


    clearTimeout(followHideTimer);

    center.classList.remove("show");

    void center.offsetWidth;

    center.classList.add("show");


    /* تشغيل الخلفية التفاعلية */

    if (
        window.FollowEffect &&
        typeof window.FollowEffect.play === "function"
    ) {

        console.log(
            "S-LIVE: Starting Follow Effect"
        );

        window.FollowEffect.play();

    } else {

        console.error(
            "S-LIVE: FollowEffect is not ready"
        );
    }


    followHideTimer =
        setTimeout(() => {

            center.classList.remove("show");

        }, 5000);
}


/* =========================================================
   SSE - المتابعة
========================================================= */

function connectFollowEvents() {

    if (followEventSource) {
        followEventSource.close();
    }


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
                    "S-LIVE follow error:",
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

async function initHome() {

    console.log(
        "S-LIVE HOME JS loaded"
    );


    /*
     * تحميل المؤثرات أولًا
     */

    await Promise.all([
        loadRoseEffect(),
        loadFollowEffect()
    ]);


    console.log(
        "S-LIVE: All effects ready"
    );


    /*
     * بعد التأكد من تحميل المؤثرات
     * نبدأ استقبال الأحداث.
     */

    connectGiftEvents();

    connectFollowEvents();
}


/* =========================================================
   Start
========================================================= */

initHome(); 
