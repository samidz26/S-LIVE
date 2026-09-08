"use strict";

(function () {

    function loadCSS(href) {

        return new Promise((resolve, reject) => {

            // منع تحميل CSS أكثر من مرة
            if (
                document.querySelector(
                    `link[href="${href}"]`
                )
            ) {
                resolve();
                return;
            }

            const link =
                document.createElement("link");

            link.rel = "stylesheet";
            link.href = href;

            link.onload = resolve;
            link.onerror = reject;

            document.head.appendChild(link);
        });
    }


    function loadScript(src) {

        return new Promise((resolve, reject) => {

            // منع تحميل JS أكثر من مرة
            if (
                document.querySelector(
                    `script[src="${src}"]`
                )
            ) {
                resolve();
                return;
            }

            const script =
                document.createElement("script");

            script.src = src;

            script.onload = resolve;
            script.onerror = reject;

            document.body.appendChild(script);
        });
    }


    async function initSettings() {

        try {

            // تحميل تصميم قائمة اختبار المؤثرات
            await loadCSS(
                "/effects/effects-menu/effects-menu.css"
            );

            // تحميل قائمة اختبار المؤثرات
            await loadScript(
                "/effects/effects-menu/effects-menu.js"
            );

            // إنشاء القائمة داخل Settings
            if (
                window.EffectsTestMenu &&
                typeof window.EffectsTestMenu.create === "function"
            ) {

                window.EffectsTestMenu.create();

            } else {

                console.warn(
                    "S-LIVE: EffectsTestMenu not available"
                );
            }

        } catch (error) {

            console.error(
                "S-LIVE: Settings effects menu error:",
                error
            );
        }
    }


    initSettings();

})();
