// src/components/AccessRequestsView.tsx
// Context-Aware Just-in-Time Access Main Screen
// Provides complete interactive workflow for Priya's emergency access (AR-203)
// and contrasting malicious comparison for Devraj (AR-104)

import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Fingerprint,
  Radio,
  FileText,
  AlertOctagon,
  ChevronRight,
  UserX,
  FastForward,
  Info,
  Server,
  Terminal,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useJITAccess } from '../useJITAccess';
import { AIAccessReviewPanel } from './AIAccessReviewPanel';
import { ContextEvidenceChecklist } from './ContextEvidenceChecklist';
import { ScopeBlastRadiusPreview } from './ScopeBlastRadiusPreview';
import { AccessAuditTimeline } from './AccessAuditTimeline';
import { ApproveScopedAccessModal } from './ApproveScopedAccessModal';
import { RequestMoreContextModal } from './RequestMoreContextModal';
import { DenyAccessModal } from './DenyAccessModal';
import { DevrajRevocationModal } from './DevrajRevocationModal';
import { PersonaAvatar } from './PersonaAvatar';
import { RECORDING_MODE_BADGE, SIMULATED_ENFORCEMENT_LABEL } from '../constants';
import { DemoPersona } from '../api/client';

interface ActionBannerState {
  type: 'deny' | 'escalate' | 'approve' | 'context' | 'restriction';
  title: string;
  text: string;
  policy?: string;
}

interface AccessRequestsViewProps {
  currentPersona: DemoPersona;
  onSwitchPersona: (persona: DemoPersona) => void;
  onNavigateToCase?: (caseId: string) => void;
  jitAccessState?: ReturnType<typeof useJITAccess>;
}

export function AccessRequestsView({
  currentPersona,
  onSwitchPersona,
  onNavigateToCase,
  jitAccessState,
}: AccessRequestsViewProps) {
  const localJitState = useJITAccess();
  const {
    requests,
    activeRequestId,
    activeRequest,
    setActiveRequestId,
    formatCountdown,
    generateAIReview,
    proposeAccessDecision,
    approveScopedAccess,
    requestMoreContext,
    denyRequest,
    revokeEarly,
    simulateScopeDeviation,
    approveDevrajRevocation,
    expireNow,
    resetSimulation,
  } = jitAccessState || localJitState;

  // Modal Dialog States & Action Banner
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRequestContextModalOpen, setIsRequestContextModalOpen] = useState<boolean>(false);
  const [isDenyModalOpen, setIsDenyModalOpen] = useState<boolean>(false);
  const [isDevrajRevokeModalOpen, setIsDevrajRevokeModalOpen] = useState<boolean>(false);
  const [actionBanner, setActionBanner] = useState<ActionBannerState | null>(null);
  const [proposeNote, setProposeNote] = useState<string>(
    'Verified active Sev-1 outage #88219 and approved RFC-4109. Propose 15-minute scoped terminal bastion session.'
  );

  // Persona RBAC
  const isAdmin = currentPersona === 'admin';
  const isAnalyst = currentPersona === 'analyst';
  const isReviewer = currentPersona === 'reviewer';

  const actorName =
    currentPersona === 'admin'
      ? 'Elena Rostova'
      : currentPersona === 'reviewer'
      ? 'Sarah Sterling'
      : 'Alex Thorne';

  const actorRole =
    currentPersona === 'admin'
      ? 'SOC Administrator / Enforcement Director'
      : currentPersona === 'reviewer'
      ? 'Authorized Security Reviewer & VP Compliance'
      : 'SOC Tier 2 Analyst';

  const handleRestrictedAction = (actionName: string) => {
    setActionBanner({
      type: 'restriction',
      title: 'ACTION RESTRICTED: ADMIN PERMISSION REQUIRED',
      text: `Only the Admin persona (Elena Rostova) has enforcement authority to ${actionName}. Active persona "${actorName}" (${currentPersona.toUpperCase()}) cannot execute administrative decisions.`,
      policy: 'POL-SOD-001: Separation of Duties & Administrative Control Boundary',
    });
  };

  const handleConfirmApprove = (params: {
    reviewerName: string;
    reviewerRole: string;
    reason: string;
    durationMinutes: number;
    stepUpVerified: boolean;
  }) => {
    approveScopedAccess(activeRequest.id, params);
    setActionBanner({
      type: 'approve',
      title: 'SCOPED ACCESS APPROVED & ACTIVATED (15m TTL)',
      text: `15-minute temporary scoped session granted to ${activeRequest.employeeName} by Admin (${params.reviewerName}). Step-up WebAuthn MFA verified. Unrelated systems remain locked.`,
      policy: 'POL-JIT-APPR-001: Authorized Reviewer temporary scoped grant with mandatory MFA step-up.',
    });
  };

  const handleConfirmRequestContext = (params: {
    reviewerName: string;
    reviewerRole: string;
    notes: string;
  }) => {
    requestMoreContext(activeRequest.id, params);
    setActionBanner({
      type: 'context',
      title: 'ADDITIONAL CONTEXT REQUESTED — ACCESS PAUSED',
      text: `Formal context clarification issued by Admin (${params.reviewerName}). Access request ${activeRequest.id} remains safely paused before exposure pending ticket issuer response.`,
      policy: 'POL-JIT-CTX-002: Access request remains paused when additional context is requested.',
    });
  };

  const handleConfirmDeny = (params: {
    reviewerName: string;
    reviewerRole: string;
    reason: string;
  }) => {
    denyRequest(activeRequest.id, params);
    setActionBanner({
      type: 'deny',
      title: 'ACCESS REQUEST DENIED & ESCALATED TO SECURITY OPS',
      text: `Access request ${activeRequest.id} (${activeRequest.employeeName}) has been formally denied with zero exposure by Admin (${params.reviewerName}). Incident escalated to SOC Tier 3 for investigation. Justification: "${params.reason}".`,
      policy: 'POL-JIT-DENY-001: Denied requests terminate immediately with zero exposure.',
    });
  };

  const handleConfirmDevrajRevocation = (params: {
    reviewerName: string;
    reviewerRole: string;
    reason: string;
  }) => {
    approveDevrajRevocation(params);
    setActionBanner({
      type: 'escalate',
      title: 'INCIDENT ESCALATED & CREDENTIALS FROZEN',
      text: `Enterprise session for Devraj Malhotra (AR-104) terminated immediately by Admin (${params.reviewerName}). 4.8 GB outbound S3 dump locked under protective hold and Vault master key API tokens frozen. Justification: "${params.reason}".`,
      policy: 'POL-CONT-009: Human-authorized destructive session revocation and credential freeze.',
    });
  };

  const priyaReq = requests['AR-203'];
  const devrajReq = requests['AR-104'];

  const isActive = activeRequest.currentStatus === 'ACTIVE';
  const isPaused = activeRequest.currentStatus === 'PAUSED';
  const isExpired = activeRequest.currentStatus === 'EXPIRED';
  const isDenied = activeRequest.currentStatus === 'DENIED';
  const isRevoked = activeRequest.currentStatus === 'REVOKED';
  const isAwaitingApproval = activeRequest.currentStatus === 'AWAITING_APPROVAL';
  const isMoreContextReq = activeRequest.currentStatus === 'MORE_CONTEXT_REQUIRED';

  // Status Badge Rendering
  const getStatusBadge = () => {
    if (isActive) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>ACTIVE — {formatCountdown(activeRequest.remainingSeconds)} REMAINING</span>
        </div>
      );
    }
    if (isPaused) {
      if (activeRequest.id === 'AR-104') {
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>PROTECTIVE HOLD — BLOCKED</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold tracking-wider">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>PAUSED — CONTEXT REVIEW</span>
        </div>
      );
    }
    if (isExpired) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-500/15 border border-slate-500/30 text-slate-300 font-mono text-xs font-bold">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>EXPIRED — ACCESS REVOKED</span>
        </div>
      );
    }
    if (isRevoked) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold">
          <UserX className="w-4 h-4 text-rose-400" />
          <span>SESSION REVOKED</span>
        </div>
      );
    }
    if (isDenied) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span>DENIED — ACCESS BLOCKED</span>
        </div>
      );
    }
    if (isAwaitingApproval) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold">
          <UserCheck className="w-4 h-4 text-indigo-400" />
          <span>AWAITING REVIEWER APPROVAL</span>
        </div>
      );
    }
    if (isMoreContextReq) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>MORE CONTEXT REQUIRED</span>
        </div>
      );
    }
    return (
      <div className="px-3 py-1.5 rounded-lg bg-white/10 text-white font-mono text-xs font-bold">
        {activeRequest.currentStatus}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Mandatory Terminology Distinction Banner */}
      <div className="bg-[#0b0f19] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Context-Aware Just-in-Time Access (JIT Engine)
              </h2>
              <p className="text-xs text-slate-400">
                Prevents access to sensitive data before exposure occurs while enabling legitimate emergency operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Restores Priya and Devraj to pristine initial simulation states"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulation</span>
            </button>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {RECORDING_MODE_BADGE}
            </span>
          </div>
        </div>

        {/* The 3 Core Product Distinctions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-amber-300 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Access Request Paused</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>The user never had access.</strong> Sensitive request held prior to any packet transmission or data exposure while context is validated.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-rose-300 font-mono text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Protective Hold</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>An existing risky action was interrupted.</strong> Egress pipelines held at perimeter gateways without disconnecting innocent work.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/[0.06] border border-purple-500/20 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-purple-300 font-mono text-xs">
              <UserX className="w-3.5 h-3.5 text-purple-400" />
              <span>Session Revoked</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>An active session was terminated.</strong> Executed only after explicit human reviewer approval or automatic TTL expiration.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>FABLE controls a session, action, destination or privilege — never an employee.</span>
          </div>
          <span>Deterministic State Engine · Zero Network Dependencies</span>
        </div>
      </div>

      {/* 2. Request Switcher: Priya (Legitimate) vs Devraj (Malicious Comparison) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priya Ramesh Card */}
        <div
          onClick={() => setActiveRequestId('AR-203')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeRequestId === 'AR-203'
              ? 'bg-[#0d1424] border-emerald-500/50 shadow-lg shadow-emerald-950/30'
              : 'bg-[#0b0f19] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <PersonaAvatar name="Priya Ramesh" size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Priya Ramesh</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    AR-203
                  </span>
                </div>
                <div className="text-xs text-slate-400">SRE Lead · Core Infrastructure</div>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              LEGITIMATE EMERGENCY
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-slate-300">
              Resource: <strong className="text-white font-mono">Payments Production Bastion</strong>
            </div>
            <div className="text-emerald-400 font-mono text-[11px]">
              {priyaReq.currentStatus === 'ACTIVE'
                ? `ACTIVE (${formatCountdown(priyaReq.remainingSeconds)})`
                : priyaReq.currentStatus === 'EXPIRED'
                ? 'EXPIRED (00:00)'
                : priyaReq.currentStatus}
            </div>
          </div>
        </div>

        {/* Devraj Malhotra Card */}
        <div
          onClick={() => setActiveRequestId('AR-104')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeRequestId === 'AR-104'
              ? 'bg-[#180d12] border-rose-500/50 shadow-lg shadow-rose-950/30'
              : 'bg-[#0b0f19] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <PersonaAvatar name="Devraj Malhotra" size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Devraj Malhotra</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/25">
                    AR-104
                  </span>
                </div>
                <div className="text-xs text-slate-400">Staff Infrastructure Engineer · Core Infrastructure</div>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
              MALICIOUS COMPARISON
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="text-slate-300">
              Resource: <strong className="text-white font-mono">Vault Master-Secret Keyring</strong>
            </div>
            <div className="text-rose-400 font-mono text-[11px] font-bold">
              {devrajReq.currentStatus === 'REVOKED'
                ? 'SESSION REVOKED'
                : 'PROTECTIVE HOLD (4.8 GB BLOCKED)'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scope Deviation Alert Banner (if triggered) */}
      {activeRequest.deviationAlert && activeRequest.deviationAlert.triggered && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-bounce">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">
                Active Session Paused: Scope Deviation Detected
              </h4>
              <span className="text-xs font-mono text-rose-300">
                {activeRequest.deviationAlert.timestamp}
              </span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
              {activeRequest.deviationAlert.reason}
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-1">
              Held Session ID: <span className="text-white">{activeRequest.deviationAlert.pausedSessionId}</span> · New high-priority alert dispatched to SOC.
            </div>
          </div>
        </div>
      )}

      {/* 3.5 Action Result / Fixed Confirmation Text / RBAC Restriction Banner */}
      {actionBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-4 shadow-xl transition-all font-sans animate-in fade-in duration-200 ${
            actionBanner.type === 'deny'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              : actionBanner.type === 'escalate'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
              : actionBanner.type === 'approve'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              : actionBanner.type === 'restriction'
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl border mt-0.5 ${
                actionBanner.type === 'deny' || actionBanner.type === 'restriction'
                  ? 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                  : actionBanner.type === 'escalate'
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                  : actionBanner.type === 'approve'
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
              }`}
            >
              {actionBanner.type === 'deny' && <XCircle className="w-5 h-5" />}
              {actionBanner.type === 'escalate' && <ShieldAlert className="w-5 h-5" />}
              {actionBanner.type === 'approve' && <ShieldCheck className="w-5 h-5" />}
              {actionBanner.type === 'context' && <HelpCircle className="w-5 h-5" />}
              {actionBanner.type === 'restriction' && <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-white tracking-wide">
                  {actionBanner.title}
                </span>
                {actionBanner.policy && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white border border-white/20">
                    {actionBanner.policy}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                {actionBanner.text}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActionBanner(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Active Request Main Inspector */}
      <div className="bg-[#0b0f19] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Request Overview Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-[#0d1424] via-[#0b0f19] to-[#0d1424] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <PersonaAvatar name={activeRequest.employeeName} size="lg" />
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {activeRequest.employeeName}
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-white/10 text-white">
                  {activeRequest.id}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {activeRequest.sensitivity} Asset
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                <span>{activeRequest.employeeRole} · {activeRequest.department}</span>
                <span>•</span>
                <span>Trigger: <strong className="text-slate-300">{activeRequest.trigger}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {getStatusBadge()}
          </div>
        </div>

        {/* Role Bar & Action Triggers */}
        <div className="p-4 border-b border-white/10 bg-[#080c16] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Active Role Persona:</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-mono text-white font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{actorName}</span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                isAdmin
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : isReviewer
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                {currentPersona}
              </span>
            </div>
            {!isAdmin && (
              <button
                onClick={() => onSwitchPersona('admin')}
                className="px-2.5 py-1 rounded bg-[#C6613F]/20 hover:bg-[#C6613F]/30 border border-[#C6613F]/40 text-[#E07B57] text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="Switch to Admin (Elena Rostova) for enforcement authority"
              >
                <span>Switch to Admin (Elena Rostova) →</span>
              </button>
            )}
          </div>

          {/* Contextual Action Buttons depending on role and request state */}
          <div className="flex flex-wrap items-center gap-2">
            {/* If Priya AR-203 */}
            {activeRequest.id === 'AR-203' && (
              <>
                {/* When PAUSED or AI_REVIEWED */}
                {(isPaused || isAwaitingApproval || isMoreContextReq) && (
                  <>
                    {/* Analyst can propose */}
                    {isAnalyst && (
                      <button
                        onClick={() =>
                          proposeAccessDecision(
                            'AR-203',
                            actorName,
                            actorRole,
                            proposeNote
                          )
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Propose Scoped Approval</span>
                      </button>
                    )}

                    {/* Decision Action Buttons (Only Admin can execute; locked/restricted for Analyst/Reviewer) */}
                    <button
                      onClick={() =>
                        isAdmin
                          ? setIsApproveModalOpen(true)
                          : handleRestrictedAction('approve scoped access requests')
                      }
                      className={`px-3.5 py-1.5 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isAdmin
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
                          : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300/70 hover:bg-emerald-900/50'
                      }`}
                      title={isAdmin ? 'Approve temporary 15-minute access' : 'Admin authority required (Elena Rostova)'}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve Scoped Access</span>
                      {!isAdmin && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
                    </button>

                    <button
                      onClick={() =>
                        isAdmin
                          ? setIsRequestContextModalOpen(true)
                          : handleRestrictedAction('request additional context')
                      }
                      className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isAdmin
                          ? 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300'
                          : 'bg-amber-950/30 border border-amber-500/20 text-amber-400/60'
                      }`}
                      title={isAdmin ? 'Request formal ticket / manager verification' : 'Admin authority required (Elena Rostova)'}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Request More Context</span>
                      {!isAdmin && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
                    </button>

                    <button
                      onClick={() =>
                        isAdmin
                          ? setIsDenyModalOpen(true)
                          : handleRestrictedAction('deny access requests')
                      }
                      className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isAdmin
                          ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold'
                          : 'bg-rose-950/30 border border-rose-500/20 text-rose-400/60'
                      }`}
                      title={isAdmin ? 'Deny request and escalate to Security Ops' : 'Admin authority required (Elena Rostova)'}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Deny Request & Escalate</span>
                      {!isAdmin && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
                    </button>
                  </>
                )}

                {/* When ACTIVE */}
                {isActive && (
                  <>
                    <button
                      onClick={() =>
                        isAdmin
                          ? revokeEarly('AR-203', {
                              actorName,
                              actorRole,
                              actorPersona: 'admin',
                              reason: 'Manual session rollback by Admin.',
                            })
                          : handleRestrictedAction('revoke active sessions')
                      }
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Revoke Early</span>
                      {!isAdmin && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
                    </button>

                    <button
                      onClick={() => simulateScopeDeviation('AR-203')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Simulates employee attempting privilege escalation or unapproved subnet connection"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Simulate Scope Deviation</span>
                    </button>

                    <button
                      onClick={() => expireNow('AR-203')}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Demonstrates automatic expiry instantly without waiting 15 actual minutes"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>Fast-Forward Expiry (TTL=0)</span>
                    </button>
                  </>
                )}
              </>
            )}

            {/* If Devraj AR-104 */}
            {activeRequest.id === 'AR-104' && (
              <>
                {devrajReq.currentStatus !== 'REVOKED' ? (
                  <button
                    onClick={() =>
                      isAdmin
                        ? setIsDevrajRevokeModalOpen(true)
                        : handleRestrictedAction('escalate incidents and revoke sessions')
                    }
                    className={`px-3.5 py-1.5 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAdmin
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20'
                        : 'bg-rose-950/40 border border-rose-500/30 text-rose-300/70 hover:bg-rose-900/50'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Approve Session Revocation & Escalate</span>
                    {!isAdmin && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Session Revocation Executed & Credentials Frozen</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Body Content Grid */}
        <div className="p-5 space-y-6">
          {/* AI Access Review Panel */}
          <AIAccessReviewPanel
            review={activeRequest.aiReview}
            currentRole={currentPersona}
            requestStatus={activeRequest.currentStatus}
          />

          {/* Context Evidence Checklist */}
          <ContextEvidenceChecklist
            evidence={activeRequest.contextEvidence}
            employeeName={activeRequest.employeeName}
          />

          {/* Scope and Blast-Radius Preview */}
          <ScopeBlastRadiusPreview
            scope={activeRequest.scopePreview}
            requestStatus={activeRequest.currentStatus}
          />

          {/* Immutable Decision Timeline */}
          <AccessAuditTimeline timeline={activeRequest.auditTimeline} />
        </div>
      </div>

      {/* Modals */}
      <ApproveScopedAccessModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        request={activeRequest}
        reviewerName={actorName}
        reviewerRole={actorRole}
        onConfirm={handleConfirmApprove}
      />

      <RequestMoreContextModal
        isOpen={isRequestContextModalOpen}
        onClose={() => setIsRequestContextModalOpen(false)}
        request={activeRequest}
        reviewerName={actorName}
        reviewerRole={actorRole}
        onConfirm={handleConfirmRequestContext}
      />

      <DenyAccessModal
        isOpen={isDenyModalOpen}
        onClose={() => setIsDenyModalOpen(false)}
        request={activeRequest}
        reviewerName={actorName}
        reviewerRole={actorRole}
        onConfirm={handleConfirmDeny}
      />

      <DevrajRevocationModal
        isOpen={isDevrajRevokeModalOpen}
        onClose={() => setIsDevrajRevokeModalOpen(false)}
        reviewerName={actorName}
        reviewerRole={actorRole}
        onConfirm={handleConfirmDevrajRevocation}
      />
    </div>
  );
}
