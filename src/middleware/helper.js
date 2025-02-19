const path = require("path");
const qrcode = require("qrcode");
const sharp = require("sharp");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const PDFDocument = require("pdfkit");

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created: ${dirPath}`);
    }
}

// Generate QR code with logo
async function generateQRCodeWithImage(imagePath, qrUrl) {
    try {
        const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png");
        const qrCodeBuffer = await generateQRCode(qrUrl);
        const { width } = await sharp(qrCodeBuffer).metadata();
        const logoSize = Math.floor(width / 4);
        const logoBuffer = await processLogo(logoPath, logoSize);
        await overlayLogoOnQRCode(qrCodeBuffer, logoBuffer, imagePath, width);
        console.log("QR Code with logo saved at:", imagePath);
    } catch (error) {
        console.error("Error generating QR code:", error);
    }
}

async function generateQRCode(qrUrl) {
    return qrcode.toBuffer(qrUrl, { errorCorrectionLevel: "H", scale: 10, margin: 1 });
}

async function processLogo(logoPath, logoSize) {
    const logoImage = await sharp(logoPath).resize(logoSize, logoSize).toBuffer();
    const circleMask = Buffer.from(`<svg width="${logoSize}" height="${logoSize}"><circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white"/></svg>`);
    return sharp(logoImage).composite([{ input: circleMask, blend: "dest-in" }]).sharpen(2).toBuffer();
}

async function overlayLogoOnQRCode(qrCodeBuffer, logoBuffer, imagePath, qrSize) {
    await sharp(qrCodeBuffer).resize(qrSize, qrSize).composite([{ input: logoBuffer, gravity: "center", blend: "over" }]).toFile(imagePath);
}

async function generateBadge(badgeObj) {
    try {
        const [baseImage, userPhoto, qrCode] = await Promise.all([
            loadImage(badgeObj.baseImagePath),
            loadImage(badgeObj.response.logo_image),
            loadImage(badgeObj.qrCodePath)
        ]);

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(baseImage, 0, 0);
        ctx.drawImage(userPhoto, 3011, 406, 1313, 842);
        ctx.drawImage(qrCode, 1739, 3925, 959, 959);
        drawVerticalText(ctx,badgeObj.response.qr_unique_code,2753, 4630)

        const outputFilePath = await saveBadgeImage(canvas, badgeObj.destFolderImg, badgeObj.response.qr_unique_code);
        await generateBadgePDF(outputFilePath, badgeObj.response, badgeObj.destFolderPdf);
    } catch (error) {
        console.error("Error generating badge:", error);
    }
}

function drawVerticalText(ctx, text, x, y) {
    // Save the current context
    ctx.save();
    
    ctx.font = "bold 64px Arial";
    ctx.fillStyle = "black";
    // Rotate the canvas context 90 degrees counterclockwise to make the text vertical
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2);  // Rotate by 90 degrees counterclockwise

    // Draw the text
    ctx.fillText(text, 0, 0);

    // Restore the context to its original state
    ctx.restore();
}

function drawUserPhoto(ctx, userPhoto) {
    const photoX = 1450, photoY = 90, photoSize = 800;
    ctx.save();
    ctx.beginPath();
    ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
    ctx.clip();
    ctx.drawImage(userPhoto, photoX, photoY, photoSize, photoSize);
    ctx.restore();
    ctx.strokeStyle = "green";
    ctx.lineWidth = 4;
    ctx.stroke();
}

async function saveBadgeImage(canvas, destFolder, couponCode) {
    const outputFilePath = path.join(destFolder, `${couponCode}.png`);
    await fs.promises.writeFile(outputFilePath, canvas.toBuffer("image/png"));
    console.log(`Badge saved as PNG at: ${outputFilePath}`);
    return outputFilePath;
}

async function generateBadgePDF(imagePath, response, destFolder) {
    const pdfFilePath = path.join(destFolder, `${response.qr_unique_code}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfFilePath));
    doc.image(imagePath, { fit: [650, 650], align: "center", valign: "center" });
    doc.end();
    console.log(`Badge saved as PDF at: ${pdfFilePath}`);
}

module.exports = { generateQRCodeWithImage, generateBadge, ensureDirectoryExists};

