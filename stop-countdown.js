const stopTriggers = Array.from(document.querySelectorAll("[data-stop-trigger='true']"));

// Single-box mode (index.html)
const stopCountdownBox = document.getElementById("stopCountdownBox");

// Dual-box mode (1vs1.html)
const stopCountdownPair = document.getElementById("stopCountdownPair");
const stopCountdownTop = document.getElementById("stopCountdownTop");
const stopCountdownBottom = document.getElementById("stopCountdownBottom");

const isDualMode = stopCountdownPair !== null;

let stopCountdownInterval = null;
let topDismissed = false;
let bottomDismissed = false;

function _getAudioCtx() {
    if (!window._stopAudioCtx) {
        window._stopAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return window._stopAudioCtx;
}

function playCountdownTick(remaining) {
    try {
        const ctx = _getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (remaining === 0) {
            osc.type = 'triangle';
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'triangle';
            osc2.frequency.value = 440;
            gain2.gain.setValueAtTime(0.2, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.5);
        } else if (remaining <= 3) {
            osc.type = 'square';
            osc.frequency.value = 660;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);
        } else {
            osc.type = 'sine';
            osc.frequency.value = 480;
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        }
    } catch (_) {}
}

function clearStopCountdown() {
    if (stopCountdownInterval !== null) {
        window.clearInterval(stopCountdownInterval);
        stopCountdownInterval = null;
    }
}

function hidePair() {
    stopCountdownPair.classList.remove("is-visible");
    topDismissed = false;
    bottomDismissed = false;
    stopCountdownTop.classList.remove("is-dismissed");
    stopCountdownBottom.classList.remove("is-dismissed");
}

function dismissBox() {
    clearStopCountdown();
    stopCountdownTop.classList.add("is-dismissed");
    stopCountdownBottom.classList.add("is-dismissed");
    window.setTimeout(hidePair, 300);
}

function startStopCountdown() {
    if (!stopTriggers.length) { return; }
    clearStopCountdown();

    if (isDualMode) {
        topDismissed = false;
        bottomDismissed = false;
        stopCountdownTop.classList.remove("is-dismissed");
        stopCountdownBottom.classList.remove("is-dismissed");

        let remaining = 10;
        stopCountdownTop.textContent = remaining;
        stopCountdownBottom.textContent = remaining;
        stopCountdownPair.classList.add("is-visible");
        playCountdownTick(remaining);

        stopCountdownInterval = window.setInterval(() => {
            remaining -= 1;
            if (!topDismissed) { stopCountdownTop.textContent = remaining; }
            if (!bottomDismissed) { stopCountdownBottom.textContent = remaining; }
            playCountdownTick(remaining);

            if (remaining <= 0) {
                clearStopCountdown();
                window.setTimeout(hidePair, 250);
            }
        }, 1000);
    } else {
        if (!stopCountdownBox) { return; }
        let remaining = 10;
        stopCountdownBox.textContent = `${remaining}S`;
        stopCountdownBox.classList.add("is-visible");
        playCountdownTick(remaining);

        stopCountdownInterval = window.setInterval(() => {
            remaining -= 1;
            stopCountdownBox.textContent = `${remaining}S`;
            playCountdownTick(remaining);

            if (remaining <= 0) {
                clearStopCountdown();
                window.setTimeout(() => {
                    stopCountdownBox.classList.remove("is-visible");
                }, 250);
            }
        }, 1000);
    }
}

if (stopTriggers.length) {
    stopTriggers.forEach((trigger) => {
        trigger.addEventListener("click", startStopCountdown);
    });
}

if (isDualMode) {
    stopCountdownTop.addEventListener("click", dismissBox);
    stopCountdownBottom.addEventListener("click", dismissBox);
}
