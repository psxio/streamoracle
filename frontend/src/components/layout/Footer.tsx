import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-gray-300">StreamOracle</p>
            <p className="mt-1 text-xs text-gray-500">
              Score, don&apos;t accuse.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/methodology" className="transition-colors hover:text-gray-300">
              Methodology
            </Link>
            <Link href="/about" className="transition-colors hover:text-gray-300">
              About
            </Link>
            <a
              href="https://github.com/psxio/streamoracle"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-gray-300"
            >
              GitHub
            </a>
          </div>

          <div className="text-center text-xs text-gray-600 md:text-right">
            <p>
              Built by{' '}
              <a href="https://x.com/duhhhdev" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300">@duhhhdev</a>
            </p>
            <p className="mt-1">Next.js, FastAPI &amp; SQLite</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
