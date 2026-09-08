"use strict";

window.FollowEffect = (() => {

    let layer = null;
    let hideTimer = null;

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


    function createSpark() {

        if (!layer) {
            return;
        }

        const spark =
            document.createElement("div");

        spark.className =
            "follow-spark";

        spark.textContent =
            Math.random() > 0.5
                ? "✦"
                : "✨";

        spark.style.left =
            `${15 + Math.random() * 70}%`;

        spark.style.top =
            `${20 + Math.random() * 55}%`;

        spark.style.fontSize =
            `${12 + Math.random() * 18}px`;

        spark.style.animationDelay =
            `${Math.random() * 0.8}s`;

        layer.appendChild(spark);

        spark.addEventListener(
            "animationend",
            () => spark.remove(),
            { once: true }
        );
    }


    function play() {

        const effectLayer =
            createLayer();

        if (!effectLayer) {
            return;
        }

        clearTimeout(hideTimer);

        effectLayer.classList.remove(
            "active"
        );

        void effectLayer.offsetWidth;

        effectLayer.classList.add(
            "active"
        );

        for (let i = 0; i < 30; i++) {
            createSpark();
        }

        hideTimer =
            setTimeout(() => {

                effectLayer.classList.remove(
                    "active"
                );

            }, 5000);
    }


    return {
        play
    };

})();
