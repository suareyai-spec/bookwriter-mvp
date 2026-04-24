export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-2xl';
  return (
    <span className={`${textSize} font-bold tracking-tight`}>
      <span className="text-dark">Chart</span>
      <span className="text-brand">IQ</span>
    </span>
  );
}
