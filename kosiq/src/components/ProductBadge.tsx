'use client';

interface ProductBadgeProps {
  name: string;
  color: string;
  icon?: string;
  size?: 'sm' | 'md';
}

export default function ProductBadge({ name, color, icon, size = 'sm' }: ProductBadgeProps) {
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1 ${px} rounded-full font-medium whitespace-nowrap`}
      style={{ backgroundColor: color + '15', color }}
    >
      {icon && <span className="text-[10px]">{icon}</span>}
      {name}
    </span>
  );
}
