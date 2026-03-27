<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Field Interview — Stephan · GoNepal</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        hsl(40 30% 98%);
  --fg:        hsl(220 20% 15%);
  --primary:   hsl(220 60% 25%);
  --secondary: hsl(35 40% 92%);
  --accent:    hsl(25 85% 55%);
  --accent-fg: hsl(40 30% 98%);
  --muted:     hsl(35 25% 90%);
  --muted-fg:  hsl(220 15% 45%);
  --border:    hsl(35 30% 85%);
  --gold:      hsl(38 90% 50%);
  --forest:    hsl(160 40% 25%);
  --r: 0.75rem;
  --shadow-card: 0 8px 30px -8px hsl(220 20% 15% / 0.12);
  --shadow-up:   0 20px 50px -15px hsl(220 20% 15% / 0.22);
}

html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg);
  color: var(--fg);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  cursor: auto;
}

/* ── SCROLL PROGRESS BAR ── */
#progress-bar {
  position: fixed;
  top: 0; left: 0;
  height: 3px;
  width: 0%;
  background: linear-gradient(90deg, var(--primary), var(--gold), var(--accent));
  z-index: 1000;
  transition: width 0.05s linear;
}

/* ── GRAIN OVERLAY ── */
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.025;
  pointer-events: none;
  z-index: 500;
}

/* ══ HERO ══ */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  position: sticky;
  top: 0;
  z-index: 1;
}
@media(max-width:768px){
  .hero { grid-template-columns: 1fr; min-height: auto; position: relative; }
}

/* left panel */
.hero-left {
  background: var(--primary);
  padding: 56px 52px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  z-index: 2;
}
.hero-left::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 0% 100%, hsl(25 85% 45% / 0.25) 0%, transparent 60%),
    radial-gradient(ellipse at 100% 0%,  hsl(200 70% 55% / 0.1) 0%, transparent 55%);
  pointer-events: none;
}
/* animated orb */
.hero-left::after {
  content: '';
  position: absolute;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: hsl(38 90% 50% / 0.07);
  bottom: -80px; right: -80px;
  animation: orb-float 7s ease-in-out infinite;
  pointer-events: none;
}
@keyframes orb-float {
  0%,100% { transform: translate(0,0) scale(1); }
  50%      { transform: translate(-20px,-20px) scale(1.08); }
}

.hero-logo {
  font-family: 'Playfair Display', serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: hsl(40 30% 98% / 0.4);
  position: relative;
  animation: fadeUp .5s ease both;
}

.hero-copy { position: relative; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 0.67rem; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 24px;
  animation: fadeUp .55s .05s ease both;
}
.eyebrow-line { width: 26px; height: 1px; background: var(--gold); opacity: .7; }

.hero-h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.4rem, 4vw, 3.7rem);
  font-weight: 700;
  line-height: 1.08;
  color: hsl(40 30% 98%);
  margin-bottom: 36px;
  animation: fadeUp .6s .1s ease both;
  overflow: hidden;
}
.hero-h1 em { font-style: italic; color: var(--gold); }

/* word-by-word reveal spans (JS adds these) */
.word { display: inline-block; }

.hero-meta-stack {
  display: flex; flex-direction: column; gap: 10px;
  animation: fadeUp .65s .15s ease both;
}
.hero-meta-row {
  display: flex; align-items: center; gap: 9px;
  font-size: 0.79rem;
  color: hsl(40 30% 98% / 0.48);
}
.hero-meta-row svg { flex-shrink: 0; opacity: .5; }
.hero-meta-row b { color: hsl(40 30% 98% / 0.82); font-weight: 500; }

.hero-tags {
  display: flex; gap: 10px; flex-wrap: wrap;
  animation: fadeUp .7s .2s ease both;
  position: relative;
}
.hero-tag {
  font-size: 0.64rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: hsl(40 30% 98% / 0.36);
  border: 1px solid hsl(40 30% 98% / 0.13);
  padding: 5px 13px;
  border-radius: 999px;
  transition: color .2s, border-color .2s, transform .2s;
}
.hero-tag:hover {
  color: hsl(40 30% 98% / 0.7);
  border-color: hsl(40 30% 98% / 0.3);
  transform: translateY(-2px);
}

/* right photo panel */
.hero-right {
  position: relative;
  overflow: hidden;
  background: hsl(220 20% 10%);
}
@media(max-width:768px){ .hero-right { height: 60vw; min-height: 260px; } }

.hero-right img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 20%;
  display: block;
  /* NO TRANSFORM - keep image static */
}
.hero-right::after {
  content: '';
  position: absolute; inset: 0;
  background:
    linear-gradient(to right, var(--primary) 0%, transparent 32%),
    linear-gradient(to top, hsl(220 20% 6% / 0.5) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
}
.photo-label {
  position: absolute;
  bottom: 18px; right: 18px;
  z-index: 2;
  font-size: 0.67rem; font-weight: 500;
  letter-spacing: 0.05em;
  color: hsl(40 30% 98% / 0.5);
  text-align: right; line-height: 1.55;
}

/* scroll-down cue */
.scroll-cue {
  position: absolute;
  bottom: 28px; left: 52px;
  display: flex; align-items: center; gap: 10px;
  font-size: 0.65rem; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: hsl(40 30% 98% / 0.3);
  animation: fadeUp .8s .4s ease both;
  z-index: 3;
  cursor: pointer;
  transition: color 0.3s;
}
.scroll-cue:hover {
  color: hsl(40 30% 98% / 0.6);
}
.scroll-cue-line {
  width: 30px; height: 1px;
  background: hsl(40 30% 98% / 0.2);
  position: relative; overflow: hidden;
}
.scroll-cue-line::after {
  content: '';
  position: absolute; inset: 0;
  background: var(--gold);
  animation: line-sweep 2s ease-in-out infinite;
}
@keyframes line-sweep {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(0); }
  100% { transform: translateX(100%); }
}

/* ══ CONTENT BELOW HERO (scrolls over sticky) ══ */
.content-over {
  position: relative;
  z-index: 10;
  background: var(--bg);
  border-radius: 28px 28px 0 0;
  margin-top: -28px;
  box-shadow: 0 -4px 40px hsl(220 20% 15% / 0.08);
}

/* ── PAGE BODY ── */
.page {
  max-width: 880px;
  margin: 0 auto;
  padding: 72px 32px 0;
}
@media(max-width:560px){ .page { padding: 56px 20px 0; } }

/* ── SECTION LABEL ── */
.s-label {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 0.67rem; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 12px;
}
.s-label::before {
  content: ''; display: block;
  width: 22px; height: 2px;
  background: var(--accent); border-radius: 2px;
}
.s-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.45rem, 3.2vw, 2rem);
  font-weight: 600; line-height: 1.2;
  color: var(--fg); margin-bottom: 24px;
}

/* ── PULL QUOTE ── */
.pq-wrap { padding-bottom: 0; }
.pq-grid {
  display: grid;
  grid-template-columns: 3px 1fr;
  gap: 0 32px; align-items: start;
}
.pq-bar {
  background: var(--gold); border-radius: 3px;
  align-self: stretch;
  transform: scaleY(0); transform-origin: top;
  transition: transform .8s cubic-bezier(.16,1,.3,1);
}
.pq-bar.in { transform: scaleY(1); }

.pq-text {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.3rem, 2.8vw, 1.72rem);
  font-weight: 400; font-style: italic;
  line-height: 1.52; color: var(--fg);
}
.pq-text strong { font-style: normal; font-weight: 700; color: var(--primary); }
.pq-attr {
  margin-top: 14px;
  font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--muted-fg);
}

/* ── REVIEWER ROW ── */
.reviewer-wrap { padding: 64px 0 0; }
.reviewer-card {
  display: flex; align-items: center; gap: 22px;
  padding: 26px 30px;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--r);
  box-shadow: var(--shadow-card);
  transition: box-shadow .25s, transform .25s;
  cursor: default;
}
.reviewer-card:hover { box-shadow: var(--shadow-up); transform: translateY(-2px); }

.rev-icon {
  width: 50px; height: 50px; border-radius: 50%;
  background: var(--primary);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}
.reviewer-card:hover .rev-icon {
  transform: scale(1.1);
}
.rev-icon svg { opacity: .85; }
.rev-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem; font-weight: 600; color: var(--fg); margin-bottom: 3px;
}
.rev-sub { font-size: 0.78rem; color: var(--muted-fg); margin-bottom: 9px; }
.stars { display: flex; gap: 3px; }
.star { font-size: 0.95rem; color: var(--muted); transition: color 0.2s; }
.star.on { color: var(--gold); }
.rev-sep { width: 1px; align-self: stretch; background: var(--border); margin: 0 6px; }
.rev-stat { text-align: center; padding: 0 4px; }
.rev-stat-n {
  font-family: 'Playfair Display', serif;
  font-size: 1.55rem; font-weight: 700;
  color: var(--primary); line-height: 1; margin-bottom: 4px;
}
.rev-stat-l {
  font-size: 0.63rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--muted-fg); line-height: 1.4;
}
@media(max-width:500px){ .reviewer-card { flex-wrap: wrap; } .rev-sep { display: none; } }

/* ── FEATURES ── */
.feat-wrap { padding: 64px 0 0; }
.feat-list {
  border: 1px solid var(--border);
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.feat-row {
  display: grid;
  grid-template-columns: 46px 1fr auto;
  align-items: center; gap: 18px;
  padding: 20px 26px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  transition: background .18s, transform .18s;
  cursor: default;
}
.feat-row:last-child { border-bottom: none; }
.feat-row:hover { background: var(--secondary); transform: translateX(4px); }
.feat-row.hi { background: hsl(220 60% 25% / 0.04); }
.feat-row.hi:hover { background: hsl(220 60% 25% / 0.08); }

.feat-ico {
  width: 40px; height: 40px; border-radius: 10px;
  background: var(--primary);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: transform .2s ease, background .2s ease;
}
.feat-row:hover .feat-ico { transform: scale(1.08); }
.feat-row.hi .feat-ico { background: var(--accent); }

.feat-b h3 {
  font-family: 'Playfair Display', serif;
  font-size: 0.98rem; font-weight: 600; color: var(--fg); margin-bottom: 3px;
}
.feat-b p { font-size: 0.79rem; color: var(--muted-fg); line-height: 1.6; }

.feat-badge {
  font-size: 0.62rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 4px 11px; border-radius: 999px;
  white-space: nowrap; flex-shrink: 0;
  background: var(--muted); color: var(--muted-fg);
  transition: transform 0.2s ease;
}
.feat-row:hover .feat-badge {
  transform: scale(1.05);
}
.feat-row.hi .feat-badge { background: var(--accent); color: var(--accent-fg); }
@media(max-width:480px){ .feat-row { grid-template-columns: 40px 1fr; } .feat-badge { display: none; } }

/* ── VIDEO ── */
.video-wrap { padding: 64px 0 0; }
.video-shell {
  position: relative;
  width: 100%; padding-bottom: 56.25%;
  border-radius: var(--r);
  overflow: hidden;
  box-shadow: var(--shadow-up);
  background: hsl(220 20% 10%);
  transition: box-shadow .3s, transform .3s;
  cursor: pointer;
}
.video-shell:hover { box-shadow: 0 28px 60px -18px hsl(220 20% 15% / 0.3); transform: translateY(-3px); }
.video-shell iframe {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  border: none; display: block;
}
.video-caption {
  margin-top: 11px;
  font-size: 0.74rem; color: var(--muted-fg); letter-spacing: 0.03em;
}

/* ── TWO CARDS ── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px; padding: 64px 0 0;
}
@media(max-width:580px){ .two-col { grid-template-columns: 1fr; } }

.info-card {
  border-radius: var(--r);
  border: 1px solid var(--border);
  padding: 30px;
  box-shadow: var(--shadow-card);
  position: relative; overflow: hidden;
  transition: transform .25s ease, box-shadow .25s ease;
  cursor: default;
}
.info-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-up); }
.info-card::before {
  content: ''; position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
}
.card-dark { background: var(--primary); border-color: transparent; }
.card-dark::before { background: var(--gold); }
.card-light { background: hsl(160 40% 25% / 0.05); border-color: hsl(160 40% 25% / 0.2); }
.card-light::before { background: var(--forest); }

.card-ico {
  width: 38px; height: 38px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
  transition: transform 0.3s ease;
}
.info-card:hover .card-ico {
  transform: scale(1.1);
}
.card-dark .card-ico  { background: hsl(40 30% 98% / 0.1); }
.card-light .card-ico { background: hsl(160 40% 25% / 0.12); }

.card-eye {
  font-size: 0.62rem; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 9px;
}
.card-dark .card-eye  { color: var(--gold); }
.card-light .card-eye { color: var(--forest); }

.card-ttl {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem; font-weight: 700; line-height: 1.3; margin-bottom: 11px;
}
.card-dark .card-ttl  { color: hsl(40 30% 98%); }
.card-light .card-ttl { color: var(--fg); }

.card-txt { font-size: 0.84rem; line-height: 1.68; }
.card-dark .card-txt  { color: hsl(40 30% 98% / 0.7); }
.card-light .card-txt { color: var(--muted-fg); }

.card-tag {
  display: inline-block; margin-top: 16px;
  font-size: 0.62rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 4px 12px; border-radius: 999px;
  background: var(--forest); color: hsl(40 30% 98%);
  transition: transform 0.2s ease, background 0.2s ease;
}
.card-tag:hover {
  transform: scale(1.05);
  background: hsl(160 40% 20%);
}

/* ── FOOTER ── */
.footer-line { height: 1px; background: var(--border); margin: 80px 0 0; }
footer {
  max-width: 880px; margin: 0 auto;
  padding: 36px 32px 52px;
  display: flex; align-items: center;
  justify-content: space-between; flex-wrap: wrap; gap: 10px;
}
.footer-logo {
  font-family: 'Playfair Display', serif;
  font-size: 0.95rem; font-weight: 700;
  letter-spacing: 0.06em; color: var(--primary);
}
.footer-sub { font-size: 0.75rem; color: var(--muted-fg); }

/* ── REVEAL ── */
.r {
  opacity: 0; transform: translateY(28px);
  transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1);
}
.r.in { opacity: 1; transform: none; }
.d1 { transition-delay: .08s; }
.d2 { transition-delay: .16s; }
.d3 { transition-delay: .24s; }
.d4 { transition-delay: .32s; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: none; }
}
</style>
<base target="_blank">
</head>
<body>

<!-- scroll progress -->
<div id="progress-bar"></div>

<!-- ══ HERO (sticky) ══ -->
<section class="hero" id="hero">
  <div class="hero-left">
    <div class="hero-logo">GoNepal</div>

    <div class="hero-copy">
      <div class="hero-eyebrow">
        <span class="eyebrow-line"></span>
        Field Interview · Pokhara
      </div>
      <h1 class="hero-h1" id="hero-title">
        What a Canadian<br/>
        traveller said<br/>
        near <em>Phewa Tal</em>
      </h1>
      <div class="hero-meta-stack">
        <div class="hero-meta-row">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Interviewer: Nishant &nbsp;·&nbsp; <b>Stephan, Canada</b>
        </div>
        <div class="hero-meta-row">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <b>Lakeside, Pokhara, Nepal</b>
        </div>
      </div>
    </div>

    <div>
      <div class="hero-tags">
        <span class="hero-tag">User Research</span>
        <span class="hero-tag">Feature Feedback</span>
      </div>
      <div class="scroll-cue" onclick="document.querySelector('.content-over').scrollIntoView({behavior: 'smooth'})">
        <span class="scroll-cue-line"></span>
        Scroll to read
      </div>
    </div>
  </div>

  <div class="hero-right">
    <img
      src="https://i.ibb.co/93hKfLLP/656191920-1677060123707598-7574505493526533434-n-1.jpg"
      alt="Nishant interviewing Stephan near Phewa Tal Lakeside, Pokhara"
    />
    <div class="photo-label">Phewa Tal Lakeside<br/>Pokhara, Nepal</div>
  </div>
</section>

<!-- ══ CONTENT OVER STICKY HERO ══ -->
<div class="content-over">
<div class="page">

  <!-- Pull quote -->
  <div class="pq-wrap r">
    <div class="pq-grid">
      <div class="pq-bar"></div>
      <div>
        <p class="pq-text">
          When asked which feature he'd actually reach for —
          <strong>"Maybe the translation."</strong>
          Unprompted. Before anything else. That's the clearest signal from the whole session.
        </p>
        <div class="pq-attr">Stephan's first answer · Feature preference</div>
      </div>
    </div>
  </div>

  <!-- Reviewer -->
  <div class="reviewer-wrap r d1">
    <div class="s-label">Participant</div>
    <div class="reviewer-card">
      <div class="rev-icon">
        <svg width="22" height="22" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div style="flex:1">
        <div class="rev-name">Stephan</div>
        <div class="rev-sub">Tourist · Canada &nbsp;·&nbsp; Phewa Tal Lakeside, Pokhara</div>
        <div class="stars">
          <span class="star on">★</span><span class="star on">★</span>
          <span class="star on">★</span><span class="star on">★</span>
          <span class="star">★</span>
        </div>
      </div>
      <div class="rev-sep"></div>
      <div class="rev-stat">
        <div class="rev-stat-n" data-count="5">0</div>
        <div class="rev-stat-l">Features<br/>Shown</div>
      </div>
      <div class="rev-sep"></div>
      <div class="rev-stat">
        <div class="rev-stat-n" data-count="1">0</div>
        <div class="rev-stat-l">Suggestion<br/>Made</div>
      </div>
    </div>
  </div>

  <!-- Features -->
  <div class="feat-wrap r d2">
    <div class="s-label">Features Covered</div>
    <p class="s-title">What we walked him through</p>
    <div class="feat-list">

      <div class="feat-row hi">
        <div class="feat-ico">
          <svg width="19" height="19" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
        </div>
        <div class="feat-b">
          <h3>Multilingual Translator</h3>
          <p>22 languages, real-time, Google-backed. No data leaves the device — fully private.</p>
        </div>
        <span class="feat-badge">His Pick</span>
      </div>

      <div class="feat-row">
        <div class="feat-ico">
          <svg width="19" height="19" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <div class="feat-b">
          <h3>Nepali Phrasebook</h3>
          <p>Preloaded common phrases — greetings, food, navigation — no typing needed.</p>
        </div>
        <span class="feat-badge">Shown</span>
      </div>

      <div class="feat-row">
        <div class="feat-ico">
          <svg width="19" height="19" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="feat-b">
          <h3>Nearby Places Finder</h3>
          <p>Live map of hospitals, hotels, services. Built for emergencies, not just browsing.</p>
        </div>
        <span class="feat-badge">Shown</span>
      </div>

      <div class="feat-row">
        <div class="feat-ico">
          <svg width="19" height="19" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        </div>
        <div class="feat-b">
          <h3>Trip Tracker · Take Me Back</h3>
          <p>Set your base, explore freely. One tap sends you back via Google Maps.</p>
        </div>
        <span class="feat-badge">Shown</span>
      </div>

      <div class="feat-row">
        <div class="feat-ico">
          <svg width="19" height="19" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div class="feat-b">
          <h3>Currency Converter</h3>
          <p>Updates every minute. We brought it up — he wasn't expecting it. Quiet utility.</p>
        </div>
        <span class="feat-badge">Mentioned</span>
      </div>

    </div>
  </div>

  <!-- Video -->
  <div class="video-wrap r d3">
    <div class="s-label">Proof</div>
    <p class="s-title">Watch the interview</p>
    <div class="video-shell">
      <iframe
        src="https://www.youtube.com/embed/oR0j3gAYcb0"
        title="GoNepal field interview — Stephan, Pokhara"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        frameborder="0"
      ></iframe>
    </div>
    <p class="video-caption">Recorded at Phewa Tal Lakeside, Pokhara &nbsp;·&nbsp; GoNepal field research</p>
  </div>

  <!-- Two cards -->
  <div class="two-col r d4">
    <div class="info-card card-dark">
      <div class="card-ico">
        <svg width="19" height="19" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div class="card-eye">Key Moment</div>
      <div class="card-ttl">"Is it a free app?"</div>
      <p class="card-txt">He stopped mid-demo to ask. Not about features, not about UI — about price. Tourists notice free. The answer landed.</p>
    </div>

    <div class="info-card card-light">
      <div class="card-ico">
        <svg width="19" height="19" fill="none" stroke="hsl(160 40% 25%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div class="card-eye">User Suggestion</div>
      <div class="card-ttl">Add sports venue discovery</div>
      <p class="card-txt">Cricket grounds, stadiums. His exact point: tourists want to find where to watch a live match. A real gap, not a hypothetical.</p>
      <span class="card-tag">Open Opportunity</span>
    </div>
  </div>

</div><!-- .page -->

<div class="footer-line"></div>
<footer>
  <div class="footer-logo">GoNepal</div>
  <div class="footer-sub">Field research · Phewa Tal Lakeside, Pokhara</div>
</footer>
</div><!-- .content-over -->

<script>
/* ── SCROLL PROGRESS ── */
const bar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  bar.style.width = (p * 100) + '%';
}, { passive: true });

/* ── SCROLL REVEAL ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      // animate pq-bar when pull-quote enters
      const bar = e.target.querySelector('.pq-bar');
      if (bar) bar.classList.add('in');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.r').forEach(el => revObs.observe(el));

/* ── COUNT-UP NUMBERS ── */
function countUp(el, target, duration = 900) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    el.textContent = Math.round(p * target);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-count]').forEach(n => {
        countUp(n, parseInt(n.dataset.count));
      });
      countObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.reviewer-card').forEach(el => countObs.observe(el));

/* ── FEAT ROW STAGGER ON ENTER ── */
const featObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.feat-row').forEach((row, i) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-12px)';
        setTimeout(() => {
          row.style.transition = 'opacity .45s ease, transform .45s ease';
          row.style.opacity = '1';
          row.style.transform = 'translateX(0)';
        }, i * 80);
      });
      featObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.feat-list').forEach(el => featObs.observe(el));
</script>
</body>
</html>