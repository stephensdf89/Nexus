export default async function enhanceImage(base64Image) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original
      ctx.drawImage(img, 0, 0);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Basic AI-style enhancement
      for (let i = 0; i < data.length; i += 4) {
        // Brightness
        data[i] = Math.min(255, data[i] * 1.08); // R
        data[i + 1] = Math.min(255, data[i + 1] * 1.08); // G
        data[i + 2] = Math.min(255, data[i + 2] * 1.08); // B

        // Contrast
        const contrast = 1.12;
        data[i] = ((data[i] - 128) * contrast) + 128;
        data[i + 1] = ((data[i + 1] - 128) * contrast) + 128;
        data[i + 2] = ((data[i + 2] - 128) * contrast) + 128;
      }

      ctx.putImageData(imageData, 0, 0);

      // Slight sharpening
      ctx.filter = "contrast(1.05) brightness(1.05)";
      ctx.drawImage(canvas, 0, 0);

      resolve(canvas.toDataURL("image/jpeg"));
    };
  });
}
