const API_PREFIX = '/api';

async function parseResponse(response) {
  if (response.ok) {
    return response;
  }

  let message = 'Não foi possível concluir a operação.';

  try {
    const body = await response.json();
    message = body.error || message;
  } catch {
    message = `${message} (${response.status})`;
  }

  throw new Error(message);
}

export async function listDocuments(owner) {
  const query = owner ? `?owner=${encodeURIComponent(owner)}` : '';
  const response = await fetch(`${API_PREFIX}/documents${query}`);
  const validResponse = await parseResponse(response);
  const body = await validResponse.json();
  return body.documents || [];
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);

  if (owner) {
    formData.append('owner', owner);
  }

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    body: formData,
  });
  const validResponse = await parseResponse(response);
  return validResponse.json();
}

export async function downloadDocument(id) {
  const response = await fetch(`${API_PREFIX}/documents/${encodeURIComponent(id)}/download`);
  const validResponse = await parseResponse(response);
  return validResponse.blob();
}
