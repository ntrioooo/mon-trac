"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Shield, Lock } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background: "linear-gradient(180deg, #DDD6FE 0%, #EDE9FE 45%, #F8FAFC 100%)",
      }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-violet-300 opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 -right-16 h-64 w-64 rounded-full bg-purple-200 opacity-25 blur-3xl" />

      <div className="relative w-full max-w-sm">
        {/* Hero */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-[1.75rem] bg-violet-300 opacity-40 blur-xl" />
            <Image
              src="/icons/logo-baru.png"
              alt="JagaJajan Logo"
              width={96}
              height={96}
              className="relative rounded-[1.75rem] object-contain animate-float"
              style={{ boxShadow: "0 12px 32px rgba(124,58,237,0.3)" }}
              priority
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#1E1B4B] mb-1">
            JagaJajan
          </h1>
          <p className="text-sm font-semibold text-violet-600">
            Kelola jajan harianmu dengan gaya
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-[var(--radius-lg)] p-6 mb-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(124,58,237,0.12)",
            border: "1px solid rgba(196,181,253,0.5)",
          }}
        >
          <p className="text-center text-sm font-bold text-slate-600 mb-4">
            Masuk untuk mulai mencatat 👋
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-violet-100 bg-white px-6 py-3.5 text-sm font-extrabold text-[#0F172A] transition-all hover:border-violet-400 hover:shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
            id="google-login-button"
          >
            {!isLoading ? (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Masuk dengan Google</span>
              </>
            ) : (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin shrink-0" />
                <span>Menghubungkan...</span>
              </>
            )}
          </button>

          {/* Encryption assurance */}
          <div
            className="mt-4 flex items-start gap-2.5 rounded-xl p-3"
            style={{ backgroundColor: "#F0FDF4" }}
          >
            <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
            <div>
              <p className="text-xs font-extrabold text-emerald-700">
                Data kamu terenkripsi & aman
              </p>
              <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                Semua data keuangan disimpan secara lokal di perangkat dan dienkripsi sebelum diunggah ke server. Kami tidak pernah bisa melihat isi data kamu.
              </p>
            </div>
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <Lock className="h-3 w-3 text-violet-400" />
            <span>End-to-end encrypted</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
            <span>📱</span>
            <span>Offline-first</span>
          </div>
        </div>
      </div>
    </div>
  );
}
