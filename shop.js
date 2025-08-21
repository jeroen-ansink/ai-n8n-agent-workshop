const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏" },
  banana: { name: "Banana", emoji: "🍌" },
  lemon: { name: "Lemon", emoji: "🍋" },
};

const MAX_BASKET_ITEMS = 10;

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

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
  updateAddToBasketButtonState();
} else {
  document.addEventListener("DOMContentLoaded", function () {
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
