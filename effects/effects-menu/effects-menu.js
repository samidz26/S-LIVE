"use strict";

window.EffectsTestMenu = (() => {

    let menu = null;


    function create() {

        /*
         * منع إنشاء القائمة أكثر من مرة
         */
        if (menu) {
            return;
        }


        /*
         * القائمة تظهر في Settings فقط
         */
        const settingsPage =
            document.querySelector(".settings-page");

        if (!settingsPage) {

            console.warn(
                "S-LIVE: .settings-page not found"
            );

            return;
        }


        /*
         * إنشاء القائمة
         */
        menu =
            document.createElement("div");

        menu.className =
            "effects-test-menu";


        menu.innerHTML = `

            <!-- زر الاختبار -->

            <button
                class="effects-test-button"
                type="button"
                title="اختبار المؤثرات"
            >
                ⚡
            </button>


            <!-- القائمة الرئيسية -->

            <div class="effects-test-dropdown">


                <!-- =========================
                     الهدايا
                     ========================= -->

                <button
                    class="effects-test-item"
                    type="button"
                    data-action="gifts"
                >

                    <span
                        class="effects-test-item-icon"
                    >
                        🎁
                    </span>

                    <span>
                        هدايا
                    </span>

                </button>


                <!-- =========================
                     قائمة الهدايا الفرعية
                     ========================= -->

                <div class="effects-test-submenu">


                    <!-- وردة -->

                    <button
                        class="effects-test-gift"
                        type="button"
                        data-gift="rose"
                    >

                        <span>
                            🌹
                        </span>

                        <span>
                            وردة
                        </span>

                    </button>


                    <!-- قلب -->

                    <button
                        class="effects-test-gift"
                        type="button"
                        data-gift="heart"
                    >

                        <span>
                            ❤️
                        </span>

                        <span>
                            قلب
                        </span>

                    </button>


                    <!-- دونت -->

                    <button
                        class="effects-test-gift"
                        type="button"
                        data-gift="donut"
                    >

                        <span>
                            🍩
                        </span>

                        <span>
                            دونت
                        </span>

                    </button>

                </div>


                <!-- =========================
                     متابعة
                     ========================= -->

                <button
                    class="effects-test-item"
                    type="button"
                    data-action="follow"
                >

                    <span
                        class="effects-test-item-icon"
                    >
                        ➕
                    </span>

                    <span>
                        متابعة
                    </span>

                </button>


                <!-- =========================
                     اشتراك
                     ========================= -->

                <button
                    class="effects-test-item"
                    type="button"
                    data-action="subscribe"
                >

                    <span
                        class="effects-test-item-icon"
                    >
                        ❤️
                    </span>

                    <span>
                        اشتراك
                    </span>

                </button>


                <!-- =========================
                     تكبيس
                     ========================= -->

                <button
                    class="effects-test-item"
                    type="button"
                    data-action="like"
                >

                    <span
                        class="effects-test-item-icon"
                    >
                        ⚡
                    </span>

                    <span>
                        تكبيس
                    </span>

                </button>


            </div>
        `;


        /*
         * إضافة القائمة إلى Settings
         */
        settingsPage.appendChild(menu);


        /*
         * تشغيل الأحداث
         */
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


        /*
         * ==========================================
         * زر ⚡
         * ==========================================
         */

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                dropdown.classList.toggle(
                    "open"
                );


                /*
                 * عند فتح القائمة الرئيسية
                 * نخفي قائمة الهدايا
                 */

                giftsSubmenu.classList.remove(
                    "open"
                );
            }
        );


        /*
         * ==========================================
         * زر الهدايا
         * ==========================================
         */

        giftsButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                giftsSubmenu.classList.toggle(
                    "open"
                );
            }
        );


        /*
         * ==========================================
         * أزرار الهدايا
         * ==========================================
         */

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


        /*
         * ==========================================
         * أزرار التفاعلات
         * ==========================================
         */

        const actionButtons =
            menu.querySelectorAll(
                ".effects-test-item[data-action]"
            );


        actionButtons.forEach(
            actionButton => {

                actionButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();


                        const action =
                            actionButton.dataset.action;


                        /*
                         * الهدايا لها معالجة خاصة
                         */
                        if (action === "gifts") {

                            return;
                        }


                        handleAction(action);
                    }
                );
            }
        );


        /*
         * ==========================================
         * الضغط خارج القائمة
         * ==========================================
         */

        document.addEventListener(
            "click",
            () => {

                closeMenu();

            }
        );


        /*
         * ==========================================
         * منع إغلاق القائمة عند الضغط داخلها
         * ==========================================
         */

        dropdown.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );
    }


    /*
     * ==========================================
     * التعامل مع الهدايا
     * ==========================================
     */

    function handleGift(gift) {

        console.log(
            "S-LIVE TEST GIFT:",
            gift
        );


        /*
         * الوردة
         */

        if (gift === "rose") {

            console.log(
                "S-LIVE: Rose selected"
            );

        }


        /*
         * القلب
         */

        if (gift === "heart") {

            console.log(
                "S-LIVE: Heart selected"
            );

        }


        /*
         * الدونت
         */

        if (gift === "donut") {

            console.log(
                "S-LIVE: Donut selected"
            );

        }
    }


    /*
     * ==========================================
     * التعامل مع التفاعلات
     * ==========================================
     */

    function handleAction(action) {

        console.log(
            "S-LIVE TEST ACTION:",
            action
        );


        /*
         * ==========================================
         * متابعة
         * ==========================================
         */

        if (action === "follow") {

            /*
             * إغلاق القائمة فورًا
             */

            closeMenu();


            /*
             * تشغيل مؤثر المتابعة
             */

            if (
                window.FollowEffect &&
                typeof window.FollowEffect.play === "function"
            ) {

                window.FollowEffect.play();

            } else {

                console.warn(
                    "S-LIVE: FollowEffect not loaded"
                );
            }

            return;
        }


        /*
         * ==========================================
         * اشتراك
         * ==========================================
         */

        if (action === "subscribe") {

            closeMenu();

            console.log(
                "S-LIVE: Subscribe effect not implemented yet"
            );

            return;
        }


        /*
         * ==========================================
         * تكبيس
         * ==========================================
         */

        if (action === "like") {

            closeMenu();

            console.log(
                "S-LIVE: Like effect not implemented yet"
            );

            return;
        }
    }


    /*
     * ==========================================
     * إغلاق القائمة
     * ==========================================
     */

    function closeMenu() {

        if (!menu) {
            return;
        }


        const dropdown =
            menu.querySelector(
                ".effects-test-dropdown"
            );


        const giftsSubmenu =
            menu.querySelector(
                ".effects-test-submenu"
            );


        if (dropdown) {

            dropdown.classList.remove(
                "open"
            );
        }


        if (giftsSubmenu) {

            giftsSubmenu.classList.remove(
                "open"
            );
        }
    }


    /*
     * ==========================================
     * API
     * ==========================================
     */

    return {

        create,

        close: closeMenu

    };

})();
