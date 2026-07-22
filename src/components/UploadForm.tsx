"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function UploadForm({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onUpload() {
    if (!files || files.length === 0) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const form = new FormData();
      form.set("albumId", albumId);
      Array.from(files).forEach((f) => form.append("files", f));
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Falha no upload");
        return;
      }
      setMessage(`${data.count} foto(s) enviada(s)`);
      setFiles(null);
      router.refresh();
    });
  }

  return (
    <div className="border border-border bg-card p-4">
      <h2 className="font-display text-2xl text-foam">Upload em lote</h2>
      <p className="mt-1 text-sm text-muted">
        JPG/PNG. Geramos prévia com marca d&apos;água automaticamente.
      </p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="mt-4 block w-full text-sm text-muted file:mr-3 file:border-0 file:bg-cyan file:px-3 file:py-2 file:font-semibold file:text-navy-deep"
        onChange={(e) => setFiles(e.target.files)}
      />
      <button
        type="button"
        className="btn btn-primary mt-4"
        disabled={pending || !files?.length}
        onClick={onUpload}
      >
        {pending ? "Processando…" : "Enviar fotos"}
      </button>
      {message ? <p className="mt-2 text-sm text-cyan">{message}</p> : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
