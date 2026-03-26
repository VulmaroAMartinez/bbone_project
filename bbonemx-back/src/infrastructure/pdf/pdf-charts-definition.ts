export interface DashboardChartPdfItem {
  title: string;
  /** data:image/png;base64,... o data:image/jpeg;base64,... */
  imageDataUrl: string;
}

export interface DashboardChartsPdfOptions {
  documentTitle?: string;
  subtitle?: string;
  items: DashboardChartPdfItem[];
  /** Ancho máximo (pt) para la última fila si queda una sola gráfica (A4 vertical). */
  imageMaxWidth?: number;
}
