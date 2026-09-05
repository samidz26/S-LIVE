/* =========================================
   S-LIVE - MAIN APPLICATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadPage("connection");

});


/* =========================================
   تحميل الصفحة
========================================= */

async function loadPage(pageName) {

    const appScreen = document.getElementById("app-screen");

    if (!appScreen) {
        console.error("S-LIVE: app-screen not found");
        return;
    }

    try {

        const response = await fetch(
            `pages/${pageName}/${pageName}.html`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load page: ${pageName}`
            );
        }

        const html = await response.text();

        appScreen.innerHTML = html;

        /*
         * بعد تحميل HTML
         * نقوم بتحميل JavaScript الخاص بالصفحة
         */

        loadPageScript(pageName);

        console.log(
            `S-LIVE: ${pageName} loaded successfully`
        );

    } catch (error) {

        console.error("S-LIVE:", error);

        appScreen.innerHTML = `
            <div class="page-load-error">
                حدث خطأ أثناء تحميل الصفحة
            </div>
        `;

    }

}


/* =========================================
   تحميل JavaScript الخاص بالصفحة
========================================= */

function loadPageScript(pageName) {

    const oldScript =
        document.getElementById("active-page-script");

    if (oldScript) {
        oldScript.remove();
    }

    const script =
        document.createElement("script");

    script.id = "active-page-script";

    script.src =
        `pages/${pageName}/${pageName}.js`;

    script.onload = () => {

        console.log(
            `S-LIVE: ${pageName}.js loaded`
        );

    };

    script.onerror = () => {

        console.error(
            `S-LIVE: Failed to load ${pageName}.js`
        );

    };

    document.body.appendChild(script);

}
