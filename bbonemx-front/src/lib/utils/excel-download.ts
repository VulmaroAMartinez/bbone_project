export function downloadExcelFromBase64(base64: string, filename: string): void {
  const byteCharacters = atob(base64);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadExcelBlob(blob, filename);
}

export function downloadExcelBlob(blob: Blob, filename: string): void {
  downloadBlob(blob, filename);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function parseFilenameFromContentDisposition(
  header: string | null,
): string | null {
  if (!header) return null;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ''));
  }

  const match = header.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

export async function postExcelExport(
  endpoint: string,
  body: Record<string, unknown>,
  fallbackFilename: string,
): Promise<void> {
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const filename =
    parseFilenameFromContentDisposition(
      response.headers.get('Content-Disposition'),
    ) ?? fallbackFilename;

  downloadBlob(blob, filename);
}
