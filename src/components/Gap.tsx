export function Gap({ h, w }: { h?: number; w?: number }) {
  return <div className={`un-h-${h ?? 1} un-w-${w ?? 1}`} />;
}
