"use strict";

const FollowEffect = (() => {

    let layer = null;
    let hideTimer = null;

    function createLayer() {

        if (layer) {
            return layer;
        }

        layer = document.createElement("div");
        layer.className = "follow-effect-layer";

        layer.innerHTML = `
            <div class="follow-glow"></div>
        `;

        const homePage =
            document.querySelector(".home-page");

        if (homePage) {
            homePage.appendChild(layer);
        }

        return layer;
    }

    function createSpark() {

        const spark =
            document.createElement("div");

        spark.className = "follow-spark";
        spark.textContent = "✦";

        spark.style.left =
            `${25 + Math.random() * 50}%`;

        spark.style.top =
            `${25 + Math.random() * 45}%`;

        spark.style.fontSize =
            `${10 + Math.random() * 14}px`;

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

        createLayer();

        if (!layer) {
            return;
        }

        clearTimeout(hideTimer);

        layer.classList.add("active");

        // تأثير موحد لكل متابعة
        for (let i = 0; i < 24; i++) {
            createSpark();
        }

        hideTimer = setTimeout(() => {

            layer.classList.remove("active");

        }, 5000);
    }

    return {
        play
    };

})();
