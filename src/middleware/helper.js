const path = require("path");
const qrcode = require("qrcode");
const sharp = require("sharp");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const PDFDocument = require("pdfkit");


async function generateQRCodeWithImage(imagePath, qrUrl) {
  try {
    const logoPath = path.join(__dirname, "../uploads/delegate_qr", "Logo.png");

    // Generate QR code buffer
    const qrCodeBuffer = await generateQRCode(qrUrl);

    // Get QR code metadata
    const { width } = await sharp(qrCodeBuffer).metadata();
    const logoSize = Math.floor(width / 4); // Logo is 1/4 of QR code size

    // Process logo with circular mask
    const logoBuffer = await processLogo(logoPath, logoSize);

    // Overlay logo on QR code and save final image
    await overlayLogoOnQRCode(qrCodeBuffer, logoBuffer, imagePath, width);

    console.log("QR Code with logo saved at:", imagePath);
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
}

// Generate QR code with high error correction level
async function generateQRCode(qrUrl) {
  return qrcode.toBuffer(qrUrl, {
    errorCorrectionLevel: "H",
    scale: 10,
    margin: 1,
  });
}

// Process logo: resize, apply circular mask, and sharpen
async function processLogo(logoPath, logoSize) {
  const logoImage = await sharp(logoPath).resize(logoSize, logoSize).toBuffer();

  const circleMask = Buffer.from(
    `<svg width="${logoSize}" height="${logoSize}">
        <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="white"/>
     </svg>`
  );

  return sharp(logoImage)
    .composite([{ input: circleMask, blend: "dest-in" }])
    .sharpen(2)
    .toBuffer();
}

// Overlay logo onto QR code and save to file
async function overlayLogoOnQRCode(qrCodeBuffer, logoBuffer, imagePath, qrSize) {
  await sharp(qrCodeBuffer)
    .resize(qrSize, qrSize)
    .composite([{ input: logoBuffer, gravity: "center", blend: "over" }])
    .toFile(imagePath);
}

async function generateBadge(personData, response, baseImagePath, userPhotoPath, qrCodePath, destFolder) {
  try {
    const baseImage = await loadImage(baseImagePath);
    const userPhoto = await loadImage(userPhotoPath);
    const qrCode = await loadImage(qrCodePath);

    if (personData.Check_email !== 1) return;

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    drawBaseImage(ctx, baseImage);
    drawUserPhoto(ctx, userPhoto);
    drawUserDetails(ctx, personData, response);
    drawQRCode(ctx, qrCode);

    const outputFilePath = await saveBadgeImage(canvas, destFolder, response[0].coupon_code);
    await generateBadgePDF(outputFilePath, response, destFolder);

  } catch (error) {
    console.error("Error generating badge:", error);
  }
}

// Draw the base image
function drawBaseImage(ctx, baseImage) {
  ctx.drawImage(baseImage, 0, 0);
}

// Draw the circular user photo with a border
function drawUserPhoto(ctx, userPhoto) {
  const photoX = 1450, photoY = 90, photoSize = 800, borderWidth = 4;

  ctx.save();
  ctx.beginPath();
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(userPhoto, photoX, photoY, photoSize, photoSize);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2 + borderWidth / 2, 0, 2 * Math.PI);
  ctx.strokeStyle = "green";
  ctx.lineWidth = borderWidth;
  ctx.stroke();
}

// Draw user details on the badge
function drawUserDetails(ctx, personData, response) {
  ctx.font = "bold 65px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(personData.username, 200, 250);

  const details = [
    { label: "Country:", value: personData.country, y: 350 },
    { label: "Mobile:", value: response[0].mobile_number || "N/A", y: 420 },
    { label: "E-mail:", value: personData.email, y: 500 },
    { label: "ID No:", value: personData.idNo, y: 580 }
  ];

  ctx.font = "bold 55px Arial";
  details.forEach(detail => {
    ctx.fillStyle = "#17598e";
    ctx.fillText(detail.label, 200, detail.y);
    ctx.fillStyle = "black";
    ctx.fillText(detail.value, 440, detail.y);
  });
}

// Draw the QR code on the badge
function drawQRCode(ctx, qrCode) {
  const qrCodeX = 1250, qrCodeY = 1850, qrCodeSize = 400;
  ctx.drawImage(qrCode, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
}

// Save the badge as an image file
async function saveBadgeImage(canvas, destFolder, couponCode) {
  return new Promise((resolve, reject) => {
    const outputFilePath = path.join(destFolder, `${couponCode}.png`);
    const out = fs.createWriteStream(outputFilePath);
    const stream = canvas.createPNGStream();
    
    stream.pipe(out);
    out.on("finish", () => {
      console.log(`Badge saved as PNG at: ${outputFilePath}`);
      resolve(outputFilePath);
    });
    out.on("error", reject);
  });
}

// Generate a PDF version of the badge
async function generateBadgePDF(imagePath, response, destFolder) {
  return new Promise((resolve, reject) => {
    const pdfFilePath = path.join(destFolder, `${response[0].coupon_code}.pdf`);
    const doc = new PDFDocument();
    const margin = 0;

    doc.pipe(fs.createWriteStream(pdfFilePath));
    doc.image(imagePath, {
      fit: [650 - margin * 2, 650 - margin * 2],
      align: "center",
      valign: "center",
      x: margin,
      y: margin
    });

    doc.fillColor("black").font("Helvetica-Bold").fontSize(8)
      .text("To Register as a Delegate, Click the below link", 240, 625, {
        link: response[0].qr_code,
        underline: true
      });

    doc.fillColor("blue").font("Helvetica-Bold").fontSize(10)
      .text(response[0].qr_code, 120, 638, {
        link: response[0].qr_code,
        underline: true
      });

    doc.end();

    doc.on("finish", () => {
      console.log(`Badge saved as PDF at: ${pdfFilePath}`);
      resolve(pdfFilePath);
    });
    doc.on("error", reject);
  });
}

module.exports = { generateQRCodeWithImage, generateBadge };
