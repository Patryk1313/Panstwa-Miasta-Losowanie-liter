const stopTriggers = Array.from(document.querySelectorAll("[data-stop-trigger='true']"));
const stopCountdownBox = document.getElementById("stopCountdownBox");

let stopCountdownInterval = null;

function clearStopCountdown() {
    if (stopCountdownInterval !== null) {
        window.clearInterval(stopCountdownInterval);
        stopCountdownInterval = null;
    }
}

function startStopCountdown() {
    if (!stopTriggers.length || !stopCountdownBox) {
        return;
    }

    clearStopCountdown();

    let remaining = 10;
    stopCountdownBox.classList.add("is-visible");
    stopCountdownBox.textContent = `${remaining}S`;

    stopCountdownInterval = window.setInterval(() => {
        remaining -= 1;
        stopCountdownBox.textContent = `${remaining}S`;

        if (remaining <= 0) {
            clearStopCountdown();
            window.setTimeout(() => {
                stopCountdownBox.classList.remove("is-visible");
            }, 250);
        }
    }, 1000);
}

if (stopTriggers.length) {
    stopTriggers.forEach((trigger) => {
        trigger.addEventListener("click", startStopCountdown);
    });
}
