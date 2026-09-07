document.addEventListener(
"DOMContentLoaded",
() => {

    initializeConnectionPage();

}

);

/* =========================================
INITIALIZE
========================================= */

function initializeConnectionPage() {

const usernameInput =
    document.getElementById(
        "username"
    );

const connectButton =
    document.getElementById(
        "connect-btn"
    );

const status =
    document.getElementById(
        "connection-status"
    );


if (
    !usernameInput ||
    !connectButton ||
    !status
) {

    console.error(
        "S-LIVE: Connection page elements not found"
    );

    return;

}


connectButton.addEventListener(
    "click",
    () => {

        connectToLive();

    }
);


usernameInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            connectToLive();

        }

    }
);


/*
إزالة @ من البداية
*/

usernameInput.addEventListener(
    "input",
    () => {

        usernameInput.value =
            usernameInput.value
                .replace(/^@+/, "");

    }
);

}

/* =========================================
CONNECT
========================================= */

async function connectToLive() {

const usernameInput =
    document.getElementById(
        "username"
    );

const connectButton =
    document.getElementById(
        "connect-btn"
    );

const status =
    document.getElementById(
        "connection-status"
    );


if (
    !usernameInput ||
    !connectButton ||
    !status
) {

    return;

}


const username =
    usernameInput.value
        .trim()
        .replace(/^@+/, "");


/*
التحقق من الاسم
*/

if (!username) {

    setStatus(
        "يرجى إدخال اسم مستخدم TikTok",
        "error"
    );

    usernameInput.focus();

    return;

}


/*
حالة الاتصال
*/

connectButton.disabled = true;

connectButton.textContent =
    "جاري الاتصال...";


setStatus(
    "جاري الاتصال باللايف...",
    "connecting"
);


try {

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
                            username
                    })

            }
        );


    const data =
        await response.json();


    /*
    فشل الاتصال
    */

    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "تعذر الاتصال باللايف"
        );

    }


    /*
    حفظ معلومات الاتصال
    */

    localStorage.setItem(
        "s_live_username",
        data.username ||
        username
    );


    localStorage.setItem(
        "s_live_connected",
        "true"
    );


    if (
        data.roomId
    ) {

        localStorage.setItem(
            "s_live_room_id",
            data.roomId
        );

    }


    if (
        data.profilePictureUrl
    ) {

        localStorage.setItem(
            "s_live_profile_picture",
            data.profilePictureUrl
        );

    }


    /*
    نجاح
    */

    setStatus(
        "تم الاتصال باللايف ✓",
        "connected"
    );


    /*
    الانتقال إلى Home
    */

    setTimeout(
        () => {

            if (
                window.SLive &&
                typeof window.SLive.loadPage ===
                    "function"
            ) {

                window.SLive.loadPage(
                    "home"
                );

            } else {

                console.error(
                    "S-LIVE: SLIVE API not available"
                );

            }

        },
        500
    );


} catch (error) {

    console.error(
        "S-LIVE connection error:",
        error
    );


    /*
    حذف حالة اتصال قديمة
    */

    localStorage.removeItem(
        "s_live_connected"
    );


    /*
    إظهار الخطأ
    */

    setStatus(
        error.message ||
        "فشل الاتصال باللايف",
        "error"
    );


    connectButton.disabled =
        false;

    connectButton.textContent =
        "اتصال باللايف";

}

}

/* =========================================
STATUS
========================================= */

function setStatus(
message,
state
) {

const status =
    document.getElementById(
        "connection-status"
    );


if (!status) {
    return;
}


const dot =
    status.querySelector(
        ".status-dot"
    );


const text =
    status.querySelector(
        "span:last-child"
    );


if (dot) {

    dot.className =
        "status-dot";


    if (state) {

        dot.classList.add(
            state
        );

    }

}


if (text) {

    text.textContent =
        message;

}

}
