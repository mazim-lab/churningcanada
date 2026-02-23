import { getNetworkStyle } from '@/data/card-images';

export function NetworkBadge({ network }: { network: string }) {
  const style = getNetworkStyle(network);
  return (
    <span className={`${style.bg} ${style.text} inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider leading-none`}>
      {style.label}
    </span>
  );
}
