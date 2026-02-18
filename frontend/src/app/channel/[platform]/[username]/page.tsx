import dynamic from 'next/dynamic';

const ChannelContent = dynamic(() => import('@/components/ChannelContent'), { ssr: false });

export default function ChannelPage() {
  return <ChannelContent />;
}
