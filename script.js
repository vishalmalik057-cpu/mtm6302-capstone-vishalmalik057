const apiKey = "lMzVCQWvoSn9Z9nJR9DzfLmtY0jD9fFrqyrKsuDl";
const baseUrl = "https://api.nasa.gov/planetary/apod";

const dateInput = document.getElementById("apod-date");
const loadBtn = document.getElementById("load-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const favoriteBtn = document.getElementById("favorite-btn");

const apodImage = document.getElementById("apod-image");
const apodTitle = document.getElementById("apod-title");
const apodDateText = document.getElementById("apod-date-text");
const apodDescription = document.getElementById("apod-description");
const learnMoreLink = document.getElementById("learn-more-link");

const favoritesList = document.getElementById("favorites-list");

const imageModal = document.getElementById("image-modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalImage = document.getElementById("modal-image");
const modalCaption = document.getElementById("modal-caption");

let currentApod = null;

function formatDateForInput(date) {
  return date.toISOString().split("T")[0];
}

function getTodayDate() {
  return formatDateForInput(new Date());
}

function changeDateByDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDateForInput(date);
}

function getFavorites() {
  const favorites = localStorage.getItem("apodFavorites");
  return favorites ? JSON.parse(favorites) : [];
}

function saveFavorites(favorites) {
  localStorage.setItem("apodFavorites", JSON.stringify(favorites));
}

function openModal(imageSrc, titleText) {
  modalImage.src = imageSrc;
  modalImage.alt = titleText;
  modalCaption.textContent = titleText;
  imageModal.classList.remove("hidden");
}

function closeModal() {
  imageModal.classList.add("hidden");
}

function updateApodContent(data) {
  currentApod = data;

  apodTitle.textContent = data.title;
  apodDateText.textContent = data.date;
  apodDescription.textContent = data.explanation;
  dateInput.value = data.date;

  if (data.media_type === "image") {
    apodImage.src = data.url;
    apodImage.alt = data.title;
    apodImage.style.display = "block";
    learnMoreLink.href = data.hdurl || data.url;
  } else {
    apodImage.src = "assets/hero.jpg.png";
    apodImage.alt = "Video preview not available";
    apodImage.style.display = "block";
    apodDescription.textContent = `${data.explanation} This APOD is a video. Open Learn More to view it.`;
    learnMoreLink.href = data.url;
  }
}

async function fetchApod(selectedDate) {
  try {
    const url = `${baseUrl}?api_key=${apiKey}&date=${selectedDate}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to fetch APOD data.");
    }

    const data = await response.json();
    updateApodContent(data);
  } catch (error) {
    apodTitle.textContent = "Error";
    apodDateText.textContent = "";
    apodDescription.textContent = "Could not load NASA APOD data. Please try another date.";
  }
}

function addCurrentToFavorites() {
  if (!currentApod || currentApod.media_type !== "image") {
    return;
  }

  const favorites = getFavorites();
  const alreadySaved = favorites.some((item) => item.date === currentApod.date);

  if (!alreadySaved) {
    favorites.push({
      title: currentApod.title,
      date: currentApod.date,
      explanation: currentApod.explanation,
      url: currentApod.url
    });

    saveFavorites(favorites);
    renderFavorites();
  }
}

function removeFavorite(date) {
  const favorites = getFavorites().filter((item) => item.date !== date);
  saveFavorites(favorites);
  renderFavorites();
}

function createFavoriteCard(item) {
  const card = document.createElement("article");
  card.classList.add("favorite-card");

  const image = document.createElement("img");
  image.src = item.url;
  image.alt = item.title;
  image.addEventListener("click", () => {
    openModal(item.url, item.title);
  });

  const title = document.createElement("h3");
  title.textContent = item.title;

  const date = document.createElement("p");
  date.textContent = item.date;

  const viewButton = document.createElement("button");
  viewButton.textContent = "Load This Image";
  viewButton.classList.add("secondary");
  viewButton.addEventListener("click", () => {
    fetchApod(item.date);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    removeFavorite(item.date);
  });

  card.appendChild(image);
  card.appendChild(title);
  card.appendChild(date);
  card.appendChild(viewButton);
  card.appendChild(removeButton);

  return card;
}

function renderFavorites() {
  const favorites = getFavorites();
  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p>No favorite images saved yet.</p>";
    return;
  }

  favorites.forEach((item) => {
    const card = createFavoriteCard(item);
    favoritesList.appendChild(card);
  });
}

function handleLoadClick() {
  const selectedDate = dateInput.value || getTodayDate();
  fetchApod(selectedDate);
}

function handlePrevClick() {
  const selectedDate = dateInput.value || getTodayDate();
  const previousDate = changeDateByDays(selectedDate, -1);
  fetchApod(previousDate);
}

function handleNextClick() {
  const selectedDate = dateInput.value || getTodayDate();
  const nextDate = changeDateByDays(selectedDate, 1);
  const today = getTodayDate();

  if (nextDate <= today) {
    fetchApod(nextDate);
  }
}

function setInitialDateLimits() {
  const today = getTodayDate();
  dateInput.max = today;
  dateInput.value = today;
}

loadBtn.addEventListener("click", handleLoadClick);
prevBtn.addEventListener("click", handlePrevClick);
nextBtn.addEventListener("click", handleNextClick);
favoriteBtn.addEventListener("click", addCurrentToFavorites);

apodImage.addEventListener("click", () => {
  if (currentApod && currentApod.media_type === "image") {
    openModal(currentApod.url, currentApod.title);
  }
});

modalOverlay.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);

window.addEventListener("DOMContentLoaded", () => {
  setInitialDateLimits();
  fetchApod(getTodayDate());
  renderFavorites();
});