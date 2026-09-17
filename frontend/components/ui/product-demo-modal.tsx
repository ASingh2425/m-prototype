// product-demo-modal.tsx
import React from 'react';
import { X, ShieldAlert, Activity, CheckCircle2, Lock, FileText, Terminal } from 'lucide-react';

interface ProductDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDemoModal({ isOpen, onClose }: ProductDemoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[#0b0b0e] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0e0e13]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C6613F] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                  FABLE INSIDER THREAT SENSOR
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C6613F]/20 text-[#C6613F] border border-[#C6613F]/40 font-semibold">
                  LIVE INTERCEPT
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-sans mt-0.5">
                Session telemetry correlation: User account <span className="text-zinc-300 font-mono">dev_admin_42</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Risk Metrics Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex flex-col justify-between">
              <span className="text-xs font-mono text-zinc-500 uppercase">Anomaly Score</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-mono text-[#C6613F]">94</span>
                <span className="text-xs text-zinc-400">/ 100 [Critical]</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex flex-col justify-between">
              <span className="text-xs font-mono text-zinc-500 uppercase">Detection Vector</span>
              <div className="mt-2 text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#C6613F]" />
                <span>Stealth Staging</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex flex-col justify-between">
              <span className="text-xs font-mono text-zinc-500 uppercase">Protective Hold</span>
              <div className="mt-2 text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Session Quarantined</span>
              </div>
            </div>
          </div>

          {/* Chronological Investigation Timeline */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5 text-[#C6613F]" />
              <span>Behavioral Forensic Timeline</span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-lg bg-zinc-900/40 border border-white/[0.05] flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-zinc-500">02:14:02</span>
                  <div>
                    <span className="text-zinc-200">Unusual SSH public key deployed</span>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                      Origin IP 198.51.100.44 differs from engineer's baseline subnet (Tokyo VPN proxy)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400/90 font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  Suspicious
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/40 border border-white/[0.05] flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-zinc-500">02:16:18</span>
                  <div>
                    <span className="text-zinc-200">Volume snapshot mounted without ticket approval</span>
                    <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                      Target volume: <code className="text-zinc-300">vol-09a27f80 (production-vault)</code>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-amber-400/90 font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                  Elevated
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#C6613F]/10 border border-[#C6613F]/30 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-[#C6613F] font-bold">02:18:05</span>
                  <div>
                    <span className="text-zinc-100 font-bold">Encrypted tunnel staged for exfiltration</span>
                    <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                      Outbound connection attempted to unknown cloud storage endpoint. 2.4GB archived.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-[#C6613F] font-mono px-2 py-0.5 rounded bg-[#C6613F]/20 border border-[#C6613F]/40 font-bold">
                  Intercepted
                </span>
              </div>
            </div>
          </div>

          {/* Narrative Verdict Banner */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-white/[0.07] flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#C6613F] shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 font-sans leading-relaxed">
              <strong className="text-white block font-semibold mb-1">
                The story behind the story:
              </strong>
              While cloud infrastructure logs registered standard administrative maintenance commands,
              FABLE's deep behavioral graph recognized an adversary utilizing compromised employee credentials
              outside their normal operational context. Data transmission was terminated within 140ms.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#08080a] border-t border-white/[0.08]">
          <span className="text-xs text-zinc-500 font-mono">
            Protective hold active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            Close preview
          </button>
        </div>
      </div>
    </div>
  );
}
