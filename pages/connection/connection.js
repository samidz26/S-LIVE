const usernameInput = document.getElementById("username");
const connectButton = document.getElementById("connect-btn");
const connectionStatus = document.getElementById("connection-status");

connectButton.addEventListener("click", () => {

    const username = usernameInput.value.trim();

    if (!username) {
        updateStatus("يرجى إدخال اسم المستخدم", "error");
        return;
    }

    updateStatus("جاري الاتصال...", "connecting");

    /*
     * الاتصال الحقيقي بـ TikTok LIVE
     * سنضيفه لاحقًا عن طريق السيرفر.
     */

    setTimeout(() => {
        updateStatus("جاهز للاتصال", "connecting");
    }, 1000);
});


function updateStatus(message, state) {

    const statusText = connectionStatus.querySelector("span:last-child");
    const statusDot = connectionStatus.querySelector(".status-dot");

    statusText.textContent = message;

    statusDot.className = "status-dot";

    if (state) {
        statusDot.classList.add(state);
    }
}
