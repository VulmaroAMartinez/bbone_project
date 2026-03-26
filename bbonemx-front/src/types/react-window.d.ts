declare module 'react-window' {
    import { Component, ComponentType, CSSProperties } from 'react';

    /** Props que recibe cada fila renderizada por List v2 */
    export interface RowComponentProps {
        index: number;
        style: CSSProperties;
        // Más props se inyectan vía rowProps
        [key: string]: unknown;
    }

    /** API pública de List en react-window v2 */
    export interface ListProps {
        /** Componente responsable de renderizar cada fila */
        rowComponent: ComponentType<RowComponentProps>;

        /** Número total de filas */
        rowCount: number;

        /** Alto de cada fila o función que lo calcule por índice */
        rowHeight: number | ((index: number) => number);

        /**
         * Props adicionales que se pasan a cada fila.
         * No deben incluir: ariaAttributes, index, style.
         */
        rowProps?: Record<string, unknown>;

        /** Alto por defecto del contenedor (en px) */
        defaultHeight?: number;

        /** Número de filas extra a renderizar fuera del viewport */
        overscanCount?: number;

        /** Clase CSS opcional del contenedor */
        className?: string;

        /** Estilos inline del contenedor (por ejemplo height/width) */
        style?: CSSProperties;

        /** Callback opcional cuando cambian tamaño/filas visibles */
        onResize?: (size: { height: number }) => void;
        onRowsRendered?: (info: {
            startIndexVisible: number;
            stopIndexVisible: number;
            startIndexOverscan: number;
            stopIndexOverscan: number;
        }) => void;
    }

    export class List extends Component<ListProps> {}

    export class Grid extends Component<unknown> {}

    export function getScrollbarSize(): number;
}
