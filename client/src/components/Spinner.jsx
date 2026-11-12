export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin`}
        style={{ borderWidth: size === 'sm' ? '2px' : size === 'md' ? '3px' : '4px' }}
      ></div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
