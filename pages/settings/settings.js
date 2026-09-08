"use strict";

(function () {

    function loadCSS(href) {

        return new Promise((resolve, reject) => {

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

            /*
             * تحميل مؤثر المتابعة
             */

            await loadCSS(
                "/effects/follow/follow.css"
            );

            await loadScript(
                "/effects/follow/follow.js"
            );


            /*
             * تحميل قائمة اختبار المؤثرات
             */

            await loadCSS(
                "/effects/effects-menu/effects-menu.css"
            );

            await loadScript(
                "/effects/effects-menu/effects-menu.js"
            );


            /*
             * إنشاء القائمة
             */

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
                "S-LIVE: Settings effects error:",
                error
            );
        }
    }


    initSettings();

})();
