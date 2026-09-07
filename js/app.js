document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});


/* =========================================
   INITIALIZE S-LIVE
========================================= */

async function initializeApp() {

    console.log("S-LIVE: Initializing...");

    const savedUsername =
        localStorage.getItem("s_live_username");

    const savedConnected =
        localStorage.getItem("s_live_connected");

    /*
        لا يوجد اتصال محفوظ
        → افتح صفحة الاتصال
    */

    if (
        savedConnected !== "true" ||
        !savedUsername
    ) {
        console.log(
            "S-LIVE: No saved connection"
        );

        loadPage("connection");
        return;
    }


    /*
        يوجد اتصال محفوظ
        → نتحقق من السيرفر
    */

    console.log(
        `S-LIVE: Checking connection for @${savedUsername}`
    );

    try {

        const response =
            await fetch(
                "/api/connection/status",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Connection status request failed"
            );
        }

        const data =
            await response.json();

        console.log(
            "S-LIVE: Connection status:",
            data
        );


        /*
            السيرفر ما زال متصلاً
            → افتح Home مباشرة
        */

        if (
            data.connected === true &&
            data.username
        ) {

            localStorage.setItem(
                "s_live_username",
                data.username
            );

            localStorage.setItem(
                "s_live_connected",
                "true"
            );

            loadPage("home");

            return;
        }


        /*
            السيرفر غير متصل.

            نحاول إعادة الاتصال تلقائياً
            باستخدام اسم المستخدم المحفوظ.
        */

        console.log(
            "S-LIVE: Server is not connected"
        );

        await reconnectAutomatically(
            savedUsername
        );

    } catch (error) {

        console.error(
            "S-LIVE: Initialization error:",
            error
        );

        /*
            إذا تعذر التحقق من السيرفر
            لا نحذف البيانات مباشرة.

            نفتح Home لأن المستخدم كان متصلاً
            سابقاً.
        */

        loadPage("home");
    }
}


/* =========================================
   AUTOMATIC RECONNECT
========================================= */

async function reconnectAutomatically(
    username
) {

    console.log(
        `S-LIVE: Reconnecting to @${username}...`
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
                    body: JSON.stringify({
                        username:
                            username
                    })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Automatic reconnect failed"
            );
        }


        console.log(
            "S-LIVE: Automatic reconnect successful",
            data
        );


        localStorage.setItem(
            "s_live_username",
            data.username || username
        );

        localStorage.setItem(
            "s_live_connected",
            "true"
        );


        /*
            بعد نجاح إعادة الاتصال
            نذهب إلى Home
        */

        loadPage("home");

    } catch (error) {

        console.error(
            "S-LIVE: Automatic reconnect failed:",
            error
        );


        /*
            إعادة الاتصال فشلت.

            نحذف حالة الاتصال القديمة
            ونرجع لصفحة الاتصال.
        */

        localStorage.removeItem(
            "s_live_username"
        );

        localStorage.removeItem(
            "s_live_connected"
        );

        loadPage("connection");
    }
}


/* =========================================
   LOAD PAGE
========================================= */

async function loadPage(pageName) {

    const appScreen =
        document.getElementById(
            "app-screen"
        );

    if (!appScreen) {

        console.error(
            "S-LIVE: app-screen not found"
        );

        return;
    }


    try {

        /*
            تحميل HTML
        */

        const response =
            await fetch(
                `pages/${pageName}/${pageName}.html`
            );

        if (!response.ok) {

            throw new Error(
                `Failed to load page: ${pageName}`
            );
        }


        const html =
            await response.text();


        /*
            وضع الصفحة داخل مساحة العرض
        */

        appScreen.innerHTML =
            html;


        /*
            تحميل CSS الخاص بالصفحة
        */

        loadPageStyles(
            pageName
        );


        /*
            تحميل JavaScript الخاص بالصفحة
        */

        await loadPageScript(
            pageName
        );


        console.log(
            `S-LIVE: ${pageName} loaded successfully`
        );

    } catch (error) {

        console.error(
            "S-LIVE page error:",
            error
        );

        appScreen.innerHTML = `
            <div class="page-load-error">
                حدث خطأ أثناء تحميل الصفحة
            </div>
        `;
    }
}


/* =========================================
   LOAD PAGE CSS
========================================= */

function loadPageStyles(
    pageName
) {

    /*
        حذف CSS الصفحة السابقة
    */

    const oldStyle =
        document.getElementById(
            "active-page-style"
        );

    if (oldStyle) {
        oldStyle.remove();
    }


    /*
        إنشاء رابط CSS جديد
    */

    const style =
        document.createElement(
            "link"
        );

    style.id =
        "active-page-style";

    style.rel =
        "stylesheet";

    style.href =
        `pages/${pageName}/${pageName}.css`;


    document.head.appendChild(
        style
    );
}


/* =========================================
   LOAD PAGE JAVASCRIPT
========================================= */

function loadPageScript(
    pageName
) {

    return new Promise(
        (resolve, reject) => {

            /*
                حذف JS الصفحة السابقة
            */

            const oldScript =
                document.getElementById(
                    "active-page-script"
                );

            if (oldScript) {
                oldScript.remove();
            }


            /*
                إنشاء Script جديد
            */

            const script =
                document.createElement(
                    "script"
                );

            script.id =
                "active-page-script";

            script.src =
                `pages/${pageName}/${pageName}.js`;


            script.onload =
                () => {

                    console.log(
                        `S-LIVE: ${pageName}.js loaded`
                    );

                    resolve();
                };


            script.onerror =
                () => {

                    console.error(
                        `S-LIVE: Failed to load ${pageName}.js`
                    );

                    reject(
                        new Error(
                            `Failed to load ${pageName}.js`
                        )
                    );
                };


            document.body.appendChild(
                script
            );
        }
    );
}


/* =========================================
   GLOBAL S-LIVE API
========================================= */

window.SLive = {

    loadPage,

    initializeApp,

    reconnectAutomatically

};
