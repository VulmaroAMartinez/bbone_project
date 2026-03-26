export type BackendUploadResponse = {
  filename: string;
  url: string;
};

const FALLBACK_API_BASE = 'http://localhost:3000';

export const getApiBaseUrl = () => (
  import.meta.env.VITE_GRAPHQL_URL?.replace('/graphql', '') ?? FALLBACK_API_BASE
);

export const resolveBackendAssetUrl = (pathOrUrl?: string | null) => {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;

  const apiBase = getApiBaseUrl();
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${apiBase}${normalizedPath}`;
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
