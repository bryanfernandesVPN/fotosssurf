"use client";

import { useTransition } from "react";

export function DeleteAlbumButton({
  action,
  label = "Apagar álbum",
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="btn border border-danger/50 bg-transparent text-danger hover:bg-danger/10 disabled:opacity-50"
      onClick={() => {
        const ok = window.confirm(
          "Apagar este álbum e todas as fotos? Esta ação não pode ser desfeita.",
        );
        if (!ok) return;
        startTransition(async () => {
          await action();
        });
      }}
    >
      {pending ? "Apagando…" : label}
    </button>
  );
}
