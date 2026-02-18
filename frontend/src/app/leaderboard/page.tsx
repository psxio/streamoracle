import dynamic from 'next/dynamic';

const LeaderboardContent = dynamic(() => import('@/components/LeaderboardContent'), { ssr: false });

export default function LeaderboardPage() {
  return <LeaderboardContent />;
}
