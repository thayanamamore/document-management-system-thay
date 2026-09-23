import { useCallback, useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { listDocuments } from './services/documentApi';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDocuments = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      setDocuments(await listDocuments());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  function handleUploaded(document) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Workspace local</p>
          <h1>Document Management System</h1>
          <p className="intro">Organize seus arquivos importantes em um só lugar.</p>
        </div>
        <div className="status-chip"><span /> Armazenamento local</div>
      </header>

      <div className="app-grid">
        <UploadComponent onUploaded={handleUploaded} />
        <DocumentList
          documents={documents}
          isLoading={isLoading}
          error={error}
          onRetry={loadDocuments}
        />
      </div>
    </main>
  );
}
