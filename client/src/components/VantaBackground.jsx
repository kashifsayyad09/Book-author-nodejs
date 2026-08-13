import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Make THREE available globally too — Vanta's UMD bundles fall back to
// window.THREE if it isn't passed explicitly in options.
if (typeof window !== 'undefined' && !window.THREE) {
  window.THREE = THREE;
}

const loaders = {
  net: () => import('vanta/dist/vanta.net.min'),
  fog: () => import('vanta/dist/vanta.fog.min'),
  cells: () => import('vanta/dist/vanta.cells.min'),
};

/**
 * Living, ambient background powered by three.js + Vanta.
 * effect: 'net'   (constellation of connected nodes — the main library shell)
 *         'fog'   (drifting luminous mist — the auth / reading-room pages)
 *         'cells' (organic, pulsing cellular field — book detail & form pages)
 */
export default function VantaBackground({ effect = 'net', options = {}, className }) {
  const hostRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    loaders[effect]().then((mod) => {
      if (cancelled || !hostRef.current) return;
      const VANTA_EFFECT = mod.default;
      instanceRef.current = VANTA_EFFECT({
        el: hostRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        ...options,
      });
    });

    return () => {
      cancelled = true;
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
