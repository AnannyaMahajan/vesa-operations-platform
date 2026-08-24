import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const formatted = status.replace('_', ' ');
  const cssClass = `badge badge-${status.toLowerCase()}`;

  return (
    <span className={cssClass}>
      {formatted}
    </span>
  );
}
