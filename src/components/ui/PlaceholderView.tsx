import React from 'react';

export const PlaceholderView: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terminal-surface border border-terminal-border mb-4">
          <span className="text-2xl text-terminal-gold">⚙</span>
        </div>
        <h2 className="text-lg font-semibold text-terminal-text mb-2">{title}</h2>
        <p className="text-xs text-terminal-muted max-w-xs mx-auto">
          This module is under construction. Core gameplay systems are being implemented.
        </p>
      </div>
    </div>
  );
};
