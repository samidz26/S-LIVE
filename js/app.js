/* =========================================
   S-LIVE - MAIN APPLICATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadPage("connection");
});


/* =========================================
   تحميل صفحة
========================================= */

async function loadPage(pageName) {

    const appScreen = document.getElementById("app-screen");

    if (!appScreen) {
        console.error("S-LIVE: app-screen not found");
        return;
    }

    try {

        // تحميل HTML
        const response = await fetch(
            `pages/${pageName}/${pageName}.html`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load page: ${pageName}`
            );
        }

        const html = await response.text();

        // وضع الصفحة داخل Frame
        appScreen.innerHTML = html;

        // تحميل CSS الخاص بالصفحة
        loadPageStyles(pageName);

        // تحميل JS الخاص بالصفحة
        await loadPageScript(pageName);

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
   تحميل CSS الصفحة
========================================= */

function loadPageStyles(pageName) {

    const oldStyle =
        document.getElementById("active-page-style");

    if (oldStyle) {
        oldStyle.remove();
    }

    const style =
        document.createElement("link");

    style.id = "active-page-style";

    style.rel = "stylesheet";

    style.href =
        `pages/${pageName}/${pageName}.css`;

    document.head.appendChild(style);
}


/* =========================================
   تحميل JavaScript الصفحة
========================================= */

function loadPageScript(pageName) {

    return new Promise((resolve, reject) => {

        const oldScript =
            document.getElementById(
                "active-page-script"
            );

        if (oldScript) {
            oldScript.remove();
        }

        const script =
            document.createElement("script");

        script.id =
            "active-page-script";

        script.src =
            `pages/${pageName}/${pageName}.js`;

        script.onload = () => {

            console.log(
                `S-LIVE: ${pageName}.js loaded`
            );

            resolve();

        };

        script.onerror = () => {

            console.error(
                `S-LIVE: Failed to load ${pageName}.js`
            );

            reject(
                new Error(
                    `Failed to load ${pageName}.js`
                )
            );
        };

        document.body.appendChild(script);
    });
}


/* =========================================
   إتاحة التنقل لباقي الصفحات
========================================= */

window.SLive = {

    loadPage
};
