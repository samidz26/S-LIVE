"use strict";

const EffectsTestMenu = (() => {

    let menu = null;

    function create() {

        // منع إنشاء القائمة أكثر من مرة
        if (menu) {
            return;
        }

        // القائمة تظهر في Settings فقط
        const settingsPage =
            document.querySelector(".settings-page");

        if (!settingsPage) {
            console.warn(
                "S-LIVE: .settings-page not found"
            );
            return;
        }

        menu = document.createElement("div");

        menu.className =
            "effects-test-menu";

        menu.innerHTML = `
            <button
                class="effects-test-button"
                type="button"
                title="اختبار المؤثرات"
            >
                ⚡
            </button>

            <div class="effects-test-dropdown">

                <button
                    class="effects-test-item"
                    type="button"
                    data-action="gifts"
                >
                    <span class="effects-test-item-icon">🎁</span>
                    <span>هدايا</span>
                </button>

                <div class="effects-test-submenu">

                    <button
                        class="effects-test-gift"
                        type="button"
                        data-gift="rose"
                    >
                        <span>🌹</span>
                        <span>وردة</span>
                    </button>

                    <button
                        class="effects-test-gift"
                        type="button"
                        data-gift="heart"
                    >
                        <span>❤️</span>
                        <span>قلب</span>
                    </button>

                    <button
                        class="effects-test-gift"
                        type="button"
                        data-gift="donut"
                    >
                        <span>🍩</span>
                        <span>دونت</span>
                    </button>

                </div>

                <button
                    class="effects-test-item"
                    type="button"
                    data-action="follow"
                >
                    <span class="effects-test-item-icon">➕</span>
                    <span>متابعة</span>
                </button>

                <button
                    class="effects-test-item"
                    type="button"
                    data-action="subscribe"
                >
                    <span class="effects-test-item-icon">❤️</span>
                    <span>اشتراك</span>
                </button>

                <button
                    class="effects-test-item"
                    type="button"
                    data-action="like"
                >
                    <span class="effects-test-item-icon">⚡</span>
                    <span>تكبيس</span>
                </button>

            </div>
        `;

        settingsPage.appendChild(menu);

        setupEvents();
    }


    function setupEvents() {

        const button =
            menu.querySelector(
                ".effects-test-button"
            );

        const dropdown =
            menu.querySelector(
                ".effects-test-dropdown"
            );

        const giftsButton =
            menu.querySelector(
                '[data-action="gifts"]'
            );

        const giftsSubmenu =
            menu.querySelector(
                ".effects-test-submenu"
            );


        // فتح وإغلاق القائمة الرئيسية
        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                dropdown.classList.toggle(
                    "open"
                );

                giftsSubmenu.classList.remove(
                    "open"
                );
            }
        );


        // فتح قائمة الهدايا
        giftsButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                giftsSubmenu.classList.toggle(
                    "open"
                );
            }
        );


        // الهدايا
        const giftButtons =
            menu.querySelectorAll(
                ".effects-test-gift"
            );

        giftButtons.forEach(
            giftButton => {

                giftButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        const gift =
                            giftButton.dataset.gift;

                        handleGift(gift);
                    }
                );
            }
        );


        // إغلاق القائمة عند الضغط خارجها
        document.addEventListener(
            "click",
            () => {

                dropdown.classList.remove(
                    "open"
                );

                giftsSubmenu.classList.remove(
                    "open"
                );
            }
        );


        // منع إغلاق القائمة عند الضغط داخلها
        dropdown.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );
    }


    function handleGift(gift) {

        console.log(
            "S-LIVE TEST GIFT:",
            gift
        );


        if (gift === "rose") {

            console.log(
                "S-LIVE: Rose selected"
            );

            /*
             * سيتم ربط RoseEffect.play()
             * في الخطوة التالية.
             */
        }


        if (gift === "heart") {

            console.log(
                "S-LIVE: Heart selected"
            );
        }


        if (gift === "donut") {

            console.log(
                "S-LIVE: Donut selected"
            );
        }
    }


    return {
        create
    };

})();
