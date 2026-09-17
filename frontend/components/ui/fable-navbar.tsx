// fable-navbar.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, ExternalLink } from 'lucide-react';

// Minimal custom Github Icon component from standard SVG / Lucide style
function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

interface FableNavbarProps {
  onOpenProductDemo?: () => void;
  onNavigateProduct?: () => void;
  className?: string;
  id?: string;
}

export function FableNavbar({
  onOpenProductDemo,
  onNavigateProduct,
  className = '',
  id = 'fable-top-navbar',
}: FableNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id={id}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 pointer-events-none ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav
          className={`pointer-events-auto flex items-center justify-between px-5 sm:px-6 py-3 rounded-full transition-all duration-300 ${
            isScrolled
              ? 'bg-[#09090c]/85 border border-white/[0.09] shadow-2xl shadow-black/60 backdrop-blur-xl'
              : 'bg-[#09090c]/40 border border-white/[0.05] backdrop-blur-md'
          }`}
        >
          {/* Left: Modest FABLE wordmark + minimal terracotta orbital dot */}
          <a
            href="#"
            className="flex items-center gap-2.5 group outline-none"
            aria-label="FABLE Home"
          >
            <div className="relative flex items-center justify-center w-5 h-5">
              <span className="w-2 h-2 rounded-full bg-[#C6613F] group-hover:scale-125 transition-transform duration-300" />
              <span className="absolute inset-0 rounded-full border border-[#C6613F]/40 animate-ping opacity-60" />
            </div>
            <span className="font-sans font-bold tracking-wider text-sm text-zinc-200 group-hover:text-white transition-colors">
              FABLE
            </span>
          </a>

          {/* Center / Right: Desktop Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wide">
            <a
              href="#"
              className="text-zinc-300 hover:text-white transition-colors relative py-1 hover:after:w-full after:w-0 after:h-[1.5px] after:bg-[#C6613F] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300"
            >
              Home
            </a>

            <button
              onClick={() => {
                if (onNavigateProduct) {
                  onNavigateProduct();
                } else if (onOpenProductDemo) {
                  onOpenProductDemo();
                }
              }}
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer relative py-1 hover:after:w-full after:w-0 after:h-[1.5px] after:bg-[#C6613F] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300"
            >
              Product
            </button>

            <a
              href="#how-it-works"
              className="text-zinc-300 hover:text-white transition-colors relative py-1 hover:after:w-full after:w-0 after:h-[1.5px] after:bg-[#C6613F] after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300"
            >
              How it works
            </a>

            <div className="w-[1px] h-3.5 bg-zinc-800" />

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
              aria-label="Fable on GitHub"
            >
              <GithubIcon className="w-4 h-4" />
              <span className="text-[11px] font-mono opacity-80">v1.4</span>
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-zinc-300 hover:text-white p-1.5 rounded-lg border border-white/[0.08] bg-zinc-900/50 backdrop-blur"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </nav>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto md:hidden mt-2 p-4 rounded-2xl bg-[#0a0a0d]/95 border border-white/[0.08] backdrop-blur-2xl shadow-2xl flex flex-col gap-3.5 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            >
              Home
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProductDemo?.();
              }}
              className="text-left px-3 py-2 rounded-lg text-zinc-200 hover:bg-zinc-800/50 transition-colors flex items-center justify-between"
            >
              <span>Product Demo</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#C6613F]/20 text-[#C6613F] border border-[#C6613F]/30">
                Interactive
              </span>
            </button>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            >
              How it works
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/50 flex items-center gap-2"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
