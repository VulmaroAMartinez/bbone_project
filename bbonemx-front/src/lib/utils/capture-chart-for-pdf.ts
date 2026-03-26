import { toJpeg } from 'html-to-image';

/**
 * Captura un nodo DOM (p. ej. contenedor de Recharts) como JPEG en data URL.
 * JPEG reduce tamaño vs PNG y alivia el payload hacia el backend.
 */
export async function captureElementToJpegDataUrl(
  element: HTMLElement,
  options?: { quality?: number; pixelRatio?: number },
): Promise<string> {
  return toJpeg(element, {
    quality: options?.quality ?? 0.9,
    pixelRatio: options?.pixelRatio ?? 2,
    cacheBust: true,
    backgroundColor: '#ffffff',
    /**
     * Evita leer `cssRules` de hojas de estilo remotas (p. ej. Google Fonts),
     * que en cross-origin lanzan SecurityError y dejan la captura colgada.
     */
    skipFonts: true,
  });
}
