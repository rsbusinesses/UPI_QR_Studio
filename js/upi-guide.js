
/*
=========================================================
Project      : UPI QR Studio
Website      : https://rsbusinesses0.github.io/UPI_QR_Studio/
Created By   : Sumit Kumar Shakya
Developer    : Solo Creator & Developer
Developed For: RS Businesses
GitHub       : https://github.com/sksumitkumarshakya
Contact      : sksumitkumarshakya@gmail.com

Description  : JavaScript functionality for UPI QR Studio,
               including QR generation, user interactions,
               and other client-side website features.

Year         : 2026
=========================================================
*/

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
