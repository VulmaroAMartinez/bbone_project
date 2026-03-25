export interface DashboardChartPdfItem {
  title: string;
  /** data:image/png;base64,... o data:image/jpeg;base64,... */
  imageDataUrl: string;
}

export interface DashboardChartsPdfOptions {
  documentTitle?: string;
  subtitle?: string;
  items: DashboardChartPdfItem[];
  /** Ancho de imagen en puntos PDF (landscape A4 útil ~720). */
  imageMaxWidth?: number;
}
