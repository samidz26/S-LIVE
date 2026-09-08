"use strict";

window.FollowEffect = (() => {

    let layer = null;
    let hideTimer = null;


    // =====================================================
    // إنشاء طبقة التأثير
    // =====================================================

    function createLayer() {

        if (layer) {
            return layer;
        }

        const settingsPage =
            document.querySelector(".settings-page");

        if (!settingsPage) {
            console.error(
                "S-LIVE: .settings-page not found"
            );

            return null;
        }

        layer =
            document.createElement("div");

        layer.className =
            "follow-effect-layer";

        layer.innerHTML = `
            <div class="follow-glow"></div>
        `;

        settingsPage.appendChild(layer);

        return layer;
    }


    // =====================================================
    // إنشاء شرارة فاخرة
    // =====================================================

    function createSpark() {

        if (!layer) {
            return;
        }

        const spark =
            document.createElement("div");

        spark.className =
            "follow-spark";


        // رموز مختلفة لإعطاء شكل طبيعي

        const symbols = [
            "✦",
            "✧",
            "✨",
            "·"
        ];

        spark.textContent =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];


        // نقطة البداية حول مركز الشاشة

        const startX =
            (Math.random() - 0.5) * 35;

        const startY =
            (Math.random() - 0.5) * 35;


        // منتصف الحركة

        const angle =
            Math.random() *
            Math.PI *
            2;

        const distance =
            45 +
            Math.random() * 80;

        const midX =
            Math.cos(angle) *
            distance;

        const midY =
            Math.sin(angle) *
            distance;


        // نهاية الحركة

        const endDistance =
            110 +
            Math.random() * 170;

        const endX =
            Math.cos(angle) *
            endDistance;

        const endY =
            Math.sin(angle) *
            endDistance;


        // إرسال الإحداثيات إلى CSS

        spark.style.setProperty(
            "--x-start",
            `${startX}px`
        );

        spark.style.setProperty(
            "--y-start",
            `${startY}px`
        );

        spark.style.setProperty(
            "--x-mid",
            `${midX}px`
        );

        spark.style.setProperty(
            "--y-mid",
            `${midY}px`
        );

        spark.style.setProperty(
            "--x-end",
            `${endX}px`
        );

        spark.style.setProperty(
            "--y-end",
            `${endY}px`
        );


        // حجم عشوائي

        spark.style.fontSize =
            `${11 + Math.random() * 15}px`;


        // توقيت عشوائي

        spark.style.animationDelay =
            `${Math.random() * 0.8}s`;

        spark.style.animationDuration =
            `${2.2 + Math.random() * 1.2}s`;


        // وضع العنصر في مركز الشاشة

        spark.style.left = "50%";
        spark.style.top = "50%";


        layer.appendChild(spark);


        // حذف العنصر بعد انتهاء الحركة

        spark.addEventListener(
            "animationend",
            () => {
                spark.remove();
            },
            { once: true }
        );
    }


    // =====================================================
    // تشغيل تأثير المتابعة
    // =====================================================

    function play() {

        const effectLayer =
            createLayer();

        if (!effectLayer) {
            return;
        }


        // إلغاء المؤقت السابق

        clearTimeout(hideTimer);


        // إعادة تشغيل التأثير من البداية

        effectLayer.classList.remove(
            "active"
        );

        void effectLayer.offsetWidth;

        effectLayer.classList.add(
            "active"
        );


        // إنشاء الشرارات

        for (
            let i = 0;
            i < 35;
            i++
        ) {

            createSpark();

        }


        // إخفاء التأثير بعد 5 ثوانٍ

        hideTimer =
            setTimeout(() => {

                effectLayer.classList.remove(
                    "active"
                );

            }, 5000);
    }


    // =====================================================
    // Public API
    // =====================================================

    return {
        play
    };

})();
