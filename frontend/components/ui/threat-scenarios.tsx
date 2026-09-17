// threat-scenarios.tsx
import React, { useState } from 'react';
import { Terminal } from 'lucide-react';

export interface ThreatScenario {
  title: string;
  vector: string;
  confidence: string;
  action: string;
  log: string[];
}

export const DEFAULT_SIMULATIONS: ThreatScenario[] = [
  {
    title: 'Credential Hijack & Staging',
    vector: 'Lateral Movement',
    confidence: '98.4%',
    action: 'Session Isolated in 84ms',
    log: [
      '[02:14:02] SSH session opened from unverified Tokyo ASN',
      '[02:14:19] Privilege escalation request bypassed via sudo token replay',
      '[02:14:31] Reading /etc/shadow and database credentials',
      '[02:14:32] >> FABLE INTERVENE: Terminated PTY socket & revoked token',
    ],
  },
  {
    title: 'Bulk Customer Data Egress',
    vector: 'Data Exfiltration',
    confidence: '95.2%',
    action: 'Egress Blocked at Gateway',
    log: [
      '[11:42:10] Internal Postgres query extracted 42,000 PII records',
      '[11:43:05] Staged payload compressed into password-protected .7z',
      '[11:43:22] Outbound upload initiated to anonymized S3 bucket',
      '[11:43:23] >> FABLE INTERVENE: Upload stream halted, bucket egress blacklisted',
    ],
  },
  {
    title: 'Source Code Repos Clone',
    vector: 'Intellectual Property Theft',
    confidence: '92.7%',
    action: 'Repository Access Revoked',
    log: [
      '[23:18:01] 28 proprietary core repos cloned consecutively within 4 minutes',
      '[23:20:15] Employee resignation notice filed 2 days prior',
      '[23:21:40] High deviation from normal commit & branch workflow',
      '[23:21:41] >> FABLE INTERVENE: OAuth token invalidated & security ops alerted',
    ],
  },
];

export function ThreatScenariosPanel({
  simulations = DEFAULT_SIMULATIONS,
  className = '',
}: {
  simulations?: ThreatScenario[];
  className?: string;
}) {
  const [activeSimulation, setActiveSimulation] = useState<number>(0);

  return (
    <div className={`rounded-2xl bg-[#09090d] border border-white/[0.08] overflow-hidden p-6 sm:p-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#C6613F]" />
            <span className="text-sm font-mono font-bold text-zinc-200">
              Interactive Threat Scenarios
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Select a live scenario to inspect FABLE&apos;s real-time interception logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {simulations.map((sim, i) => (
            <button
              key={i}
              onClick={() => setActiveSimulation(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeSimulation === i
                  ? 'bg-[#C6613F] text-black font-semibold shadow-md shadow-[#C6613F]/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
              }`}
            >
              Scenario 0{i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Selected Vector</span>
            <h4 className="text-base font-bold text-zinc-100 mt-0.5">
              {simulations[activeSimulation].title}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.05]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Detection Confidence</span>
              <div className="text-lg font-bold font-mono text-[#C6613F]">
                {simulations[activeSimulation].confidence}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.05]">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Intervention Time</span>
              <div className="text-lg font-bold font-mono text-emerald-400">
                &lt; 100ms
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#C6613F]/10 border border-[#C6613F]/30 text-xs text-zinc-300">
            <span className="font-semibold text-white">Status: </span>
            {simulations[activeSimulation].action}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#050507] p-4 rounded-xl border border-white/[0.06] font-mono text-xs text-zinc-300 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-500 text-[11px]">
            <span>fable-agent-daemon // stream 0x9f</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ANALYZING
            </span>
          </div>
          {simulations[activeSimulation].log.map((line, idx) => (
            <div
              key={idx}
              className={`leading-relaxed ${
                line.includes('FABLE INTERVENE')
                  ? 'text-[#C6613F] font-bold bg-[#C6613F]/10 px-2 py-1 rounded'
                  : 'text-zinc-400'
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
