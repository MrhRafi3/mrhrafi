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
  const stickyCta = document.getElementById('sticky-cta');
  const navPills = document.querySelectorAll('.nav-pills .nav-pill');
  const faqItems = document.querySelectorAll('.faq-item');
  const statNumbers = document.querySelectorAll('.stat-number');
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

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

        return `
        <article class="project-card" id="project-${escapeHtml(p.id)}" data-id="${escapeHtml(p.id)}">
          <div class="project-card-image" role="button" tabindex="0" aria-label="Open ${escapeHtml(p.title)} showcase">
            ${
              p.screenshotSrc
                ? `<img src="${escapeHtml(p.screenshotSrc)}" alt="${escapeHtml(p.title)} preview" class="card-thumb-img" loading="lazy" onerror="this.style.display='none'" />`
                : ''
            }
            <span class="project-card-category">${escapeHtml(category)}</span>
            ${p.badge ? `<span class="project-card-badge">${escapeHtml(p.badge)}</span>` : ''}
            <div class="project-card-icon-overlay">${icon}</div>
          </div>

          <div class="project-card-body">
            <div class="project-card-header-line">
              <h3 class="project-card-title">${escapeHtml(p.enriched?.resolvedTitle || p.title)}${p.accent ? `<span class="accent-dot">${escapeHtml(p.accent)}</span>` : ''}</h3>
            </div>
            
            <p class="project-card-desc">${escapeHtml(p.tagline)}</p>
            
            <div class="project-card-tags">
              ${(p.tags || []).map((t) => `<span class="project-card-tag">${escapeHtml(t)}</span>`).join('')}
            </div>

            ${
              p.features && p.features.length > 0
                ? `
              <div class="project-card-feature-chips">
                ${p.features
                  .slice(0, 3)
                  .map(
                    (f) => `
                  <div class="card-feature-mini">
                    <span class="mini-icon">${escapeHtml(f.icon)}</span>
                    <span class="mini-name">${escapeHtml(f.name)}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }

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
              <button class="btn-card-showcase" data-id="${escapeHtml(p.id)}">
                <span>Explore Showcase</span> ↗
              </button>

              <div class="card-actions-right">
                ${
                  hasGithub
                    ? `<a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener" class="project-card-link" title="Open GitHub Repository">GitHub ↗</a>`
                    : `<span class="project-card-link disabled" title="${escapeHtml(p.repoNote || 'Repository in preparation')}">Repo Soon</span>`
                }
                <button class="project-card-enrich" data-id="${escapeHtml(p.id)}" data-url="${escapeHtml(p.url)}" title="Live scrape metadata via Context.dev">
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

    document.querySelectorAll('.project-card-image').forEach((imgWrap) => {
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

    // Update gallery pinning geometry with newly rendered card widths
    if (stepTotalEl && projects) {
      stepTotalEl.textContent = String(projects.length).padStart(2, '0');
    }
    setTimeout(updateGalleryMetrics, 50);
  }

  // ============================================================
  // 3. Project Detail Modal
  // ============================================================
  let activeModalProject = null;
  let activeScreenIndex = 0;

  function openProjectModal(projectId) {
    if (!portfolioData || !portfolioData.projects) return;
    const project = portfolioData.projects.find((p) => p.id === projectId);
    if (!project) return;

    activeModalProject = project;
    activeScreenIndex = 0;
    renderModalContent();

    if (modalBackdrop) {
      modalBackdrop.classList.add('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeProjectModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    activeModalProject = null;
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
            <span class="role-icon">👤</span> ${escapeHtml(p.role || 'Flutter App Developer')}
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

    // Listeners for thumbnails switcher
    modalContentArea.querySelectorAll('.modal-thumb-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.screenIdx, 10);
        if (!isNaN(idx)) {
          activeScreenIndex = idx;
          renderModalContent();
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
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop?.classList.contains('is-open')) {
      closeProjectModal();
    }
  });

  // ============================================================
  // 4. Pinned Horizontal Project Gallery (Scroll-Linked + Snap)
  // ============================================================
  const CARD_STEP = 472; // 440px card width + 32px gap
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
      if (projectsProgressBar) projectsProgressBar.style.width = '100%';
      return;
    }

    const trackWidth = projectsCarousel.scrollWidth;
    const windowWidth = window.innerWidth;
    const endPadding = Math.max(120, (windowWidth - 440) / 2);
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

    if (isMobileLayout() || prefersReducedMotion) {
      const cards = projectsCarousel.querySelectorAll('.project-card');
      if (cards[activeCardIndex]) {
        cards[activeCardIndex].scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'start', block: 'nearest' });
      }
      return;
    }

    const targetTranslate = Math.min(maxTravelDistance, activeCardIndex * CARD_STEP);
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
    const newIdx = Math.min(totalCards - 1, Math.max(0, Math.round(currentTranslateX / CARD_STEP)));
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
        const targetIndex = Math.round(currentTranslateX / CARD_STEP);
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
  }

  // Keyboard navigation when Projects section is in view
  window.addEventListener('keydown', (e) => {
    if (modalBackdrop?.classList.contains('is-open')) return;
    if (document.activeElement?.tagName === 'INPUT') return;

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
  // 8. Mobile Navigation Menu Toggle
  // ============================================================
  if (navHamburger && mobileNavOverlay) {
    navHamburger.addEventListener('click', () => {
      mobileNavOverlay.classList.toggle('open');
      const isOpen = mobileNavOverlay.classList.contains('open');
      navHamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mobileNavOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNavOverlay.classList.remove('open');
        navHamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============================================================
  // 9. Sticky Bottom CTA on Scroll
  // ============================================================
  function updateStickyCta() {
    if (!stickyCta) return;
    if (window.scrollY > 450) {
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
    if (!navbar || groundSections.length === 0) return;
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
  const sections = ['about', 'skills', 'services', 'projects', 'process', 'faq', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateActiveNavPill() {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach((sec) => {
      if (sec.offsetTop <= scrollPos) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    navPills.forEach((pill) => {
      const href = pill.getAttribute('href');
      if (!currentSectionId && href === '#') {
        pill.classList.add('active');
      } else if (href === `#${currentSectionId}`) {
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
  // ============================================================
  function initSplitText() {
    if (prefersReducedMotion) return;
    const splitEls = document.querySelectorAll('[data-split]');
    splitEls.forEach((el) => {
      if (el.classList.contains('is-split')) return;
      const originalText = el.textContent.trim();
      const words = originalText.split(/\s+/);
      el.innerHTML = words
        .map((w, i) => `<span class="split-w"><span class="split-wi" style="--i: ${i}">${escapeHtml(w)}</span></span>`)
        .join(' ');
      el.classList.add('is-split');
    });
  }

  // ============================================================
  // 15. Interactive Matter.js Skills Physics ("Throw Them Around")
  // ============================================================
  function initSkillsPhysics() {
    const wrap = document.getElementById('skills-physics-wrap');
    const canvas = document.getElementById('skills-physics-canvas');
    const staticTags = document.getElementById('skills-static-tags');
    if (!wrap || !canvas || !window.Matter || prefersReducedMotion || window.innerWidth <= 640) {
      return;
    }

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body } = window.Matter;
    const engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 0.85;

    const width = wrap.clientWidth || 760;
    const height = 320;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    wrap.classList.add('has-canvas');

    // Create boundaries (floor, left wall, right wall)
    const floor = Bodies.rectangle(width / 2, height + 25, width * 2, 50, { isStatic: true });
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height * 2, { isStatic: true });
    Composite.add(engine.world, [floor, leftWall, rightWall]);

    // Skill pills labels
    const tagElements = staticTags ? Array.from(staticTags.querySelectorAll('.feature-tag')) : [];
    const skillNames = tagElements.length > 0
      ? tagElements.map((t) => t.textContent.trim())
      : ['Flutter', 'Dart', 'Riverpod', 'Clean Architecture', 'C++', 'DSA', 'Custom Canvas', 'SQLite', 'REST APIs', 'Git', 'Touch UI'];

    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    const pillBodies = [];

    skillNames.forEach((text, i) => {
      const textWidth = ctx.measureText(text).width;
      const pillW = Math.max(80, textWidth + 34);
      const pillH = 38;
      const startX = 60 + ((i * 120) % Math.max(100, width - 180));
      const startY = -40 - i * 35; // Staggered drop from above

      const body = Bodies.rectangle(startX, startY, pillW, pillH, {
        chamfer: { radius: 19 },
        restitution: 0.35,
        friction: 0.4,
        frictionAir: 0.015,
        angle: (i % 2 === 0 ? 1 : -1) * (0.05 + (i * 0.03)),
      });
      body.skillLabel = text;
      body.pillW = pillW;
      body.pillH = pillH;
      pillBodies.push(body);
    });

    Composite.add(engine.world, pillBodies);

    // Mouse control for grabbing and tossing pills
    const mouse = Mouse.create(canvas);
    // Remove wheel capture so scrolling works over canvas
    canvas.removeEventListener('wheel', mouse.mousewheel);
    canvas.removeEventListener('DOMMouseScroll', mouse.mousewheel);

    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } },
    });
    Composite.add(engine.world, mouseConstraint);

    // Wake up bodies when interacting
    Events.on(mouseConstraint, 'startdrag', () => {
      pillBodies.forEach((b) => Body.setSleeping(b, false));
    });

    let isRunning = false;
    let animId = null;

    function renderLoop() {
      if (!isRunning) return;
      Engine.update(engine, 1000 / 60);

      ctx.clearRect(0, 0, width, height);

      // Draw custom tactile pills
      pillBodies.forEach((b) => {
        const { x, y } = b.position;
        const angle = b.angle;
        const w = b.pillW;
        const h = b.pillH;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Pill background
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
        } else {
          ctx.rect(-w / 2, -h / 2, w, h);
        }
        ctx.fillStyle = '#f8f7f4';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#2e0cff';
        ctx.stroke();

        // Pill text
        ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#0a0a0a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.skillLabel, 0, 1);

        ctx.restore();
      });

      animId = requestAnimationFrame(renderLoop);
    }

    // IntersectionObserver to only simulate when visible (0% CPU when offscreen)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isRunning) {
              isRunning = true;
              pillBodies.forEach((b) => Body.setSleeping(b, false));
              renderLoop();
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
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      if (isCursorOn) talkCursor.classList.add('is-down');
    });

    window.addEventListener('mouseup', () => {
      talkCursor.classList.remove('is-down');
    });

    function cursorRaf() {
      if (isCursorOn) {
        cursorX += (targetX - cursorX) * 0.18;
        cursorY += (targetY - cursorY) * 0.18;
        talkCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      }
      requestAnimationFrame(cursorRaf);
    }
    requestAnimationFrame(cursorRaf);
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
      updateGalleryMetrics();
      updateNavbarTheme();
    }, 100);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
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
  initSplitText();
  initSkillsPhysics();
  initTalkCursor();
  updateNavbarTheme();
  updateActiveNavPill();
  loadPortfolio();
});
