import { gsap } from 'gsap';

export type ViewRenderer = () => void;

// Blue Archive inspired color palettes
const BA_PALETTES = [
  { primary: '#3B82F6', accent: '#60A5FA', bg: '#1E3A8A', cross: '#93C5FD' },   // Classic Blue
  { primary: '#F472B6', accent: '#FB7185', bg: '#9D174D', cross: '#FDA4AF' },   // Pink (Abydos)
  { primary: '#FBBF24', accent: '#F59E0B', bg: '#92400E', cross: '#FDE68A' },   // Gold (Millennium)
  { primary: '#34D399', accent: '#10B981', bg: '#065F46', cross: '#6EE7B7' },   // Green (Trinity)
  { primary: '#A78BFA', accent: '#8B5CF6', bg: '#4C1D95', cross: '#C4B5FD' },   // Purple (Gehenna)
  { primary: '#FB923C', accent: '#F97316', bg: '#9A3412', cross: '#FDBA74' },   // Orange (Shanhaijing)
  { primary: '#22D3EE', accent: '#06B6D4', bg: '#155E75', cross: '#67E8F9' },   // Cyan (SRT)
  { primary: '#F43F5E', accent: '#E11D48', bg: '#881337', cross: '#FDA4AF' },   // Rose (Red Winter)
];

export class Router {
  private container: HTMLElement;

  constructor() {
    // Create a reusable container for transition layers
    this.container = document.createElement('div');
    this.container.id = 'ba-transition-container';
    this.container.style.cssText = 'position:fixed;inset:0;z-index:10000;pointer-events:none;overflow:hidden;';
    document.body.appendChild(this.container);
  }

  async navigate(renderView: ViewRenderer) {
    const palette = BA_PALETTES[Math.floor(Math.random() * BA_PALETTES.length)];
    this.container.style.pointerEvents = 'all';
    this.container.innerHTML = '';

    // --- Layer 1: Diagonal sweep background ---
    const bg = document.createElement('div');
    bg.style.cssText = `position:absolute;inset:0;background:${palette.bg};transform:translateX(-110%) skewX(-15deg);`;
    this.container.appendChild(bg);

    // --- Layer 2: Primary color stripe ---
    const stripe = document.createElement('div');
    stripe.style.cssText = `position:absolute;inset:0;background:${palette.primary};transform:translateX(-110%) skewX(-15deg);`;
    this.container.appendChild(stripe);

    // --- Layer 3: Accent highlight thin bar ---
    const bar = document.createElement('div');
    bar.style.cssText = `position:absolute;top:0;left:0;width:110%;height:100%;background:${palette.accent};transform:translateX(-110%) skewX(-15deg);opacity:0.6;`;
    this.container.appendChild(bar);

    // --- Layer 4: Central cross / halo ---
    const cross = document.createElement('div');
    cross.innerHTML = `
      <svg viewBox="0 0 200 200" width="120" height="120" style="filter: drop-shadow(0 0 30px ${palette.cross});">
        <line x1="100" y1="20" x2="100" y2="180" stroke="${palette.cross}" stroke-width="6" stroke-linecap="round"/>
        <line x1="20" y1="100" x2="180" y2="100" stroke="${palette.cross}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="100" cy="100" r="35" fill="none" stroke="${palette.cross}" stroke-width="3" opacity="0.7"/>
        <circle cx="100" cy="100" r="55" fill="none" stroke="${palette.cross}" stroke-width="1.5" opacity="0.3"/>
      </svg>
    `;
    cross.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0) rotate(-90deg);opacity:0;z-index:5;`;
    this.container.appendChild(cross);

    // --- Layer 5: Decorative floating particles ---
    const particles = document.createElement('div');
    particles.style.cssText = 'position:absolute;inset:0;z-index:4;overflow:hidden;';
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      const size = 4 + Math.random() * 8;
      p.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        background:${palette.cross};
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        top:${10 + Math.random() * 80}%;
        left:${10 + Math.random() * 80}%;
        opacity:0;
        transform:rotate(${Math.random()*360}deg);
      `;
      p.className = 'ba-particle';
      particles.appendChild(p);
    }
    this.container.appendChild(particles);

    // --- PHASE 1: Sweep In ---
    const tl = gsap.timeline();

    tl.to(bg, { x: '0%', duration: 0.35, ease: 'power3.inOut' })
      .to(stripe, { x: '0%', duration: 0.35, ease: 'power3.inOut' }, '-=0.25')
      .to(bar, { x: '0%', duration: 0.3, ease: 'power3.inOut' }, '-=0.2')
      .to(cross, { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.15')
      .to('.ba-particle', {
        opacity: 0.8, scale: 1.5, duration: 0.3,
        stagger: { each: 0.03, from: 'random' }, ease: 'power2.out'
      }, '-=0.3');

    await tl.then();
    await new Promise(r => setTimeout(r, 120));

    // --- Execute view change while fully covered ---
    renderView();
    window.scrollTo(0, 0);

    // --- PHASE 2: Sweep Out (reverse direction) ---
    const tl2 = gsap.timeline();

    tl2.to(cross, { scale: 2, opacity: 0, rotation: 90, duration: 0.3, ease: 'power2.in' })
       .to('.ba-particle', { opacity: 0, scale: 0, duration: 0.2, stagger: 0.02 }, '-=0.2')
       .to(bar, { x: '110%', duration: 0.3, ease: 'power3.inOut' }, '-=0.1')
       .to(stripe, { x: '110%', duration: 0.35, ease: 'power3.inOut' }, '-=0.2')
       .to(bg, { x: '110%', duration: 0.35, ease: 'power3.inOut' }, '-=0.25');

    await tl2.then();

    // Cleanup
    this.container.innerHTML = '';
    this.container.style.pointerEvents = 'none';
  }
}
