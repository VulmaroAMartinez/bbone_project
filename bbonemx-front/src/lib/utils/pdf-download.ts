export function downloadPdfFromBase64(base64: string | null | undefined, filename: string): void {
  if (!base64) {
    console.warn("No base64 data provided for PDF.");
    return;
  }
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("Error decoding base64 PDF:", error);
  }
}
