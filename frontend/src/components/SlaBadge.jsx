import React from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function SlaBadge({ slaStatus }) {
  if (!slaStatus) return null;

  const configs = {
    'WITHIN_SLA': { label: 'Within SLA', icon: Clock, class: 'badge-within_sla' },
    'APPROACHING_SLA': { label: 'Approaching SLA', icon: AlertTriangle, class: 'badge-approaching_sla' },
    'OVERDUE': { label: 'Overdue', icon: XCircle, class: 'badge-rejected' },
    'COMPLETED_WITHIN_SLA': { label: 'Met SLA', icon: CheckCircle, class: 'badge-approved' },
    'COMPLETED_AFTER_SLA': { label: 'Overdue Complete', icon: AlertTriangle, class: 'badge-changes_requested' }
  };

  const cfg = configs[slaStatus] || { label: slaStatus, icon: Clock, class: 'badge-submitted' };
  const Icon = cfg.icon;

  return (
    <span className={`badge ${cfg.class}`}>
      <Icon size={12} />
      <span>{cfg.label}</span>
    </span>
  );
}
