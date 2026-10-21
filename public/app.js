document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const projectsPinSection = document.getElementById('projects');
  const projectsViewport = document.getElementById('projects-viewport');
  const projectsCarousel = document.getElementById('projects-carousel');
  const projectsProgressBar = document.getElementById('projects-progress-bar');
  const projectsIndicator = document.getElementById('projects-indicator');
  const projectsWindow = document.getElementById('projects-window');
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
                ? `<img src="${escapeHtml(p.screenshotSrc)}" alt="${escapeHtml(p.title)} preview" class="card-thumb-img" onerror="this.style.display='none'" />`
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
              <img src="${escapeHtml(currentScreen.src)}" alt="${escapeHtml(currentScreen.alt || p.title)}" class="modal-phone-img" />
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
                  <img src="${escapeHtml(s.src)}" alt="${escapeHtml(s.label)}" />
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
  // 4. Pinned Horizontal Project Gallery (Scroll-Linked)
  // ============================================================
  function isMobileLayout() {
    return window.innerWidth <= 1024 || window.matchMedia('(pointer: coarse)').matches;
  }

  function updateGalleryMetrics() {
    if (!projectsPinSection || !projectsCarousel) return;

    if (isMobileLayout() || prefersReducedMotion) {
      projectsPinSection.style.height = 'auto';
      projectsCarousel.style.transform = 'none';
      if (projectsProgressBar) projectsProgressBar.style.width = '100%';
      return;
    }

    // Force layout flush to get true scrollWidth
    const trackWidth = projectsCarousel.scrollWidth;
    const windowWidth = window.innerWidth;

    // End padding ensures the last card stays in full view before releasing
    const endPadding = Math.max(140, (windowWidth - 440) / 2);
    maxTravelDistance = Math.max(0, trackWidth - windowWidth + endPadding);

    // Height of the pin container determines vertical scroll duration
    const scrollDistance = Math.max(maxTravelDistance * 1.15, window.innerHeight * 1.4);
    projectsPinSection.style.height = `${window.innerHeight + scrollDistance}px`;

    // Immediately trigger a scroll update to position correctly
    syncHorizontalScroll();
  }

  function syncHorizontalScroll() {
    if (!projectsPinSection || !projectsCarousel) return;

    if (isMobileLayout() || prefersReducedMotion) {
      projectsCarousel.style.transform = 'none';
      return;
    }

    const rect = projectsPinSection.getBoundingClientRect();
    const totalScrollable = projectsPinSection.offsetHeight - window.innerHeight;

    if (totalScrollable <= 0) return;

    // Progress from 0 to 1
    const rawProgress = -rect.top / totalScrollable;
    const progress = Math.min(Math.max(rawProgress, 0), 1);

    // Horizontal travel
    const currentTranslateX = progress * maxTravelDistance;
    projectsCarousel.style.transform = `translate3d(${-currentTranslateX}px, 0, 0)`;

    // Progress bar
    if (projectsProgressBar) {
      projectsProgressBar.style.width = `${progress * 100}%`;
    }

    // Indicator fading when reaching the end
    if (projectsIndicator) {
      projectsIndicator.style.opacity = progress > 0.95 ? '0.25' : '1';
    }
  }

  // Drag-to-scroll support on desktop
  if (projectsWindow) {
    projectsWindow.addEventListener('mousedown', (e) => {
      if (isMobileLayout() || prefersReducedMotion) return;
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragScrollTop = window.scrollY;
      projectsWindow.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX;
      window.scrollTo({
        top: dragScrollTop - deltaX * 1.5,
        behavior: 'auto',
      });
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (projectsWindow) projectsWindow.style.cursor = '';
      }
    });
  }

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
      const duration = 1200;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * target);
        el.textContent = current;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(update);
    });
  }

  // ============================================================
  // 11. Active Navbar Pill Sync on Scroll
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
  // 12. Copy Email to Clipboard
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
        // Fallback prompt
        window.prompt('Copy email manually:', email);
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
    }, 100);
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(updateGalleryMetrics, 150);
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

  // Initial load
  loadPortfolio();
});
