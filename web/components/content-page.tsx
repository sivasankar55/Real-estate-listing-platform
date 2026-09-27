import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";

type ContentPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function ContentPage({ eyebrow, title, intro, children }: ContentPageProps) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[960px] flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="max-w-3xl border-b border-line pb-8">
          <p className="text-sm font-semibold text-brand">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-muted">{intro}</p>
        </header>
        <div className="mt-10 max-w-3xl space-y-10 text-muted">{children}</div>
      </main>
    </>
  );
}

export function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 leading-7">{children}</div>
    </section>
  );
}
