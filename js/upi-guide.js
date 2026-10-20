
document.addEventListener("DOMContentLoaded", function () {
    const accordion = document.getElementById("upiTopicAccordion");

    if (!accordion) return;

    const toggles = accordion.querySelectorAll(".upi-topic-toggle");

    toggles.forEach(function (toggle) {
        toggle.addEventListener("click", function () {
            const isOpen = toggle.getAttribute("aria-expanded") === "true";
            const panelId = toggle.getAttribute("aria-controls");
            const panel = document.getElementById(panelId);

            // Close every category first.
            toggles.forEach(function (otherToggle) {
                const otherPanel = document.getElementById(
                    otherToggle.getAttribute("aria-controls")
                );

                otherToggle.setAttribute("aria-expanded", "false");

                if (otherPanel) {
                    otherPanel.hidden = true;
                }
            });

            // Open the clicked category if it was previously closed.
            if (!isOpen && panel) {
                toggle.setAttribute("aria-expanded", "true");
                panel.hidden = false;
            }
        });
    });
});
