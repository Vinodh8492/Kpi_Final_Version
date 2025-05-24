import React, { useState, useContext } from 'react';
import { LogoContext } from '../contexts/LogoContext';

const API_BASE = "http://localhost:5000";

export default function LogoSettings() {
  const [logoFile, setLogoFile] = useState(null);
  const { setLogoUrl } = useContext(LogoContext);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!logoFile) {
      setError('Please select a logo file.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await fetch(`${API_BASE}/api/logo`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed. Please try again.');
      }

      const result = await response.json();

      if (result.logoUrl) {
        const updatedUrl = `${API_BASE}${result.logoUrl}?t=${Date.now()}`;
        setLogoUrl(updatedUrl);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while uploading the logo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '400px' }}>
      <h3>Logo Settings</h3>
      <input
        type="file"
        accept="image/*"
        onChange={e => setLogoFile(e.target.files[0])}
        style={{ marginBottom: '1rem' }}
      />
      <br />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload Logo'}
      </button>

      {success && <p style={{ color: 'green' }}>Logo uploaded successfully!</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
