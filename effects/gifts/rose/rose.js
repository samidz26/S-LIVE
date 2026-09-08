"use strict";

const RoseEffect = (() => {

    let layer = null;
    let timeout = null;

    function createLayer() {

        if (layer) {
            return layer;
        }

        layer = document.createElement("div");
        layer.className = "rose-effect-layer";

        layer.innerHTML = `
            <div class="rose-effect-glow"></div>
        `;

        const homePage =
            document.querySelector(".home-page");

        if (homePage) {
            homePage.appendChild(layer);
        }

        return layer;
    }

    function createRose() {

        const rose =
            document.createElement("div");

        rose.className = "rose-particle";
        rose.textContent = "🌹";

        rose.style.left =
            `${Math.random() * 100}%`;

        rose.style.fontSize =
            `${22 + Math.random() * 18}px`;

        rose.style.animationDuration =
            `${3.5 + Math.random() * 2}s`;

        rose.style.animationDelay =
            `${Math.random() * 0.8}s`;

        layer.appendChild(rose);

        rose.addEventListener(
            "animationend",
            () => rose.remove(),
            { once: true }
        );
    }

    function createPetal() {

        const petal =
            document.createElement("div");

        petal.className = "rose-petal";

        petal.style.left =
            `${Math.random() * 100}%`;

        petal.style.animationDuration =
            `${3 + Math.random() * 3}s`;

        petal.style.animationDelay =
            `${Math.random() * 1}s`;

        layer.appendChild(petal);

        petal.addEventListener(
            "animationend",
            () => petal.remove(),
            { once: true }
        );
    }

    function play() {

        createLayer();

        if (!layer) {
            return;
        }

        clearTimeout(timeout);

        layer.classList.add("active");

        /*
         * التأثير موحّد دائمًا.
         * لا علاقة لعدد الورود بكمية الهدية.
         */

        for (let i = 0; i < 18; i++) {
            createRose();
        }

        for (let i = 0; i < 35; i++) {
            createPetal();
        }

        timeout = setTimeout(() => {

            layer.classList.remove("active");

        }, 5000);
    }

    return {
        play
    };

})();
