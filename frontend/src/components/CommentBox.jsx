import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

export default function CommentBox({ comments = [], onAddComment }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment(message.trim());
      setMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem' }}>
        <MessageSquare size={18} className="text-primary" />
        <span>Comments & Communication ({comments.length})</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No comments added yet. Use the box below to ask questions or request clarification.
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{
              backgroundColor: 'var(--bg-main)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.author_name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {c.author_role}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{c.message}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Type a message or response..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={submitting}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.88rem'
          }}
        />
        <button type="submit" className="btn btn-primary" disabled={submitting || !message.trim()}>
          <Send size={16} />
          <span>Post</span>
        </button>
      </form>
    </div>
  );
}
