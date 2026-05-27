interface BrandLogoProps {
  logo: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { wrapper: 'w-8 h-8', img: 'w-4 h-4', text: 'text-sm' },
  md: { wrapper: 'w-10 h-10', img: 'w-6 h-6', text: 'text-lg' },
  lg: { wrapper: 'w-12 h-12', img: 'w-7 h-7', text: 'text-2xl' },
};

const isUrl = (str: string) => str.startsWith('http') || str.startsWith('/');

const BrandLogo = ({ logo, color, size = 'md', className = '' }: BrandLogoProps) => {
  const s = sizeMap[size];

  return (
    <div
      className={`${s.wrapper} rounded-xl flex items-center justify-center shrink-0 ${className}`}
      style={{ backgroundColor: `${color}20` }}
    >
      {isUrl(logo) ? (
        <img
          src={logo}
          alt="brand logo"
          className={`${s.img} object-contain`}
          onError={(e) => {
            // If the SVG fails to load, fallback to a generic icon
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML = '📦';
          }}
        />
      ) : (
        <span className={s.text}>{logo}</span>
      )}
    </div>
  );
};

export default BrandLogo;
