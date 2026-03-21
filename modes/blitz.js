const raceLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const raceExcludedLetters = new Set(["Y", "V", "X", "Q"]);
const raceCategories = [
    "Państwo-Miasto",
    "Imię",
    "Kolor",
    "Zwierzę",
    "Rzecz",
    "Roślina",
    "Zawód",
    "Jedzenie",
    "Owoc",
    "Warzywo",
    "Napój",
    "Słodycze",
    "Samochód",
    "Część ciała",
    "Ubranie",
    "Sport",
    "Film",
    "Serial",
    "Bajka",
    "Piosenka",
    "Piosenkarz/Piosenkarka",
    "Instrument muzyczny",
    "Gra komputerowa",
    "Gra planszowa",
    "Przedmiot szkolny",
    "Mebel",
    "Sprzęt domowy",
    "Elektronika",
    "Kraj",
    "Miasto w Polsce",
    "Rzeka",
    "Góra",
    "Morze",
    "Kontynent",
    "Język",
    "Święto",
    "Pogoda",
    "Drzewo",
    "Kwiat",
    "Ptak",
    "Ryba",
    "Owad",
    "Zwierzę domowe",
    "Postać z bajki",
    "Postać filmowa",
    "Aktor lub aktorka",
    "Sklep",
    "Restauracja",
    "Budowla",
    "Miejsce w mieście",
    "Miejsce na wakacje",
    "Środek transportu",
    "Firma",
    "Program telewizyjny",
    "YouTuber",
    "Danie obiadowe",
    "Danie śniadaniowe",
    "Danie kolacyjne",
    "Planeta",
    "Emocja",
    "Rzecz w kuchni",
    "Rzecz w łazience",
    "Rzecz w plecaku",
    "Miejsce w szkole",
    "Przedmiot na biurku",
    "Marka",
    "Narzędzie",
    "Materiał",
    "Zawód sportowy",
    "Gra mobilna",
    "Aplikacja",
    "Serial animowany",
    "Film animowany",
    "Książka",
    "Komiks",
    "Postać historyczna",
    "Naukowiec",
    "Element garderoby",
    "Kosmetyk",
    "Przedmiot kuchenny",
    "Danie regionalne",
    "Deser",
    "Sos",
    "Przyprawa",
    "Nabiał",
    "Marka odzieżowa",
    "Sieć sklepów",
    "Miejsce turystyczne",
    "Zabytek",
    "Pasmo górskie",
    "Wyspa",
    "Jezioro",
    "Park narodowy",
    "Środek płatniczy",
    "Waluta",
    "Język programowania",
    "Przeglądarka internetowa",
    "System operacyjny",
    "Komponent komputera",
    "Emoji",
    "Cecha charakteru",
    "Emocja pozytywna",
    "Emocja negatywna",
    "Rzecz w biurze",
    "Rzecz w samochodzie"
];
const raceStorageKey = "panstwa-miasta-blitz-mode";
const raceCountdownSeconds = 5;
const raceDefaultPointsToWin = 100;
const raceDefaultPlayerNames = {
    top: "Gracz górny",
    bottom: "Gracz dolny"
};

const drawBoxLetter = document.getElementById("drawBoxLetter");
const drawBoxCategory = document.getElementById("drawBoxCategory");
const drawBoxHint = document.getElementById("drawBoxHint");
const drawBoxMirror = document.getElementById("drawBoxMirror");
const drawBoxLetterMirror = document.getElementById("drawBoxLetterMirror");
const drawBoxCategoryMirror = document.getElementById("drawBoxCategoryMirror");
const drawBoxHintMirror = document.getElementById("drawBoxHintMirror");
const raceStatus = document.getElementById("raceStatus");
const drawBox = document.getElementById("drawBox");
const raceBuzzTop = document.getElementById("raceBuzzTop");
const raceBuzzBottom = document.getElementById("raceBuzzBottom");
const resetRaceButton = document.getElementById("resetRaceButton");
const awardPointButton = document.getElementById("awardPointButton");
const denyPointButton = document.getElementById("denyPointButton");
const raceModal = document.getElementById("raceModal");
const raceModalLabel = document.getElementById("raceModalLabel");
const raceModalValue = document.getElementById("raceModalValue");
const raceModalText = document.getElementById("raceModalText");
const raceModalActions = document.getElementById("raceModalActions");
const raceModalLabelMirror = document.getElementById("raceModalLabelMirror");
const raceModalValueMirror = document.getElementById("raceModalValueMirror");
const raceModalTextMirror = document.getElementById("raceModalTextMirror");
const raceModalActionsMirror = document.getElementById("raceModalActionsMirror");
const awardPointButtonMirror = document.getElementById("awardPointButtonMirror");
const denyPointButtonMirror = document.getElementById("denyPointButtonMirror");
const skipRoundButton = document.getElementById("skipRoundButton");
const raceScoreTop = document.getElementById("raceScoreTop");
const raceScoreBottom = document.getElementById("raceScoreBottom");
const racePlayerTop = document.getElementById("racePlayerTop");
const racePlayerBottom = document.getElementById("racePlayerBottom");
const racePlayerLabelTop = document.getElementById("racePlayerLabelTop");
const racePlayerLabelBottom = document.getElementById("racePlayerLabelBottom");
const raceLeadTop = document.getElementById("raceLeadTop");
const raceLeadBottom = document.getElementById("raceLeadBottom");
const openSettingsButton = document.getElementById("openSettingsButton");
const raceSettingsModal = document.getElementById("raceSettingsModal");
const playerTopInput = document.getElementById("playerTopInput");
const playerBottomInput = document.getElementById("playerBottomInput");
const pointsToWinInput = document.getElementById("pointsToWinInput");
const saveSettingsButton = document.getElementById("saveSettingsButton");
const closeSettingsButton = document.getElementById("closeSettingsButton");


let raceCurrentLetter = null;
let raceCurrentCategory = null;
let racePhase = "idle";
let raceResponder = null;
let raceCountdownValue = raceCountdownSeconds;
let raceCountdownIntervalId = null;
let raceIsDrawing = false;
let raceAudioContext = null;

const raceScores = {
    top: 0,
    bottom: 0
};
const racePlayerNames = {
    top: raceDefaultPlayerNames.top,
    bottom: raceDefaultPlayerNames.bottom
};

const raceDrawnLetters = [];
const raceDrawnCategories = [];
const raceRounds = [];
let raceSkippedRounds = 0;
const raceAwardVotes = new Set();
let racePointsToWin = raceDefaultPointsToWin;

function getRaceAudioContext() {
    if (!window.AudioContext && !window.webkitAudioContext) {
        return null;
    }

    if (!raceAudioContext) {
        const ContextClass = window.AudioContext || window.webkitAudioContext;
        raceAudioContext = new ContextClass();
    }

    if (raceAudioContext.state === "suspended") {
        raceAudioContext.resume();
    }

    return raceAudioContext;
}

function playRaceTone(frequency, duration = 0.08, type = "sine", volume = 0.03, startOffset = 0) {
    const context = getRaceAudioContext();

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

function playRaceDrawSound() {
    playRaceTone(350, 0.08, "triangle", 0.03, 0);
    playRaceTone(520, 0.08, "triangle", 0.02, 0.08);
}

function playRaceBuzzSound() {
    playRaceTone(620, 0.1, "square", 0.04);
}

function playRaceCountdownSound(remaining) {
    if (remaining <= 1) {
        playRaceTone(760, 0.12, "square", 0.1);
        return;
    }

    playRaceTone(540, 0.09, "sine", 0.08);
}

function playRaceAwardSound() {
    playRaceTone(620, 0.08, "triangle", 0.035, 0);
    playRaceTone(840, 0.12, "triangle", 0.035, 0.08);
}

function playRaceDenySound() {
    playRaceTone(260, 0.1, "sine", 0.035, 0);
    playRaceTone(200, 0.12, "sine", 0.03, 0.08);
}

function getRaceActiveLetters() {
    return raceLetters.filter((letter) => !raceExcludedLetters.has(letter));
}

function getAvailableRaceLetters() {
    return getRaceActiveLetters().filter((letter) => !raceDrawnLetters.includes(letter));
}

function getAvailableRaceCategories() {
    return raceCategories.filter((category) => !raceDrawnCategories.includes(category));
}

function getResponderLabel(responder) {
    if (responder === "top") {
        return racePlayerNames.top;
    }

    if (responder === "bottom") {
        return racePlayerNames.bottom;
    }

    return "Nikt";
}

function clearRaceCountdown() {
    if (raceCountdownIntervalId !== null) {
        window.clearInterval(raceCountdownIntervalId);
        raceCountdownIntervalId = null;
    }
}

function closeRaceModal() {
    raceModal.hidden = true;
    raceModalActions.hidden = true;
    raceModalValue.hidden = false;
    raceModalActionsMirror.hidden = true;
    raceModalValueMirror.hidden = false;
}

function openRaceCountdownModal(player) {
    raceModal.hidden = false;
    const label = getResponderLabel(player);
    const text = `Ma ${raceCountdownSeconds} sekundy na odpowiedź.`;
    const val = String(raceCountdownValue);
    raceModalLabel.textContent = label;
    raceModalValue.hidden = false;
    raceModalValue.textContent = val;
    raceModalText.textContent = text;
    raceModalActions.hidden = true;
    raceModalLabelMirror.textContent = label;
    raceModalValueMirror.hidden = false;
    raceModalValueMirror.textContent = val;
    raceModalTextMirror.textContent = text;
    raceModalActionsMirror.hidden = true;
}

function openRaceJudgeModal() {
    raceAwardVotes.clear();
    raceModal.hidden = false;
    const text = `Czy ${getResponderLabel(raceResponder).toLowerCase()} dostaje punkt?`;
    raceModalLabel.textContent = "Decyzja";
    raceModalValue.hidden = true;
    raceModalText.textContent = text;
    raceModalActions.hidden = false;
    awardPointButton.disabled = false;
    denyPointButton.disabled = false;
    raceModalLabelMirror.textContent = "Decyzja";
    raceModalValueMirror.hidden = true;
    raceModalTextMirror.textContent = text;
    raceModalActionsMirror.hidden = false;
    awardPointButtonMirror.disabled = false;
    denyPointButtonMirror.disabled = false;
}

function saveRaceState() {
    const state = {
        currentLetter: raceCurrentLetter,
        currentCategory: raceCurrentCategory,
        phase: racePhase,
        responder: raceResponder,
        scores: raceScores,
        playerNames: racePlayerNames,
        pointsToWin: racePointsToWin,
        drawnLetters: raceDrawnLetters,
        drawnCategories: raceDrawnCategories,
        skippedRounds: raceSkippedRounds,
        rounds: raceRounds
    };

    localStorage.setItem(raceStorageKey, JSON.stringify(state));
}



function updateRaceScores() {
    raceScoreTop.textContent = `${raceScores.top} pkt`;
    raceScoreBottom.textContent = `${raceScores.bottom} pkt`;
}

function updateRacePlayerLabels() {
    racePlayerLabelTop.textContent = racePlayerNames.top;
    racePlayerLabelBottom.textContent = racePlayerNames.bottom;
}

function updateRaceLead() {
    const normalizedPointsToWin = Math.max(1, racePointsToWin);
    const topStep = Math.min(normalizedPointsToWin, Math.max(0, raceScores.top));
    const bottomStep = Math.min(normalizedPointsToWin, Math.max(0, raceScores.bottom));
    const topPosition = (topStep / normalizedPointsToWin) * 100;
    const bottomPosition = (bottomStep / normalizedPointsToWin) * 100;

    raceLeadTop.style.left = `${topPosition}%`;
    raceLeadBottom.style.left = `${bottomPosition}%`;
    raceLeadTop.textContent = "";
    raceLeadBottom.textContent = "";
    raceLeadTop.classList.toggle("is-leading", topPosition > bottomPosition);
    raceLeadBottom.classList.toggle("is-leading", bottomPosition > topPosition);
}

function updateRaceBoxes() {
    const letter = raceCurrentLetter ?? "?";
    const category = raceCurrentCategory ?? "Kategoria";
    drawBoxLetter.textContent = letter;
    drawBoxCategory.textContent = category;
    drawBoxLetterMirror.textContent = letter;
    drawBoxCategoryMirror.textContent = category;
}

function updateRaceHighlights() {
    racePlayerTop.classList.toggle("is-active", raceResponder === "top" && (racePhase === "countdown" || racePhase === "judging"));
    racePlayerBottom.classList.toggle("is-active", raceResponder === "bottom" && (racePhase === "countdown" || racePhase === "judging"));
}

function syncRaceControls() {
    const roundReady = raceCurrentLetter !== null && raceCurrentCategory !== null;
    const canBuzz = roundReady && racePhase === "open" && !raceIsDrawing;
    const canDraw = !raceIsDrawing && (racePhase === "idle" || racePhase === "resolved") && getAvailableRaceLetters().length > 0 && getAvailableRaceCategories().length > 0;

    raceBuzzTop.hidden = true;
    raceBuzzBottom.hidden = true;
    raceBuzzTop.disabled = true;
    raceBuzzBottom.disabled = true;
    const drawBoxActive = canDraw || canBuzz;
    drawBox.classList.toggle("drawbox-answer", canBuzz);
    drawBoxMirror.classList.toggle("drawbox-answer", canBuzz);
    drawBox.classList.toggle("is-disabled", !drawBoxActive);
    drawBox.setAttribute("aria-disabled", String(!drawBoxActive));
    drawBoxMirror.classList.toggle("is-disabled", !drawBoxActive);
    drawBoxMirror.setAttribute("aria-disabled", String(!drawBoxActive));
    drawBoxHint.textContent = canBuzz ? "ODPOWIADAM" : canDraw ? "Losuj" : "";
    drawBoxHintMirror.textContent = canBuzz ? "ODPOWIADAM" : canDraw ? "Losuj" : "";
    skipRoundButton.hidden = !canBuzz;
    resetRaceButton.disabled = raceIsDrawing;
    awardPointButton.disabled = racePhase !== "judging" || raceAwardVotes.has("bottom");
    denyPointButton.disabled = racePhase !== "judging";
    awardPointButtonMirror.disabled = racePhase !== "judging" || raceAwardVotes.has("top");
    denyPointButtonMirror.disabled = racePhase !== "judging";
}

function renderRaceState() {
    updateRaceBoxes();
    updateRaceScores();
    updateRacePlayerLabels();
    updateRaceLead();
    updateRaceHighlights();
    syncRaceControls();
}

function openRaceSettings() {
    playerTopInput.value = racePlayerNames.top;
    playerBottomInput.value = racePlayerNames.bottom;
    pointsToWinInput.value = String(racePointsToWin);
    raceSettingsModal.hidden = false;
    playerTopInput.focus();
}

function closeRaceSettings() {
    raceSettingsModal.hidden = true;
}

function saveRaceSettings() {
    const nextTopName = playerTopInput.value.trim();
    const nextBottomName = playerBottomInput.value.trim();
    const parsedPointsToWin = Number.parseInt(pointsToWinInput.value, 10);

    racePlayerNames.top = nextTopName || raceDefaultPlayerNames.top;
    racePlayerNames.bottom = nextBottomName || raceDefaultPlayerNames.bottom;
    racePointsToWin = Number.isFinite(parsedPointsToWin)
        ? Math.min(500, Math.max(1, parsedPointsToWin))
        : raceDefaultPointsToWin;
    pointsToWinInput.value = String(racePointsToWin);
    closeRaceSettings();
    saveRaceState();
    renderRaceState();
}

function normalizeRaceState() {
    if (racePhase === "countdown") {
        racePhase = "open";
        raceResponder = null;
    }

    if ((racePhase === "judging" || racePhase === "open") && (!raceCurrentLetter || !raceCurrentCategory)) {
        racePhase = "idle";
        raceResponder = null;
    }
}

function loadRaceState() {
    closeRaceModal();
    const savedState = localStorage.getItem(raceStorageKey);

    if (!savedState) {
        racePhase = "idle";
        raceResponder = null;
        renderRaceState();
        return;
    }

    try {
        const parsedState = JSON.parse(savedState);
        const activeLetters = new Set(getRaceActiveLetters());
        const validLetters = Array.isArray(parsedState.drawnLetters)
            ? parsedState.drawnLetters.filter((letter) => activeLetters.has(letter))
            : [];
        const validCategories = Array.isArray(parsedState.drawnCategories)
            ? parsedState.drawnCategories.filter((category) => raceCategories.includes(category))
            : [];
        const validRounds = Array.isArray(parsedState.rounds)
            ? parsedState.rounds.filter((round) => {
                return activeLetters.has(round.letter)
                    && raceCategories.includes(round.category)
                    && (round.responder === "top" || round.responder === "bottom")
                    && typeof round.awarded === "boolean";
            })
            : [];

        raceDrawnLetters.push(...validLetters);
        raceDrawnCategories.push(...validCategories);
        raceRounds.push(...validRounds);
        racePlayerNames.top = parsedState.playerNames?.top?.trim() || raceDefaultPlayerNames.top;
        racePlayerNames.bottom = parsedState.playerNames?.bottom?.trim() || raceDefaultPlayerNames.bottom;
        racePointsToWin = Number.isFinite(parsedState.pointsToWin)
            ? Math.min(500, Math.max(1, parsedState.pointsToWin))
            : raceDefaultPointsToWin;
        raceSkippedRounds = Number.isFinite(parsedState.skippedRounds) ? Math.max(0, parsedState.skippedRounds) : 0;
        raceCurrentLetter = activeLetters.has(parsedState.currentLetter) ? parsedState.currentLetter : null;
        raceCurrentCategory = raceCategories.includes(parsedState.currentCategory) ? parsedState.currentCategory : null;
        racePhase = ["idle", "open", "judging", "resolved"].includes(parsedState.phase) ? parsedState.phase : "idle";
        raceResponder = parsedState.responder === "top" || parsedState.responder === "bottom" ? parsedState.responder : null;
        raceScores.top = Number.isFinite(parsedState.scores?.top) ? parsedState.scores.top : 0;
        raceScores.bottom = Number.isFinite(parsedState.scores?.bottom) ? parsedState.scores.bottom : 0;
    } catch {
        localStorage.removeItem(raceStorageKey);
    }

    normalizeRaceState();

    if (racePhase === "idle") {
        raceStatus.textContent = "Losuj pierwszą rundę.";
        closeRaceModal();
    } else if (racePhase === "open") {
        raceStatus.textContent = "Kliknij Odpowiadam. Kto pierwszy kliknie, ten odpowiada.";
        closeRaceModal();
    } else if (racePhase === "judging") {
        raceStatus.textContent = `Czas minął. Zdecyduj, czy ${getResponderLabel(raceResponder).toLowerCase()} dostaje punkt.`;
        openRaceJudgeModal();
    } else {
        raceStatus.textContent = "Runda zakończona. Losuj następną.";
        closeRaceModal();
    }

    renderRaceState();
}

function finishRaceDraw(nextLetter, nextCategory) {
    raceCurrentLetter = nextLetter;
    raceCurrentCategory = nextCategory;
    raceDrawnLetters.push(nextLetter);
    raceDrawnCategories.push(nextCategory);
    racePhase = "open";
    raceResponder = null;
    raceIsDrawing = false;
    drawBox.classList.remove("is-drawing");
    drawBoxMirror.classList.remove("is-drawing");
    raceStatus.textContent = "Kliknij Odpowiadam. Kto pierwszy kliknie, ten odpowiada.";
    closeRaceModal();
    saveRaceState();
    renderRaceState();
    playRaceDrawSound();
}

function animateRaceValue(elements, values, ticks, onComplete) {
    const els = Array.isArray(elements) ? elements : [elements];
    let animationStep = 0;
    const animationInterval = window.setInterval(() => {
        const previewValue = values[Math.floor(Math.random() * values.length)];
        els.forEach((el) => { el.textContent = previewValue; });
        animationStep += 1;

        if (animationStep >= ticks) {
            window.clearInterval(animationInterval);
            onComplete();
        }
    }, 70);
}

function drawRaceRound() {
    if (raceIsDrawing || !(racePhase === "idle" || racePhase === "resolved")) {
        return;
    }

    const availableLetters = getAvailableRaceLetters();
    const availableCategories = getAvailableRaceCategories();

    if (availableLetters.length === 0 || availableCategories.length === 0) {
        raceStatus.textContent = "Brak kolejnych liter lub kategorii. Kliknij reset, aby zacząć od nowa.";
        renderRaceState();
        return;
    }

    const nextLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    const nextCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];

    raceIsDrawing = true;
    racePhase = "idle";
    raceResponder = null;
    raceStatus.textContent = "Losowanie litery...";
    drawBox.classList.add("is-drawing");
    drawBoxMirror.classList.add("is-drawing");
    drawBoxCategory.textContent = "Kategoria";
    drawBoxCategoryMirror.textContent = "Kategoria";
    closeRaceModal();
    syncRaceControls();

    animateRaceValue([drawBoxLetter, drawBoxLetterMirror], getRaceActiveLetters(), 10, () => {
        drawBoxLetter.textContent = nextLetter;
        drawBoxLetterMirror.textContent = nextLetter;
        raceStatus.textContent = "Za chwilę losowanie kategorii...";

        window.setTimeout(() => {
            raceStatus.textContent = "Losowanie kategorii...";
            animateRaceValue([drawBoxCategory, drawBoxCategoryMirror], raceCategories, 10, () => {
                drawBoxCategory.textContent = nextCategory;
                drawBoxCategoryMirror.textContent = nextCategory;
                finishRaceDraw(nextLetter, nextCategory);
            });
        }, 1700);
    });
}

function openRaceJudging() {
    clearRaceCountdown();

    if (raceResponder === null) {
        racePhase = "resolved";
        closeRaceModal();
        saveRaceState();
        renderRaceState();
        return;
    }

    racePhase = "judging";
    raceStatus.textContent = `Czas minął. Zdecyduj, czy ${getResponderLabel(raceResponder).toLowerCase()} dostaje punkt.`;
    openRaceJudgeModal();
    saveRaceState();
    renderRaceState();
}

function startRaceResponse(player) {
    if (racePhase !== "open" || raceIsDrawing) {
        return;
    }

    raceResponder = player;
    racePhase = "countdown";
    raceCountdownValue = raceCountdownSeconds;
    raceStatus.textContent = `${getResponderLabel(player)} odpowiada. Ma ${raceCountdownSeconds} sekundy.`;
    playRaceBuzzSound();
    openRaceCountdownModal(player);
    renderRaceState();

    raceCountdownIntervalId = window.setInterval(() => {
        raceCountdownValue -= 1;

        if (raceCountdownValue <= 0) {
            raceModalValue.textContent = "0";
            raceModalValueMirror.textContent = "0";
            playRaceCountdownSound(0);
            openRaceJudging();
            return;
        }

        raceModalValue.textContent = String(raceCountdownValue);
        raceModalValueMirror.textContent = String(raceCountdownValue);
        playRaceCountdownSound(raceCountdownValue);
    }, 1000);

    saveRaceState();
}

function finalizeRaceRound(awarded) {
    if (racePhase !== "judging" || raceResponder === null) {
        return;
    }

    raceAwardVotes.clear();

    if (awarded) {
        raceScores[raceResponder] += 1;
        playRaceAwardSound();
    } else {
        playRaceDenySound();
    }

    raceRounds.unshift({
        letter: raceCurrentLetter,
        category: raceCurrentCategory,
        responder: raceResponder,
        awarded
    });

    racePhase = "resolved";
    raceStatus.textContent = awarded
        ? `${getResponderLabel(raceResponder)} dostaje punkt. Losuj następną rundę.`
        : `Brak punktu dla ${getResponderLabel(raceResponder).toLowerCase()}. Losuj następną rundę.`;
    raceResponder = null;
    closeRaceModal();
    saveRaceState();
    renderRaceState();
}

function registerAwardVote(voter) {
    if (racePhase !== "judging" || raceResponder === null) {
        return;
    }

    if (voter !== "top" && voter !== "bottom") {
        return;
    }

    if (raceAwardVotes.has(voter)) {
        return;
    }

    raceAwardVotes.add(voter);

    if (raceAwardVotes.size < 2) {
        raceStatus.textContent = "1/2 potwierdzeń przyznania punktu. Czekam na drugą osobę.";
        raceModalText.textContent = "1/2 potwierdzeń. Druga osoba musi kliknąć Przyznaj punkt.";
        raceModalTextMirror.textContent = "1/2 potwierdzeń. Druga osoba musi kliknąć Przyznaj punkt.";
        renderRaceState();
        return;
    }

    finalizeRaceRound(true);
}

function resetRaceMode() {
    clearRaceCountdown();
    raceCurrentLetter = null;
    raceCurrentCategory = null;
    racePhase = "idle";
    raceResponder = null;
    raceCountdownValue = raceCountdownSeconds;
    raceIsDrawing = false;
    raceScores.top = 0;
    raceScores.bottom = 0;
    raceDrawnLetters.length = 0;
    raceDrawnCategories.length = 0;
    raceRounds.length = 0;
    raceSkippedRounds = 0;
    raceAwardVotes.clear();
    raceModalValue.textContent = String(raceCountdownSeconds);
    raceModalValueMirror.textContent = String(raceCountdownSeconds);
    drawBox.classList.remove("is-drawing");
    drawBoxMirror.classList.remove("is-drawing");
    raceStatus.textContent = "Losuj pierwszą rundę.";
    closeRaceModal();
    localStorage.removeItem(raceStorageKey);
    renderRaceState();
}

function shouldIgnoreRaceShortcut(event) {
    const target = event.target;

    if (!target || !(target instanceof Element)) {
        return false;
    }

    return Boolean(target.closest("button") || target.closest("a") || target.closest("input"));
}

function handleRaceShortcuts(event) {
    if (shouldIgnoreRaceShortcut(event)) {
        return;
    }

    const key = event.key.toLowerCase();

    if (event.code === "Space") {
        event.preventDefault();
        drawRaceRound();
        return;
    }

    if (key === "w") {
        event.preventDefault();
        startRaceResponse("top");
        return;
    }

    if (key === "s") {
        event.preventDefault();
        startRaceResponse("bottom");
        return;
    }

    if (key === "p") {
        event.preventDefault();
        registerAwardVote("bottom");
        return;
    }

    if (key === "o") {
        event.preventDefault();
        registerAwardVote("top");
        return;
    }

    if (key === "n") {
        event.preventDefault();
        finalizeRaceRound(false);
        return;
    }

    if (key === "r") {
        event.preventDefault();
        resetRaceMode();
        return;
    }

    if (key === "u") {
        event.preventDefault();
        openRaceSettings();
    }
}

function handleDrawBoxInteraction(player) {
    if (racePhase === "open" && !raceIsDrawing) {
        startRaceResponse(player);
    } else {
        drawRaceRound();
    }
}

drawBox.addEventListener("click", () => handleDrawBoxInteraction("bottom"));
drawBox.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        handleDrawBoxInteraction("bottom");
    }
});
drawBoxMirror.addEventListener("click", () => handleDrawBoxInteraction("top"));
drawBoxMirror.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        handleDrawBoxInteraction("top");
    }
});
resetRaceButton.addEventListener("click", resetRaceMode);
raceBuzzTop.addEventListener("click", () => startRaceResponse("top"));
raceBuzzBottom.addEventListener("click", () => startRaceResponse("bottom"));
awardPointButton.addEventListener("click", () => registerAwardVote("bottom"));
denyPointButton.addEventListener("click", () => finalizeRaceRound(false));
awardPointButtonMirror.addEventListener("click", () => registerAwardVote("top"));
denyPointButtonMirror.addEventListener("click", () => finalizeRaceRound(false));
skipRoundButton.addEventListener("click", () => {
    racePhase = "resolved";
    raceResponder = null;
    raceSkippedRounds += 1;
    raceStatus.textContent = "Nikt nie odpowiedział. Losuj następną rundę.";
    closeRaceModal();
    saveRaceState();
    renderRaceState();
});
openSettingsButton.addEventListener("click", openRaceSettings);
saveSettingsButton.addEventListener("click", saveRaceSettings);
closeSettingsButton.addEventListener("click", closeRaceSettings);
raceSettingsModal.addEventListener("click", (event) => {
    if (event.target === raceSettingsModal) {
        closeRaceSettings();
    }
});
window.addEventListener("keydown", handleRaceShortcuts);

loadRaceState();