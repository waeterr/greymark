import React from 'react';

interface PriceChartProps {
  data: number[];
  basePrice: number;
  height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  basePrice,
  height = 140,
}) => {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-terminal-muted text-xs font-mono bg-terminal-surface/40 rounded border border-terminal-border"
        style={{ height }}
      >
        No price telemetry recorded
      </div>
    );
  }

  const min = Math.min(...data, basePrice * 0.85);
  const max = Math.max(...data, basePrice * 1.15);
  const range = max - min || 1;

  const width = 400;
  const paddingX = 16;
  const paddingY = 16;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = paddingX + (idx / Math.max(1, data.length - 1)) * chartW;
    const y = paddingY + chartH - ((val - min) / range) * chartH;
    return { x, y, val };
  });

  const pathD = points.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`,
    ''
  );

  const fillD = `${pathD} L ${points[points.length - 1]?.x.toFixed(1)} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

  const isUp = (data[data.length - 1] ?? 0) >= (data[0] ?? 0);
  const strokeColor = isUp ? '#65B88A' : '#D66F6F';

  // Baseline Y
  const baseY = paddingY + chartH - ((basePrice - min) / range) * chartH;

  return (
    <div className="w-full bg-terminal-bg/60 p-2 rounded border border-terminal-border overflow-hidden">
      <div className="flex justify-between items-center text-[10px] font-mono text-terminal-muted px-2 pb-1">
        <span>High: ${max.toFixed(2)}</span>
        <span className="text-terminal-gold">Base: ${basePrice.toFixed(2)}</span>
        <span>Low: ${min.toFixed(2)}</span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
      >
        <defs>
          <linearGradient id={`grad_${isUp ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Baseline indicator */}
        <line
          x1={paddingX}
          y1={baseY}
          x2={width - paddingX}
          y2={baseY}
          stroke="#C3A36B"
          strokeDasharray="3 3"
          strokeOpacity="0.4"
          strokeWidth="1"
        />

        {/* Shaded Area */}
        <path d={fillD} fill={`url(#grad_${isUp ? 'up' : 'down'})`} />

        {/* Price Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={i === points.length - 1 ? 3.5 : 2}
            fill={i === points.length - 1 ? strokeColor : '#202731'}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
        ))}
      </svg>
    </div>
  );
};
