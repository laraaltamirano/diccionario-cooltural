const phraseCards = [...document.querySelectorAll(".phrase-card")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const expandButtons = [...document.querySelectorAll(".expand-button")];
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#phrase-search");
const emptyMessage = document.querySelector(".empty-message");

let selectedCategory = "all";

function normalizeText(text) {
  return text
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "");
}

function updateCompanionPositions() {
  const columns = window.matchMedia("(max-width: 640px)").matches
    ? 1
    : window.matchMedia("(max-width: 900px)").matches
      ? 2
      : 3;
  const visibleCards = phraseCards.filter((card) => !card.hidden);

  visibleCards.forEach((card, index) => {
    const companion = card.querySelector(".card-companion");
    if (!companion) return;

    const column = index % columns;
    companion.classList.remove(
      "card-companion--edge-left",
      "card-companion--edge-right",
      "card-companion--layout-hidden"
    );

    if (columns === 1 || (columns === 3 && column === 1)) {
      companion.classList.add("card-companion--layout-hidden");
    } else if (column === 0) {
      companion.classList.add("card-companion--edge-left");
    } else {
      companion.classList.add("card-companion--edge-right");
    }
  });
}

function updateResults() {
  const searchTerm = normalizeText(searchInput.value.trim());
  let visibleCards = 0;

  phraseCards.forEach((card) => {
    const matchesCategory =
      selectedCategory === "all" || card.dataset.category === selectedCategory;
    const matchesSearch = normalizeText(card.textContent).includes(searchTerm);
    const shouldShow = matchesCategory && matchesSearch;

    card.hidden = !shouldShow;
    if (shouldShow) visibleCards += 1;
  });

  emptyMessage.hidden = visibleCards !== 0;
  updateCompanionPositions();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;

    filterButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle("is-active", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });

    updateResults();
  });
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateResults();
});

searchInput.addEventListener("input", updateResults);
window.addEventListener("resize", updateCompanionPositions);

function openDetails(details) {
  details.getAnimations().forEach((animation) => animation.cancel());
  details.hidden = false;
  details.animate(
    [
      { opacity: 0, transform: "translateY(-12px) scaleY(0.96)" },
      { opacity: 1, transform: "translateY(0) scaleY(1)" }
    ],
    {
      duration: 260,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      fill: "both"
    }
  );
}

function closeDetails(details) {
  details.getAnimations().forEach((animation) => animation.cancel());
  const animation = details.animate(
    [
      { opacity: 1, transform: "translateY(0) scaleY(1)" },
      { opacity: 0, transform: "translateY(-12px) scaleY(0.96)" }
    ],
    {
      duration: 200,
      easing: "ease-in",
      fill: "both"
    }
  );

  animation.finished
    .then(() => {
      details.hidden = true;
      animation.cancel();
    })
    .catch(() => {});
}

expandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const details = document.getElementById(button.getAttribute("aria-controls"));
    const willOpen = button.getAttribute("aria-expanded") === "false";

    button.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      openDetails(details);
    } else {
      closeDetails(details);
    }
    button.textContent = willOpen ? "Cerrar" : "Ver significado";
  });
});

updateResults();
