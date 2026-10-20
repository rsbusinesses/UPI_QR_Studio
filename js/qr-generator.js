
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

(() => {
  "use strict";

  const widget = document.getElementById("upi-qr-widget");

  // Initialize only once and only on pages containing this widget.
  if (!widget || widget.dataset.qrInitialized === "true") {
    return;
  }

  widget.dataset.qrInitialized = "true";

  const form = widget.querySelector(".qr-widget-form");
  const usernameInput = widget.querySelector(".qr-widget-username");
  const providerInput = widget.querySelector(".qr-widget-provider");
  const errorElement = widget.querySelector(".qr-widget-error");
  const qrContainer = widget.querySelector(".qr-widget-qr-code");
  const placeholder = widget.querySelector(".qr-widget-placeholder");
  const generatedIdElement = widget.querySelector(
    ".qr-widget-generated-id"
  );
  const downloadButton = widget.querySelector(".qr-widget-download");
  const statusElement = widget.querySelector(".qr-widget-status");

  let currentUpiId = "";

  function showError(message) {
    errorElement.textContent = message;
    errorElement.hidden = false;
  }

  function clearError() {
    errorElement.textContent = "";
    errorElement.hidden = true;
  }

  function isValidPart(value) {
    return /^[a-zA-Z0-9._-]+$/.test(value);
  }

  // Keep validation messages within the QR widget.
  usernameInput.addEventListener("input", clearError);
  providerInput.addEventListener("input", clearError);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();

    if (typeof QRCode === "undefined") {
      showError(
        "The QR library could not load. Check your internet connection and refresh the page."
      );
      return;
    }

    // Both parts are entered manually.
    const username = usernameInput.value.trim().replace(/^@+/, "");
    const provider = providerInput.value.trim().replace(/^@+/, "");

    if (!username) {
      showError("Please enter your UPI username.");
      usernameInput.focus();
      return;
    }

    if (!provider) {
      showError("Please enter your UPI provider.");
      providerInput.focus();
      return;
    }

    if (!isValidPart(username)) {
      showError(
        "The username can contain letters, numbers, dots, underscores and hyphens only."
      );
      usernameInput.focus();
      return;
    }

    if (!isValidPart(provider)) {
      showError(
        "Enter a valid provider handle without spaces or extra @ symbols."
      );
      providerInput.focus();
      return;
    }

    const upiId = `${username}@${provider}`.toLowerCase();

    // Encode a basic UPI payment URI with the recipient's UPI ID.
    const paymentUri = `upi://pay?pa=${encodeURIComponent(upiId)}`;

    // Clear only the previous QR inside this widget.
    qrContainer.replaceChildren();

    try {
      new QRCode(qrContainer, {
        text: paymentUri,
        width: 400,
        height: 400,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    } catch (error) {
      showError("Unable to generate the QR code. Please try again.");
      return;
    }

    currentUpiId = upiId;

    generatedIdElement.textContent = currentUpiId;

    qrContainer.style.display = "grid";
    placeholder.style.display = "none";

    downloadButton.disabled = false;

    statusElement.textContent =
      "QR code generated. Verify the recipient details in your UPI app before making a payment.";
  });

  // Export QR code + UPI ID together in one PNG image.
  downloadButton.addEventListener("click", () => {
    if (!currentUpiId) {
      return;
    }

    const qrCanvas = qrContainer.querySelector("canvas");

    if (!qrCanvas) {
      showError(
        "The QR image is not ready. Please generate the QR code again."
      );
      return;
    }

    const outputCanvas = document.createElement("canvas");
    const context = outputCanvas.getContext("2d");

    if (!context) {
      showError("Unable to prepare the download image.");
      return;
    }

    const width = 640;
    const qrSize = 560;
    const top = 24;
    const bottomSpace = 104;

    outputCanvas.width = width;
    outputCanvas.height = top + qrSize + bottomSpace;

    // White background for printing and sharing.
    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      outputCanvas.width,
      outputCanvas.height
    );

    // Draw the QR code at high resolution.
    context.imageSmoothingEnabled = false;

    context.drawImage(
      qrCanvas,
      (width - qrSize) / 2,
      top,
      qrSize,
      qrSize
    );

    // Add a small label below the QR.
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#61718e";
    context.font = "20px Arial, sans-serif";

    context.fillText(
      "UPI ID",
      width / 2,
      top + qrSize + 28
    );

    // Fit long UPI IDs within the image.
    let fontSize = 28;

    context.font = `bold ${fontSize}px Arial, sans-serif`;

    while (
      context.measureText(currentUpiId).width > width - 40 &&
      fontSize > 15
    ) {
      fontSize -= 1;
      context.font = `bold ${fontSize}px Arial, sans-serif`;
    }

    context.fillStyle = "#145c43";

    context.fillText(
      currentUpiId,
      width / 2,
      top + qrSize + 68
    );

    // Create a downloadable image without changing the page.
    const link = document.createElement("a");

    link.href = outputCanvas.toDataURL("image/png");
    link.download =
      `upi-qr-${currentUpiId.replace(/[^a-z0-9._-]/gi, "_")}.png`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  });
})();
