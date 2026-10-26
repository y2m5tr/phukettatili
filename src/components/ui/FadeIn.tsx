import React from 'react';
import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  duration?: number;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  duration = 0.8,
}: FadeInProps) {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.25, 0.25, 0, 1], // easeOutQuart
      }}
      // SSR + hydration'sız kullanım için kritik: bu bileşen client:*
      // directive'i olmadan render edildiğinde framer-motion'un
      // whileInView'i asla çalışmaz (SSR'de initial prop'u inline
      // style olarak basar: opacity:0). Bu yüzden:
      // 1. SSR çıktısına .ptt-fade-in + CSS değişkenleri basılır —
      //    Layout'taki IntersectionObserver animasyonu devralır.
      // 2. initial: SSR'de false — inline opacity:0 BASILMAZ, görünmezlik
      //    tamamen .js .ptt-fade-in CSS kuralından gelir. Gözlemci
      //    .is-visible ekleyince inline style ile çakışmaz.
      // 3. JS yoksa CSS .js sınıfına bağlıdır → içerik görünür kalır (SEO).
      className={`ptt-fade-in ${className}`}
      initial={typeof window === 'undefined' ? false : {
        opacity: 0,
        ...directions[direction],
      }}
      style={
        {
          '--ptt-delay': `${delay}s`,
          '--ptt-duration': `${duration}s`,
          '--ptt-offset':
            direction === 'up'
              ? 'translateY(40px)'
              : direction === 'down'
                ? 'translateY(-40px)'
                : direction === 'left'
                  ? 'translateX(40px)'
                  : direction === 'right'
                    ? 'translateX(-40px)'
                    : 'none',
        } as React.CSSProperties
      }
    >
      {children}
    </motion.div>
  );
}
