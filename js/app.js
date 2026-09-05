/* =========================================
   S-LIVE - MAIN APPLICATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadPage("connection");

});


/* =========================================
   تحميل الصفحات داخل مساحة العرض
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

        console.log(
            `S-LIVE: ${pageName} loaded successfully`
        );

    } catch (error) {

        console.error("S-LIVE:", error);

        appScreen.innerHTML = `
            <div style="
                width:100%;
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#ef4444;
                font-family:Arial,Tahoma,sans-serif;
                text-align:center;
                padding:20px;
            ">
                حدث خطأ أثناء تحميل الصفحة
            </div>
        `;

    }

}
