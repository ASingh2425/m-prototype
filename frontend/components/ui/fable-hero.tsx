'use client';

// fable-hero.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { FableNavbar } from './fable-navbar';
import { FableMoonScene } from './fable-moon-scene';
import { FlowButton } from './flow-button';
import { ProductDemoModal } from './product-demo-modal';

interface FableHeroProps {
  onCheckItOut?: () => void;
  className?: string;
}

export function FableHero({ onCheckItOut, className = '' }: FableHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const defaultBlockRef = useRef<HTMLDivElement>(null);
  const alternateBlockRef = useRef<HTMLDivElement>(null);
  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const navbarWrapperRef = useRef<HTMLDivElement>(null);

  // States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [introProgress, setIntroProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Split text for FABLE & alternate line
  const defaultText = 'FABLE';
  const alternateText = 'I WILL FIND YOU';

  // Mouse Parallax tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMousePos({ x, y });
  }, []);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const progress = Math.min(Math.max(scrollY / (windowHeight * 1.5), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  // Shared identical animation configurations for title entrance & swap
  const getAnimationConfig = useCallback((reducedMotion: boolean) => ({
    initial: {
      opacity: 0,
      y: reducedMotion ? 0 : 70,
      filter: reducedMotion ? 'none' : 'blur(16px)',
      scale: 0.9,
    },
    enter: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      duration: reducedMotion ? 0.3 : 1.2,
      stagger: 0.07,
      ease: 'power4.out',
    },
    exit: {
      opacity: 0,
      y: reducedMotion ? 0 : -60,
      filter: reducedMotion ? 'none' : 'blur(14px)',
      scale: 0.92,
      duration: reducedMotion ? 0.2 : 0.45,
      stagger: 0.03,
      ease: 'power3.in',
    },
  }), []);

  // Entrance Sequence (GSAP Timeline)
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animConfig = getAnimationConfig(prefersReducedMotion);

    // Initial state: hide elements
    if (navbarWrapperRef.current) gsap.set(navbarWrapperRef.current, { opacity: 0, y: -20 });
    if (subtitleRef.current) gsap.set(subtitleRef.current, { opacity: 0, y: 24, filter: 'blur(8px)' });
    if (ctaContainerRef.current) gsap.set(ctaContainerRef.current, { opacity: 0, y: 30, scale: 0.95 });

    const defaultChars = titleContainerRef.current?.querySelectorAll('.title-char-default');
    const alternateChars = titleContainerRef.current?.querySelectorAll('.title-char-alternate');

    if (defaultChars) {
      gsap.set(defaultChars, animConfig.initial);
    }

    // Ensure alternate characters and wrapper are strictly hidden on mount
    if (alternateBlockRef.current) {
      alternateBlockRef.current.style.visibility = 'hidden';
      alternateBlockRef.current.style.pointerEvents = 'none';
    }
    if (alternateChars) {
      gsap.set(alternateChars, animConfig.initial);
    }

    const tl = gsap.timeline({
      delay: 0.15,
      onComplete: () => setIsReady(true),
    });

    // Step 1: Hold briefly on stars (0.2s)
    // Step 2 & 3: Moon fades/scales in & Dust ring assembles (0.7s)
    const introObj = { progress: 0 };
    tl.to(introObj, {
      progress: 1,
      duration: prefersReducedMotion ? 0.2 : 0.85,
      ease: 'power2.out',
      onUpdate: () => setIntroProgress(introObj.progress),
    });

    // Step 4: "FABLE" letters stagger up from below with blur-to-sharp focus and slight overshoot
    if (defaultChars && defaultChars.length > 0) {
      tl.fromTo(
        defaultChars,
        animConfig.initial,
        animConfig.enter,
        '-=0.35'
      );

      // Brief soft terracotta glow pulse on settle
      tl.to(
        titleContainerRef.current,
        {
          textShadow: '0 0 35px rgba(198, 97, 63, 0.75), 0 0 65px rgba(198, 97, 63, 0.4)',
          duration: 0.4,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        },
        '-=0.2'
      );
    }

    // Step 5: Subtitle line fades up
    if (subtitleRef.current) {
      tl.to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.4'
      );
    }

    // Step 6: Nav bar and CTA button settle in last
    if (navbarWrapperRef.current) {
      tl.to(
        navbarWrapperRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
        },
        '-=0.5'
      );
    }

    if (ctaContainerRef.current) {
      tl.to(
        ctaContainerRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
        },
        '-=0.5'
      );
    }

    return () => {
      tl.kill();
    };
  }, [getAnimationConfig]);

  // Hover-in: "FABLE" -> "I WILL FIND YOU" using identical entrance animation
  const handleTitleMouseEnter = () => {
    if (!isReady) return;
    setIsTitleHovered(true);

    const defaultChars = titleContainerRef.current?.querySelectorAll('.title-char-default');
    const alternateChars = titleContainerRef.current?.querySelectorAll('.title-char-alternate');
    if (!defaultChars || !alternateChars) return;

    activeTimelineRef.current?.kill();
    gsap.killTweensOf(defaultChars);
    gsap.killTweensOf(alternateChars);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animConfig = getAnimationConfig(prefersReducedMotion);

    // Make alternate text container visible
    if (alternateBlockRef.current) {
      alternateBlockRef.current.style.visibility = 'visible';
      alternateBlockRef.current.style.pointerEvents = 'auto';
    }

    const hoverTl = gsap.timeline();
    activeTimelineRef.current = hoverTl;

    // Animate out "FABLE"
    hoverTl.to(defaultChars, {
      ...animConfig.exit,
      onComplete: () => {
        if (defaultBlockRef.current) {
          defaultBlockRef.current.style.visibility = 'hidden';
          defaultBlockRef.current.style.pointerEvents = 'none';
        }
      },
    });

    // Animate in "I WILL FIND YOU" using identical entrance animation parameters
    hoverTl.fromTo(
      alternateChars,
      animConfig.initial,
      animConfig.enter,
      '-=0.25'
    );
  };

  // Hover-out: "I WILL FIND YOU" -> back to "FABLE" using identical entrance animation
  const handleTitleMouseLeave = () => {
    if (!isReady) return;

    const defaultChars = titleContainerRef.current?.querySelectorAll('.title-char-default');
    const alternateChars = titleContainerRef.current?.querySelectorAll('.title-char-alternate');
    if (!defaultChars || !alternateChars) {
      setIsTitleHovered(false);
      return;
    }

    activeTimelineRef.current?.kill();
    gsap.killTweensOf(defaultChars);
    gsap.killTweensOf(alternateChars);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animConfig = getAnimationConfig(prefersReducedMotion);

    // Make default text container visible
    if (defaultBlockRef.current) {
      defaultBlockRef.current.style.visibility = 'visible';
      defaultBlockRef.current.style.pointerEvents = 'auto';
    }

    const leaveTl = gsap.timeline({
      onComplete: () => {
        setIsTitleHovered(false);
      },
    });
    activeTimelineRef.current = leaveTl;

    // Animate out "I WILL FIND YOU"
    leaveTl.to(alternateChars, {
      ...animConfig.exit,
      onComplete: () => {
        if (alternateBlockRef.current) {
          alternateBlockRef.current.style.visibility = 'hidden';
          alternateBlockRef.current.style.pointerEvents = 'none';
        }
      },
    });

    // Animate in "FABLE" using identical entrance animation parameters
    leaveTl.fromTo(
      defaultChars,
      animConfig.initial,
      animConfig.enter,
      '-=0.25'
    );
  };

  // Click CTA action
  const handleCtaClick = () => {
    if (onCheckItOut) {
      onCheckItOut();
    } else {
      setIsDemoModalOpen(true);
    }
  };

  return (
    <section
      id="fable-hero-section"
      ref={containerRef}
      className={`relative w-full h-[100vh] min-h-[680px] bg-[#060608] text-white overflow-hidden select-none ${className}`}
    >
      {/* 1. Navbar Layer */}
      <div ref={navbarWrapperRef}>
        <FableNavbar
          onOpenProductDemo={() => setIsDemoModalOpen(true)}
          onNavigateProduct={onCheckItOut}
        />
      </div>

      {/* 2. Pinned Cosmic Canvas Layer: Fixed in viewport background */}
      <div
        className="fixed inset-0 w-full h-full pointer-events-auto z-0 transition-opacity duration-300"
        style={{
          opacity: 1 - scrollProgress * 0.7,
        }}
      >
        <FableMoonScene
          scrollProgress={scrollProgress}
          mousePos={mousePos}
          introProgress={introProgress}
        />
      </div>

      {/* 3. Hero Content Foreground Layer (Pinned / reacts to scroll) */}
      <div
        ref={heroContentRef}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-20 pb-12 px-4 sm:px-6 pointer-events-none"
        style={{
          transform: `translateY(-${scrollProgress * 85}px)`,
          opacity: Math.max(0, 1 - scrollProgress * 1.6),
        }}
      >
        {/* Center: Title + Subtitle Block + FlowButton CTA */}
        <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto pointer-events-auto">
          {/* Subtle Category Pill above Title */}
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-zinc-950/40 backdrop-blur-md text-[11px] font-mono tracking-widest uppercase text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6613F]" />
            <span>Insider Threat Intelligence</span>
          </div>

          {/* "FABLE" Wordmark with Interactive Hover Swap */}
          <div
            ref={titleContainerRef}
            onMouseEnter={handleTitleMouseEnter}
            onMouseLeave={handleTitleMouseLeave}
            className="cursor-pointer group relative py-2 px-6 flex items-center justify-center min-h-[90px] sm:min-h-[140px] md:min-h-[170px]"
            aria-label="FABLE - I WILL FIND YOU"
          >
            {/* Default Display: "FABLE" (Large, Terracotta #C6613F) */}
            <div
              ref={defaultBlockRef}
              className="relative z-10 flex items-center justify-center"
              aria-hidden={isTitleHovered}
            >
              <h1
                className="text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-black tracking-tighter text-[#C6613F] font-sans"
                style={{
                  textShadow:
                    '0 0 35px rgba(198, 97, 63, 0.4), 0 0 70px rgba(198, 97, 63, 0.2)',
                }}
              >
                {defaultText.split('').map((char, i) => (
                  <span
                    key={i}
                    className="title-char title-char-default inline-block mx-[0.02em] transform-gpu"
                  >
                    {char}
                  </span>
                ))}
              </h1>
            </div>

            {/* Alternate Hover Copy: "I WILL FIND YOU" (Saturated Red with Layered Glowing Bloom) */}
            <div
              ref={alternateBlockRef}
              className="absolute inset-0 flex items-center justify-center text-center pointer-events-none"
              style={{ visibility: 'hidden' }}
              aria-hidden={!isTitleHovered}
            >
              <h2
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight font-sans select-none whitespace-nowrap"
                style={{
                  color: '#E8342A',
                  textShadow:
                    '0 0 20px rgba(232, 52, 42, 0.85), 0 0 45px rgba(232, 52, 42, 0.6), 0 0 90px rgba(232, 52, 42, 0.35)',
                }}
              >
                {alternateText.split('').map((char, i) => (
                  <span
                    key={i}
                    className="title-char title-char-alternate inline-block transform-gpu"
                    style={{
                      whiteSpace: char === ' ' ? 'pre' : 'normal',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </h2>
            </div>
          </div>

          {/* Subtitle (persistent, beneath title, smaller/muted) */}
          <div
            ref={subtitleRef}
            className="mt-3 sm:mt-5 text-zinc-400 text-sm sm:text-base md:text-lg font-normal tracking-wide max-w-lg mx-auto"
          >
            <p>Watch what&apos;s explained. Investigate what isn&apos;t.</p>
          </div>

          {/* Lower Third CTA: FlowButton with vertical breathing room from subtitle */}
          <div ref={ctaContainerRef} className="mt-14 sm:mt-16 pointer-events-auto">
            <FlowButton
              text="Check it out"
              onClick={handleCtaClick}
              id="fable-hero-cta"
            />
          </div>
        </div>

        {/* Subtle Scroll Hint Indicator anchored at bottom */}
        <div
          className="absolute bottom-6 inset-x-0 flex flex-col items-center justify-center gap-1.5 text-xs font-mono text-zinc-500 pointer-events-none transition-opacity duration-300"
          style={{ opacity: Math.max(0, 1 - scrollProgress * 2.5) }}
        >
          <span className="tracking-widest uppercase text-[10px]">Explore</span>
          <div className="w-4 h-7 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-1.5 bg-[#C6613F] rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Interactive Product Demo Modal */}
      <ProductDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </section>
  );
}
