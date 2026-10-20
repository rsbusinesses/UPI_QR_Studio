/* ==========================================================================
   UNIVERSAL AUTOMATED NAVIGATION ROUTER
   File: js/subcategory-guides.js
   Works on ANY page automatically by querying DOM attributes dynamically.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /**
   * Universal function to activate section and highlight matching sidebar link
   * @param {string} targetId - Section ID to activate
   */
  function activateGuideSection(targetId) {
    const sections = Array.from(document.querySelectorAll("[data-guide-section]"));
    const guideLinks = Array.from(document.querySelectorAll(".popular-guide-link"));

    if (sections.length === 0) return;

    let targetFound = false;

    // Reveal matching section and hide all other sections on the page
    sections.forEach(section => {
      const isTarget = section.id === targetId;
      if (isTarget) {
        section.removeAttribute("hidden");
        section.classList.add("is-active");
        targetFound = true;
      } else {
        section.setAttribute("hidden", "true");
        section.classList.remove("is-active");
      }
    });

    // If targetId is not found or empty, default to the first available section on the page
    if (!targetFound && sections.length > 0) {
      const defaultSection = sections[0];
      defaultSection.removeAttribute("hidden");
      defaultSection.classList.add("is-active");
      targetId = defaultSection.id;
    }

    // Highlight active link in sidebar
    guideLinks.forEach(link => {
      const isActive = link.dataset.guideTarget === targetId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // Universal delegated click listener for any link with .popular-guide-link
  document.addEventListener("click", (event) => {
    const link = event.target.closest(".popular-guide-link");
    if (link) {
      event.preventDefault();
      const targetId = link.dataset.guideTarget;
      activateGuideSection(targetId);

      // Update URL hash state
      if (history.pushState) {
        history.pushState(null, null, `#${targetId}`);
      } else {
        window.location.hash = targetId;
      }

      // Smooth scroll on smaller devices
      if (window.matchMedia("(max-width: 960px)").matches) {
        document.getElementById("guideArticle")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }
  });

  // Universal Accordion Toggle Handler (Works for any .popular-guides-header on any page)
  document.addEventListener("click", (event) => {
    const toggleBtn = event.target.closest(".popular-guides-header");
    if (toggleBtn) {
      const guidesListContainer = toggleBtn.nextElementSibling || document.getElementById("popularGuidesList");
      if (guidesListContainer) {
        const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", String(!isExpanded));

        if (isExpanded) {
          guidesListContainer.setAttribute("hidden", "true");
        } else {
          guidesListContainer.removeAttribute("hidden");
        }
      }
    }
  });

  // Handle URL hash changes dynamically across all pages
  function handleHashRoute() {
    const currentHash = window.location.hash.replace("#", "");
    activateGuideSection(currentHash);
  }

  window.addEventListener("hashchange", handleHashRoute);
  
  // Initial activation on page load
  handleHashRoute();
});