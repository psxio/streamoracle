import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#0a0e1a]">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              <span className="text-lg font-bold tracking-tight text-gradient" style={{ fontFamily: 'Outfit, sans-serif' }}>
                StreamOracle
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Multi-platform viewership forensics.
              <br />
              Score, don&apos;t accuse.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-start gap-2 md:items-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-600">
              Navigate
            </p>
            <Link href="/methodology" className="text-sm text-gray-500 transition-colors hover:text-cyan-400">
              Methodology
            </Link>
            <Link href="/leaderboard" className="text-sm text-gray-500 transition-colors hover:text-cyan-400">
              Leaderboard
            </Link>
            <Link href="/about" className="text-sm text-gray-500 transition-colors hover:text-cyan-400">
              About
            </Link>
          </div>

          {/* Credits */}
          <div className="flex flex-col items-start gap-2 md:items-end">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-600">
              Connect
            </p>
            <a
              href="https://x.com/duhhhdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 transition-colors hover:text-cyan-400"
            >
              @duhhhdev
            </a>
            <a
              href="https://github.com/psxio/streamoracle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 transition-colors hover:text-cyan-400"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="mt-10 border-t border-white/[0.06] pt-6 text-center">
          <p className="text-xs text-gray-600">
            Built with data, not opinions.
          </p>
        </div>
      </div>
    </footer>
  );
}
