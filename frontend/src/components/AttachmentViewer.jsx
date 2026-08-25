import React, { useState } from 'react';
import { Paperclip, Upload, Download, FileText } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

export default function AttachmentViewer({ attachments = [], onUpload }) {
  const [uploading, setUploading] = useState(false);
  const { showToast } = useNotification();

  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.txt'];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate File Extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      showToast(`Invalid file format '${ext}'. Allowed formats: PDF, PNG, JPG, JPEG, DOC, DOCX, TXT.`, 'error');
      e.target.value = '';
      return;
    }

    // Validate File Size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds maximum allowed limit of 10MB.', 'error');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
      e.target.value = '';
    } catch (err) {
      showToast(err.message || 'Failed to upload attachment.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (id) => {
    const token = localStorage.getItem('vesa_jwt_token');
    window.open(`${api.downloadAttachment(id)}?token=${token}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
          <Paperclip size={18} className="text-primary" />
          <span>Supporting Documents ({attachments.length})</span>
        </div>

        <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
          <Upload size={14} />
          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
          <input 
            type="file" 
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
            onChange={handleFileChange} 
            disabled={uploading} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {attachments.length === 0 ? (
          <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
            No documents uploaded for this request.
          </div>
        ) : (
          attachments.map(att => (
            <div key={att.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{att.original_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {(att.file_size / 1024).toFixed(1)} KB • Uploaded by {att.uploader_name}
                  </div>
                </div>
              </div>

              <button onClick={() => handleDownload(att.id)} className="btn btn-secondary" style={{ padding: '4px 8px' }}>
                <Download size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
