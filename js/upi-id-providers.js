
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector("#upi-providers-page");

  if (!page) return;

  const searchInput = page.querySelector("#provider-search");
  const filterButtons = page.querySelectorAll(".filter-button");
  const providerCards = page.querySelectorAll(".provider-card");
  const providerCount = page.querySelector("#provider-count");
  const noResults = page.querySelector("#no-results");
  const resetButton = page.querySelector("#reset-search");

  let activeFilter = "all";

  function updateProviders() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    providerCards.forEach((card) => {
      const category = card.dataset.category || "";
      const searchableText = (
        card.dataset.search + " " + card.textContent
      ).toLowerCase();

      const matchesSearch = searchableText.includes(searchTerm);
      const matchesFilter =
        activeFilter === "all" || category === activeFilter;

      const isVisible = matchesSearch && matchesFilter;

      card.hidden = !isVisible;

      if (isVisible) visibleCount++;
    });

    providerCount.textContent =
      `${visibleCount} ${visibleCount === 1 ? "provider" : "providers"}`;

    noResults.hidden = visibleCount !== 0;
  }

  searchInput.addEventListener("input", updateProviders);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;

        filterButton.classList.toggle("active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      updateProviders();
    });
  });

  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    activeFilter = "all";

    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === "all";

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    updateProviders();
    searchInput.focus();
  });

  updateProviders();
});
