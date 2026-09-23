import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ onUploaded }) {
  const inputRef = useRef(null);
  const [owner, setOwner] = useState('anonymous');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError('Selecione um documento antes de enviar.');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const document = await uploadDocument(selectedFile, owner.trim() || 'anonymous');
      setSelectedFile(null);
      inputRef.current.value = '';
      onUploaded(document);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-panel" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Novo arquivo</p>
          <h2>Adicionar documento</h2>
        </div>
        <span className="upload-mark" aria-hidden="true">+</span>
      </div>

      <label htmlFor="owner">Responsável</label>
      <input
        id="owner"
        name="owner"
        value={owner}
        onChange={(event) => setOwner(event.target.value)}
        placeholder="Identificador do usuário"
      />

      <label htmlFor="document-file">Arquivo</label>
      <input
        ref={inputRef}
        id="document-file"
        name="file"
        type="file"
        onChange={(event) => setSelectedFile(event.target.files[0] || null)}
      />
      {selectedFile && <p className="file-name">{selectedFile.name}</p>}

      {error && <p className="error-message" role="alert">{error}</p>}

      <button className="primary-button" type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
    </form>
  );
}
