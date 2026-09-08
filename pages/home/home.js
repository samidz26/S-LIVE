"use strict";
let followEventSource = null;
let followHideTimer = null;
let giftEventSource = null;
let giftHideTimer = null;

function getElement(id) {
    return document.getElementById(id);
}


/* ==============================
   تحميل CSS لتأثير الورود
============================== */

function loadRoseEffect() {

    if (document.getElementById("rose-effect-css")) {
        return;
    }

    const link = document.createElement("link");

    link.id = "rose-effect-css";
    link.rel = "stylesheet";
    link.href = "/effects/gifts/rose/rose.css";

    document.head.appendChild(link);
}


/* ==============================
   تحميل JavaScript لتأثير الورود
============================== */

function loadRoseScript() {

    if (window.RoseEffect) {
        return;
    }

    const script = document.createElement("script");

    script.src = "/effects/gifts/rose/rose.js";

    document.body.appendChild(script);
}


/* ==============================
   إظهار معلومات الهدية
============================== */

function showGift(gift) {

    const center = getElement("gift-center");
    const image = getElement("gift-user-image");
    const name = getElement("gift-user-name");
    const message = getElement("gift-message");

    if (!center || !image || !name || !message) {
        return;
    }

    const username =
        gift.nickname ||
        gift.uniqueId ||
        "مستخدم TikTok";

    const profilePicture =
        gift.profilePictureUrl || "";

    const giftName =
        gift.giftName ||
        "هدية";

    const quantity =
        Number(gift.repeatCount) > 0
            ? Number(gift.repeatCount)
            : 1;

    name.textContent = `@${username.replace(/^@/, "")}`;

    message.textContent =
        `🎁 أرسل ${giftName} ×${quantity}`;

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

    clearTimeout(giftHideTimer);

    center.classList.remove("show");

    /*
     * إجبار المتصفح على إعادة تشغيل Animation
     */
    void center.offsetWidth;

    center.classList.add("show");

    giftHideTimer = setTimeout(() => {

        center.classList.remove("show");

    }, 5000);
}


/* ==============================
   تشغيل تأثير Rose
============================== */

function playRoseGift(gift) {

    if (!window.RoseEffect) {
        return;
    }

    /*
     * التأثير موحد مهما كانت الكمية.
     */
    window.RoseEffect.play();
}


/* ==============================
   معالجة الهدية
============================== */

function handleGift(gift) {

    if (!gift) {
        return;
    }

    const giftName =
        String(gift.giftName || "")
            .trim()
            .toLowerCase();

    /*
     * حاليًا نختبر Rose فقط.
     */

    if (
        giftName === "rose" ||
        giftName === "roses" ||
        giftName === "وردة" ||
        giftName === "ورد"
    ) {

        showGift(gift);

        playRoseGift(gift);
    }
}


/* ==============================
   الاتصال بـ SSE
============================== */

function connectGiftEvents() {

    if (giftEventSource) {
        giftEventSource.close();
    }

    giftEventSource =
        new EventSource("/api/connection/events");

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
            "S-LIVE gift SSE connection lost"
        );

    };
}


/* ==============================
   تشغيل الصفحة
============================== */

function initHome() {

    loadRoseEffect();
    loadRoseScript();

    /*
     * ننتظر تحميل rose.js
     * قبل استقبال الهدايا.
     */
    setTimeout(() => {

        connectGiftEvents();

    }, 100);

}


initHome();
