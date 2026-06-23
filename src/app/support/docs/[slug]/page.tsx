import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupportDocBySlug } from "@/lib/supportDocs";

export default async function SupportDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getSupportDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const filePath = path.join(/* turbopackIgnore: true */ process.cwd(), doc.fileName);
  let content = "";

  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    try {
      const githubRepo = process.env.NEXT_PUBLIC_GITHUB_REPO || "stephensdf89/Nexus";
      const rawUrl = `https://raw.githubusercontent.com/${githubRepo}/main/${doc.fileName}`;
      const res = await fetch(rawUrl, { cache: "no-store" });
      if (res.ok) {
        content = await res.text();
      } else {
        content = `# ${doc.title}\n\nThe file ${doc.fileName} could not be loaded from deployment storage or GitHub raw content.`;
      }
    } catch {
      content = `# ${doc.title}\n\nThe file ${doc.fileName} could not be loaded from deployment storage or GitHub raw content.`;
    }
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/support" className="text-cyan-300 hover:text-cyan-100">Support Hub</Link>
          <span className="text-cyan-100/50">/</span>
          <span className="text-cyan-100/80">{doc.title}</span>
        </div>

        <header className="rounded-xl border border-cyan-400/35 bg-[rgba(9,25,66,0.82)] p-6">
          <h1 className="text-3xl font-bold text-cyan-100">{doc.title}</h1>
          <p className="mt-2 text-sm text-cyan-100/70">Source file: {doc.fileName}</p>
        </header>

        <article className="rounded-xl border border-cyan-400/30 bg-slate-900/70 p-6">
          <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-cyan-100/85">{content}</pre>
        </article>
      </div>
    </main>
  );
}
