
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    const upiForm = document.getElementById("upiForm");
    const upiIdInput = document.getElementById("upiId");
    const payeeNameInput = document.getElementById("payeeName");
    const amountInput = document.getElementById("amount");
    const noteInput = document.getElementById("note");
    const qrResult = document.getElementById("qrResult");

    if (
        !upiForm ||
        !upiIdInput ||
        !payeeNameInput ||
        !amountInput ||
        !noteInput ||
        !qrResult
    ) {
        console.error(
            "UPI QR Generator: One or more required HTML elements are missing."
        );
        return;
    }

    let currentPaymentString = "";
    let currentUpiId = "";
    let currentPayeeName = "";
    let currentAmount = "";
    let currentNote = "";
    let generationToken = 0;

    // Display a status or error message.
    function showMessage(message, type = "status") {
        qrResult.replaceChildren();

        const messageElement = document.createElement("p");
        messageElement.className =
            type === "error" ? "qr-error" : "qr-status";
        messageElement.textContent = message;

        if (type === "error") {
            messageElement.setAttribute("role", "alert");
        }

        qrResult.appendChild(messageElement);
    }

    // Basic UPI ID format check. This cannot verify account ownership.
    function validateUpiId(upiId) {
        const pattern =
            /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9.-]{2,64}$/;

        return pattern.test(upiId);
    }

    // Validate the optional amount.
    function validateAmount(amount) {
        if (amount === "") {
            return true;
        }

        if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
            return false;
        }

        const numericAmount = Number(amount);

        return Number.isFinite(numericAmount) && numericAmount > 0;
    }

    // Create the UPI payment URI.
    function buildUpiPaymentString(upiId, payeeName, amount, note) {
        const params = new URLSearchParams();

        params.set("pa", upiId);
        params.set("cu", "INR");

        if (payeeName) {
            params.set("pn", payeeName);
        }

        if (amount) {
            params.set("am", amount);
        }

        if (note) {
            params.set("tn", note);
        }

        return "upi://pay?" + params.toString();
    }

    // Wait for QRCode.js to add a canvas or image to the preview.
    function waitForQrImage(container, token) {
        return new Promise(function (resolve, reject) {
            let attempts = 0;
            const maxAttempts = 40;

            function check() {
                if (token !== generationToken) {
                    reject(new Error("QR generation superseded."));
                    return;
                }

                const canvas = container.querySelector("canvas");
                const image = container.querySelector("img");

                if (canvas) {
                    resolve(canvas);
                    return;
                }

                if (image && image.complete && image.naturalWidth > 0) {
                    resolve(image);
                    return;
                }

                attempts += 1;

                if (attempts >= maxAttempts) {
                    reject(new Error("QR image was not created."));
                    return;
                }

                window.setTimeout(check, 50);
            }

            check();
        });
    }

    // Convert the generated QR image to a PNG blob with labels underneath.
    async function createDownloadBlob(qrSource, upiId, payeeName, amount) {
        const qrSize = 320;
        const padding = 28;
        const gap = 16;
        const upiFontSize = 18;
        const secondaryFontSize = 15;
        const lineGap = 8;

        const labels = [];

        // Always show the UPI ID.
        labels.push({
            text: upiId,
            font: "bold " + upiFontSize + "px Arial, sans-serif",
            color: "#102a43",
            height: 28
        });

        if (payeeName) {
            labels.push({
                text: payeeName,
                font: secondaryFontSize + "px Arial, sans-serif",
                color: "#53675a",
                height: 23
            });
        }

        if (amount) {
            labels.push({
                text: "Amount: INR " + amount,
                font: "bold " + secondaryFontSize + "px Arial, sans-serif",
                color: "#16834a",
                height: 23
            });
        }

        const labelHeight = labels.reduce(function (total, label) {
            return total + label.height;
        }, 0);

        const totalLabelGaps = Math.max(0, labels.length - 1) * lineGap;
        const canvas = document.createElement("canvas");

        canvas.width = qrSize + padding * 2;
        canvas.height =
            padding * 2 +
            qrSize +
            gap +
            labelHeight +
            totalLabelGaps;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("Could not create the download image.");
        }

        // White background.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load the QR preview into an image so it can be drawn consistently.
        let qrImage;

        if (qrSource instanceof HTMLCanvasElement) {
            qrImage = new Image();
            qrImage.src = qrSource.toDataURL("image/png");

            await new Promise(function (resolve, reject) {
                qrImage.onload = resolve;
                qrImage.onerror = reject;
            });
        } else if (qrSource instanceof HTMLImageElement) {
            qrImage = qrSource;
        } else {
            throw new Error("The generated QR image is unavailable.");
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(qrImage, padding, padding, qrSize, qrSize);

        // Draw the UPI ID and optional labels below the QR code.
        let y = padding + qrSize + gap;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        labels.forEach(function (label, index) {
            ctx.font = label.font;
            ctx.fillStyle = label.color;

            // Fit unusually long labels within the image width.
            let displayText = label.text;
            const maxTextWidth = canvas.width - padding * 2;

            while (
                displayText.length > 1 &&
                ctx.measureText(displayText).width > maxTextWidth
            ) {
                displayText = displayText.slice(0, -2) + "…";
            }

            ctx.fillText(
                displayText,
                canvas.width / 2,
                y + label.height / 2,
                maxTextWidth
            );

            y += label.height;

            if (index < labels.length - 1) {
                y += lineGap;
            }
        });

        return new Promise(function (resolve, reject) {
            canvas.toBlob(function (blob) {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Could not export the PNG image."));
                }
            }, "image/png");
        });
    }

    // Download the QR code and its accompanying details as one PNG.
    async function downloadQrCode(qrSource, upiId, payeeName, amount) {
        try {
            const blob = await createDownloadBlob(
                qrSource,
                upiId,
                payeeName,
                amount
            );

            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");

            const safeFileName = upiId.replace(/[^a-zA-Z0-9_-]/g, "_");

            link.href = downloadUrl;
            link.download = "upi-qr-" + safeFileName + ".png";

            document.body.appendChild(link);
            link.click();
            link.remove();

            // Delay cleanup to allow the browser to begin the download.
            window.setTimeout(function () {
                URL.revokeObjectURL(downloadUrl);
            }, 1500);
        } catch (error) {
            console.error("QR download failed:", error);

            showMessage(
                "Unable to download the QR code. Please generate it again and try.",
                "error"
            );
        }
    }

    // Generate and display the QR code.
    async function renderQrCode(
        paymentString,
        upiId,
        payeeName,
        amount,
        note,
        token
    ) {
        qrResult.replaceChildren();

        if (typeof window.QRCode === "undefined") {
            showMessage(
                "The QR generation library could not be loaded. Check the library script and try again.",
                "error"
            );
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "generated-qr-wrapper";

        const heading = document.createElement("h3");
        heading.className = "generated-qr-heading";
        heading.textContent = "Your UPI QR Code";

        const imageContainer = document.createElement("div");
        imageContainer.className = "generated-qr-image";

        wrapper.appendChild(heading);
        wrapper.appendChild(imageContainer);
        qrResult.appendChild(wrapper);

        try {
            new window.QRCode(imageContainer, {
                text: paymentString,
                width: 280,
                height: 280,
                colorDark: "#102a43",
                colorLight: "#ffffff",
                correctLevel: window.QRCode.CorrectLevel.H
            });

            const qrSource = await waitForQrImage(imageContainer, token);

            if (token !== generationToken) {
                return;
            }

            // Show the UPI ID directly below the preview QR code.
            const upiLabel = document.createElement("p");
            upiLabel.className = "generated-qr-upi-id";
            upiLabel.textContent = "UPI ID: " + upiId;
            wrapper.appendChild(upiLabel);

            if (payeeName) {
                const payeeLabel = document.createElement("p");
                payeeLabel.className = "generated-qr-payee";
                payeeLabel.textContent = payeeName;
                wrapper.appendChild(payeeLabel);
            }

            if (amount) {
                const amountLabel = document.createElement("p");
                amountLabel.className = "generated-qr-amount";
                amountLabel.textContent = "Amount: INR " + amount;
                wrapper.appendChild(amountLabel);
            }

            // Create the download button.
            const downloadButton = document.createElement("button");
            downloadButton.type = "button";
            downloadButton.className =
                "primary-button full-button qr-download-button";
            downloadButton.textContent = "Download QR Code";

            downloadButton.addEventListener("click", function () {
                downloadQrCode(qrSource, upiId, payeeName, amount);
            });

            qrResult.appendChild(downloadButton);

            const safetyMessage = document.createElement("p");
            safetyMessage.className = "generated-qr-safety";
            safetyMessage.textContent =
                "Verify the recipient details in your UPI app before making a payment.";

            qrResult.appendChild(safetyMessage);

        } catch (error) {
            if (token !== generationToken) {
                return;
            }

            console.error("QR generation failed:", error);

            showMessage(
                "Could not generate the QR code. Please try again.",
                "error"
            );
        }
    }

    // Handle form submission.
    upiForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const upiId = upiIdInput.value.trim();
        const payeeName = payeeNameInput.value.trim();
        const amount = amountInput.value.trim();
        const note = noteInput.value.trim();

        generationToken += 1;
        const token = generationToken;

        if (!upiId) {
            showMessage("Please enter your UPI ID.", "error");
            upiIdInput.focus();
            return;
        }

        if (!validateUpiId(upiId)) {
            showMessage(
                "Enter a UPI ID in a format such as example@bank. This format check does not confirm that the ID exists.",
                "error"
            );
            upiIdInput.focus();
            return;
        }

        if (!validateAmount(amount)) {
            showMessage(
                "Enter a valid amount greater than zero with no more than two decimal places, or leave the amount blank.",
                "error"
            );
            amountInput.focus();
            return;
        }

        if (payeeName.length > 100) {
            showMessage(
                "Please keep the payee name within 100 characters.",
                "error"
            );
            payeeNameInput.focus();
            return;
        }

        if (note.length > 100) {
            showMessage(
                "Please keep the payment note within 100 characters.",
                "error"
            );
            noteInput.focus();
            return;
        }

        currentUpiId = upiId;
        currentPayeeName = payeeName;
        currentAmount = amount;
        currentNote = note;

        currentPaymentString = buildUpiPaymentString(
            currentUpiId,
            currentPayeeName,
            currentAmount,
            currentNote
        );

        renderQrCode(
            currentPaymentString,
            currentUpiId,
            currentPayeeName,
            currentAmount,
            currentNote,
            token
        );
    });
});
