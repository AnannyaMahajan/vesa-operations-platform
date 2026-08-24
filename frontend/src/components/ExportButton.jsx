import React from 'react';
import { Download } from 'lucide-react';

export default function ExportButton() {
  const handleExport = (format) => {
    const token = localStorage.getItem('vesa_jwt_token');
    window.open(`http://localhost:5000/api/analytics/export?format=${format}&token=${token}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button onClick={() => handleExport('csv')} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
        <Download size={14} />
        <span>Export CSV</span>
      </button>
      <button onClick={() => handleExport('json')} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
        <Download size={14} />
        <span>Export JSON</span>
      </button>
    </div>
  );
}
