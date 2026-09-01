"use client";

import { usePwaStore } from "@/stores/pwa-store";
import { X, Share, PlusSquare } from "lucide-react";
import Image from "next/image";

export function PwaInstallModal() {
  const showIOSModal = usePwaStore((s) => s.showIOSModal);
  const setShowIOSModal = usePwaStore((s) => s.setShowIOSModal);
  const isIOS = usePwaStore((s) => s.isIOS);

  if (!showIOSModal) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => setShowIOSModal(false)}
      />

      {/* Bottom Sheet Modal */}
      <div
        className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl border-t border-slate-100 bg-white p-6 shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 1.5rem)" }}
      >
        {/* Handle Bar */}
        <div className="flex justify-center -mt-2 pb-3">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        {/* Header with App Logo */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/icons/logo-baru.png"
                alt="JagaJajan Logo"
                width={44}
                height={44}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Akses di Layar Utama
              </h3>
              <p className="text-xs font-medium text-slate-400">
                Pasang aplikasi tanpa perlu buka browser
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowIOSModal(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 font-bold text-xs">
              1
            </div>
            <div className="text-xs text-slate-600">
              Tap ikon <strong>Bagikan / Share</strong>{" "}
              <Share className="inline h-3.5 w-3.5 text-violet-600 align-text-bottom" />{" "}
              atau <strong>Menu Titik Tiga (⋮)</strong> pada bilah menu browser.
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 font-bold text-xs">
              2
            </div>
            <div className="text-xs text-slate-600">
              Gulir ke bawah dan pilih opsi{" "}
              <strong>&ldquo;Tambah ke Layar Utama&rdquo;</strong> (
              <PlusSquare className="inline h-3.5 w-3.5 text-violet-600 align-text-bottom" />
              ).
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 font-bold text-xs">
              3
            </div>
            <div className="text-xs text-slate-600">
              Tap <strong>&ldquo;Tambah&rdquo; (Add)</strong> di pojok kanan atas. Icon aplikasi akan langsung muncul di HP Anda!
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowIOSModal(false)}
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-extrabold text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 active:scale-[0.98] transition-all cursor-pointer"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
