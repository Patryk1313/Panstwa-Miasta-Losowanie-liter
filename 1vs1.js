const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const excludedLetters = new Set(["Y", "V", "X", "Q"]);
const duelStorageKey = "panstwa-miasta-duel-mode";

const duelLetterTop = document.getElementById("duelLetterTop");
const duelLetterBottom = document.getElementById("duelLetterBottom");
const duelResetButton = document.getElementById("duelResetButton");
const duelRemainingCountLeft = document.getElementById("duelRemainingCountLeft");
const duelRemainingCountRight = document.getElementById("duelRemainingCountRight");
const duelHistoryListLeft = document.getElementById("duelHistoryListLeft");
const duelHistoryListRight = document.getElementById("duelHistoryListRight");

let currentLetter = null;
let isDrawing = false;
const drawnLetters = [];

function getActiveLetters() {
    return letters.filter((letter) => !excludedLetters.has(letter));
}

function setDisplayedLetter(letter) {
    const shownLetter = letter ?? "?";
    duelLetterTop.textContent = shownLetter;
    duelLetterBottom.textContent = shownLetter;
}

function saveState() {
    localStorage.setItem(duelStorageKey, JSON.stringify({
        currentLetter,
        drawnLetters
    }));
}

function updateRemainingCount() {
    const remaining = getActiveLetters().length - drawnLetters.length;
    const label = `${remaining} litery`;
    duelRemainingCountLeft.textContent = label;
    duelRemainingCountRight.textContent = label;
}

function renderHistoryColumn(container) {
    container.innerHTML = "";

    if (drawnLetters.length === 0) {
        const emptyState = document.createElement("span");
        emptyState.className = "history-empty";
        emptyState.textContent = "Brak losowań";
        container.appendChild(emptyState);
        return;
    }

    for (let index = drawnLetters.length - 1; index >= 0; index -= 1) {
        const letter = drawnLetters[index];
        const item = document.createElement("span");
        item.className = "history-letter duel-history-letter";
        item.textContent = letter;
        container.appendChild(item);
    }
}

function renderHistory() {
    renderHistoryColumn(duelHistoryListLeft);
    renderHistoryColumn(duelHistoryListRight);
}

function scrollHistoryToTop() {
    duelHistoryListLeft.scrollTop = 0;
    duelHistoryListRight.scrollTop = 0;
}

function syncControls() {
    const completed = drawnLetters.length >= getActiveLetters().length;
    duelLetterTop.disabled = completed || isDrawing;
    duelLetterBottom.disabled = completed || isDrawing;

    if (completed) {
        setDisplayedLetter("KONIEC");
    } else if (!isDrawing) {
        setDisplayedLetter(currentLetter);
    }
}

function renderState() {
    updateRemainingCount();
    renderHistory();
    syncControls();
}

function loadState() {
    const savedState = localStorage.getItem(duelStorageKey);

    if (!savedState) {
        renderState();
        return;
    }

    try {
        const parsedState = JSON.parse(savedState);
        const savedLetters = Array.isArray(parsedState.drawnLetters) ? parsedState.drawnLetters : [];
        const activeLetters = new Set(getActiveLetters());
        const validLetters = savedLetters.filter((letter) => activeLetters.has(letter));

        drawnLetters.push(...validLetters);
        currentLetter = activeLetters.has(parsedState.currentLetter) ? parsedState.currentLetter : validLetters.at(-1) ?? null;
    } catch {
        localStorage.removeItem(duelStorageKey);
    }

    renderState();
}

function finishDraw(nextLetter) {
    currentLetter = nextLetter;
    drawnLetters.push(nextLetter);
    isDrawing = false;

    duelLetterTop.classList.remove("is-drawing");
    duelLetterBottom.classList.remove("is-drawing");

    saveState();
    renderState();
    scrollHistoryToTop();
}

function drawLetter() {
    if (isDrawing) {
        return;
    }

    const availableLetters = getActiveLetters().filter((letter) => !drawnLetters.includes(letter));

    if (availableLetters.length === 0) {
        renderState();
        return;
    }

    const nextLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];

    isDrawing = true;
    duelLetterTop.classList.add("is-drawing");
    duelLetterBottom.classList.add("is-drawing");
    syncControls();

    const animationLetters = getActiveLetters();
    let animationStep = 0;
    const animationTicks = 12;
    const animationInterval = window.setInterval(() => {
        const previewLetter = animationLetters[Math.floor(Math.random() * animationLetters.length)];
        setDisplayedLetter(previewLetter);
        animationStep += 1;

        if (animationStep >= animationTicks) {
            window.clearInterval(animationInterval);
            finishDraw(nextLetter);
        }
    }, 70);
}

function resetState() {
    currentLetter = null;
    isDrawing = false;
    drawnLetters.length = 0;
    localStorage.removeItem(duelStorageKey);
    duelLetterTop.classList.remove("is-drawing");
    duelLetterBottom.classList.remove("is-drawing");
    renderState();
}

duelLetterTop.addEventListener("click", drawLetter);
duelLetterBottom.addEventListener("click", drawLetter);
duelResetButton.addEventListener("click", resetState);

window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        event.preventDefault();
        drawLetter();
    }

    if (event.code === "KeyR") {
        resetState();
    }
});

loadState();