import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="lp">

  <!-- ═══════════════════════════════════════════════
       NAVIGATION
       ═══════════════════════════════════════════════ -->
  <header class="lp-nav" [class.lp-nav-solid]="scrolled" role="banner">
    <div class="lp-container lp-nav-inner">

      <!-- Logo -->
      <a class="lp-logo" routerLink="/" aria-label="Claimora home">
        <div class="lp-logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6L12 2z"
                  fill="#06C5E8" fill-opacity="0.2" stroke="#06C5E8"
                  stroke-width="1.75" stroke-linejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#06C5E8" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="lp-logo-text">
          <span class="lp-logo-name">Claimora</span>
          <span class="lp-logo-tag">WARRANTY INTELLIGENCE</span>
        </div>
      </a>

      <!-- Desktop centre nav -->
      <nav class="lp-nav-links" aria-label="Main navigation">
        <a id="nav-platform"    (click)="scrollTo('platform')"   class="lp-nav-link">Platform</a>
        <a id="nav-features"    (click)="scrollTo('features')"   class="lp-nav-link">Features</a>
        <a id="nav-how"         (click)="scrollTo('how-it-works')" class="lp-nav-link">How It Works</a>
        <a id="nav-solutions"   (click)="scrollTo('problems')"   class="lp-nav-link">Solutions</a>
        <a id="nav-about"       (click)="scrollTo('cta')"        class="lp-nav-link">About</a>
      </nav>

      <!-- Right actions -->
      <div class="lp-nav-actions">
        <a id="nav-signin" routerLink="/auth/login" class="lp-nav-signin">Sign In</a>
        <button id="nav-demo" class="lp-nav-demo" (click)="scrollTo('cta')">Request a Demo</button>
        <button class="lp-hamburger" (click)="toggleMenu()"
                [attr.aria-expanded]="menuOpen" aria-label="Toggle mobile menu">
          <svg *ngIf="!menuOpen" width="20" height="20" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          <svg *ngIf="menuOpen" width="20" height="20" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div class="lp-mobile-menu" *ngIf="menuOpen" role="navigation">
      <a (click)="scrollTo('platform')">Platform</a>
      <a (click)="scrollTo('features')">Features</a>
      <a (click)="scrollTo('how-it-works')">How It Works</a>
      <a (click)="scrollTo('problems')">Solutions</a>
      <a (click)="scrollTo('cta')">About</a>
      <div class="mm-divider"></div>
      <a routerLink="/auth/login" class="mm-signin">Sign In</a>
      <button class="mm-demo" (click)="scrollTo('cta')">Request a Demo</button>
    </div>
  </header>

  <!-- ═══════════════════════════════════════════════
       HERO
       ═══════════════════════════════════════════════ -->
  <section id="hero" class="lp-hero">
    <!-- Background grid -->
    <div class="hero-grid" aria-hidden="true"></div>
    <!-- Glow blob -->
    <div class="hero-glow" aria-hidden="true"></div>

    <div class="lp-container hero-inner">

      <!-- LEFT: Copy + CTAs -->
      <div class="hero-left">
        <div class="hero-badge" id="hero-badge">
          <span class="badge-pulse" aria-hidden="true"></span>
          WARRANTY CLAIMS INTELLIGENCE
        </div>

        <h1 id="hero-headline" class="hero-h1">
          Turn Warranty Claims Into
          <span class="hero-cyan">Evidence-Backed<br>Decisions.</span>
        </h1>

        <p class="hero-p">
          Claimora helps warranty teams identify suspicious claim patterns, connect findings
          to supporting evidence, and investigate inconsistencies through a traceable
          review workflow.
        </p>

        <div class="hero-ctas">
          <button id="cta-explore" class="btn-cyan" (click)="scrollTo('features')">
            Explore the Platform
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
          <button id="cta-investigation" class="btn-outline" (click)="scrollTo('platform')">
            View Sample Investigation
          </button>
        </div>

        <p class="hero-caption" aria-label="Key capabilities">
          Evidence-linked findings &nbsp;·&nbsp; Explainable checks &nbsp;·&nbsp; Traceable reviews
        </p>
      </div>

      <!-- RIGHT: Product Mockup -->
      <div class="hero-right">
        <div class="mockup-wrap">

          <!-- ── Main product preview frame ── -->
          <div class="product-frame" role="img" aria-label="Claimora dashboard preview">
            <!-- Browser chrome -->
            <div class="pf-chrome">
              <div class="pf-dots" aria-hidden="true">
                <span class="dot-r"></span>
                <span class="dot-y"></span>
                <span class="dot-g"></span>
              </div>
              <div class="pf-url">app.claimora.io/dashboard</div>
              <div class="pf-chrome-right"></div>
            </div>

            <!-- App layout -->
            <div class="pf-app">
              <!-- Sidebar -->
              <div class="pf-sidebar" aria-hidden="true">
                <div class="pfs-logo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6L12 2z"
                          fill="#06C5E8" fill-opacity="0.25" stroke="#06C5E8" stroke-width="1.5" stroke-linejoin="round"/>
                    <path d="M9 12l2 2 4-4" stroke="#06C5E8" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="pfs-item" title="Dashboard">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/></svg>
                </div>
                <div class="pfs-item" title="Products">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z" clip-rule="evenodd"/></svg>
                </div>
                <div class="pfs-item pfs-active" title="Claims">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/></svg>
                </div>
                <div class="pfs-item" title="Evidence">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
                </div>
                <div class="pfs-item" title="Findings">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                </div>
                <div class="pfs-item" title="Reports">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd"/></svg>
                </div>
              </div>

              <!-- Main content area -->
              <div class="pf-content" aria-hidden="true">
                <!-- Top bar -->
                <div class="pfc-topbar">
                  <div class="pfc-breadcrumb">
                    <span class="pfc-title">Fraud Risk Dashboard</span>
                    <span class="pfc-role-chip">ADMIN</span>
                  </div>
                  <div class="pfc-topbar-right">
                    <div class="pfc-avatar">JD</div>
                  </div>
                </div>

                <!-- KPI cards -->
                <div class="pfc-kpi-row">
                  <div class="pfc-kpi">
                    <span class="pfc-kl">Total Claims</span>
                    <strong class="pfc-kv">47</strong>
                    <span class="pfc-ks">↑ 4 this week</span>
                  </div>
                  <div class="pfc-kpi kpi-danger">
                    <span class="pfc-kl">Flagged</span>
                    <strong class="pfc-kv">12</strong>
                    <span class="pfc-ks">25.5% rate</span>
                  </div>
                  <div class="pfc-kpi kpi-success">
                    <span class="pfc-kl">Resolved</span>
                    <strong class="pfc-kv">28</strong>
                    <span class="pfc-ks">8 this week</span>
                  </div>
                  <div class="pfc-kpi kpi-amber">
                    <span class="pfc-kl">Pending Review</span>
                    <strong class="pfc-kv">7</strong>
                    <span class="pfc-ks">2 high priority</span>
                  </div>
                </div>

                <!-- Bottom grid: claims + findings -->
                <div class="pfc-grid">
                  <!-- Recent Claims table -->
                  <div class="pfc-claims">
                    <div class="pfc-sec-hdr">Recent Claims</div>
                    <div class="pfc-claim-row">
                      <span class="pcr-id">CLM-2401</span>
                      <span class="pcr-name">Acme Corp</span>
                      <span class="pcr-badge pb-danger">FLAGGED</span>
                      <span class="pcr-dot danger">●</span>
                    </div>
                    <div class="pfc-claim-row">
                      <span class="pcr-id">CLM-2398</span>
                      <span class="pcr-name">TechMax Ltd</span>
                      <span class="pcr-badge pb-info">SUBMITTED</span>
                      <span class="pcr-dot muted">—</span>
                    </div>
                    <div class="pfc-claim-row">
                      <span class="pcr-id">CLM-2395</span>
                      <span class="pcr-name">GlobalFix Co</span>
                      <span class="pcr-badge pb-amber">REVIEWING</span>
                      <span class="pcr-dot amber">●</span>
                    </div>
                    <div class="pfc-claim-row">
                      <span class="pcr-id">CLM-2390</span>
                      <span class="pcr-name">FastRepair</span>
                      <span class="pcr-badge pb-success">RESOLVED</span>
                      <span class="pcr-dot muted">—</span>
                    </div>
                    <div class="pfc-claim-row">
                      <span class="pcr-id">CLM-2387</span>
                      <span class="pcr-name">NovaTech Inc</span>
                      <span class="pcr-badge pb-danger">FLAGGED</span>
                      <span class="pcr-dot danger">●</span>
                    </div>
                  </div>

                  <!-- Top rule triggers -->
                  <div class="pfc-rules">
                    <div class="pfc-sec-hdr">Top Rule Triggers</div>
                    <div class="pfr-item">
                      <span class="pfr-name">Duplicate Invoice</span>
                      <div class="pfr-track"><div class="pfr-fill pfr-red" style="width:82%"></div></div>
                      <span class="pfr-cnt">8</span>
                    </div>
                    <div class="pfr-item">
                      <span class="pfr-name">Out-of-Warranty</span>
                      <div class="pfr-track"><div class="pfr-fill pfr-amber" style="width:55%"></div></div>
                      <span class="pfr-cnt">5</span>
                    </div>
                    <div class="pfr-item">
                      <span class="pfr-name">Repeat Claim</span>
                      <div class="pfr-track"><div class="pfr-fill pfr-cyan" style="width:38%"></div></div>
                      <span class="pfr-cnt">3</span>
                    </div>
                    <div class="pfr-item">
                      <span class="pfr-name">Value Mismatch</span>
                      <div class="pfr-track"><div class="pfr-fill pfr-cyan" style="width:22%"></div></div>
                      <span class="pfr-cnt">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Floating card 1: Investigation Finding ── -->
          <div class="fc fc-1" role="figure" aria-label="Investigation Finding card">
            <div class="fc-icon-wrap fc-amber">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="fc-body">
              <p class="fc-label">Investigation Finding</p>
              <p class="fc-main">Duplicate invoice detected</p>
              <p class="fc-sub">2 related claims require review</p>
            </div>
          </div>

          <!-- ── Floating card 2: Evidence Linked ── -->
          <div class="fc fc-2" role="figure" aria-label="Evidence Linked card">
            <div class="fc-icon-wrap fc-cyan">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="fc-body">
              <p class="fc-label">Evidence Linked</p>
              <p class="fc-main">Invoice · Claim · Product</p>
              <p class="fc-sub">3 source records available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════
       TRUST STRIP
       ═══════════════════════════════════════════════ -->
  <section id="features" class="trust-strip" aria-label="Core capabilities">
    <div class="lp-container trust-inner">
      <div class="trust-item">
        <div class="trust-icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span>Explainable Claim Checks</span>
      </div>
      <div class="trust-divider" aria-hidden="true"></div>
      <div class="trust-item">
        <div class="trust-icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a3 3 0 016 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span>Evidence-Centric Investigations</span>
      </div>
      <div class="trust-divider" aria-hidden="true"></div>
      <div class="trust-item">
        <div class="trust-icon">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span>Traceable Review History</span>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════
       PROBLEM SECTION
       ═══════════════════════════════════════════════ -->
  <section id="problems" class="problem-sec">
    <div class="lp-container">
      <div class="sec-label">THE CHALLENGE</div>
      <h2 class="sec-h2">Suspicious Claims Are Harder to Investigate<br>When Evidence Is Scattered.</h2>
      <p class="sec-sub">
        Most warranty teams rely on disconnected spreadsheets and email threads. Claimora
        centralises findings, evidence, and review decisions in one structured workflow.
      </p>

      <div class="problem-grid">
        <div class="problem-card">
          <div class="pc-icon-wrap pc-icon-red">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="pc-h">Duplicate Records</h3>
          <p class="pc-p">Identify repeated invoice references and potentially overlapping claims before they are approved.</p>
        </div>

        <div class="problem-card">
          <div class="pc-icon-wrap pc-icon-amber">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="pc-h">Conflicting Information</h3>
          <p class="pc-p">Bring inconsistencies in claim, product, invoice, and repair information into view for structured review.</p>
        </div>

        <div class="problem-card">
          <div class="pc-icon-wrap pc-icon-cyan">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="pc-h">Fragmented Evidence</h3>
          <p class="pc-p">Connect investigation findings to the records that explain why they were flagged, all in one place.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════
       HOW IT WORKS
       ═══════════════════════════════════════════════ -->
  <section id="how-it-works" class="workflow-sec">
    <div class="lp-container">
      <div class="sec-label">HOW IT WORKS</div>
      <h2 class="sec-h2">From Suspicious Pattern to Resolved Finding.</h2>
      <p class="sec-sub">Three clear stages keep every investigation structured and auditable.</p>

      <div class="workflow-steps">
        <div class="wf-step">
          <div class="wf-num-wrap">
            <span class="wf-num">01</span>
          </div>
          <div class="wf-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="wf-h">Detect</h3>
          <p class="wf-p">Identify suspicious patterns through configured validation rules applied across warranty submissions and product records.</p>
        </div>

        <div class="wf-connector" aria-hidden="true">
          <div class="connector-line"></div>
          <div class="connector-arrow">›</div>
        </div>

        <div class="wf-step">
          <div class="wf-num-wrap">
            <span class="wf-num">02</span>
          </div>
          <div class="wf-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="wf-h">Investigate</h3>
          <p class="wf-p">Review conflicting records, inspect the supporting evidence documents, and record observations in a structured audit trail.</p>
        </div>

        <div class="wf-connector" aria-hidden="true">
          <div class="connector-line"></div>
          <div class="connector-arrow">›</div>
        </div>

        <div class="wf-step">
          <div class="wf-num-wrap">
            <span class="wf-num">03</span>
          </div>
          <div class="wf-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h3 class="wf-h">Resolve</h3>
          <p class="wf-p">Record the review outcome, assign a final status, and preserve the complete investigation history for compliance and reporting.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════
       PRODUCT PREVIEW SECTION
       ═══════════════════════════════════════════════ -->
  <section id="platform" class="preview-sec">
    <div class="lp-container preview-inner">
      <!-- Left: Investigation detail mockup -->
      <div class="preview-mockup-wrap">
        <div class="preview-frame" role="img" aria-label="Investigation detail view preview">
          <div class="pvf-header">
            <div class="pvf-hdr-left">
              <span class="pvf-back">← Findings</span>
              <h4 class="pvf-title">Finding #F-0031 — Duplicate Invoice Reference</h4>
            </div>
            <div class="pvf-badges">
              <span class="pvf-badge pvf-high">HIGH</span>
              <span class="pvf-badge pvf-open">OPEN</span>
            </div>
          </div>
          <div class="pvf-body">
            <!-- Left: claim + evidence -->
            <div class="pvf-left">
              <div class="pvf-card">
                <div class="pvf-card-label">Flagged Claim</div>
                <div class="pvf-row"><span class="pvf-key">Claim No.</span><code class="pvf-val">CLM-2401</code></div>
                <div class="pvf-row"><span class="pvf-key">Customer</span><span class="pvf-val">Acme Corp</span></div>
                <div class="pvf-row"><span class="pvf-key">Product</span><span class="pvf-val">ProMax X200</span></div>
                <div class="pvf-row"><span class="pvf-key">Invoice No.</span><code class="pvf-val danger">INV-8821</code></div>
                <div class="pvf-row"><span class="pvf-key">Claim Date</span><span class="pvf-val">Oct 12, 2024</span></div>
              </div>
              <div class="pvf-card pvf-evidence-card">
                <div class="pvf-card-label">Linked Evidence</div>
                <div class="pvf-evidence-item">
                  <span class="pvf-ev-icon">📄</span>
                  <div>
                    <div class="pvf-ev-name">invoice_INV-8821.pdf</div>
                    <div class="pvf-ev-role">CONFLICTING_VALUE</div>
                  </div>
                </div>
                <div class="pvf-evidence-item">
                  <span class="pvf-ev-icon">📎</span>
                  <div>
                    <div class="pvf-ev-name">repair_receipt_duplicate.jpg</div>
                    <div class="pvf-ev-role">SUPPORTING_EVIDENCE</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Right: audit trail -->
            <div class="pvf-right">
              <div class="pvf-card-label" style="margin-bottom:.75rem">Investigation Audit Trail</div>
              <div class="pvf-timeline">
                <div class="pvt-item pvt-open">
                  <div class="pvt-dot"></div>
                  <div class="pvt-content">
                    <div class="pvt-user">System</div>
                    <div class="pvt-action">Finding created · Duplicate rule triggered</div>
                    <div class="pvt-time">Oct 12, 2024 · 14:03</div>
                  </div>
                </div>
                <div class="pvt-item pvt-comment">
                  <div class="pvt-dot"></div>
                  <div class="pvt-content">
                    <div class="pvt-user">Jane Doe</div>
                    <div class="pvt-action">Commented — "Invoice number appears in CLM-2389 filed 14 days prior."</div>
                    <div class="pvt-time">Oct 13, 2024 · 09:17</div>
                  </div>
                </div>
                <div class="pvt-item pvt-ev">
                  <div class="pvt-dot"></div>
                  <div class="pvt-content">
                    <div class="pvt-user">Jane Doe</div>
                    <div class="pvt-action">Evidence linked — repair_receipt_duplicate.jpg</div>
                    <div class="pvt-time">Oct 13, 2024 · 09:22</div>
                  </div>
                </div>
                <div class="pvt-item pvt-status">
                  <div class="pvt-dot"></div>
                  <div class="pvt-content">
                    <div class="pvt-user">Jane Doe</div>
                    <div class="pvt-action">Status → UNDER INVESTIGATION</div>
                    <div class="pvt-time">Oct 13, 2024 · 09:23</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: explanatory content -->
      <div class="preview-text">
        <div class="sec-label">INVESTIGATION WORKFLOW</div>
        <h2 class="sec-h2" style="font-size:clamp(1.5rem,3vw,2.25rem)">
          From Suspicious Pattern to<br>Explainable Finding.
        </h2>
        <p class="sec-sub" style="max-width:100%">
          Every investigation in Claimora follows a structured, auditable path — from initial
          flag to documented resolution.
        </p>
        <ul class="preview-feature-list">
          <li>
            <span class="pfl-icon">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </span>
            Inspect a flagged claim and understand why it was flagged
          </li>
          <li>
            <span class="pfl-icon">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </span>
            Compare related records to identify inconsistencies
          </li>
          <li>
            <span class="pfl-icon">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </span>
            Open and review supporting evidence documents
          </li>
          <li>
            <span class="pfl-icon">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </span>
            Review previous investigation actions in a full audit trail
          </li>
          <li>
            <span class="pfl-icon">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </span>
            Record a decision and close the finding with documented reasoning
          </li>
        </ul>
        <div class="preview-ctas">
          <button class="btn-cyan" (click)="scrollTo('cta')">
            Request a Demo
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
          <a routerLink="/auth/login" class="btn-outline">Sign In to Explore</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════
       FINAL CTA
       ═══════════════════════════════════════════════ -->
  <section id="cta" class="cta-sec">
    <div class="lp-container">
      <div class="cta-inner">
        <div class="cta-badge">GET STARTED</div>
        <h2 class="cta-h">Make Every Warranty Investigation<br>Easier to Explain.</h2>
        <p class="cta-p">
          Bring claim inconsistencies, supporting evidence, and review decisions into one
          structured workflow. No additional BI tools required.
        </p>
        <div class="cta-buttons">
          <a routerLink="/auth/login" class="btn-cyan btn-lg">
            Explore the Platform
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
          </a>
          <button class="btn-outline btn-lg" (click)="scrollTo('how-it-works')">Request a Demo</button>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════
       FOOTER
       ═══════════════════════════════════════════════ -->
  <footer class="lp-footer" role="contentinfo">
    <div class="lp-container footer-inner">
      <!-- Brand column -->
      <div class="footer-brand">
        <a class="lp-logo" routerLink="/" aria-label="Claimora home" style="margin-bottom:.75rem">
          <div class="lp-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6L12 2z"
                    fill="#06C5E8" fill-opacity="0.2" stroke="#06C5E8"
                    stroke-width="1.75" stroke-linejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#06C5E8" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="lp-logo-name" style="font-size:.95rem">Claimora</span>
        </a>
        <p class="footer-tagline">
          Warranty investigation and fraud risk platform for enterprise warranty operations.
        </p>
      </div>

      <!-- Link columns -->
      <div class="footer-col">
        <h4 class="footer-col-title">Product</h4>
        <a (click)="scrollTo('platform')">Platform</a>
        <a (click)="scrollTo('features')">Features</a>
        <a (click)="scrollTo('how-it-works')">How It Works</a>
      </div>
      <div class="footer-col">
        <h4 class="footer-col-title">Resources</h4>
        <a (click)="scrollTo('cta')">Contact</a>
        <a (click)="scrollTo('cta')">About</a>
        <a (click)="scrollTo('problems')">Solutions</a>
      </div>
      <div class="footer-col">
        <h4 class="footer-col-title">Account</h4>
        <a routerLink="/auth/login">Sign In</a>
        <a (click)="scrollTo('cta')">Request a Demo</a>
      </div>
    </div>

    <div class="lp-container footer-bottom">
      <p>© {{ currentYear }} Claimora. All rights reserved.</p>
      <p class="footer-build">Built for enterprise warranty operations.</p>
    </div>
  </footer>

</div>
  `,
  styles: [`
/* ════════════════════════════════════════════════════════
   CLAIMORA LANDING PAGE — Premium Dark SaaS Design
   Palette: #0B1426 · #06C5E8 · #2675F5
   ════════════════════════════════════════════════════════ */

/* ── CSS Variables ── */
:host {
  --bg:      #0B1426;
  --bg2:     #0E1929;
  --panel:   #18263B;
  --panel2:  #1E2F47;
  --cyan:    #06C5E8;
  --blue:    #2675F5;
  --text:    #F8FAFC;
  --muted:   #9AAAC0;
  --dim:     #5A6B82;
  --border:  #26364C;
  --border2: #2E4060;
  --red:     #EF4444;
  --amber:   #F59E0B;
  --green:   #10B981;
  --shadow:  0 24px 64px rgba(0,0,0,0.7);
}

/* ── Reset within host ── */
.lp * { box-sizing: border-box; }
.lp { background: var(--bg); color: var(--text); min-height: 100vh; font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; overflow-x: hidden; }
.lp a { text-decoration: none; cursor: pointer; color: inherit; }
.lp button { cursor: pointer; font-family: inherit; }
.lp p, .lp h1, .lp h2, .lp h3, .lp h4 { margin: 0; }

.lp-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

/* ════════════════════════════════════════════════════════
   NAVIGATION
   ════════════════════════════════════════════════════════ */
.lp-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  transition: background 0.3s, border-color 0.3s;
  border-bottom: 1px solid transparent;
}
.lp-nav-solid {
  background: rgba(11, 20, 38, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-color: var(--border);
}

.lp-nav-inner {
  display: flex; align-items: center; gap: 2rem;
  height: 64px;
}

/* Logo */
.lp-logo { display: flex; align-items: center; gap: .625rem; flex-shrink: 0; }
.lp-logo-icon {
  width: 36px; height: 36px;
  background: rgba(6, 197, 232, 0.1);
  border: 1px solid rgba(6, 197, 232, 0.25);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.lp-logo-text { display: flex; flex-direction: column; line-height: 1; }
.lp-logo-name { font-size: 1rem; font-weight: 700; color: var(--text); letter-spacing: -.02em; }
.lp-logo-tag  { font-size: .55rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--cyan); margin-top: 2px; }

/* Centre nav */
.lp-nav-links {
  display: flex; gap: .25rem; align-items: center;
  flex: 1; justify-content: center;
}
.lp-nav-link {
  font-size: .8375rem; font-weight: 500; color: var(--muted);
  padding: .375rem .75rem; border-radius: 6px;
  transition: color .15s, background .15s;
}
.lp-nav-link:hover { color: var(--text); background: rgba(255,255,255,.05); }

/* Right actions */
.lp-nav-actions { display: flex; align-items: center; gap: .625rem; flex-shrink: 0; }
.lp-nav-signin {
  font-size: .875rem; font-weight: 500; color: var(--muted);
  padding: .375rem .75rem; border-radius: 6px;
  transition: color .15s;
}
.lp-nav-signin:hover { color: var(--text); }

.lp-nav-demo {
  background: var(--cyan); color: #000;
  font-size: .875rem; font-weight: 700;
  padding: .45rem 1.1rem; border: none; border-radius: 7px;
  transition: background .15s, transform .1s;
}
.lp-nav-demo:hover { background: #0ad5f9; transform: translateY(-1px); }

.lp-hamburger {
  display: none; background: transparent; border: 1px solid var(--border);
  color: var(--muted); width: 36px; height: 36px; border-radius: 7px;
  align-items: center; justify-content: center;
}

/* Mobile menu */
.lp-mobile-menu {
  background: var(--bg2); border-top: 1px solid var(--border);
  padding: 1rem 1.5rem;
  display: flex; flex-direction: column; gap: .125rem;
}
.lp-mobile-menu a {
  font-size: .9rem; color: var(--muted); padding: .625rem .5rem;
  border-radius: 6px; transition: color .15s, background .15s;
}
.lp-mobile-menu a:hover { color: var(--text); background: rgba(255,255,255,.05); }
.mm-divider { height: 1px; background: var(--border); margin: .5rem 0; }
.mm-signin { font-size: .9rem; color: var(--muted) !important; }
.mm-demo {
  background: var(--cyan); color: #000;
  font-size: .875rem; font-weight: 700;
  padding: .6rem 1rem; border: none; border-radius: 7px; margin-top: .375rem;
  text-align: center; width: 100%;
}

/* ════════════════════════════════════════════════════════
   HERO
   ════════════════════════════════════════════════════════ */
.lp-hero {
  position: relative;
  min-height: 100vh;
  display: flex; align-items: center;
  padding: 6rem 0 4rem;
  overflow: hidden;
}

/* Background grid decoration */
.hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(6,197,232,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6,197,232,.04) 1px, transparent 1px);
  background-size: 52px 52px;
  pointer-events: none;
}

/* Glow blob */
.hero-glow {
  position: absolute; top: 10%; right: 10%;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(38,117,245,.12) 0%, transparent 65%);
  pointer-events: none;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 3.5rem;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
}

/* LEFT column */
.hero-left { display: flex; flex-direction: column; gap: 1.5rem; }

.hero-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  font-size: .6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
  color: var(--cyan);
  border: 1px solid rgba(6,197,232,.35);
  background: rgba(6,197,232,.07);
  padding: .35rem .85rem; border-radius: 999px;
  align-self: flex-start;
}
.badge-pulse {
  width: 6px; height: 6px; border-radius: 50%; background: var(--cyan);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .5; transform: scale(.8); }
}

.hero-h1 {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -.03em;
  color: var(--text);
}
.hero-cyan { color: var(--cyan); display: block; }

.hero-p {
  font-size: clamp(.9rem, 1.5vw, 1.0625rem);
  color: var(--muted); line-height: 1.7;
  max-width: 480px;
}

.hero-ctas { display: flex; gap: .875rem; flex-wrap: wrap; }

.btn-cyan {
  display: inline-flex; align-items: center; gap: .5rem;
  background: var(--cyan); color: #000;
  font-size: .9375rem; font-weight: 700;
  padding: .75rem 1.5rem; border: none; border-radius: 8px;
  transition: background .15s, transform .1s, box-shadow .15s;
  box-shadow: 0 4px 20px rgba(6,197,232,.3);
}
.btn-cyan:hover { background: #0ad5f9; transform: translateY(-2px); box-shadow: 0 8px 28px rgba(6,197,232,.45); }

.btn-outline {
  display: inline-flex; align-items: center; gap: .5rem;
  background: transparent; color: var(--text);
  font-size: .9375rem; font-weight: 600;
  padding: .725rem 1.4rem; border: 1px solid var(--border2); border-radius: 8px;
  transition: background .15s, border-color .15s;
}
.btn-outline:hover { background: rgba(255,255,255,.05); border-color: var(--muted); }

.btn-lg { padding: .875rem 2rem; font-size: 1rem; }

.hero-caption {
  font-size: .7875rem; color: var(--dim);
  letter-spacing: .01em;
}

/* RIGHT column */
.hero-right { position: relative; }

.mockup-wrap { position: relative; padding: 2rem 1.5rem 2.5rem 1rem; }

/* ── Product Frame (browser mockup) ── */
.product-frame {
  border-radius: 12px; overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: 0 32px 80px rgba(0,0,0,.65);
  background: #060f1e;
  position: relative;
}

/* Browser chrome */
.pf-chrome {
  background: #0d1929; border-bottom: 1px solid var(--border);
  padding: .5rem .875rem;
  display: flex; align-items: center; gap: .625rem;
}
.pf-dots { display: flex; gap: 4px; }
.dot-r { width: 8px; height: 8px; border-radius: 50%; background: #ff5f57; }
.dot-y { width: 8px; height: 8px; border-radius: 50%; background: #febc2e; }
.dot-g { width: 8px; height: 8px; border-radius: 50%; background: #28c840; }
.pf-url {
  flex: 1; background: rgba(255,255,255,.04); border: 1px solid var(--border);
  border-radius: 4px; padding: 3px 10px; font-size: .6875rem;
  color: var(--dim); font-family: 'JetBrains Mono', monospace;
  text-align: center; max-width: 260px; margin: 0 auto;
}
.pf-chrome-right { width: 40px; }

/* App body */
.pf-app { display: flex; height: 320px; }

/* Sidebar */
.pf-sidebar {
  width: 42px; background: #070f1d; border-right: 1px solid var(--border);
  padding: .75rem 0; display: flex; flex-direction: column;
  align-items: center; gap: 2px; flex-shrink: 0;
}
.pfs-logo {
  width: 26px; height: 26px;
  background: rgba(6,197,232,.12); border: 1px solid rgba(6,197,232,.2);
  border-radius: 6px; display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px; flex-shrink: 0;
}
.pfs-item {
  width: 30px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: #3d5270; transition: color .15s;
}
.pfs-item:hover { color: var(--muted); background: rgba(255,255,255,.04); }
.pfs-active { background: rgba(38,117,245,.25); color: #7caeff !important; }

/* Content area */
.pf-content { flex: 1; background: #0b1829; overflow: hidden; display: flex; flex-direction: column; }

/* Top bar */
.pfc-topbar {
  padding: .5rem .75rem; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
}
.pfc-breadcrumb { display: flex; align-items: center; gap: .5rem; }
.pfc-title { font-size: .7rem; font-weight: 600; color: #c8d6e8; }
.pfc-role-chip {
  font-size: .55rem; font-weight: 700; text-transform: uppercase;
  background: rgba(38,117,245,.2); color: #7caeff;
  padding: 1px 5px; border-radius: 3px; letter-spacing: .04em;
}
.pfc-topbar-right { display: flex; align-items: center; gap: .5rem; }
.pfc-avatar {
  width: 20px; height: 20px; border-radius: 50%; background: var(--blue);
  display: flex; align-items: center; justify-content: center;
  font-size: .55rem; font-weight: 700; color: #fff;
}

/* KPI cards */
.pfc-kpi-row {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 5px; padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.pfc-kpi {
  background: #111e33; border: 1px solid var(--border);
  border-radius: 5px; padding: 5px 7px;
  display: flex; flex-direction: column; gap: 1px;
}
.pfc-kl { font-size: .58rem; color: var(--dim); text-transform: uppercase; letter-spacing: .03em; }
.pfc-kv { font-size: 1.25rem; font-weight: 800; color: #e2e8f0; line-height: 1.1; }
.pfc-ks { font-size: .58rem; color: var(--dim); }
.kpi-danger { border-left: 2px solid var(--red); }
.kpi-danger .pfc-kv { color: #f87171; }
.kpi-success { border-left: 2px solid var(--green); }
.kpi-success .pfc-kv { color: #34d399; }
.kpi-amber { border-left: 2px solid var(--amber); }
.kpi-amber .pfc-kv { color: #fbbf24; }

/* Bottom grid */
.pfc-grid { display: grid; grid-template-columns: 1.55fr 1fr; gap: 5px; padding: 6px 8px; flex: 1; overflow: hidden; }

/* Claims table */
.pfc-claims { overflow: hidden; }
.pfc-sec-hdr { font-size: .6rem; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 5px; }
.pfc-claim-row { display: flex; align-items: center; gap: 4px; padding: 3px 0; border-bottom: 1px solid rgba(38,54,76,.5); }
.pcr-id   { font-size: .62rem; font-family: 'JetBrains Mono', monospace; color: var(--dim); width: 52px; flex-shrink: 0; }
.pcr-name { font-size: .65rem; color: #a0b0c8; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pcr-badge { font-size: .52rem; font-weight: 700; padding: 1px 4px; border-radius: 999px; letter-spacing: .02em; flex-shrink: 0; }
.pb-danger  { background: rgba(239,68,68,.15);  color: #f87171;  border: 1px solid rgba(239,68,68,.3); }
.pb-info    { background: rgba(59,130,246,.15); color: #93c5fd; border: 1px solid rgba(59,130,246,.3); }
.pb-amber   { background: rgba(245,158,11,.15); color: #fcd34d; border: 1px solid rgba(245,158,11,.3); }
.pb-success { background: rgba(16,185,129,.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,.3); }
.pcr-dot  { font-size: .7rem; flex-shrink: 0; }
.pcr-dot.danger  { color: #f87171; }
.pcr-dot.amber   { color: #fbbf24; }
.pcr-dot.muted   { color: var(--dim); }

/* Rule triggers bars */
.pfc-rules { overflow: hidden; }
.pfr-item  { display: flex; align-items: center; gap: 4px; margin-bottom: 5px; }
.pfr-name  { font-size: .61rem; color: #7a8fa8; width: 72px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pfr-track { flex: 1; height: 4px; background: #182a42; border-radius: 999px; overflow: hidden; }
.pfr-fill  { height: 100%; border-radius: 999px; }
.pfr-red   { background: var(--red); }
.pfr-amber { background: var(--amber); }
.pfr-cyan  { background: var(--cyan); }
.pfr-cnt   { font-size: .6rem; font-weight: 700; color: #c8d6e8; width: 12px; text-align: right; }

/* ── Floating Cards ── */
.fc {
  position: absolute;
  background: rgba(24, 38, 59, 0.96);
  border: 1px solid var(--border2);
  border-radius: 10px; padding: .75rem 1rem;
  display: flex; align-items: flex-start; gap: .625rem;
  box-shadow: 0 12px 40px rgba(0,0,0,.6);
  backdrop-filter: blur(8px);
  min-width: 190px;
  animation: floatIn 0.8s ease-out forwards;
}
.fc-1 { top: 1rem; left: -1.25rem; animation-delay: .3s; }
.fc-2 { bottom: 1.5rem; right: -1rem; animation-delay: .6s; }
@keyframes floatIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fc-icon-wrap {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.fc-amber { background: rgba(245,158,11,.15); color: var(--amber); border: 1px solid rgba(245,158,11,.3); }
.fc-cyan  { background: rgba(6,197,232,.12);  color: var(--cyan);  border: 1px solid rgba(6,197,232,.3); }

.fc-body { display: flex; flex-direction: column; gap: 2px; }
.fc-label { font-size: .65rem; font-weight: 700; color: var(--dim); text-transform: uppercase; letter-spacing: .05em; }
.fc-main  { font-size: .8rem; font-weight: 600; color: var(--text); line-height: 1.3; }
.fc-sub   { font-size: .68rem; color: var(--muted); }

/* ════════════════════════════════════════════════════════
   TRUST STRIP
   ════════════════════════════════════════════════════════ */
.trust-strip {
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 1.5rem 0;
}
.trust-inner { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; }
.trust-item {
  display: flex; align-items: center; gap: .625rem;
  padding: .625rem 2rem; font-size: .875rem; font-weight: 500; color: var(--muted);
  transition: color .15s;
}
.trust-item:hover { color: var(--text); }
.trust-icon {
  width: 30px; height: 30px; border-radius: 7px;
  background: rgba(6,197,232,.1); border: 1px solid rgba(6,197,232,.2);
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan); flex-shrink: 0;
}
.trust-divider { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }

/* ════════════════════════════════════════════════════════
   COMMON SECTION STYLES
   ════════════════════════════════════════════════════════ */
.sec-label {
  font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .12em;
  color: var(--cyan); margin-bottom: .75rem;
}
.sec-h2 {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  font-weight: 700; letter-spacing: -.025em; color: var(--text);
  line-height: 1.2; margin-bottom: 1rem;
}
.sec-sub {
  font-size: clamp(.875rem, 1.5vw, 1rem);
  color: var(--muted); line-height: 1.7; max-width: 560px;
}

/* ════════════════════════════════════════════════════════
   PROBLEM SECTION
   ════════════════════════════════════════════════════════ */
.problem-sec { padding: 6rem 0; background: var(--bg); }
.problem-sec .sec-sub { margin-bottom: 3rem; }

.problem-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; margin-top: 3rem; }

.problem-card {
  background: var(--panel); border: 1px solid var(--border);
  border-radius: 12px; padding: 1.75rem;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.problem-card:hover { border-color: var(--cyan); box-shadow: 0 0 0 1px rgba(6,197,232,.15); transform: translateY(-3px); }

.pc-icon-wrap {
  width: 44px; height: 44px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;
}
.pc-icon-red   { background: rgba(239,68,68,.12); color: #f87171; border: 1px solid rgba(239,68,68,.25); }
.pc-icon-amber { background: rgba(245,158,11,.12); color: #fbbf24; border: 1px solid rgba(245,158,11,.25); }
.pc-icon-cyan  { background: rgba(6,197,232,.1);  color: var(--cyan); border: 1px solid rgba(6,197,232,.25); }

.pc-h { font-size: 1rem; font-weight: 600; color: var(--text); margin-bottom: .625rem; }
.pc-p { font-size: .875rem; color: var(--muted); line-height: 1.65; }

/* ════════════════════════════════════════════════════════
   HOW IT WORKS
   ════════════════════════════════════════════════════════ */
.workflow-sec {
  padding: 6rem 0;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.workflow-sec .sec-sub { margin-bottom: 3.5rem; }

.workflow-steps {
  display: flex; align-items: flex-start; gap: 0;
  margin-top: 3.5rem;
}

.wf-step {
  flex: 1; padding: 2rem 1.75rem;
  background: var(--panel); border: 1px solid var(--border);
  border-radius: 12px; position: relative;
  transition: border-color .2s, transform .2s;
}
.wf-step:hover { border-color: rgba(6,197,232,.4); transform: translateY(-4px); }

.wf-num-wrap { margin-bottom: 1rem; }
.wf-num {
  font-size: 2.5rem; font-weight: 900; color: rgba(6,197,232,.15);
  letter-spacing: -.04em; line-height: 1;
}

.wf-icon-wrap {
  width: 48px; height: 48px; border-radius: 11px;
  background: rgba(6,197,232,.1); border: 1px solid rgba(6,197,232,.2);
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan); margin-bottom: 1.25rem;
}

.wf-h { font-size: 1.125rem; font-weight: 700; color: var(--text); margin-bottom: .625rem; }
.wf-p { font-size: .875rem; color: var(--muted); line-height: 1.65; }

.wf-connector {
  display: flex; flex-direction: column; align-items: center;
  padding: 0 .75rem; padding-top: 3rem; flex-shrink: 0;
}
.connector-line { width: 60px; height: 1px; background: var(--border); }
.connector-arrow { font-size: 1.25rem; color: var(--cyan); margin-top: -.3rem; }

/* ════════════════════════════════════════════════════════
   PRODUCT PREVIEW SECTION
   ════════════════════════════════════════════════════════ */
.preview-sec { padding: 6rem 0; background: var(--bg); }
.preview-inner {
  display: grid; grid-template-columns: 1.1fr 1fr;
  gap: 4rem; align-items: center;
}

/* Investigation detail mockup */
.preview-mockup-wrap { position: relative; }
.preview-frame {
  background: var(--panel); border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,.55);
}
.pvf-header {
  padding: 1rem 1.25rem; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem;
}
.pvf-back { font-size: .75rem; color: var(--cyan); margin-bottom: .25rem; display: block; cursor: pointer; }
.pvf-title { font-size: .9rem; font-weight: 700; color: var(--text); }
.pvf-badges { display: flex; gap: .375rem; }
.pvf-badge { font-size: .65rem; font-weight: 700; padding: .2rem .55rem; border-radius: 4px; text-transform: uppercase; letter-spacing: .04em; }
.pvf-high { background: rgba(239,68,68,.15); color: #f87171; border: 1px solid rgba(239,68,68,.3); }
.pvf-open { background: rgba(59,130,246,.15); color: #93c5fd; border: 1px solid rgba(59,130,246,.3); }
.pvf-body { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; }
.pvf-card { background: rgba(11,20,38,.6); border: 1px solid var(--border); border-radius: 8px; padding: .875rem; }
.pvf-card-label { font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--dim); margin-bottom: .625rem; display: block; }
.pvf-row { display: flex; justify-content: space-between; align-items: center; padding: .3rem 0; border-bottom: 1px solid rgba(38,54,76,.4); }
.pvf-row:last-child { border-bottom: none; }
.pvf-key { font-size: .75rem; color: var(--dim); }
.pvf-val { font-size: .75rem; color: #c8d6e8; font-weight: 500; }
.pvf-val.danger { color: #f87171; }
code.pvf-val { font-family: 'JetBrains Mono', monospace; font-size: .7rem; }
code.pvf-val.danger { color: #f87171; background: rgba(239,68,68,.08); padding: 1px 4px; border-radius: 3px; }
.pvf-evidence-card { margin-top: 0; }
.pvf-evidence-item { display: flex; align-items: flex-start; gap: .5rem; padding: .4rem 0; border-bottom: 1px solid rgba(38,54,76,.4); }
.pvf-evidence-item:last-child { border-bottom: none; }
.pvf-ev-icon { font-size: .875rem; flex-shrink: 0; }
.pvf-ev-name { font-size: .72rem; color: #c8d6e8; font-weight: 500; }
.pvf-ev-role { font-size: .6rem; color: var(--dim); text-transform: uppercase; letter-spacing: .04em; margin-top: 1px; }

/* Timeline */
.pvf-right { }
.pvf-timeline { display: flex; flex-direction: column; gap: 0; padding-left: .875rem; border-left: 2px solid var(--border); }
.pvt-item { position: relative; padding: 0 0 .875rem .875rem; }
.pvt-item:last-child { padding-bottom: 0; }
.pvt-dot { position: absolute; left: -1.2rem; top: .3rem; width: 10px; height: 10px; border-radius: 50%; background: var(--cyan); border: 2px solid var(--panel); flex-shrink: 0; }
.pvt-open .pvt-dot { background: #3b82f6; }
.pvt-comment .pvt-dot { background: var(--cyan); }
.pvt-ev .pvt-dot { background: var(--purple, #7c3aed); }
.pvt-status .pvt-dot { background: var(--amber); }
.pvt-user { font-size: .7rem; font-weight: 700; color: #c8d6e8; }
.pvt-action { font-size: .72rem; color: var(--muted); line-height: 1.4; margin-top: .1rem; }
.pvt-time { font-size: .65rem; color: var(--dim); margin-top: .2rem; }

/* Right text */
.preview-text { display: flex; flex-direction: column; gap: 1.25rem; }
.preview-feature-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: .625rem;
}
.preview-feature-list li { display: flex; align-items: flex-start; gap: .625rem; font-size: .9rem; color: var(--muted); }
.pfl-icon { width: 20px; height: 20px; border-radius: 5px; background: rgba(6,197,232,.1); border: 1px solid rgba(6,197,232,.2); color: var(--cyan); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: .1rem; }
.preview-ctas { display: flex; gap: .875rem; flex-wrap: wrap; margin-top: .5rem; }

/* ════════════════════════════════════════════════════════
   FINAL CTA SECTION
   ════════════════════════════════════════════════════════ */
.cta-sec {
  padding: 6rem 0;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  position: relative; overflow: hidden;
}
.cta-sec::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(38,117,245,.12) 0%, transparent 60%);
  pointer-events: none;
}
.cta-inner { text-align: center; position: relative; z-index: 1; }
.cta-badge {
  display: inline-block; font-size: .65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .12em; color: var(--cyan);
  border: 1px solid rgba(6,197,232,.3); background: rgba(6,197,232,.07);
  padding: .3rem .85rem; border-radius: 999px; margin-bottom: 1.5rem;
}
.cta-h {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800; letter-spacing: -.03em; color: var(--text);
  line-height: 1.2; margin-bottom: 1.25rem;
}
.cta-p { font-size: 1.0625rem; color: var(--muted); max-width: 520px; margin: 0 auto 2.5rem; line-height: 1.65; }
.cta-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

/* ════════════════════════════════════════════════════════
   FOOTER
   ════════════════════════════════════════════════════════ */
.lp-footer {
  background: #070e1c;
  border-top: 1px solid var(--border);
  padding: 3.5rem 0 0;
}
.footer-inner {
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem; padding-bottom: 3rem;
}
.footer-brand { display: flex; flex-direction: column; gap: .5rem; }
.footer-tagline { font-size: .8125rem; color: var(--dim); line-height: 1.6; max-width: 240px; }
.footer-col { display: flex; flex-direction: column; gap: .5rem; }
.footer-col-title { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--dim); margin-bottom: .375rem; }
.footer-col a { font-size: .875rem; color: var(--muted); transition: color .15s; }
.footer-col a:hover { color: var(--text); }
.footer-bottom {
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid var(--border);
  padding: 1.25rem 1.5rem; font-size: .7875rem; color: var(--dim);
  max-width: unset; margin: 0;
}
.footer-build { color: var(--dim); }

/* ════════════════════════════════════════════════════════
   RESPONSIVE
   ════════════════════════════════════════════════════════ */
@media (max-width: 1100px) {
  .hero-inner { grid-template-columns: 1fr; gap: 3rem; }
  .hero-left { max-width: 600px; }
  .hero-right { order: -1; }
  .mockup-wrap { max-width: 680px; margin: 0 auto; }
  .pf-app { height: 260px; }
  .preview-inner { grid-template-columns: 1fr; }
  .preview-mockup-wrap { order: 1; }
  .preview-text { order: 0; }
}

@media (max-width: 900px) {
  .problem-grid { grid-template-columns: 1fr 1fr; }
  .workflow-steps { flex-direction: column; }
  .wf-connector { flex-direction: row; padding: .5rem 0; }
  .connector-line { width: 40px; }
  .connector-arrow { margin-top: 0; }
  .footer-inner { grid-template-columns: 1fr 1fr; gap: 2rem; }
  .fc-1 { left: -.5rem; }
  .fc-2 { right: -.5rem; }
}

@media (max-width: 768px) {
  .lp-nav-links { display: none; }
  .lp-nav-demo { display: none; }
  .lp-hamburger { display: flex; }
  .problem-grid { grid-template-columns: 1fr; }
  .pvf-body { grid-template-columns: 1fr; }
  .trust-inner { flex-direction: column; gap: 1rem; }
  .trust-divider { display: none; }
  .footer-inner { grid-template-columns: 1fr; gap: 2rem; }
  .hero-ctas { flex-direction: column; }
  .btn-cyan, .btn-outline { width: 100%; justify-content: center; }
  .fc-1 { top: -.75rem; left: 0; min-width: 160px; padding: .5rem .75rem; }
  .fc-2 { bottom: -.5rem; right: 0; min-width: 160px; padding: .5rem .75rem; }
  .cta-buttons { flex-direction: column; align-items: center; }
  .btn-lg { width: 100%; max-width: 320px; justify-content: center; }
  .footer-bottom { flex-direction: column; gap: .375rem; text-align: center; }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  menuOpen  = false;
  scrolled  = false;
  currentYear = new Date().getFullYear();

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 30;
  }

  ngOnInit(): void {
    // Set dark bg on body so there's no light flash
    document.body.style.background = '#0B1426';
    window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    document.body.style.background = '';
  }

  scrollTo(id: string): void {
    this.menuOpen = false;
    const el = document.getElementById(id);
    if (el) {
      const offset = 80; // account for sticky nav
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
