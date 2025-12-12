/// <reference lib="webworker" />

addEventListener('message', async ({ data }) => {
  const { file, maxWidth = 800, maxHeight = 800, quality = 0.8 } = data;

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Create ImageBitmap from ArrayBuffer
    const imageBitmap = await createImageBitmap(new Blob([arrayBuffer], { type: file.type }));

    // Calculate new dimensions
    let width = imageBitmap.width;
    let height = imageBitmap.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Create OffscreenCanvas for compression
    const offscreen = new OffscreenCanvas(width, height);
    const ctx = offscreen.getContext('2d');

    if (!ctx) {
      postMessage({ success: false, error: 'Failed to get canvas context' });
      return;
    }

    // Draw image to canvas
    ctx.drawImage(imageBitmap, 0, 0, width, height);

    // Convert to blob
    const blob = await offscreen.convertToBlob({
      type: 'image/jpeg',
      quality: quality,
    });

    // Convert blob to ArrayBuffer for transfer
    const compressedArrayBuffer = await blob.arrayBuffer();
    postMessage(
      {
        success: true,
        arrayBuffer: compressedArrayBuffer,
        type: 'image/jpeg',
      },
      [compressedArrayBuffer]
    );
  } catch (error: any) {
    postMessage({ success: false, error: error.message || 'Failed to compress image' });
  }
});
