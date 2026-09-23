import DownloadButton from './DownloadButton';

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 ** 2).toFixed(1)} MB`;
}

export default function DocumentList({ documents, isLoading, error, onRetry }) {
  return (
    <section className="documents-panel" aria-labelledby="documents-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2 id="documents-title">Seus documentos</h2>
        </div>
        <span className="document-count">{documents.length}</span>
      </div>

      {isLoading && <p className="empty-state">Carregando documentos...</p>}
      {!isLoading && error && (
        <div className="empty-state">
          <p className="error-message" role="alert">{error}</p>
          <button className="secondary-button" type="button" onClick={onRetry}>Tentar novamente</button>
        </div>
      )}
      {!isLoading && !error && documents.length === 0 && (
        <p className="empty-state">Nenhum documento foi enviado ainda.</p>
      )}
      {!isLoading && !error && documents.length > 0 && (
        <div className="document-table" role="list">
          {documents.map((document) => (
            <article className="document-row" key={document.id} role="listitem">
              <div className="document-icon" aria-hidden="true">DOC</div>
              <div className="document-details">
                <strong title={document.originalName}>{document.originalName}</strong>
                <span>{formatSize(document.size)} · {formatDate(document.uploadedAt)}</span>
              </div>
              <span className="document-owner">{document.owner}</span>
              <DownloadButton document={document} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
