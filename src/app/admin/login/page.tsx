"use client";

import { FormEvent, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("E-mail ou senha inválidos");
        return;
      }
      router.push(search.get("callbackUrl") || "/admin");
      router.refresh();
    });
  }

  return (
    <div className="admin-panel mx-auto mt-6 max-w-md">
      <h1 className="admin-title">Entrar</h1>
      <p className="admin-subtitle">Acesse o painel do fotógrafo.</p>
      <form onSubmit={onSubmit} className="admin-form mt-6 space-y-5">
        <div>
          <label className="admin-label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            className="admin-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="admin-label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            className="admin-input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="text-sm font-medium text-[#ff8f8f]">{error}</p> : null}
        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<p className="text-[#d7e6f2]">Carregando…</p>}>
      <LoginForm />
    </Suspense>
  );
}
