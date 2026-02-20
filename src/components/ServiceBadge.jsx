import React from 'react';
import { cn } from '../lib/utils';
import { SERVICE_LABELS } from '../lib/utils';

const serviceStyles = {
    polarizado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    nanoceramica: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    autobahn_black: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    ultrasecure: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export const ServiceBadge = ({ service, className }) => {
    const label = SERVICE_LABELS[service] || service;
    const style = serviceStyles[service] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                style,
                className
            )}
            data-testid={`service-badge-${service}`}
        >
            {label}
        </span>
    );
};
