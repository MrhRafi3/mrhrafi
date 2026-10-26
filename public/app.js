document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const navbar = document.getElementById('navbar');
  const projectsPinSection = document.getElementById('projects');
  const projectsViewport = document.getElementById('projects-viewport');
  const projectsCarousel = document.getElementById('projects-carousel');
  const projectsProgressBar = document.getElementById('projects-progress-bar');
  const projectsIndicator = document.getElementById('projects-indicator');
  const projectsWindow = document.getElementById('projects-window');
  const carouselPrevBtn = document.getElementById('carousel-prev-btn');
  const carouselNextBtn = document.getElementById('carousel-next-btn');
  const stepCurrentEl = document.getElementById('step-current');
  const stepTotalEl = document.getElementById('step-total');
  const groundSections = Array.from(document.querySelectorAll('[data-ground]'));
  const talkCursor = document.getElementById('talk-cursor');
  const customUrlInput = document.getElementById('custom-url-input');
  const enrichBtn = document.getElementById('enrich-btn');
  const enrichLoading = document.getElementById('enrich-loading');
  const navHamburger = document.getElementById('nav-hamburger');
  const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const stickyCta = document.getElementById('sticky-cta');
  const navPills = document.querySelectorAll('.nav-pills .nav-pill');
  const faqItems = document.querySelectorAll('.faq-item');
  const statNumbers = document.querySelectorAll('.stat-number');
  const revealElements = document.querySelectorAll('.reveal-on-scroll, [data-split]');

  // Modal DOM Elements
  const modalBackdrop = document.getElementById('project-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContentArea = document.getElementById('modal-content-area');

  // Copy Email button in Contact
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyBtnText = document.getElementById('copy-btn-text');

  let portfolioData = null;
  let maxTravelDistance = 0;
  let activeCardIndex = 0;
  let isTicking = false;
  let isDragging = false;
  let dragStartX = 0;
  let dragScrollTop = 0;

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Category mapping helper for project cards
  function getProjectCategory(p) {
    if (p.category) return p.category;
    if (p.tags && p.tags.length > 0) return p.tags[0];
    return 'Mobile App';
  }

  // Icon mapping helper
  function getProjectIcon(id) {
    switch (id) {
      case 'clocky': return '⏱️';
      case 'expify-beta': return '💳';
      case 'nomnom': return '🍔';
      case 'alchemy': return '⚗️';
      case 'aevique': return '✨';
      default: return '📱';
    }
  }

  // ============================================================
  // 1. Fetch & Render Portfolio Data
  // ============================================================
  async function loadPortfolio() {
    try {
      const res = await fetch('/api/portfolio');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      portfolioData = await res.json();

      if (portfolioData && portfolioData.projects) {
        renderProjects(portfolioData.projects);
      }
    } catch (err) {
      console.error('Failed to load portfolio projects:', err);
      if (projectsCarousel) {
        projectsCarousel.innerHTML = '<p class="section-subtext">Could not load projects. Please refresh.</p>';
      }
    }
  }

  function getProjectCover(p) {
    if (p && p.coverSrc) return p.coverSrc;
    switch (p?.id) {
      case 'clocky': return '/images/project-covers/clocky-cover.webp';
      case 'expify-beta': return '/images/project-covers/expify-cover.webp';
      case 'nomnom': return '/images/project-covers/nomnom-cover.webp';
      case 'alchemy': return '/images/project-covers/alchemy-cover.webp';
      case 'aevique': return '/images/project-covers/aevique-cover.webp';
      default: return '';
    }
  }

  // ============================================================
  // 2. Render Projects in Carousel / Horizontal Track
  // ============================================================
  function renderProjects(projects) {
    if (!projectsCarousel) return;

    if (!projects || projects.length === 0) {
      projectsCarousel.innerHTML = '<p class="section-subtext">No projects available.</p>';
      return;
    }

    projectsCarousel.innerHTML = projects
      .map((p) => {
        const category = getProjectCategory(p);
        const icon = getProjectIcon(p.id);
        const isEnriched = Boolean(p.enriched);
        const hasGithub = Boolean(p.githubUrl);
        const coverSrc = getProjectCover(p);

        return `
        <article class="project-card project-card--${escapeHtml(p.id)}" id="project-${escapeHtml(p.id)}" data-id="${escapeHtml(p.id)}">
          <div class="card-glare" aria-hidden="true"></div>
          <div class="project-card-cover" role="button" tabindex="0" aria-label="Open ${escapeHtml(p.title)} showcase">
            ${
              coverSrc
                ? `<img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(p.title)} cover" class="card-cover-img" loading="lazy" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.classList.remove('hidden'); console.warn('Missing project cover image: ' + this.src);" />
                   <div class="card-cover-placeholder hidden">
                     <span class="card-cover-placeholder-icon">🖼️</span>
                     <span class="card-cover-placeholder-title">${escapeHtml(p.title)}</span>
                     <span class="card-cover-placeholder-path">${escapeHtml(coverSrc)}</span>
                   </div>`
                : `<div class="card-cover-placeholder">
                     <span class="card-cover-placeholder-icon">🖼️</span>
                     <span class="card-cover-placeholder-title">${escapeHtml(p.title)}</span>
                     <span class="card-cover-placeholder-path">Cover image not configured</span>
                   </div>`
            }
            <div class="card-cover-gloss"></div>
            <span class="project-card-category"><span class="brand-tag-r" aria-hidden="true">R</span> ${escapeHtml(category)}</span>
            ${p.badge ? `<span class="project-card-badge">${escapeHtml(p.badge)}</span>` : ''}
          </div>

          <div class="project-card-body">
            <div class="project-card-title-row">
              <h3 class="project-card-title">${escapeHtml(p.title)}${p.accent ? `<span class="card-title-accent">${escapeHtml(p.accent)}</span>` : ''}</h3>
              <span class="project-card-year">2026</span>
            </div>
            
            <p class="project-card-desc">${escapeHtml(p.tagline || p.description)}</p>
            
            <div class="project-card-tags">
              ${(p.tags || []).slice(0, 4).map((t) => `<span class="project-card-tag">${escapeHtml(t)}</span>`).join('')}
            </div>

            <div class="project-card-footer">
              <button type="button" class="btn-card-showcase" data-id="${escapeHtml(p.id)}" aria-label="Explore ${escapeHtml(p.title)} case study">
                <span>Explore Showcase</span> ↗
              </button>

              <div class="card-actions-right">
                ${
                  hasGithub
                    ? `<a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener" class="project-card-link" title="Open GitHub Repository">GitHub ↗</a>`
                    : `<span class="project-card-link disabled" title="${escapeHtml(p.repoNote || 'Repository in preparation')}">Repo Soon</span>`
                }
              </div>
            </div>
          </div>
        </article>
      `;
      })
      .join('');

    // Attach listeners for opening the detail modal
    document.querySelectorAll('.btn-card-showcase').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openProjectModal(id);
      });
    });

    document.querySelectorAll('.project-card-cover').forEach((imgWrap) => {
      imgWrap.addEventListener('click', (e) => {
        const card = e.currentTarget.closest('.project-card');
        if (card) {
          const id = card.dataset.id;
          openProjectModal(id);
        }
      });
      imgWrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const card = e.currentTarget.closest('.project-card');
          if (card) openProjectModal(card.dataset.id);
        }
      });
    });



    // Handle card focus for keyboard navigation
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('focusin', () => {
        if (!isMobileLayout() && projectsPinSection) {
          const cardRect = card.getBoundingClientRect();
          if (cardRect.left < 50 || cardRect.right > window.innerWidth - 50) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      });
    });

    initProjectCardTilt();

    // Update gallery pinning geometry with newly rendered card widths
    if (stepTotalEl && projects) {
      stepTotalEl.textContent = String(projects.length).padStart(2, '0');
    }
    setTimeout(updateGalleryMetrics, 50);
  }

  // Interactive 3D Perspective Tilt and Dynamic Glare for Project Cards (Desktop pointer-only)
  function initProjectCardTilt() {
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReducedMotion || !hasFinePointer || window.innerWidth <= 1024) return;

    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card) => {
      let isTicking = false;

      card.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        if (isTicking) return;
        isTicking = true;

        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;

          const px = Math.max(0, Math.min(100, (x / rect.width) * 100));
          const py = Math.max(0, Math.min(100, (y / rect.height) * 100));

          const rotX = ((cy - y) / cy) * 5.0;
          const rotY = ((x - cx) / cx) * 5.0;

          card.style.setProperty('--glare-x', `${px.toFixed(1)}%`);
          card.style.setProperty('--glare-y', `${py.toFixed(1)}%`);
          card.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s ease, border-color 0.2s ease';
          card.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

          isTicking = false;
        });
      });

      card.addEventListener('pointerleave', () => {
        card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.25s ease';
        card.style.transform = '';
        card.style.removeProperty('--glare-x');
        card.style.removeProperty('--glare-y');
      });
    });
  }

  // ============================================================
  // 3. Project Detail Modal
  // ============================================================
  let activeModalProject = null;
  let activeProjectIndex = 0;
  let activeScreenIndex = 0;
  let activeModalTrigger = null;

  function openProjectModal(projectId) {
    if (!portfolioData || !portfolioData.projects) return;
    const projectIndex = portfolioData.projects.findIndex((p) => p.id === projectId);
    if (projectIndex === -1) return;

    activeModalTrigger = document.activeElement;
    activeProjectIndex = projectIndex;
    activeModalProject = portfolioData.projects[projectIndex];
    activeScreenIndex = 0;
    renderModalContent();

    if (modalBackdrop) {
      modalBackdrop.classList.add('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (modalCloseBtn) {
        setTimeout(() => modalCloseBtn.focus(), 60);
      }
    }
  }

  function closeProjectModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    activeModalProject = null;
    if (activeModalTrigger && typeof activeModalTrigger.focus === 'function') {
      activeModalTrigger.focus();
      activeModalTrigger = null;
    }
  }

  function navigateProject(direction) {
    if (!portfolioData || !portfolioData.projects || portfolioData.projects.length === 0) return;
    const total = portfolioData.projects.length;
    let nextIdx = (activeProjectIndex + direction) % total;
    if (nextIdx < 0) nextIdx += total;
    switchToProject(nextIdx);
  }

  function switchToProject(newIndex) {
    if (!portfolioData || !portfolioData.projects || !portfolioData.projects[newIndex]) return;
    activeProjectIndex = newIndex;
    activeModalProject = portfolioData.projects[newIndex];
    activeScreenIndex = 0;

    const dialog = modalBackdrop?.querySelector('.project-modal-dialog');
    if (dialog && !prefersReducedMotion) {
      modalContentArea.style.transition = 'opacity 0.12s ease, transform 0.14s cubic-bezier(0.16, 1, 0.3, 1)';
      modalContentArea.style.opacity = '0.35';
      modalContentArea.style.transform = 'translateY(6px)';
      setTimeout(() => {
        renderModalContent();
        modalContentArea.style.opacity = '1';
        modalContentArea.style.transform = 'translateY(0)';
        dialog.scrollTop = 0;
      }, 100);
    } else {
      renderModalContent();
      if (dialog) dialog.scrollTop = 0;
    }

    const announcer = document.getElementById('modal-live-announcer');
    if (announcer) {
      announcer.textContent = `Showing ${activeModalProject.title} case study, project ${activeProjectIndex + 1} of ${portfolioData.projects.length}`;
    }
  }

  function renderModalContent() {
    if (!modalContentArea || !activeModalProject || !portfolioData?.projects) return;
    const p = activeModalProject;
    const projects = portfolioData.projects;
    const total = projects.length;
    const prevIdx = (activeProjectIndex - 1 + total) % total;
    const nextIdx = (activeProjectIndex + 1) % total;
    const prevProject = projects[prevIdx];
    const nextProject = projects[nextIdx];

    const screens = p.screenshots || [];
    const currentScreen = screens[activeScreenIndex] || screens[0] || { src: p.screenshotSrc, label: 'Overview' };
    const hasGithub = Boolean(p.githubUrl);

    modalContentArea.innerHTML = `
      <!-- Top Navigation & Brand Bar -->
      <div class="modal-header-nav">
        <div class="modal-header-brand">
          <span class="modal-header-brand-badge">R</span>
          <span>RAFI ORIGINAL · ${escapeHtml(p.platform || 'Flutter Mobile Application')}</span>
        </div>
        <div class="modal-nav-controls" role="group" aria-label="Project switcher">
          <button type="button" class="modal-nav-btn modal-nav-btn--prev" id="modal-nav-prev" title="Switch to ${escapeHtml(prevProject.title)}" aria-label="Previous project: ${escapeHtml(prevProject.title)}">
            ← <span class="modal-nav-btn-text">Prev</span>
          </button>
          <span class="modal-nav-counter" aria-hidden="true">${String(activeProjectIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
          <button type="button" class="modal-nav-btn modal-nav-btn--next" id="modal-nav-next" title="Switch to ${escapeHtml(nextProject.title)}" aria-label="Next project: ${escapeHtml(nextProject.title)}">
            <span class="modal-nav-btn-text">Next</span> →
          </button>
        </div>
      </div>

      <div class="modal-grid">
        <!-- Left: Phone Device Showcase & Screenshot Switcher -->
        <div class="modal-media-col">
          <div class="modal-phone-frame">
            <div class="modal-phone-bezel">
              <span class="modal-dynamic-island"></span>
              <img src="${escapeHtml(currentScreen.src)}" alt="${escapeHtml(currentScreen.alt || p.title)}" class="modal-phone-img" loading="lazy" />
            </div>
            <div class="modal-screen-caption">${escapeHtml(currentScreen.label || 'Screen Overview')}</div>
          </div>

          ${
            screens.length > 1
              ? `
            <div class="modal-thumbnails-strip">
              ${screens
                .map(
                  (s, idx) => `
                <button type="button" class="modal-thumb-btn ${idx === activeScreenIndex ? 'is-active' : ''}" data-screen-idx="${idx}" title="${escapeHtml(s.label)}">
                  <img src="${escapeHtml(s.src)}" alt="${escapeHtml(s.label)}" loading="lazy" />
                  <span>${escapeHtml(s.label)}</span>
                </button>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }
        </div>

        <!-- Right: Project Narrative & Specifications -->
        <div class="modal-info-col">
          <div class="modal-kicker-row">
            <span class="modal-category-badge">${escapeHtml(p.category)}</span>
            ${p.badge ? `<span class="modal-status-badge">${escapeHtml(p.badge)}</span>` : ''}
          </div>

          <h2 class="modal-title" id="modal-project-title">
            ${escapeHtml(p.title)}${p.accent ? `<span class="accent-dot">${escapeHtml(p.accent)}</span>` : ''}
          </h2>

          <p class="modal-tagline">${escapeHtml(p.tagline)}</p>

          <div class="modal-role-badge">
            <span class="role-icon">👤</span> ${escapeHtml(p.role || 'Flutter App Developer')}${p.platform ? ` · <span>${escapeHtml(p.platform)}</span>` : ''}
          </div>

          <div class="modal-section-block">
            <h4 class="modal-block-title">Overview</h4>
            <p class="modal-desc">${escapeHtml(p.description)}</p>
            ${p.overview ? `<p class="modal-overview-text">${escapeHtml(p.overview)}</p>` : ''}
          </div>

          ${
            p.features && p.features.length > 0
              ? `
            <div class="modal-section-block">
              <h4 class="modal-block-title">Verified Key Features</h4>
              <div class="modal-features-list">
                ${p.features
                  .map(
                    (f) => `
                  <div class="modal-feature-item">
                    <span class="modal-feat-icon">${escapeHtml(f.icon)}</span>
                    <div>
                      <strong>${escapeHtml(f.name)}</strong>
                      <p>${escapeHtml(f.detail)}</p>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          ${
            p.highlights && p.highlights.length > 0
              ? `
            <div class="modal-section-block">
              <h4 class="modal-block-title">Engineering Highlights</h4>
              <ul class="modal-highlights-bullets">
                ${p.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }

          <div class="modal-section-block">
            <h4 class="modal-block-title">Technology Stack</h4>
            <div class="modal-tech-pills">
              ${(p.tags || []).map((t) => `<span class="modal-tech-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>

          <div class="modal-actions-row">
            ${
              hasGithub
                ? `
              <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener" class="btn btn-primary">
                GitHub Repository ↗
              </a>
            `
                : `
              <span class="repo-note-badge" title="${escapeHtml(p.repoNote || 'In preparation')}">
                🔒 ${escapeHtml(p.repoNote || 'Repository Coming Soon')}
              </span>
            `
            }
            <a href="https://github.com/mrhrafi3" target="_blank" rel="noopener" class="btn btn-outline">
              Author Profile ↗
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Next / Previous Case Study Switcher -->
      <div class="modal-bottom-switcher">
        <button type="button" class="modal-switch-card modal-switch-card--prev" data-switch-dir="-1" aria-label="Previous project: ${escapeHtml(prevProject.title)}">
          <span class="switch-label">← Previous Case Study</span>
          <span class="switch-title">${escapeHtml(prevProject.title)}</span>
        </button>
        <button type="button" class="modal-switch-card modal-switch-card--next" data-switch-dir="1" aria-label="Next project: ${escapeHtml(nextProject.title)}">
          <span class="switch-label">Next Case Study →</span>
          <span class="switch-title">${escapeHtml(nextProject.title)}</span>
        </button>
      </div>
    `;

    // Top nav buttons
    const navPrevBtn = modalContentArea.querySelector('#modal-nav-prev');
    const navNextBtn = modalContentArea.querySelector('#modal-nav-next');
    if (navPrevBtn) navPrevBtn.addEventListener('click', () => navigateProject(-1));
    if (navNextBtn) navNextBtn.addEventListener('click', () => navigateProject(1));

    // Bottom switcher cards
    modalContentArea.querySelectorAll('.modal-switch-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = parseInt(btn.dataset.switchDir, 10);
        if (!isNaN(dir)) navigateProject(dir);
      });
    });

    // Smooth in-place screenshot switcher (preserves dialog focus and scroll position)
    function switchModalScreen(idx) {
      if (!activeModalProject || !activeModalProject.screenshots || !activeModalProject.screenshots[idx]) return;
      activeScreenIndex = idx;
      const screen = activeModalProject.screenshots[idx];
      const imgEl = modalContentArea.querySelector('.modal-phone-img');
      const captionEl = modalContentArea.querySelector('.modal-screen-caption');
      const thumbs = modalContentArea.querySelectorAll('.modal-thumb-btn');

      if (imgEl) {
        imgEl.style.opacity = '0.3';
        imgEl.style.transform = 'scale(0.97)';
        setTimeout(() => {
          imgEl.src = screen.src;
          imgEl.alt = screen.caption || `${activeModalProject.title} screenshot`;
          imgEl.style.opacity = '1';
          imgEl.style.transform = 'scale(1)';
        }, 110);
      }
      if (captionEl) {
        captionEl.textContent = screen.caption || '';
      }
      thumbs.forEach((t) => {
        const isAct = parseInt(t.dataset.screenIdx, 10) === idx;
        t.classList.toggle('is-active', isAct);
        t.setAttribute('aria-pressed', isAct ? 'true' : 'false');
      });
    }

    // Listeners for thumbnails switcher
    modalContentArea.querySelectorAll('.modal-thumb-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.screenIdx, 10);
        if (!isNaN(idx)) {
          switchModalScreen(idx);
        }
      });
    });


  }

  // Modal close events
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeProjectModal();
      }
    });

    // Keyboard accessibility trap within modal
    modalBackdrop.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusableElements = modalBackdrop.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (!modalBackdrop?.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeProjectModal();
    } else if (e.key === 'ArrowRight') {
      navigateProject(1);
    } else if (e.key === 'ArrowLeft') {
      navigateProject(-1);
    }
  });

  // ============================================================
  // 4. Pinned Horizontal Project Gallery (Scroll-Linked + Snap)
  // ============================================================
  function getCardStep() {
    const card = projectsCarousel ? projectsCarousel.querySelector('.project-card') : null;
    if (!card) return 408;
    const style = window.getComputedStyle(projectsCarousel);
    const gap = parseFloat(style.gap) || 28;
    return card.offsetWidth + gap;
  }

  let isPointerCaptured = false;
  let pointerStartX = 0;
  let dragStartTranslateX = 0;
  let currentTranslateX = 0;
  let hasDragged = false;

  function isMobileLayout() {
    // Pure width-based breakpoint: prevents touchscreen laptops from losing desktop gallery
    return window.innerWidth <= 1024;
  }

  function updateGalleryMetrics() {
    if (!projectsPinSection || !projectsCarousel) return;

    if (isMobileLayout() || prefersReducedMotion) {
      projectsPinSection.style.height = 'auto';
      projectsCarousel.style.transform = 'none';
      if (projectsProgressBar) {
        const totalCards = portfolioData?.projects?.length || 5;
        const maxScroll = projectsWindow ? (projectsWindow.scrollWidth - projectsWindow.clientWidth) : 0;
        const scrollLeft = projectsWindow ? projectsWindow.scrollLeft : 0;
        const pct = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : (activeCardIndex / Math.max(1, totalCards - 1)) * 100;
        projectsProgressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      }
      return;
    }

    const trackWidth = projectsCarousel.scrollWidth;
    const windowWidth = window.innerWidth;
    const firstCard = projectsCarousel.querySelector('.project-card');
    const cardWidth = firstCard ? firstCard.offsetWidth : 380;
    const endPadding = Math.max(100, (windowWidth - cardWidth) / 2);
    maxTravelDistance = Math.max(0, trackWidth - windowWidth + endPadding);

    if (maxTravelDistance <= 0) {
      // All cards fit in viewport without scrolling
      projectsPinSection.style.height = 'auto';
      projectsCarousel.style.transform = 'none';
      if (projectsProgressBar) projectsProgressBar.style.width = '100%';
      return;
    }

    // Height of pin section dynamically scales with actual distance to travel
    const scrollDistance = Math.max(maxTravelDistance * 1.15, window.innerHeight * 0.95);
    projectsPinSection.style.height = `${window.innerHeight + scrollDistance}px`;

    syncHorizontalScroll();
  }

  function updateCarouselControls() {
    const totalCards = portfolioData?.projects?.length || 3;
    if (stepCurrentEl) {
      stepCurrentEl.textContent = String(activeCardIndex + 1).padStart(2, '0');
    }
    if (stepTotalEl) {
      stepTotalEl.textContent = String(totalCards).padStart(2, '0');
    }
    if (carouselPrevBtn) {
      carouselPrevBtn.setAttribute('aria-disabled', String(activeCardIndex <= 0));
    }
    if (carouselNextBtn) {
      carouselNextBtn.setAttribute('aria-disabled', String(activeCardIndex >= totalCards - 1));
    }
  }

  function goToCard(targetIndex, smooth = true) {
    if (!projectsPinSection || !projectsCarousel) return;
    const totalCards = portfolioData?.projects?.length || 3;
    activeCardIndex = Math.max(0, Math.min(totalCards - 1, targetIndex));
    updateCarouselControls();

    if (isMobileLayout()) {
      const cards = projectsCarousel.querySelectorAll('.project-card');
      if (cards[activeCardIndex] && projectsWindow) {
        const card = cards[activeCardIndex];
        const cardLeft = card.offsetLeft;
        projectsWindow.scrollTo({
          left: cardLeft,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
      return;
    }

    if (prefersReducedMotion) {
      const cards = projectsCarousel.querySelectorAll('.project-card');
      if (cards[activeCardIndex]) {
        cards[activeCardIndex].scrollIntoView({ behavior: 'auto', inline: 'start', block: 'nearest' });
      }
      return;
    }

    const cardStep = getCardStep();
    const targetTranslate = Math.min(maxTravelDistance, activeCardIndex * cardStep);
    currentTranslateX = targetTranslate;

    if (smooth) {
      projectsCarousel.classList.add('is-settling');
    }
    projectsCarousel.style.transform = `translate3d(${-targetTranslate}px, 0, 0)`;

    const progress = maxTravelDistance > 0 ? targetTranslate / maxTravelDistance : 1;
    if (projectsProgressBar) {
      projectsProgressBar.style.width = `${progress * 100}%`;
    }
    if (projectsIndicator) {
      projectsIndicator.style.opacity = progress > 0.92 ? '0.25' : '1';
    }

    // Smoothly scroll window if user clicked controls
    const totalScrollable = projectsPinSection.offsetHeight - window.innerHeight;
    if (totalScrollable > 0 && !isDragging) {
      const targetScrollY = projectsPinSection.offsetTop + progress * totalScrollable;
      window.scrollTo({
        top: targetScrollY,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }

    if (smooth) {
      setTimeout(() => {
        projectsCarousel.classList.remove('is-settling');
      }, 380);
    }
  }

  function syncHorizontalScroll() {
    if (!projectsPinSection || !projectsCarousel || isDragging) return;

    if (isMobileLayout() || prefersReducedMotion) {
      projectsCarousel.style.transform = 'none';
      return;
    }

    const rect = projectsPinSection.getBoundingClientRect();
    const totalScrollable = projectsPinSection.offsetHeight - window.innerHeight;

    if (totalScrollable <= 0) return;

    const rawProgress = -rect.top / totalScrollable;
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    currentTranslateX = progress * maxTravelDistance;

    projectsCarousel.classList.remove('is-settling');
    projectsCarousel.style.transform = `translate3d(${-currentTranslateX}px, 0, 0)`;

    if (projectsProgressBar) {
      projectsProgressBar.style.width = `${progress * 100}%`;
    }
    if (projectsIndicator) {
      projectsIndicator.style.opacity = progress > 0.92 ? '0.25' : '1';
    }

    // Update active card index indicator based on current translation
    const totalCards = portfolioData?.projects?.length || 3;
    const cardStep = getCardStep();
    const newIdx = Math.min(totalCards - 1, Math.max(0, Math.round(currentTranslateX / cardStep)));
    if (newIdx !== activeCardIndex) {
      activeCardIndex = newIdx;
      updateCarouselControls();
    }
  }

  // Prev / Next button click handlers
  if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToCard(activeCardIndex - 1, true);
    });
  }

  if (carouselNextBtn) {
    carouselNextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToCard(activeCardIndex + 1, true);
    });
  }

  // Pointer capture drag & inertia card snapping on desktop
  if (projectsWindow) {
    projectsWindow.addEventListener('pointerdown', (e) => {
      if (isMobileLayout() || prefersReducedMotion) return;
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;

      isDragging = true;
      hasDragged = false;
      pointerStartX = e.clientX;
      dragStartTranslateX = currentTranslateX;

      projectsCarousel.classList.remove('is-settling');
      try {
        projectsWindow.setPointerCapture(e.pointerId);
        isPointerCaptured = true;
      } catch {}
      projectsWindow.style.cursor = 'grabbing';
      e.preventDefault();
    });

    projectsWindow.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - pointerStartX;
      if (Math.abs(deltaX) > 6) {
        hasDragged = true;
      }

      let newTranslate = dragStartTranslateX - deltaX;
      // Soft rubberband resistance at boundaries
      if (newTranslate < 0) {
        newTranslate = newTranslate * 0.3;
      } else if (newTranslate > maxTravelDistance) {
        newTranslate = maxTravelDistance + (newTranslate - maxTravelDistance) * 0.3;
      }

      currentTranslateX = newTranslate;
      projectsCarousel.style.transform = `translate3d(${-newTranslate}px, 0, 0)`;

      const progress = maxTravelDistance > 0 ? Math.min(1, Math.max(0, newTranslate / maxTravelDistance)) : 0;
      if (projectsProgressBar) {
        projectsProgressBar.style.width = `${progress * 100}%`;
      }
    });

    const handlePointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      projectsWindow.style.cursor = '';

      if (isPointerCaptured) {
        try {
          projectsWindow.releasePointerCapture(e.pointerId);
        } catch {}
        isPointerCaptured = false;
      }

      if (hasDragged) {
        // Snap to nearest card
        const cardStep = getCardStep();
        const targetIndex = Math.round(currentTranslateX / cardStep);
        goToCard(targetIndex, true);
      }
    };

    projectsWindow.addEventListener('pointerup', handlePointerUp);
    projectsWindow.addEventListener('pointercancel', handlePointerUp);

    // Guard clicks if user dragged
    projectsWindow.addEventListener(
      'click',
      (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          hasDragged = false;
        }
      },
      true
    );

    // Mobile swipe & scroll synchronization for carousel controls
    let mobileScrollRaf = null;
    projectsWindow.addEventListener(
      'scroll',
      () => {
        if (!isMobileLayout()) return;
        if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
        mobileScrollRaf = requestAnimationFrame(() => {
          const cards = projectsCarousel.querySelectorAll('.project-card');
          if (!cards.length) return;

          const scrollLeft = projectsWindow.scrollLeft;
          const maxScroll = projectsWindow.scrollWidth - projectsWindow.clientWidth;

          let closestIdx = 0;
          let minDistance = Infinity;

          if (scrollLeft <= 10) {
            closestIdx = 0;
          } else if (maxScroll > 0 && scrollLeft >= maxScroll - 15) {
            closestIdx = cards.length - 1;
          } else {
            cards.forEach((card, idx) => {
              const cardLeft = card.offsetLeft;
              const diff = Math.abs(cardLeft - scrollLeft);
              if (diff < minDistance) {
                minDistance = diff;
                closestIdx = idx;
              }
            });
          }

          if (closestIdx !== activeCardIndex) {
            activeCardIndex = closestIdx;
            updateCarouselControls();
          }

          if (projectsProgressBar) {
            const pct = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : (activeCardIndex / Math.max(1, cards.length - 1)) * 100;
            projectsProgressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
          }
        });
      },
      { passive: true }
    );
  }

  // Keyboard navigation when Projects section is in view
  window.addEventListener('keydown', (e) => {
    if (modalBackdrop?.classList.contains('is-open')) return;
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const rect = projectsPinSection?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
        e.preventDefault();
        goToCard(e.key === 'ArrowRight' ? activeCardIndex + 1 : activeCardIndex - 1, true);
      }
    }
  });

  // ============================================================
  // 5. Scroll-Triggered Reveal Animations
  // ============================================================
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }

  // ============================================================
  // 6. Trigger Enrichment via Context.dev API
  // ============================================================
  async function triggerEnrich(projectId, url, buttonEl) {
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.textContent = 'Enriching...';
    }
    if (enrichLoading) enrichLoading.classList.remove('hidden');

    try {
      const res = await fetch('/api/portfolio/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, url }),
      });

      const data = await res.json();
      if (data.success && data.project) {
        if (!portfolioData) portfolioData = { projects: [] };
        const idx = portfolioData.projects.findIndex((p) => p.id === projectId || p.url === url);
        if (idx !== -1) {
          portfolioData.projects[idx] = data.project;
        } else {
          portfolioData.projects.unshift(data.project);
        }
        renderProjects(portfolioData.projects);
      } else {
        alert(data.error || data.message || 'Failed to enrich project via Context.dev');
      }
    } catch (err) {
      console.error('Enrichment call failed:', err);
      alert('Unable to contact server for Context.dev enrichment.');
    } finally {
      if (enrichLoading) enrichLoading.classList.add('hidden');
      if (buttonEl) buttonEl.disabled = false;
    }
  }



  // ============================================================
  // 7. FAQ Accordion Interaction
  // ============================================================
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('open');
            other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          item.classList.remove('open');
          questionBtn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // ============================================================
  // 8. Mobile Navigation Menu Toggle & Accessible Focus
  // ============================================================
  function syncNavbarMetrics() {
    if (!navbar) return;
    const rect = navbar.getBoundingClientRect();
    if (rect.height > 0) {
      const navBottom = Math.round(rect.bottom);
      const navHeight = Math.round(rect.height);
      document.documentElement.style.setProperty('--navbar-bottom', `${navBottom}px`);
      document.documentElement.style.setProperty('--navbar-height', `${navHeight}px`);
    }
  }

  function closeMobileNav({ restoreFocus = false } = {}) {
    if (!mobileNavOverlay) return;
    mobileNavOverlay.classList.remove('open');
    mobileNavOverlay.setAttribute('aria-hidden', 'true');
    if (navHamburger) {
      navHamburger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) {
        navHamburger.focus();
      }
    }
    document.body.style.overflow = '';
    updateNavbarTheme();
  }

  // Navigation Section Tracking Configuration
  const navTrackedSections = [
    { id: 'home', el: document.getElementById('home'), targetNav: 'home' },
    { id: 'about', el: document.getElementById('about'), targetNav: 'about' },
    { id: 'chapters', el: document.getElementById('chapters'), targetNav: 'about' },
    { id: 'skills', el: document.getElementById('skills'), targetNav: 'skills' },
    { id: 'services', el: document.getElementById('services'), targetNav: 'services' },
    { id: 'tags', el: document.getElementById('tags'), targetNav: 'services' },
    { id: 'projects', el: document.getElementById('projects'), targetNav: 'projects' },
    { id: 'process', el: document.getElementById('process'), targetNav: 'process' },
    { id: 'faq', el: document.getElementById('faq'), targetNav: 'faq' },
    { id: 'blog', el: document.getElementById('blog'), targetNav: 'faq' },
    { id: 'contact', el: document.getElementById('contact'), targetNav: 'contact' },
  ].filter((s) => s.el !== null);

  function setActivePill(sectionId) {
    const targetHref = `#${sectionId}`;
    navPills.forEach((pill) => {
      const href = pill.getAttribute('href');
      if (href === targetHref || (!sectionId && href === '#home')) {
        pill.classList.add('active');
        pill.setAttribute('aria-current', 'page');
      } else {
        pill.classList.remove('active');
        pill.removeAttribute('aria-current');
      }
    });

    if (mobileNavOverlay) {
      const mobileLinks = mobileNavOverlay.querySelectorAll('.mobile-nav-links a');
      mobileLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === targetHref || (!sectionId && href === '#home')) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    }
  }

  function getActiveNavId() {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY < 50) {
      return 'home';
    }

    const vh = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    // Check if scrolled to or very near document bottom
    if ((scrollY + vh) >= (docHeight - 15)) {
      return 'contact';
    }

    const navBottom = navbar ? navbar.getBoundingClientRect().bottom : 80;
    // Section destinations land around navBottom + 16px via scrollToSection.
    // Setting threshold to navBottom + 28px provides a reliable, generous buffer.
    const threshold = Math.round(navBottom) + 28;

    // Traverse bottom-to-top.
    // This permanently prevents negative margin tuck-in overlaps (e.g. margin-top: -32px
    // on .projects-pin-section, .process-section, and .final-cta-section) from matching
    // the preceding section's bottom edge and causing the active indicator to lag behind.
    for (let i = navTrackedSections.length - 1; i >= 0; i--) {
      const sec = navTrackedSections[i];
      const rect = sec.el.getBoundingClientRect();
      if (rect.top <= threshold) {
        return sec.targetNav;
      }
    }

    return 'home';
  }

  function updateActiveNavPill() {
    if (isProgrammaticScroll && programmaticTarget) {
      setActivePill(programmaticTarget);
      return;
    }

    const activeId = getActiveNavId();
    setActivePill(activeId);
  }

  function scrollToSection(targetId) {
    if (targetId === '#home' || targetId === 'home') {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      return;
    }

    const sel = targetId.startsWith('#') ? targetId : `#${targetId}`;
    const targetElement = document.querySelector(sel);
    if (!targetElement) return;

    const navBottom = navbar ? navbar.getBoundingClientRect().bottom : 80;
    const navOffset = Math.round(navBottom) + 16;
    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - navOffset;

    window.scrollTo({
      top: Math.max(0, Math.round(targetTop)),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  let isProgrammaticScroll = false;
  let programmaticTarget = null;
  let scrollSettleTimer = null;
  let settleRafId = null;

  function endProgrammaticScroll() {
    if (scrollSettleTimer) {
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = null;
    }
    if (settleRafId) {
      cancelAnimationFrame(settleRafId);
      settleRafId = null;
    }
    isProgrammaticScroll = false;
    programmaticTarget = null;
    updateActiveNavPill();
    updateNavbarTheme();
  }

  function navigateToSection(targetId) {
    const cleanId = targetId.replace('#', '');
    isProgrammaticScroll = true;
    programmaticTarget = cleanId;

    // Immediately highlight destination pill for instant feedback
    setActivePill(cleanId);
    scrollToSection(targetId);

    if (history.pushState) {
      history.pushState(null, '', `#${cleanId}`);
    } else {
      window.location.hash = `#${cleanId}`;
    }

    if (scrollSettleTimer) clearTimeout(scrollSettleTimer);
    if (settleRafId) cancelAnimationFrame(settleRafId);

    if (prefersReducedMotion) {
      requestAnimationFrame(endProgrammaticScroll);
      return;
    }

    const startTime = performance.now();
    let lastY = window.scrollY;
    let stableFrames = 0;

    function checkSettle() {
      if (!isProgrammaticScroll) return;
      const now = performance.now();
      const currentY = window.scrollY;

      // Allow 150ms for smooth scroll animation to ramp up before checking stillness
      if (now - startTime > 150) {
        if (Math.abs(currentY - lastY) < 1.5) {
          stableFrames++;
          if (stableFrames >= 5) {
            endProgrammaticScroll();
            return;
          }
        } else {
          stableFrames = 0;
        }
      }
      lastY = currentY;
      settleRafId = requestAnimationFrame(checkSettle);
    }
    settleRafId = requestAnimationFrame(checkSettle);

    scrollSettleTimer = setTimeout(() => {
      endProgrammaticScroll();
    }, 1200);
  }

  window.addEventListener('scrollend', () => {
    if (isProgrammaticScroll) {
      endProgrammaticScroll();
    }
  }, { passive: true });

  ['wheel', 'touchstart', 'pointerdown'].forEach((evtType) => {
    window.addEventListener(evtType, () => {
      if (isProgrammaticScroll) {
        endProgrammaticScroll();
      }
    }, { passive: true });
  });

  window.addEventListener('keydown', (e) => {
    if (isProgrammaticScroll && ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Tab'].includes(e.key)) {
      endProgrammaticScroll();
    }
  }, { passive: true });

  function handleHashNavigation() {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const cleanId = hash.replace('#', '');
      const mapped = navTrackedSections.find((s) => s.id === cleanId || s.targetNav === cleanId);
      if (mapped) {
        navigateToSection(hash);
      }
    } else if (hash === '' || hash === '#home') {
      navigateToSection('#home');
    }
  }

  window.addEventListener('popstate', handleHashNavigation);
  window.addEventListener('hashchange', () => {
    if (!isProgrammaticScroll) {
      handleHashNavigation();
    }
  });

  // Attach navigation handler to desktop nav pills
  navPills.forEach((pill) => {
    pill.addEventListener('click', (e) => {
      const href = pill.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        navigateToSection(href);
      }
    });
  });

  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      const href = navLogo.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        navigateToSection(href);
      }
    });
  }

  const navCta = document.getElementById('nav-cta');
  if (navCta) {
    navCta.addEventListener('click', (e) => {
      const href = navCta.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        navigateToSection(href);
      }
    });
  }

  function openMobileNav() {
    if (!mobileNavOverlay) return;
    syncNavbarMetrics();
    mobileNavOverlay.classList.add('open');
    mobileNavOverlay.setAttribute('aria-hidden', 'false');
    if (navHamburger) navHamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    updateNavbarTheme();
    const firstLink = mobileNavOverlay.querySelector('.mobile-nav-links a, button');
    if (firstLink) setTimeout(() => firstLink.focus(), 60);
  }

  if (navHamburger && mobileNavOverlay) {
    navHamburger.addEventListener('click', () => {
      const isOpen = mobileNavOverlay.classList.contains('open');
      if (isOpen) {
        closeMobileNav({ restoreFocus: true });
      } else {
        openMobileNav();
      }
    });

    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', () => {
        closeMobileNav({ restoreFocus: true });
      });
    }

    mobileNavOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href) return;

        if (href.startsWith('#')) {
          e.preventDefault();
          const targetId = href;

          // 1. Close mobile nav immediately without stealing focus back to hamburger
          closeMobileNav({ restoreFocus: false });

          // 2. Perform smooth scroll in animation frame to ensure document overflow unlocked
          requestAnimationFrame(() => {
            navigateToSection(targetId);
          });
        } else {
          // External or mailto link
          closeMobileNav({ restoreFocus: false });
        }
      });
    });

    mobileNavOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileNav({ restoreFocus: true });
      }
    });
  }

  // ============================================================
  // 9. Sticky Bottom CTA on Scroll
  // ============================================================
  function updateStickyCta() {
    if (!stickyCta) return;
    const contactSection = document.getElementById('contact');
    const contactRect = contactSection ? contactSection.getBoundingClientRect() : null;
    const inContact = contactRect && contactRect.top < window.innerHeight * 0.85;

    if (window.scrollY > 450 && !inContact) {
      stickyCta.classList.add('visible');
    } else {
      stickyCta.classList.remove('visible');
    }
  }

  // ============================================================
  // 10. Stat Counter Animation on Scroll
  // ============================================================
  if ('IntersectionObserver' in window && statNumbers.length > 0) {
    const statObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateStats();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsCol = document.querySelector('.about-stats-col');
    if (statsCol) statObserver.observe(statsCol);
  } else {
    animateStats();
  }

  function animateStats() {
    statNumbers.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      if (!target) return;

      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString('en-US');
        return;
      }

      const duration = 1200;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * target);
        el.textContent = current.toLocaleString('en-US');
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target.toLocaleString('en-US');
        }
      }

      requestAnimationFrame(update);
    });
  }

  // ============================================================
  // 11. Dynamic Section-Aware Navbar Theming (data-ground)
  // ============================================================
  function updateNavbarTheme() {
    if (!navbar) return;

    if (mobileNavOverlay && mobileNavOverlay.classList.contains('open')) {
      navbar.setAttribute('data-theme', 'dark');
      navbar.removeAttribute('data-scrolled');
      return;
    }

    if (groundSections.length === 0) return;
    const navRect = navbar.getBoundingClientRect();
    const navMidY = navRect.top + navRect.height / 2;
    let activeGround = 'white';

    for (const sec of groundSections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= navMidY && rect.bottom > navMidY) {
        activeGround = sec.dataset.ground || 'white';
        break;
      }
    }

    const theme = activeGround === 'blue' || activeGround === 'ink' ? 'dark' : 'light';
    navbar.setAttribute('data-theme', theme);
    navbar.toggleAttribute('data-scrolled', window.scrollY > 80);
  }

  // ============================================================
  // 12. Active Navbar Pill Sync on Scroll (Unified Architecture)
  // ============================================================
  // Active pill synchronization is managed by getActiveNavId() and
  // updateActiveNavPill() in the unified Navigation Core above.

  // ============================================================
  // 13. Copy Email to Clipboard
  // ============================================================
  if (copyEmailBtn && copyBtnText) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = 'mrhrafi99@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        copyBtnText.textContent = 'Copied! ✓';
        copyEmailBtn.classList.add('is-copied');
        setTimeout(() => {
          copyBtnText.textContent = 'Copy';
          copyEmailBtn.classList.remove('is-copied');
        }, 2200);
      } catch (err) {
        console.error('Failed to copy email:', err);
        window.prompt('Copy email manually:', email);
      }
    });
  }

  // ============================================================
  // 14. Split-Word Typography Entrance (data-split)
  // Preserves <br> line breaks, nested styled spans, and full a11y
  // ============================================================
  function initSplitText() {
    if (prefersReducedMotion) return;
    const splitEls = document.querySelectorAll('[data-split]');

    function splitNode(node, counter, state) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text) return '';
        // Split on whitespace boundaries while preserving words
        const chunks = text.split(/(\s+)/);
        return chunks
          .map((chunk) => {
            if (/^\s+$/.test(chunk)) {
              if (state.prevWasBreak) return '';
              state.prevWasSpace = true;
              return ' ';
            }
            if (!chunk) return '';
            state.prevWasBreak = false;
            state.prevWasSpace = false;
            const idx = counter.val++;
            return `<span class="split-w"><span class="split-wi" style="--i: ${idx}">${escapeHtml(chunk)}</span></span>`;
          })
          .join('');
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === 'br') {
          state.prevWasBreak = true;
          return '<br class="split-br" />';
        }
        const tagName = node.tagName.toLowerCase();
        const attrs = Array.from(node.attributes)
          .map((a) => `${a.name}="${escapeHtml(a.value)}"`)
          .join(' ');
        const attrStr = attrs ? ` ${attrs}` : '';
        let inner = '';
        node.childNodes.forEach((child) => {
          inner += splitNode(child, counter, state);
        });
        return `<${tagName}${attrStr}>${inner}</${tagName}>`;
      }
      return '';
    }

    splitEls.forEach((el) => {
      if (el.classList.contains('is-split')) return;
      // Preserve screen reader accessibility via aria-label
      if (!el.getAttribute('aria-label')) {
        const cleanText = el.textContent.replace(/\s+/g, ' ').trim();
        el.setAttribute('aria-label', cleanText);
      }

      const counter = { val: 0 };
      const state = { prevWasBreak: true, prevWasSpace: false };
      let newHtml = '';
      el.childNodes.forEach((child) => {
        newHtml += splitNode(child, counter, state);
      });

      el.innerHTML = newHtml;
      el.classList.add('is-split');
    });
  }

  // ============================================================
  // 15. Interactive Matter.js Skills Physics ("Throw Them Around")
  // ============================================================
  function initSkillsPhysics() {
    const wrap = document.getElementById('skills-physics-wrap');
    const canvas = document.getElementById('skills-physics-canvas');
    const container = document.getElementById('skills-pills-container');
    if (!wrap || !canvas || !container) return;

    // Guaranteed visible HTML fallback:
    // If reduced-motion is requested, preserve accessible static flex pills.
    const MatterLib = window.Matter || (typeof Matter !== 'undefined' ? Matter : null);
    if (!MatterLib || prefersReducedMotion) {
      return;
    }

    // Mobile viewport threshold adaptation (Android / iOS / Desktop full support)
    const isMobileViewport = window.innerWidth <= 640;

    // Prevent double initialization
    if (wrap.dataset.physicsInit === 'true') return;
    wrap.dataset.physicsInit = 'true';

    try {
      const { Engine, Bodies, Composite, Body, Sleeping } = MatterLib;

      const wakeBody = (b) => {
        if (!b) return;
        if (Sleeping && typeof Sleeping.set === 'function') {
          Sleeping.set(b, false);
        } else {
          b.isSleeping = false;
        }
      };

      const wakeAllBodies = () => {
        pillBodies.forEach(wakeBody);
      };

      const engine = Engine.create({ enableSleeping: true });
      engine.gravity.y = isMobileViewport ? 0.95 : 0.9;

      let width = wrap.clientWidth || (isMobileViewport ? 360 : 800);
      let height = Math.max(isMobileViewport ? 440 : 420, wrap.clientHeight || (isMobileViewport ? 440 : 420));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      // Boundaries fully enclosing the container
      let floor = Bodies.rectangle(width / 2, height - 6, width * 3, 30, { isStatic: true, label: 'floor' });
      let ceiling = Bodies.rectangle(width / 2, -120, width * 3, 40, { isStatic: true, label: 'ceiling' });
      let leftWall = Bodies.rectangle(-25, height / 2, 50, height * 4, { isStatic: true, label: 'leftWall' });
      let rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 4, { isStatic: true, label: 'rightWall' });

      Composite.add(engine.world, [floor, ceiling, leftWall, rightWall]);

      // Collect real HTML skill pills
      const pillEls = Array.from(container.querySelectorAll('.skill-pill'));
      if (pillEls.length === 0) return;

      const pillBodies = [];
      const cols = width <= 500 ? 2 : (width <= 820 ? 3 : 3);
      const colWidth = (width - 40) / cols;

      pillEls.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const pillW = Math.max(68, Math.round(rect.width) || (width <= 480 ? 98 : 126));
        const pillH = Math.max(32, Math.round(rect.height) || (width <= 480 ? 36 : 42));

        const col = i % cols;
        const row = Math.floor(i / cols);
        let startX = 20 + col * colWidth + (colWidth / 2) + ((Math.random() - 0.5) * 14);
        if (pillW < width - 16) {
          startX = Math.max(pillW / 2 + 8, Math.min(width - pillW / 2 - 8, startX));
        } else {
          startX = width / 2;
        }
        let startY = 48 + row * (width <= 480 ? 56 : 64) + ((Math.random() - 0.5) * 8);
        startY = Math.max(pillH / 2 + 10, Math.min(height - pillH / 2 - 10, startY));

        const body = Bodies.rectangle(startX, startY, pillW, pillH, {
          chamfer: { radius: pillH / 2 },
          restitution: 0.55,
          friction: 0.22,
          frictionAir: 0.016,
          angle: (i % 2 === 0 ? 1 : -1) * (0.04 + (i * 0.02)),
        });

        body.pillEl = el;
        body.pillW = pillW;
        body.pillH = pillH;
        body.skillName = el.getAttribute('data-skill') || '';
        pillBodies.push(body);
      });

      Composite.add(engine.world, pillBodies);

      // Activate physics mode on container — real HTML pills are now positioned by physics transforms
      wrap.classList.add('has-physics');

      // Pointer event handlers on real HTML pills for smooth Android touch & desktop mouse
      let activeDrag = null;

      pillBodies.forEach((b) => {
        const el = b.pillEl;

        const onPointerDown = (e) => {
          if (e.button !== 0 && e.pointerType === 'mouse') return;
          if (e.cancelable) e.preventDefault();

          try {
            el.setPointerCapture(e.pointerId);
          } catch (_) {}

          el.classList.add('is-dragging');

          activeDrag = {
            pointerId: e.pointerId,
            body: b,
            el: el,
            lastX: e.clientX,
            lastY: e.clientY,
            lastTime: performance.now(),
            vx: 0,
            vy: 0,
          };

          wakeBody(b);
          Body.setStatic(b, true);
          if (!isRunning) {
            isRunning = true;
            renderFrame();
          }
        };

        const onPointerMove = (e) => {
          if (!activeDrag || activeDrag.pointerId !== e.pointerId) return;
          if (e.cancelable) e.preventDefault();

          const now = performance.now();
          const dt = Math.max(8, now - activeDrag.lastTime);
          const dx = e.clientX - activeDrag.lastX;
          const dy = e.clientY - activeDrag.lastY;

          // Smoothed momentum tracking
          const instVx = (dx / dt) * 16;
          const instVy = (dy / dt) * 16;
          activeDrag.vx = activeDrag.vx * 0.35 + instVx * 0.65;
          activeDrag.vy = activeDrag.vy * 0.35 + instVy * 0.65;
          activeDrag.lastX = e.clientX;
          activeDrag.lastY = e.clientY;
          activeDrag.lastTime = now;

          const wrapRect = wrap.getBoundingClientRect();
          const targetX = e.clientX - wrapRect.left;
          const targetY = e.clientY - wrapRect.top;

          const halfW = b.pillW / 2;
          const halfH = b.pillH / 2;
          const clampedX = Math.max(halfW, Math.min(width - halfW, targetX));
          const clampedY = Math.max(halfH, Math.min(height - halfH, targetY));

          Body.setPosition(b, { x: clampedX, y: clampedY });

          // Immediate visual update during drag
          const px = (clampedX - halfW).toFixed(1);
          const py = (clampedY - halfH).toFixed(1);
          el.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${b.angle.toFixed(3)}rad)`;

          wakeAllBodies();
        };

        const handleRelease = (e) => {
          if (!activeDrag || activeDrag.pointerId !== e.pointerId) return;
          el.classList.remove('is-dragging');

          try {
            el.releasePointerCapture(e.pointerId);
          } catch (_) {}

          Body.setStatic(b, false);

          const timeSinceLastMove = performance.now() - activeDrag.lastTime;
          let throwVx = timeSinceLastMove > 70 ? 0 : activeDrag.vx;
          let throwVy = timeSinceLastMove > 70 ? 0 : activeDrag.vy;

          // Apply throw velocity with bounded momentum and satisfying spin
          const maxVel = 20;
          throwVx = Math.max(-maxVel, Math.min(maxVel, throwVx || 0));
          throwVy = Math.max(-maxVel, Math.min(maxVel, throwVy || 0));

          Body.setVelocity(b, { x: throwVx, y: throwVy });
          Body.setAngularVelocity(b, (throwVx * 0.015) + ((Math.random() - 0.5) * 0.02));

          const px = (b.position.x - b.pillW / 2).toFixed(1);
          const py = (b.position.y - b.pillH / 2).toFixed(1);
          el.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${b.angle.toFixed(3)}rad)`;

          wakeAllBodies();
          activeDrag = null;
        };

        el.addEventListener('pointerdown', onPointerDown, { passive: false });
        el.addEventListener('pointermove', onPointerMove, { passive: false });
        el.addEventListener('pointerup', handleRelease, { passive: true });
        el.addEventListener('pointercancel', handleRelease, { passive: true });
        el.addEventListener('lostpointercapture', handleRelease, { passive: true });
      });

      // Window fallback release for boundary edge-cases
      window.addEventListener('pointerup', (e) => {
        if (activeDrag && activeDrag.pointerId === e.pointerId) {
          activeDrag.el.classList.remove('is-dragging');
          Body.setStatic(activeDrag.body, false);
          activeDrag = null;
          wakeAllBodies();
        }
      }, { passive: true });

      window.addEventListener('pointercancel', (e) => {
        if (activeDrag && activeDrag.pointerId === e.pointerId) {
          activeDrag.el.classList.remove('is-dragging');
          Body.setStatic(activeDrag.body, false);
          activeDrag = null;
          wakeAllBodies();
        }
      }, { passive: true });

      let isRunning = false;
      let animId = null;

      // Color palette for soft canvas contact shadows matching each 3D pill
      const shadowColorMap = {
        'Flutter': 'rgba(1, 117, 194, ',
        'Dart': 'rgba(0, 168, 181, ',
        'Riverpod': 'rgba(121, 40, 202, ',
        'C++': 'rgba(29, 78, 216, ',
        'Data Structures & Algorithms': 'rgba(5, 150, 105, ',
        'Custom Canvas': 'rgba(225, 29, 72, ',
        'SQLite': 'rgba(217, 119, 6, ',
        'REST APIs': 'rgba(13, 148, 136, ',
        'Git & GitHub': 'rgba(234, 88, 12, ',
      };

      function renderFrame() {
        if (!isRunning) return;

        Engine.update(engine, 1000 / 60);

        if (ctx) {
          ctx.clearRect(0, 0, width, height);
        }

        pillBodies.forEach((b) => {
          // Keep pills inside visible bounds with elastic bouncing
          const halfW = b.pillW / 2;
          const halfH = b.pillH / 2;
          let clampedX = b.position.x;
          let clampedY = b.position.y;

          if (clampedX < halfW + 4) {
            clampedX = halfW + 4;
            Body.setPosition(b, { x: clampedX, y: clampedY });
            Body.setVelocity(b, { x: Math.abs(b.velocity.x) * 0.45, y: b.velocity.y });
          } else if (clampedX > width - halfW - 4) {
            clampedX = width - halfW - 4;
            Body.setPosition(b, { x: clampedX, y: clampedY });
            Body.setVelocity(b, { x: -Math.abs(b.velocity.x) * 0.45, y: b.velocity.y });
          }

          if (clampedY > height - halfH - 6) {
            clampedY = height - halfH - 6;
            Body.setPosition(b, { x: clampedX, y: clampedY });
          }

          if (clampedY < halfH + 4) {
            clampedY = halfH + 4;
            Body.setPosition(b, { x: clampedX, y: clampedY });
            Body.setVelocity(b, { x: b.velocity.x, y: Math.abs(b.velocity.y) * 0.45 });
          }

          if (!activeDrag || activeDrag.body !== b) {
            const px = (clampedX - halfW).toFixed(1);
            const py = (clampedY - halfH).toFixed(1);
            const rot = b.angle.toFixed(3);
            b.pillEl.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${rot}rad)`;
          }

          // Soft contact shadow rendered on canvas under each pill for depth
          if (ctx) {
            const shadowY = Math.min(height - 4, clampedY + halfH + 2);
            const distFromFloor = shadowY - (clampedY + halfH);
            const shadowAlpha = Math.max(0, 0.20 - distFromFloor * 0.005);
            if (shadowAlpha > 0.01) {
              const colorPrefix = shadowColorMap[b.skillName] || 'rgba(46, 12, 255, ';
              ctx.beginPath();
              ctx.ellipse(clampedX, shadowY, halfW * 0.78, 4, 0, 0, Math.PI * 2);
              ctx.fillStyle = colorPrefix + shadowAlpha.toFixed(3) + ')';
              ctx.fill();
            }
          }
        });

        animId = requestAnimationFrame(renderFrame);
      }

      // Initial layout tick to position pills immediately
      pillBodies.forEach((b) => {
        const px = (b.position.x - b.pillW / 2).toFixed(1);
        const py = (b.position.y - b.pillH / 2).toFixed(1);
        b.pillEl.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${b.angle.toFixed(3)}rad)`;
      });

      // IntersectionObserver: only simulate physics when on-screen (0% CPU off-screen)
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!isRunning) {
                isRunning = true;
                wakeAllBodies();
                renderFrame();
              }
            } else {
              isRunning = false;
              if (animId) cancelAnimationFrame(animId);
            }
          });
        },
        { threshold: 0.05, rootMargin: '60px 0px' }
      );

      observer.observe(wrap);

      // Handle window resize and mobile orientation changes gracefully
      let resizeTimer = null;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const newWidth = wrap.clientWidth;
          const newHeight = Math.max(window.innerWidth <= 640 ? 440 : 420, wrap.clientHeight);
          if (newWidth === width && newHeight === height) return;

          width = newWidth;
          height = newHeight;

          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
          if (ctx) ctx.scale(dpr, dpr);

          Body.setPosition(floor, { x: width / 2, y: height - 6 });
          Body.setPosition(ceiling, { x: width / 2, y: -120 });
          Body.setPosition(leftWall, { x: -25, y: height / 2 });
          Body.setPosition(rightWall, { x: width + 25, y: height / 2 });

          // Keep pills inside newly resized boundaries
          pillBodies.forEach((b) => {
            const halfW = b.pillW / 2;
            const halfH = b.pillH / 2;
            const clampedX = Math.max(halfW + 4, Math.min(width - halfW - 4, b.position.x));
            const clampedY = Math.max(halfH + 4, Math.min(height - halfH - 6, b.position.y));
            Body.setPosition(b, { x: clampedX, y: clampedY });
          });

          wakeAllBodies();
          if (!isRunning) {
            isRunning = true;
            renderFrame();
          }
        }, 100);
      };

      window.addEventListener('resize', handleResize, { passive: true });
      window.addEventListener('orientationchange', handleResize, { passive: true });
    } catch (err) {
      console.warn('Physics playground initialization bypassed, using static HTML pills:', err);
      wrap.classList.remove('has-physics');
      const pillEls = container.querySelectorAll('.skill-pill');
      pillEls.forEach((el) => (el.style.transform = ''));
    }
  }

  // ============================================================
  // 16. Magnetic Talk Cursor Disc
  // ============================================================
  function initTalkCursor() {
    if (!talkCursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion) {
      return;
    }

    let cursorX = -200, cursorY = -200;
    let targetX = -200, targetY = -200;
    let isCursorOn = false;
    let cursorRafId = null;

    function cursorRaf() {
      const dx = targetX - cursorX;
      const dy = targetY - cursorY;
      if (isCursorOn || Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        cursorX += dx * 0.18;
        cursorY += dy * 0.18;
        talkCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        cursorRafId = requestAnimationFrame(cursorRaf);
      } else {
        cursorRafId = null;
      }
    }

    function startCursorRaf() {
      if (!cursorRafId) {
        cursorRafId = requestAnimationFrame(cursorRaf);
      }
    }

    window.addEventListener('pointermove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      const triggerArea = e.target.closest('#contact, .footer, .footer-hero-talk, .nav-cta-btn');
      if (triggerArea) {
        if (!isCursorOn) {
          talkCursor.classList.add('is-on');
          isCursorOn = true;
        }
      } else {
        if (isCursorOn) {
          talkCursor.classList.remove('is-on');
          isCursorOn = false;
        }
      }
      startCursorRaf();
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', () => {
      if (isCursorOn) {
        talkCursor.classList.remove('is-on');
        talkCursor.classList.remove('is-down');
        isCursorOn = false;
      }
    });

    window.addEventListener('mousedown', () => {
      if (isCursorOn) talkCursor.classList.add('is-down');
    });

    window.addEventListener('mouseup', () => {
      talkCursor.classList.remove('is-down');
    });
  }

  // ============================================================
  // 17. Cinematic Typography Footer Interactions
  // ============================================================
  function initCinematicFooter() {
    const footerHero = document.querySelector('.footer-hero-talk');
    const portraitWrap = document.querySelector('.footer-portrait-wrap');
    const portraitAura = document.querySelector('.footer-portrait-aura');
    const watermarkName = document.querySelector('.footer-watermark-name');
    if (!footerHero) return;

    if ('IntersectionObserver' in window) {
      const footerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              footerHero.classList.add('is-revealed');
              footerObserver.unobserve(footerHero);
            }
          });
        },
        { threshold: 0.15 }
      );
      footerObserver.observe(footerHero);
    } else {
      footerHero.classList.add('is-revealed');
    }

    if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    let targetShiftX = 0, targetShiftY = 0;
    let currentShiftX = 0, currentShiftY = 0;
    let footerRafId = null;

    function renderFooterParallax() {
      const dx = targetShiftX - currentShiftX;
      const dy = targetShiftY - currentShiftY;
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        currentShiftX += dx * 0.12;
        currentShiftY += dy * 0.12;
        if (portraitWrap) {
          portraitWrap.style.transform = `translate3d(${currentShiftX * 14}px, ${currentShiftY * 8}px, 0)`;
        }
        if (portraitAura) {
          portraitAura.style.transform = `translateX(-50%) translate3d(${currentShiftX * 8}px, ${currentShiftY * 5}px, 0)`;
        }
        if (watermarkName) {
          watermarkName.style.transform = `translate3d(${-currentShiftX * 22}px, ${-currentShiftY * 10}px, 0)`;
        }
        footerRafId = requestAnimationFrame(renderFooterParallax);
      } else {
        footerRafId = null;
      }
    }

    footerHero.addEventListener('pointermove', (e) => {
      const rect = footerHero.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetShiftX = ((e.clientX - rect.left) / rect.width) - 0.5;
      targetShiftY = ((e.clientY - rect.top) / rect.height) - 0.5;
      if (!footerRafId) {
        footerRafId = requestAnimationFrame(renderFooterParallax);
      }
    }, { passive: true });

    footerHero.addEventListener('pointerleave', () => {
      targetShiftX = 0;
      targetShiftY = 0;
      if (!footerRafId) {
        footerRafId = requestAnimationFrame(renderFooterParallax);
      }
    });
  }

  // ============================================================
  // Consolidated Scroll Loop (requestAnimationFrame)
  // ============================================================
  window.addEventListener(
    'scroll',
    () => {
      if (!isTicking) {
        requestAnimationFrame(() => {
          syncHorizontalScroll();
          updateStickyCta();
          updateActiveNavPill();
          updateNavbarTheme();
          updatePortfolioChapters();
          isTicking = false;
        });
        isTicking = true;
      }
    },
    { passive: true }
  );

  // Resize & orientation change debounce
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      syncNavbarMetrics();
      if (window.innerWidth > 1024 && mobileNavOverlay?.classList.contains('open')) {
        closeMobileNav();
      }
      updateGalleryMetrics();
      updateNavbarTheme();
      updateActiveNavPill();
      updatePortfolioChapters();
    }, 100);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      syncNavbarMetrics();
      updateGalleryMetrics();
      updateNavbarTheme();
      updateActiveNavPill();
      updatePortfolioChapters();
    }, 150);
  });

  // Cinematic Desktop Hero Parallax
  function initHeroParallax() {
    const hero = document.getElementById('home');
    const photoWrap = document.getElementById('hero-photo-wrap');
    if (!hero || !photoWrap) return;

    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (prefersReducedMotion || !hasFinePointer || window.innerWidth <= 1024) return;

    const chips = Array.from(photoWrap.querySelectorAll('.hero-chip'));
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isTracking = false;
    let rafId = null;

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // Restrained gentle depth on portrait
      const rotY = (currentX * 3.2).toFixed(2);
      const rotX = (-currentY * 2.8).toFixed(2);
      const shiftX = (currentX * 9).toFixed(2);
      const shiftY = (currentY * 7).toFixed(2);
      photoWrap.style.transform = `perspective(1000px) translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

      // Subtle counter-depth on floating metric chips
      chips.forEach((chip) => {
        const depth = parseFloat(chip.dataset.depth || '1');
        const cx = (-currentX * depth * 14).toFixed(2);
        const cy = (-currentY * depth * 11).toFixed(2);
        chip.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      });

      if (isTracking || Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        rafId = requestAnimationFrame(updateParallax);
      } else {
        rafId = null;
        if (!isTracking) {
          photoWrap.style.transform = '';
          chips.forEach((chip) => (chip.style.transform = ''));
        }
      }
    };

    hero.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      isTracking = true;
      if (!rafId) {
        rafId = requestAnimationFrame(updateParallax);
      }
    });

    hero.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      isTracking = false;
      if (!rafId) {
        rafId = requestAnimationFrame(updateParallax);
      }
    });
  }

  // ============================================================
  // Phase 4: Portfolio Chapters Shelf Exploration Progress
  // ============================================================
  let updatePortfolioChapters = () => {};

  function initPortfolioChapters() {
    const shelf = document.getElementById('chapters');
    if (!shelf) return;

    const cards = Array.from(shelf.querySelectorAll('.chapter-card'));
    if (!cards.length) return;

    const chapters = cards.map((card) => {
      const targetId = card.dataset.target;
      const targetEl = document.getElementById(targetId);
      const bar = card.querySelector('.chapter-progress-fill');
      const val = card.querySelector('.chapter-progress-val');
      return {
        card,
        targetId,
        targetEl,
        bar,
        val,
        lastPercent: -1
      };
    });

    updatePortfolioChapters = () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const isAtDocBottom = (scrollY + vh) >= (docHeight - 15);

      chapters.forEach((item) => {
        if (!item.targetEl) return;

        const rect = item.targetEl.getBoundingClientRect();
        const totalTravel = rect.height + vh;
        const currentTravel = vh - rect.top;

        let ratio = totalTravel > 0 ? currentTravel / totalTravel : 0;
        let progress = Math.max(0, Math.min(1, ratio));

        if (isAtDocBottom && item.targetId === 'contact') {
          progress = 1;
        }

        const percent = Math.round(progress * 100);

        if (percent !== item.lastPercent) {
          item.lastPercent = percent;

          if (item.bar) {
            item.bar.style.transform = `scaleX(${progress})`;
            item.bar.setAttribute('aria-valuenow', String(percent));
          }

          if (item.val) {
            if (percent >= 100) {
              item.val.textContent = '100% ✓';
              item.card.classList.add('chapter-card--completed');
              item.card.classList.remove('chapter-card--active');
            } else if (percent > 0) {
              item.val.textContent = `${percent}%`;
              item.card.classList.add('chapter-card--active');
              item.card.classList.remove('chapter-card--completed');
            } else {
              item.val.textContent = '0%';
              item.card.classList.remove('chapter-card--active');
              item.card.classList.remove('chapter-card--completed');
            }
          }
        }
      });
    };

    // Smooth click jump support
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const href = card.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          navigateToSection(href);
        }
      });
    });

    // Run initial calculation
    updatePortfolioChapters();
  }

  // ============================================================
  // Phase 5: Cinematic Opening Sequence
  // ============================================================
  function initCinematicIntro() {
    const introEl = document.getElementById('cinematic-intro');
    const skipBtn = document.getElementById('intro-skip-btn');
    const heroEl = document.querySelector('.hero');

    if (!introEl) {
      if (heroEl) heroEl.classList.add('hero--ready');
      return;
    }

    const hasSeenIntro = sessionStorage.getItem('mrh_intro_seen') === 'true';
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fast-path bypass for repeat visitors or reduced motion
    if (hasSeenIntro || isReducedMotion) {
      introEl.classList.add('intro--finished');
      introEl.setAttribute('aria-hidden', 'true');
      introEl.style.display = 'none';
      if (heroEl) heroEl.classList.add('hero--ready');
      return;
    }

    let isDismissed = false;
    let exitTimer = null;
    let finishTimer = null;

    const dismissIntro = (immediate = false) => {
      if (isDismissed) return;
      isDismissed = true;

      // Remember for the rest of this session
      try {
        sessionStorage.setItem('mrh_intro_seen', 'true');
      } catch {}

      if (exitTimer) clearTimeout(exitTimer);
      if (finishTimer) clearTimeout(finishTimer);

      window.removeEventListener('keydown', onKeyDown);

      if (immediate || isReducedMotion) {
        introEl.classList.add('intro--finished');
        introEl.setAttribute('aria-hidden', 'true');
        introEl.style.display = 'none';
        if (heroEl) heroEl.classList.add('hero--ready');
      } else {
        introEl.classList.add('intro--exiting');
        if (heroEl) heroEl.classList.add('hero--ready');

        finishTimer = setTimeout(() => {
          introEl.classList.add('intro--finished');
          introEl.setAttribute('aria-hidden', 'true');
          introEl.style.display = 'none';
        }, 550);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissIntro(false);
      }
    };

    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dismissIntro(false);
      });
    }

    window.addEventListener('keydown', onKeyDown);

    // Auto-dismiss after 2.4s sequence
    exitTimer = setTimeout(() => {
      dismissIntro(false);
    }, 2400);
  }

  // Helper function to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial load & Feature activations
  syncNavbarMetrics();
  initSplitText();
  initCinematicIntro();
  initHeroParallax();
  initPortfolioChapters();
  initSkillsPhysics();
  initTalkCursor();
  initCinematicFooter();
  updateNavbarTheme();
  if (window.location.hash && window.location.hash.length > 1) {
    const initialHash = window.location.hash;
    const cleanId = initialHash.replace('#', '');
    const mapped = navTrackedSections.find((s) => s.id === cleanId || s.targetNav === cleanId);
    if (mapped) {
      setActivePill(mapped.targetNav);
      setTimeout(() => {
        scrollToSection(initialHash);
      }, 120);
    } else {
      updateActiveNavPill();
    }
  } else {
    updateActiveNavPill();
  }
  loadPortfolio();
});
