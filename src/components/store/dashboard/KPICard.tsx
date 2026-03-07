'use client';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  action?: {
    label: string;
    href: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
}

const iconColors: Record<string, string> = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  gray: 'text-gray-400',
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  action,
  color = 'blue',
}: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3.5">
      {/* Label row: icon + title */}
      <div className="flex items-center gap-1.5 mb-1">
        {icon && (
          <span className={`${iconColors[color]} [&>svg]:w-3.5 [&>svg]:h-3.5`}>
            {icon}
          </span>
        )}
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-gray-900">{value}</span>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
            {trend.isPositive ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      )}

      {/* Action link */}
      {action && (
        <a href={action.href} className="text-xs text-blue-500 hover:text-blue-700 mt-1.5 inline-block font-medium">
          + {action.label}
        </a>
      )}
    </div>
  );
}
