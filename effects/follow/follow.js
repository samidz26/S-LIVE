"use strict";

const FollowEffect = (() => {

    let layer = null;
    let hideTimer = null;


    function createLayer() {

        if (layer) {
            return layer;
        }


        const homePage =
            document.querySelector(".home-page");

        if (!homePage) {

            console.error(
                "S-LIVE: .home-page not found"
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


        homePage.appendChild(layer);


        console.log(
            "S-LIVE: Follow effect layer created"
        );


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
            () => {

                spark.remove();

            },
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


        /*
         * نجوم ولمعات
         */

        for (let i = 0; i < 30; i++) {
            createSpark();
        }


        /*
         * يبقى التأثير 5 ثوانٍ
         */

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
