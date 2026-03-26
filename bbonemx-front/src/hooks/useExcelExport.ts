import { useLazyQuery } from '@apollo/client/react';
import type { DocumentNode, TypedDocumentNode, OperationVariables } from '@apollo/client';
import { useEffect } from 'react';
import { downloadExcelFromBase64 } from '@/lib/utils/excel-download';
import { toast } from 'sonner';

interface UseExcelExportOptions<TData> {
  filename: string;
  extractBase64: (data: TData) => string;
}

export function useExcelExport<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options: UseExcelExportOptions<TData>,
) {
  const [executeQuery, { loading, data, error }] = useLazyQuery<TData, TVariables>(document, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (!data) return;
    try {
      const base64 = options.extractBase64(data);
      downloadExcelFromBase64(base64, options.filename);
      toast.success('Excel descargado correctamente');
    } catch {
      toast.error('Error al procesar el archivo Excel');
    }
  }, [data, options.extractBase64, options.filename]);

  useEffect(() => {
    if (!error) return;
    // `error` tipa a `ApolloError`
    toast.error(`Error al exportar: ${error.message}`);
  }, [error]);

  return { exportExcel: executeQuery, loading };
}
