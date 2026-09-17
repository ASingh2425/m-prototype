// App.tsx
import React, { useState, useEffect } from 'react';
import { FableHero } from '../components/ui/fable-hero';
import { Shield, Eye, Cpu, Sparkles } from 'lucide-react';
import { DemoOne } from '../components/ui/demo';
import { OrgOverview } from './components/OrgOverview';
import { CaseDetailPage } from './components/CaseDetailPage';
import { useEntities } from './useEntities';

type PageRoute =
  | { path: 'home' }
  | { path: 'product' }
  | { path: 'case'; caseId: string };

export default function App() {
  const [viewMode, setViewMode] = useState<'fable' | 'reference'>('fable');
  const [route, setRoute] = useState<PageRoute>(() => {
    // Check initial window location if available
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/product/case/')) {
        const caseId = pathname.replace('/product/case/', '');
        return { path: 'case', caseId };
      }
      if (pathname === '/product') {
        return { path: 'product' };
      }
    }
    return { path: 'home' };
  });

  const {
    entities,
    getEntityById,
    updateEntityCaseStatus,
  } = useEntities();

  // Keep browser history / url aligned smoothly without reloading
  const navigateTo = (newRoute: PageRoute) => {
    setRoute(newRoute);
    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (newRoute.path === 'product') targetPath = '/product';
      if (newRoute.path === 'case') targetPath = `/product/case/${newRoute.caseId}`;
      window.history.pushState({}, '', targetPath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/product/case/')) {
        const caseId = pathname.replace('/product/case/', '');
        setRoute({ path: 'case', caseId });
      } else if (pathname === '/product') {
        setRoute({ path: 'product' });
      } else {
        setRoute({ path: 'home' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (viewMode === 'reference') {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setViewMode('fable')}
            className="px-4 py-2 rounded-full text-xs font-mono font-semibold bg-[#C6613F] text-black hover:bg-[#C6613F]/90 shadow-lg cursor-pointer"
          >
            ← Back to FABLE
          </button>
        </div>
        <DemoOne />
      </div>
    );
  }

  // 1. Case Detail direct route: /product/case/:caseId
  if (route.path === 'case') {
    const activeEntity = getEntityById(route.caseId) || entities[0];
    return (
      <CaseDetailPage
        caseId={route.caseId}
        entity={activeEntity}
        onBack={() => navigateTo({ path: 'product' })}
        onUpdateStatus={(status) => updateEntityCaseStatus(route.caseId, status)}
      />
    );
  }

  // 2. Product Org Overview route: /product
  if (route.path === 'product') {
    return (
      <OrgOverview
        entities={entities}
        onNavigateHome={() => navigateTo({ path: 'home' })}
        onUpdateEntityCaseStatus={updateEntityCaseStatus}
        onNavigateToCase={(caseId) => navigateTo({ path: 'case', caseId })}
      />
    );
  }

  // 3. Home Route (Preserves untouched FableHero exactly)
  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 font-sans selection:bg-[#C6613F]/30 selection:text-white">
      {/* Primary Deliverable: The FABLE Hero Section with CTA routing to /product */}
      <FableHero onCheckItOut={() => navigateTo({ path: 'product' })} />

      {/* Structured Next Section: Architecture & Flowchart */}
      <section
        id="how-it-works"
        className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 py-28 border-t border-white/[0.06] bg-[#060608]/90 backdrop-blur-xl"
      >
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-zinc-900/50 text-[11px] font-mono tracking-widest uppercase text-zinc-400 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C6613F]" />
            <span>Architecture & Flowchart</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Insider threats never look like attacks.{' '}
            <span className="text-zinc-400 font-normal">They look like work.</span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
            Standard endpoint agents watch for malware signatures. FABLE maps intent:
            distinguishing between late-night engineering crunches and systematic data theft.
          </p>
        </div>

        {/* 3-Step Flowchart Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-[#09090d] border border-white/[0.07] hover:border-[#C6613F]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#C6613F]/10 border border-[#C6613F]/20 flex items-center justify-center text-[#C6613F] mb-5">
              <Eye className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-[#C6613F] font-semibold uppercase tracking-wider mb-2">
              Stage 01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Passive Signal Ingestion</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Consumes Git activity, credential swaps, shell sessions, and cloud IAM
              telemetry in real time without invasive endpoint lag.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#09090d] border border-white/[0.07] hover:border-[#C6613F]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#C6613F]/10 border border-[#C6613F]/20 flex items-center justify-center text-[#C6613F] mb-5">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-[#C6613F] font-semibold uppercase tracking-wider mb-2">
              Stage 02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Narrative Graph Engine</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Constructs behavioral storylines behind every privilege spike. Correlates resignation
              signals, unusual access hours, and staging directories.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#09090d] border border-white/[0.07] hover:border-[#C6613F]/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#C6613F]/10 border border-[#C6613F]/20 flex items-center justify-center text-[#C6613F] mb-5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-[#C6613F] font-semibold uppercase tracking-wider mb-2">
              Stage 03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Protective Hold</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Takes surgical, zero-lag action: revoking ephemeral access tokens and capturing memory
              dumps before exfiltration packets leave the perimeter.
            </p>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="mt-20 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-300">FABLE</span>
            <span>•</span>
            <span>Insider Threat Intelligence</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo({ path: 'product' })}
              className="text-[#C6613F] hover:text-[#E07B57] underline underline-offset-4 cursor-pointer"
            >
              Open Org Overview (/product)
            </button>
            <span>•</span>
            <button
              onClick={() => setViewMode('reference')}
              className="text-zinc-400 hover:text-zinc-200 underline underline-offset-4 decoration-zinc-700 cursor-pointer"
            >
              Horizon Reference
            </button>
            <span>•</span>
            <span>© {new Date().getFullYear()} FABLE Security Inc.</span>
          </div>
        </footer>
      </section>
    </div>
  );
}
