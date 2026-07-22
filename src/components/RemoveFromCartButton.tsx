"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function RemoveFromCartButton({ photoId }: { photoId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm text-muted hover:text-danger disabled:opacity-50"
      onClick={() =>
        startTransition(async () => {
          await fetch(`/api/cart?photoId=${encodeURIComponent(photoId)}`, {
            method: "DELETE",
          });
          router.refresh();
        })
      }
    >
      Remover
    </button>
  );
}
