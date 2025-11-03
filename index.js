let categories = [
  "African",
  "Hot Dog",
  "Kebab",
  "Poke",
  "Mexican",
  "Sandwich",
  "Soup",
  "Asian",
  "Burger",
  "Pasta",
  "Grill/BBQ",
  "Sushi",
  "Indian",
  "Seafood",
  "Salad",
  "Pizza",
  "Greek",
];

const endMessages = [
  "Looks like we've run out of tasty options!",
  "Looks like we're fresh out of choices, better luck next bite!",
  "No more dishes to pick, your taste buds are on their own now...",
  "Nothing left here… time to cook up your own adventure!",
  "All categories tried, your perfect meal is still out there!",
];

const MAX_DRAG_X = 200;
const MAX_DRAG_Y = 0;

// Dynamic images
function filenameFromCategory(cat) {
  return cat
    .toLowerCase()
    .trim()
    .replace(/[\/\\]+/g, "")
    .replace(/[^a-z0-9\-]/g, "");
}

const imageCache = [];
categories.forEach((cat) => {
  const img = new Image();
  img.src = `./assets/images/categories/${filenameFromCategory(cat)}.webp`;
  img.fetchPriority = "high";
  imageCache.push(img);
});

function setBackground(el, src) {
  el.classList.remove("fade");
  void el.offsetWidth;
  el.style.backgroundImage = `url("${src}")`;
  el.classList.add("fade");
}

// Dynamic year
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  const category = document.getElementById("category");
  let i = 0;

  category.innerHTML = categories[i];
  setBackground(category, imageCache[i].src);

  let isDragging = false;
  let startX, startY;
  let tutorialDisabled = false;

  // Drag category card functions
  category.addEventListener("pointerdown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    category.style.transition = "none";
    category.style.animation = "";
    category.setPointerCapture(e.pointerId);
  });

  const yesLabel = document.getElementById("yes-label");
  const noLabel = document.getElementById("no-label");

  // Labels Yes/No logic
  category.addEventListener("pointermove", (e) => {
    if (!isDragging) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    dx = Math.max(Math.min(dx, MAX_DRAG_X), -MAX_DRAG_X);
    dy = Math.max(Math.min(dy, MAX_DRAG_Y), -MAX_DRAG_Y);

    category.style.transform = `translate(${dx}px, ${dy}px) rotate(${
      dx / 20
    }deg)`;

    const opacity = Math.min(Math.abs(dx) / MAX_DRAG_X, 1);

    if (dx > 0) {
      document.documentElement.style.backgroundColor = `rgba(0, 133, 0, ${opacity})`;
      yesLabel.style.opacity = opacity;
      noLabel.style.opacity = 0;
    } else if (dx < 0) {
      document.documentElement.style.backgroundColor = `rgba(130, 0, 0, ${opacity})`;
      noLabel.style.opacity = opacity;
      yesLabel.style.opacity = 0;
    } else {
      document.documentElement.style.backgroundColor = "";
      yesLabel.style.opacity = 0;
      noLabel.style.opacity = 0;
    }
  });

  category.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    category.style.transition = "transform 0.3s ease";

    document.documentElement.style.backgroundColor = "";
    yesLabel.style.opacity = 0;
    noLabel.style.opacity = 0;

    const dx = e.clientX - startX;

    if (dx > 150) handleYes();
    else if (dx < -150) handleNo();
    else category.style.transform = "translate(0, 0) rotate(0)";

    category.classList.remove("swipe-yes", "swipe-no");
  });

  // Yes/No Logic
  function handleYes() {
    if (categories.length === 0) return;
    i = (i + 1) % categories.length;

    if (categories.length === 1) {
      tutorialDisabled = true;
      category.innerHTML = `<span class="winner-text">${categories[0]}</span> <span class="bon-appetit-text">Bon Appétit! 🍽️</span>`;
      setBackground(category, imageCache[0].src);
      category.style.animation = "";
      category.style.border = "5px solid gold";
      category.style.boxShadow = "0 0 25px gold";
      category.classList.add("winner-shake");
      category.style.transform = "translate(0,0) rotate(0)";
      category.style.pointerEvents = "none";
      return;
    }

    updateCategory();

    category.style.transform = "translate(0,0) rotate(0)";
  }

  function handleNo() {
    if (categories.length === 0) return;
    categories.splice(i, 1);
    imageCache.splice(i, 1);

    if (categories.length === 0) {
      tutorialDisabled = true;
      category.innerHTML =
        endMessages[Math.floor(Math.random() * endMessages.length)];
      category.style.backgroundImage = "";
      category.style.transform = "translate(0,0) rotate(0)";
      category.style.pointerEvents = "none";
      category.style.border = "none";
      category.style.boxShadow = "none";
      return;
    }

    if (i >= categories.length) i = 0;
    updateCategory();

    category.style.transform = "translate(0,0) rotate(0)";
  }

  function updateCategory() {
    category.innerHTML = categories[i];
    setBackground(category, imageCache[i].src);
    onCategoryChange();
  }

  // tutorial popup
  const tutorial = document.getElementById("tutorial-popup");
  let inactivityTimer;
  let firstDrag = false;

  function showTutorial(delay) {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      if (!isDragging && !tutorialDisabled) {
        tutorial.classList.add("show");
        category.style.animation = "diagonalShake 2s alternate";
      }
    }, delay);
  }

  function hideTutorial() {
    tutorial.classList.remove("show");
    category.classList.remove("shake");
  }

  function resetInactivityTimer() {
    hideTutorial();
    clearTimeout(inactivityTimer);
    showTutorial(firstDrag ? 5000 : 1500);
  }

  showTutorial(1500);

  category.addEventListener("pointerdown", () => {
    isDragging = true;
    hideTutorial();
    clearTimeout(inactivityTimer);
  });

  category.addEventListener("pointerup", () => {
    isDragging = false;
    resetInactivityTimer();
  });

  function onCategoryChange() {
    if (i >= 0) firstDrag = true;
    resetInactivityTimer();
  }
});
