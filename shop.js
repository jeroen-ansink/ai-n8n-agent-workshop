const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  orange: { name: "Orange", emoji: "🍊" },
};

const MAX_BASKET_ITEMS = 10;
const THEME_STORAGE_KEY = "theme"; // 'light' | 'dark'

function getBasket() {
  const basket = localStorage.getItem("basket");
  return basket ? JSON.parse(basket) : [];
}

function isBasketFull() {
  const basket = getBasket();
  return basket.length >= MAX_BASKET_ITEMS;
}

function notifyBasketFull() {
  alert("Your basket is full. You cannot add more than 10 items.");
}

function updateAddToBasketButtonState() {
  const addButton = document.getElementById("addToBasket");
  if (!addButton) return;
  const full = isBasketFull();
  if (full) {
    if (!addButton.dataset.originalText) {
      addButton.dataset.originalText = addButton.textContent || "";
    }
    addButton.disabled = true;
    addButton.setAttribute("aria-disabled", "true");
    addButton.title = "Basket full";
    addButton.textContent = "Basket full";
  } else {
    addButton.disabled = false;
    addButton.removeAttribute("aria-disabled");
    addButton.title = "";
    if (addButton.dataset.originalText) {
      addButton.textContent = addButton.dataset.originalText;
    }
  }
}

function addToBasket(product) {
  const basket = getBasket();
  if (basket.length >= MAX_BASKET_ITEMS) {
    notifyBasketFull();
    return false;
  }
  basket.push(product);
  localStorage.setItem("basket", JSON.stringify(basket));
  return true;
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  basket.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Theme helpers
function getSavedTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY);
}

function prefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme'); // default light
  }
}

function setTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function injectThemeToggle() {
  // Avoid duplicates
  if (document.getElementById('themeToggle')) return;
  const headerCenter = document.querySelector('.header-center');
  if (!headerCenter) return;
  const btn = document.createElement('button');
  btn.id = 'themeToggle';
  btn.className = 'theme-toggle';
  const isDark = currentTheme() === 'dark';
  btn.setAttribute('aria-pressed', String(isDark));
  btn.title = 'Toggle dark mode';
  btn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  btn.addEventListener('click', function () {
    const nowDark = currentTheme() === 'dark';
    const next = nowDark ? 'light' : 'dark';
    setTheme(next);
    btn.setAttribute('aria-pressed', String(next === 'dark'));
    btn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
  });
  headerCenter.appendChild(btn);
}

function initializeTheme() {
  const saved = getSavedTheme();
  const initial = saved ? saved : (prefersDark() ? 'dark' : 'light');
  applyTheme(initial);
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  initializeTheme();
  injectThemeToggle();
  renderBasketIndicator();
  updateAddToBasketButtonState();
} else {
  document.addEventListener("DOMContentLoaded", function () {
    initializeTheme();
    injectThemeToggle();
    renderBasketIndicator();
    updateAddToBasketButtonState();
  });
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  const added = origAddToBasket(product);
  renderBasketIndicator();
  updateAddToBasketButtonState();
  return added;
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
  updateAddToBasketButtonState();
};
