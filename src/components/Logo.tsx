
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br income-gradient flex items-center justify-center shadow-lg logo`}>
        <span className="text-white font-bold text-sm">$</span>
      </div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} text-gray-900 dark:text-gray-100`}>
          SafeSpender
        </span>
      )}
    </div>
  );
};

export default Logo;
