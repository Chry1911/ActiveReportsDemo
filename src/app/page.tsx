import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-24 px-12 bg-white dark:bg-black sm:items-start">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            ActiveReportsJS Demo (Next.js)
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Prova il Designer per creare report complessi e usa il Viewer per l’anteprima.
          </p>
        </div>
        {/* Actions */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-8">
          <Link
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="/designer"
          >
            Apri Designer
          </Link>
          <Link
            className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            href="/viewer"
          >
            Apri Viewer
          </Link>
        </div>
      </main>
    </div>
  );
}
