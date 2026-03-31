export type BackendUploadResponse = {
  filename: string;
  url: string;
};

const FALLBACK_API_BASE = 'http://localhost:3000';

const INVALID_CONFIG_MESSAGE = 'Configuración inválida: falta VITE_GRAPHQL_URL. Defínela en las variables de entorno.';

export const getApiBaseUrl = () => {
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL?.trim();

  if (graphqlUrl) {
    return graphqlUrl.replace(/\/graphql\/?$/, '');
  }

  if (import.meta.env.DEV) {
    return FALLBACK_API_BASE;
  }

  throw new Error(INVALID_CONFIG_MESSAGE);
};

export const resolveBackendAssetUrl = (pathOrUrl?: string | null) => {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const apiBase = getApiBaseUrl();
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${apiBase}${normalizedPath}`;
};

export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
};

export const uploadFileToBackend = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${getApiBaseUrl()}/api/uploads`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Error al subir el archivo');
  }

  const payload = await response.json() as BackendUploadResponse;

  if (!payload.url) {
    throw new Error('El backend no devolvió la URL del archivo subido');
  }

  return {
    ...payload,
    absoluteUrl: resolveBackendAssetUrl(payload.url),
  };
};
