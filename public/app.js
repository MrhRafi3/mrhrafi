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
            <span class="project-card-category">${escapeHtml(category)}</span>
            ${p.badge ? `<span class="project-card-badge">${escapeHtml(p.badge)}</span>` : ''}
          </div>

          <div class="project-card-body">
            <div class="project-card-title-row">
              <h3 class="project-card-title">${escapeHtml(p.enriched?.resolvedTitle || p.title)}${p.accent ? `<span class="card-title-accent">${escapeHtml(p.accent)}</span>` : ''}</h3>
            </div>
            
            <p class="project-card-desc">${escapeHtml(p.tagline || p.description)}</p>
            
            <div class="project-card-tags">
              ${(p.tags || []).slice(0, 4).map((t) => `<span class="project-card-tag">${escapeHtml(t)}</span>`).join('')}
            </div>

            ${
              isEnriched
                ? `
              <div class="enriched-badge-box">
                <div class="enriched-label">⚡ Enriched via Context.dev Scrape</div>
                <p class="enriched-text">${escapeHtml(p.enriched.markdownExcerpt || p.enriched.description || '')}</p>
              </div>
            `
                : ''
            }

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
                <button type="button" class="project-card-enrich" data-id="${escapeHtml(p.id)}" data-url="${escapeHtml(p.url)}" title="Live scrape metadata via Context.dev">
                  ${isEnriched ? '⚡ Re-enrich' : '⚡ Enrich'}
                </button>
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

    // Attach listeners to each card's enrich button
    document.querySelectorAll('.project-card-enrich').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const targetBtn = e.currentTarget;
        const id = targetBtn.dataset.id;
        const url = targetBtn.dataset.url;
        await triggerEnrich(id, url, targetBtn);
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

  // Interactive 3D Perspective Tilt for Project Cards
  function initProjectCardTilt() {
    if (prefersReducedMotion || window.innerWidth <= 1024) return;
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
          const rotX = ((cy - y) / cy) * 4.5;
          const rotY = ((x - cx) / cx) * 4.5;
          card.style.transition = 'transform 0.08s ease-out, box-shadow 0.2s ease, border-color 0.2s ease';
          card.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.018, 1.018, 1.018)`;
          isTicking = false;
        });
      });
      card.addEventListener('pointerleave', () => {
        card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.25s ease';
        card.style.transform = '';
      });
    });
  }

  // ============================================================
  // 3. Project Detail Modal
  // ============================================================
  let activeModalProject = null;
  let activeScreenIndex = 0;
  let activeModalTrigger = null;

  function openProjectModal(projectId) {
    if (!portfolioData || !portfolioData.projects) return;
    const project = portfolioData.projects.find((p) => p.id === projectId);
    if (!project) return;

    activeModalTrigger = document.activeElement;
    activeModalProject = project;
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

  function renderModalContent() {
    if (!modalContentArea || !activeModalProject) return;
    const p = activeModalProject;
    const screens = p.screenshots || [];
    const currentScreen = screens[activeScreenIndex] || screens[0] || { src: p.screenshotSrc, label: 'Overview' };
    const hasGithub = Boolean(p.githubUrl);

    modalContentArea.innerHTML = `
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

          ${
            p.enriched
              ? `
            <div class="modal-enriched-box">
              <div class="enriched-label">⚡ Live Context.dev Scrape Intelligence</div>
              <p>${escapeHtml(p.enriched.markdownExcerpt || p.enriched.description || '')}</p>
              <small class="enriched-meta">Scraped at ${escapeHtml(p.enriched.lastUpdated || '')}</small>
            </div>
          `
              : ''
          }

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
            <button class="btn btn-ghost modal-enrich-trigger" data-id="${escapeHtml(p.id)}" data-url="${escapeHtml(p.url)}">
              ⚡ Enrich via Context.dev
            </button>
          </div>
        </div>
      </div>
    `;

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

    // Listener for modal enrich trigger
    const modalEnrichBtn = modalContentArea.querySelector('.modal-enrich-trigger');
    if (modalEnrichBtn) {
      modalEnrichBtn.addEventListener('click', async (e) => {
        const id = modalEnrichBtn.dataset.id;
        const url = modalEnrichBtn.dataset.url;
        await triggerEnrich(id, url, modalEnrichBtn);
        // Refresh modal with enriched data
        const updated = portfolioData.projects.find((pr) => pr.id === id);
        if (updated) {
          activeModalProject = updated;
          renderModalContent();
        }
      });
    }
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
    if (e.key === 'Escape' && modalBackdrop?.classList.contains('is-open')) {
      closeProjectModal();
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

  // Custom URL enrich button listener
  if (enrichBtn && customUrlInput) {
    enrichBtn.addEventListener('click', async () => {
      const url = customUrlInput.value.trim();
      if (!url) {
        alert('Please enter a valid URL.');
        return;
      }
      await triggerEnrich(null, url, enrichBtn);
      customUrlInput.value = '';
    });

    customUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        enrichBtn.click();
      }
    });
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

  function closeMobileNav() {
    if (!mobileNavOverlay) return;
    mobileNavOverlay.classList.remove('open');
    mobileNavOverlay.setAttribute('aria-hidden', 'true');
    if (navHamburger) {
      navHamburger.setAttribute('aria-expanded', 'false');
      navHamburger.focus();
    }
    document.body.style.overflow = '';
    updateNavbarTheme();
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
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', closeMobileNav);
    }

    mobileNavOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });

    mobileNavOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileNav();
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
  // 12. Active Navbar Pill Sync on Scroll
  // ============================================================
  const sections = ['home', 'about', 'skills', 'services', 'projects', 'process', 'faq', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateActiveNavPill() {
    let currentSectionId = 'home';
    const scrollPos = window.scrollY + 160;

    sections.forEach((sec) => {
      if (sec.offsetTop <= scrollPos) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navPills.forEach((pill) => {
      const href = pill.getAttribute('href');
      if (href === `#${currentSectionId}` || (!currentSectionId && (href === '#home' || href === '#'))) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

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
    // If reduced-motion is requested or screen is mobile, keep static pills visible.
    const MatterLib = window.Matter || (typeof Matter !== 'undefined' ? Matter : null);
    if (!MatterLib || prefersReducedMotion || window.innerWidth <= 640) {
      return;
    }

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
      engine.gravity.y = 0.9;

      let width = wrap.clientWidth || 800;
      let height = Math.max(380, wrap.clientHeight || 380);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      // Boundaries fully enclosing the container
      let floor = Bodies.rectangle(width / 2, height - 8, width * 3, 30, { isStatic: true, label: 'floor' });
      let ceiling = Bodies.rectangle(width / 2, -100, width * 3, 40, { isStatic: true, label: 'ceiling' });
      let leftWall = Bodies.rectangle(-25, height / 2, 50, height * 4, { isStatic: true, label: 'leftWall' });
      let rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 4, { isStatic: true, label: 'rightWall' });

      Composite.add(engine.world, [floor, ceiling, leftWall, rightWall]);

      // Collect real HTML skill pills
      const pillEls = Array.from(container.querySelectorAll('.skill-pill'));
      if (pillEls.length === 0) return;

      const pillBodies = [];

      pillEls.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const pillW = Math.max(70, Math.round(rect.width) || 120);
        const pillH = Math.max(34, Math.round(rect.height) || 40);

        // Distribute within visible bounds so pills are immediately visible inside the card
        const col = i % 3;
        const row = Math.floor(i / 3);
        const colSpacing = (width - 120) / 3;
        const startX = 60 + col * colSpacing + (row % 2 ? 25 : -15) + (Math.random() * 20);
        const startY = 70 + row * 65;

        const body = Bodies.rectangle(startX, startY, pillW, pillH, {
          chamfer: { radius: pillH / 2 },
          restitution: 0.35,
          friction: 0.25,
          frictionAir: 0.015,
          angle: (i % 2 === 0 ? 1 : -1) * (0.04 + (i * 0.02)),
        });

        body.pillEl = el;
        body.pillW = pillW;
        body.pillH = pillH;
        pillBodies.push(body);
      });

      Composite.add(engine.world, pillBodies);

      // Activate physics mode on container — real HTML pills are now positioned by physics transforms
      wrap.classList.add('has-physics');

      // Pointer event handlers on real HTML pills for silky-smooth drag & throw
      let activeDrag = null;

      pillBodies.forEach((b) => {
        const el = b.pillEl;

        el.addEventListener('pointerdown', (e) => {
          if (e.button !== 0 && e.pointerType === 'mouse') return;
          e.preventDefault();
          el.setPointerCapture(e.pointerId);
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
        });

        el.addEventListener('pointermove', (e) => {
          if (!activeDrag || activeDrag.pointerId !== e.pointerId) return;
          e.preventDefault();

          const now = performance.now();
          const dt = Math.max(8, now - activeDrag.lastTime);
          const dx = e.clientX - activeDrag.lastX;
          const dy = e.clientY - activeDrag.lastY;

          activeDrag.vx = (dx / dt) * 16;
          activeDrag.vy = (dy / dt) * 16;
          activeDrag.lastX = e.clientX;
          activeDrag.lastY = e.clientY;
          activeDrag.lastTime = now;

          const wrapRect = wrap.getBoundingClientRect();
          const targetX = e.clientX - wrapRect.left;
          const targetY = e.clientY - wrapRect.top;

          Body.setPosition(b, {
            x: Math.max(b.pillW / 2, Math.min(width - b.pillW / 2, targetX)),
            y: Math.max(b.pillH / 2, Math.min(height - b.pillH / 2, targetY)),
          });

          // Immediate visual update during drag
          const px = (b.position.x - b.pillW / 2).toFixed(1);
          const py = (b.position.y - b.pillH / 2).toFixed(1);
          el.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${b.angle.toFixed(3)}rad)`;

          wakeAllBodies();
        });

        const handleRelease = (e) => {
          if (!activeDrag || activeDrag.pointerId !== e.pointerId) return;
          el.classList.remove('is-dragging');

          try {
            el.releasePointerCapture(e.pointerId);
          } catch (_) {}

          Body.setStatic(b, false);
          // Apply throw velocity with bounded momentum
          const maxVel = 18;
          const clampVx = Math.max(-maxVel, Math.min(maxVel, activeDrag.vx || 0));
          const clampVy = Math.max(-maxVel, Math.min(maxVel, activeDrag.vy || 0));
          Body.setVelocity(b, { x: clampVx, y: clampVy });

          wakeAllBodies();
          activeDrag = null;
        };

        el.addEventListener('pointerup', handleRelease);
        el.addEventListener('pointercancel', handleRelease);
      });

      let isRunning = false;
      let animId = null;

      function renderFrame() {
        if (!isRunning) return;

        Engine.update(engine, 1000 / 60);

        if (ctx) {
          ctx.clearRect(0, 0, width, height);
        }

        pillBodies.forEach((b) => {
          // Keep pills inside visible bounds
          const halfW = b.pillW / 2;
          const halfH = b.pillH / 2;
          let clampedX = b.position.x;
          let clampedY = b.position.y;

          if (clampedX < halfW + 4) {
            clampedX = halfW + 4;
            Body.setPosition(b, { x: clampedX, y: clampedY });
            Body.setVelocity(b, { x: Math.abs(b.velocity.x) * 0.4, y: b.velocity.y });
          } else if (clampedX > width - halfW - 4) {
            clampedX = width - halfW - 4;
            Body.setPosition(b, { x: clampedX, y: clampedY });
            Body.setVelocity(b, { x: -Math.abs(b.velocity.x) * 0.4, y: b.velocity.y });
          }

          if (clampedY > height - halfH - 8) {
            clampedY = height - halfH - 8;
            Body.setPosition(b, { x: clampedX, y: clampedY });
          }

          const px = (clampedX - halfW).toFixed(1);
          const py = (clampedY - halfH).toFixed(1);
          const rot = b.angle.toFixed(3);
          b.pillEl.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${rot}rad)`;

          // Soft contact shadow rendered on canvas under each pill for depth
          if (ctx) {
            const shadowY = Math.min(height - 6, clampedY + halfH + 2);
            const shadowAlpha = Math.max(0, 0.12 - (shadowY - clampedY - halfH) * 0.005);
            if (shadowAlpha > 0.01) {
              ctx.beginPath();
              ctx.ellipse(clampedX, shadowY, halfW * 0.8, 4, 0, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(46, 12, 255, ${shadowAlpha.toFixed(3)})`;
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
        { threshold: 0.1 }
      );

      observer.observe(wrap);

      // Handle window resize gracefully
      window.addEventListener('resize', () => {
        if (window.innerWidth <= 640) {
          // Revert to clean static tags on mobile
          wrap.classList.remove('has-physics');
          pillEls.forEach((el) => (el.style.transform = ''));
          isRunning = false;
          if (animId) cancelAnimationFrame(animId);
          return;
        }

        wrap.classList.add('has-physics');
        width = wrap.clientWidth;
        height = Math.max(380, wrap.clientHeight);

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        if (ctx) ctx.scale(dpr, dpr);

        Body.setPosition(floor, { x: width / 2, y: height - 8 });
        Body.setPosition(rightWall, { x: width + 25, y: height / 2 });
        Body.setPosition(leftWall, { x: -25, y: height / 2 });

        wakeAllBodies();
        if (!isRunning) {
          isRunning = true;
          renderFrame();
        }
      });
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
    }, 100);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      syncNavbarMetrics();
      updateGalleryMetrics();
      updateNavbarTheme();
    }, 150);
  });

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
  requestAnimationFrame(() => {
    const heroEl = document.querySelector('.hero');
    if (heroEl) heroEl.classList.add('hero--ready');
  });
  initSkillsPhysics();
  initTalkCursor();
  updateNavbarTheme();
  updateActiveNavPill();
  loadPortfolio();
});
