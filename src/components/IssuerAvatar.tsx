import { getIssuerStyle } from '@/data/card-images';

export function IssuerAvatar({ issuer, size = 'md' }: { issuer: string; size?: 'sm' | 'md' | 'lg' }) {
  const style = getIssuerStyle(issuer);
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
  };

  return (
    <div className={`${sizeClasses[size]} ${style.bg} ${style.text} rounded-lg flex items-center justify-center font-bold shrink-0 shadow-sm`}>
      {style.initials}
    </div>
  );
}
