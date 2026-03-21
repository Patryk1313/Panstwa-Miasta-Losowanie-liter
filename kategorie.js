const categories = [
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

const defaultCategory = "Państwo-Miasto";
const categoryStorageKey = "panstwa-miasta-category-state";

const categoryBox = document.getElementById("categoryBox");
const categoryInfo = document.getElementById("categoryInfo");
const drawCategoryButton = document.getElementById("drawCategoryButton");
const resetCategoryButton = document.getElementById("resetCategoryButton");
const categoryDrawCount = document.getElementById("categoryDrawCount");
const categoryRemainingCount = document.getElementById("categoryRemainingCount");
const categoryHistoryList = document.getElementById("categoryHistoryList");

let currentCategory = defaultCategory;
let audioContext = null;
let isDrawingCategory = false;
const categoryHistory = [];

function getAudioContext() {
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

function playCategoryDrawStartSound() {
    playTone(340, 0.07, "triangle", 0.03);
}

function playCategoryDrawDoneSound() {
    playTone(560, 0.07, "triangle", 0.03, 0);
    playTone(780, 0.1, "triangle", 0.03, 0.07);
}

function playCategoryRemoveSound() {
    playTone(280, 0.06, "sine", 0.025, 0);
    playTone(220, 0.08, "sine", 0.02, 0.05);
}

function saveCategoryState() {
    const state = {
        currentCategory,
        categoryHistory
    };

    localStorage.setItem(categoryStorageKey, JSON.stringify(state));
}

function loadCategoryState() {
    const savedState = localStorage.getItem(categoryStorageKey);

    if (!savedState) {
        currentCategory = defaultCategory;
        categoryBox.textContent = defaultCategory;
        categoryInfo.textContent = `Domyślna kategoria: ${defaultCategory}.`;
        return;
    }

    try {
        const parsedState = JSON.parse(savedState);
        const savedHistory = Array.isArray(parsedState.categoryHistory) ? parsedState.categoryHistory : [];
        const validHistory = savedHistory.filter((category) => categories.includes(category));

        categoryHistory.push(...validHistory);
        currentCategory = categories.includes(parsedState.currentCategory) ? parsedState.currentCategory : validHistory.at(-1) ?? defaultCategory;
        categoryBox.textContent = currentCategory;

        if (validHistory.length > 0) {
            categoryInfo.textContent = `Wylosowana kategoria: ${currentCategory}.`;
        } else {
            categoryInfo.textContent = `Domyślna kategoria: ${defaultCategory}.`;
        }
    } catch {
        localStorage.removeItem(categoryStorageKey);
        currentCategory = defaultCategory;
        categoryBox.textContent = defaultCategory;
        categoryInfo.textContent = `Domyślna kategoria: ${defaultCategory}.`;
    }
}

function resetCategoryState() {
    if (isDrawingCategory) {
        return;
    }

    currentCategory = defaultCategory;
    categoryHistory.length = 0;
    categoryBox.textContent = defaultCategory;
    categoryInfo.textContent = `Zresetowano. Domyślna kategoria: ${defaultCategory}.`;
    drawCategoryButton.disabled = false;
    saveCategoryState();
    renderStats();
    renderHistory();
    playCategoryRemoveSound();
}

function renderStats() {
    categoryDrawCount.textContent = String(categoryHistory.length);
    categoryRemainingCount.textContent = String(categories.length - categoryHistory.length);
}

function renderHistory() {
    categoryHistoryList.innerHTML = "";

    if (categoryHistory.length === 0) {
        const emptyState = document.createElement("span");
        emptyState.className = "history-empty";
        emptyState.textContent = "Brak historii";
        categoryHistoryList.appendChild(emptyState);
        return;
    }

    categoryHistory.forEach((category, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "history-category";
        button.textContent = category;
        button.dataset.index = String(index);
        categoryHistoryList.appendChild(button);
    });
}

function drawCategory() {
    if (isDrawingCategory) {
        return;
    }

    const availableCategories = categories.filter((category) => !categoryHistory.includes(category));

    if (availableCategories.length === 0) {
        categoryInfo.textContent = "Wylosowano juz wszystkie kategorie. Kliknij kategorie w historii, aby je usuwac.";
        drawCategoryButton.disabled = true;
        return;
    }

    playCategoryDrawStartSound();
    isDrawingCategory = true;
    drawCategoryButton.disabled = true;
    categoryInfo.textContent = "Losowanie kategorii trwa...";
    categoryBox.classList.add("is-drawing");

    let nextCategory = currentCategory;

    while (nextCategory === currentCategory) {
        if (availableCategories.length === 1) {
            nextCategory = availableCategories[0];
            break;
        }

        const randomIndex = Math.floor(Math.random() * availableCategories.length);
        nextCategory = availableCategories[randomIndex];
    }

    let animationStep = 0;
    const animationTicks = 11;
    const animationInterval = window.setInterval(() => {
        const previewIndex = Math.floor(Math.random() * availableCategories.length);
        categoryBox.textContent = availableCategories[previewIndex];
        animationStep += 1;

        if (animationStep >= animationTicks) {
            window.clearInterval(animationInterval);
            finishCategoryDraw(nextCategory);
        }
    }, 70);
}

function finishCategoryDraw(nextCategory) {
    categoryBox.classList.remove("is-drawing");
    isDrawingCategory = false;

    currentCategory = nextCategory;
    categoryHistory.push(nextCategory);
    categoryBox.textContent = currentCategory;
    categoryInfo.textContent = `Wylosowana kategoria: ${currentCategory}.`;
    drawCategoryButton.disabled = categoryHistory.length === categories.length;
    playCategoryDrawDoneSound();
    saveCategoryState();
    renderStats();
    renderHistory();
}

function handleHistoryClick(event) {
    const clickedItem = event.target.closest(".history-category");

    if (!clickedItem) {
        return;
    }

    const index = Number(clickedItem.dataset.index);

    if (Number.isNaN(index)) {
        return;
    }

    categoryHistory.splice(index, 1);
    drawCategoryButton.disabled = false;
    categoryInfo.textContent = "Usunieto kategorie z historii.";
    playCategoryRemoveSound();

    if (categoryHistory.length === 0) {
        currentCategory = defaultCategory;
        categoryBox.textContent = defaultCategory;
    } else {
        currentCategory = categoryHistory.at(-1);
        categoryBox.textContent = currentCategory;
    }

    renderStats();
    renderHistory();
    saveCategoryState();
}

drawCategoryButton.addEventListener("click", drawCategory);
resetCategoryButton.addEventListener("click", resetCategoryState);
categoryBox.addEventListener("click", drawCategory);
categoryHistoryList.addEventListener("click", handleHistoryClick);
loadCategoryState();
renderStats();
renderHistory();