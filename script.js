const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const storageKey = "panstwa-miasta-letter-history";
const timerOptions = [60, 120, 180, 300];

const letterBox = document.getElementById("letterBox");
const remainingCount = document.getElementById("remainingCount");
const historyList = document.getElementById("historyList");
const statusMessage = document.getElementById("statusMessage");
const drawButton = document.getElementById("drawButton");
const resetButton = document.getElementById("resetButton");
const timerDisplay = document.getElementById("timerDisplay");
const timerSelect = document.getElementById("timerSelect");
const optionsButton = document.getElementById("optionsButton");
const optionsPanel = document.getElementById("optionsPanel");
const floatingOptions = document.getElementById("floatingOptions");
const excludeYVOption = document.getElementById("excludeYVOption");
const soundOffOption = document.getElementById("soundOffOption");

let currentLetter = null;
let draws = 0;
let isDrawing = false;
let audioContext = null;
let timerDuration = 60;
let timerRemaining = 60;
let timerIntervalId = null;
const drawnLetters = [];
const settings = {
    excludeYV: true,
    soundEnabled: true
};

function getActiveLetters() {
    if (!settings.excludeYV) {
        return letters;
    }

    return letters.filter((letter) => letter !== "Y" && letter !== "V" && letter !== "X" && letter !== "Q");
}

function normalizeStateToSettings() {
    const activeLettersSet = new Set(getActiveLetters());
    const filteredLetters = drawnLetters.filter((letter) => activeLettersSet.has(letter));

    if (filteredLetters.length !== drawnLetters.length) {
        drawnLetters.length = 0;
        drawnLetters.push(...filteredLetters);
    }

    currentLetter = filteredLetters.at(-1) ?? null;
    draws = filteredLetters.length;
}

function syncOptionsUI() {
    excludeYVOption.checked = settings.excludeYV;
    soundOffOption.checked = !settings.soundEnabled;
}

function getAudioContext() {
    if (!settings.soundEnabled) {
        return null;
    }

    if (!window.AudioContext && !window.webkitAudioContext) {
        return null;
    }

    if (!audioContext) {
        const ContextClass = window.AudioContext || window.webkitAudioContext;
        audioContext = new ContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}

function playTone(frequency, duration = 0.07, type = "sine", volume = 0.03, startOffset = 0) {
    const context = getAudioContext();

    if (!context) {
        return;
    }

    const startTime = context.currentTime + startOffset;
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
}

function playDrawStartSound() {
    playTone(360, 0.08, "triangle", 0.03);
}

function playDrawTickSound() {
    playTone(520, 0.04, "square", 0.012);
}

function playDrawCompleteSound() {
    playTone(610, 0.07, "triangle", 0.03, 0);
    playTone(820, 0.1, "triangle", 0.03, 0.08);
}

function playResetSound() {
    playTone(300, 0.08, "sine", 0.03, 0);
    playTone(220, 0.09, "sine", 0.025, 0.06);
}

function playTimerEndSound() {
    playTone(250, 0.08, "triangle", 0.03, 0);
    playTone(200, 0.11, "triangle", 0.03, 0.08);
}

function formatTime(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timerRemaining);
    timerDisplay.classList.toggle("timer-warning", timerRemaining <= 10);
}

function stopTimer() {
    if (timerIntervalId !== null) {
        window.clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

function resetTimerToDuration() {
    stopTimer();
    timerRemaining = timerDuration;
    updateTimerDisplay();
}

function startRoundTimer() {
    resetTimerToDuration();

    timerIntervalId = window.setInterval(() => {
        timerRemaining -= 1;
        updateTimerDisplay();

        if (timerRemaining <= 0) {
            stopTimer();
            timerRemaining = 0;
            updateTimerDisplay();
            statusMessage.textContent = "Koniec czasu rundy. Losuj kolejna litere.";
            playTimerEndSound();
        }
    }, 1000);
}

function saveState() {
    const state = {
        currentLetter,
        draws,
        drawnLetters,
        settings,
        timerDuration
    };

    localStorage.setItem(storageKey, JSON.stringify(state));
}

function updateStatus() {
    if (drawnLetters.length === 0) {
        statusMessage.textContent = "Gotowe do pierwszego losowania.";
        return;
    }

    if (drawnLetters.length === getActiveLetters().length) {
        statusMessage.textContent = "Wylosowano wszystkie litery alfabetu. Kliknij reset, aby zaczac od nowa.";
        return;
    }

    statusMessage.textContent = `Wylosowano litere ${currentLetter}.`;
}

function syncControls() {
    drawButton.disabled = isDrawing || drawnLetters.length === getActiveLetters().length;
}

function renderState() {
    letterBox.textContent = currentLetter ?? "?";
    updateRemainingCount();
    renderHistory();
    updateStatus();
    syncControls();
}

function loadState() {
    const savedState = localStorage.getItem(storageKey);

    if (!savedState) {
        syncOptionsUI();
        renderState();
        return;
    }

    try {
        const parsedState = JSON.parse(savedState);
        const savedLetters = Array.isArray(parsedState.drawnLetters) ? parsedState.drawnLetters : [];
        const validLetters = savedLetters.filter((letter) => letters.includes(letter));
        const savedSettings = parsedState.settings ?? {};
        const savedTimerDuration = Number(parsedState.timerDuration);

        settings.excludeYV = typeof savedSettings.excludeYV === "boolean" ? savedSettings.excludeYV : true;
        settings.soundEnabled = typeof savedSettings.soundEnabled === "boolean" ? savedSettings.soundEnabled : true;
        timerDuration = timerOptions.includes(savedTimerDuration) ? savedTimerDuration : 60;
        timerRemaining = timerDuration;
        drawnLetters.push(...validLetters);
        draws = typeof parsedState.draws === "number" ? Math.min(parsedState.draws, validLetters.length) : validLetters.length;
        currentLetter = validLetters.at(-1) ?? null;
    } catch {
        localStorage.removeItem(storageKey);
    }

    normalizeStateToSettings();
    syncOptionsUI();
    timerSelect.value = String(timerDuration);
    resetTimerToDuration();
    renderState();
}

function resetState() {
    resetTimerToDuration();
    currentLetter = null;
    draws = 0;
    drawnLetters.length = 0;
    saveState();
    renderState();
    playResetSound();
}

function renderHistory() {
    historyList.innerHTML = "";

    if (drawnLetters.length === 0) {
        const emptyState = document.createElement("span");
        emptyState.className = "history-empty";
        emptyState.textContent = "Brak wylosowanych liter";
        historyList.appendChild(emptyState);
        return;
    }

    drawnLetters.forEach((letter) => {
        const item = document.createElement("span");
        item.className = "history-letter";
        item.textContent = letter;
        historyList.appendChild(item);
    });
}

function updateRemainingCount() {
    const remaining = getActiveLetters().length - drawnLetters.length;
    remainingCount.textContent = `${remaining} liter zostalo`;
}

function drawLetter() {
    if (isDrawing) {
        return;
    }

    const availableLetters = getActiveLetters().filter((letter) => !drawnLetters.includes(letter));

    if (availableLetters.length === 0) {
        statusMessage.textContent = "Wylosowano juz wszystkie litery alfabetu.";
        drawButton.disabled = true;
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableLetters.length);
    const nextLetter = availableLetters[randomIndex];

    isDrawing = true;
    statusMessage.textContent = "Losowanie trwa...";
    syncControls();
    playDrawStartSound();
    letterBox.classList.remove("animate");
    letterBox.classList.add("is-drawing");

    const animationLetters = getActiveLetters();
    let animationStep = 0;
    const animationTicks = 12;
    const animationInterval = window.setInterval(() => {
        const previewIndex = Math.floor(Math.random() * animationLetters.length);
        letterBox.textContent = animationLetters[previewIndex];
        animationStep += 1;

        if (animationStep % 3 === 0) {
            playDrawTickSound();
        }

        if (animationStep >= animationTicks) {
            window.clearInterval(animationInterval);
            finishDraw(nextLetter);
        }
    }, 70);
}

function finishDraw(nextLetter) {
    letterBox.classList.remove("is-drawing");

    currentLetter = nextLetter;
    drawnLetters.push(nextLetter);
    draws += 1;
    isDrawing = false;
    playDrawCompleteSound();

    saveState();
    renderState();
    startRoundTimer();

    letterBox.classList.remove("animate");
    requestAnimationFrame(() => {
        letterBox.classList.add("animate");
    });
}

function toggleOptionsPanel() {
    const willBeOpen = !optionsPanel.classList.contains("is-open");
    optionsPanel.classList.toggle("is-open", willBeOpen);
    optionsButton.setAttribute("aria-expanded", String(willBeOpen));
    optionsPanel.setAttribute("aria-hidden", String(!willBeOpen));
}

function closeOptionsPanel() {
    optionsPanel.classList.remove("is-open");
    optionsButton.setAttribute("aria-expanded", "false");
    optionsPanel.setAttribute("aria-hidden", "true");
}

function handleExcludeYVChange() {
    settings.excludeYV = excludeYVOption.checked;
    normalizeStateToSettings();
    saveState();
    renderState();
}

function handleSoundOptionChange() {
    settings.soundEnabled = !soundOffOption.checked;
    saveState();
}

function handleTimerChange() {
    const nextDuration = Number(timerSelect.value);

    if (!timerOptions.includes(nextDuration)) {
        return;
    }

    timerDuration = nextDuration;
    resetTimerToDuration();
    saveState();
}

function shouldIgnoreShortcut(event) {
    const target = event.target;

    if (!target || !(target instanceof Element)) {
        return false;
    }

    const tagName = target.tagName;

    if (target.isContentEditable) {
        return true;
    }

    if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
        return true;
    }

    if (target.closest("button") || target.closest("a")) {
        return true;
    }

    return false;
}

function handleKeyboardShortcuts(event) {
    if (shouldIgnoreShortcut(event)) {
        return;
    }

    const key = event.key.toLowerCase();

    if (event.code === "Space") {
        event.preventDefault();
        drawLetter();
        return;
    }

    if (key === "r") {
        event.preventDefault();
        resetState();
        return;
    }

    if (key === "o") {
        event.preventDefault();
        toggleOptionsPanel();
    }
}

drawButton.addEventListener("click", drawLetter);
letterBox.addEventListener("click", drawLetter);
resetButton.addEventListener("click", resetState);
optionsButton.addEventListener("click", toggleOptionsPanel);
excludeYVOption.addEventListener("change", handleExcludeYVChange);
soundOffOption.addEventListener("change", handleSoundOptionChange);
timerSelect.addEventListener("change", handleTimerChange);
document.addEventListener("keydown", handleKeyboardShortcuts);
loadState();