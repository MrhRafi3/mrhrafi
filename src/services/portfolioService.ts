import { getContextDevService, ContextDevService, ScrapeResponse, BrandSummary, StyleguideResponse } from './contextDev.js';

export interface ProjectScreenshot {
  src: string;
  label: string;
  alt: string;
}

export interface ProjectFeature {
  name: string;
  detail: string;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  accent?: string;
  badge?: string;
  tagline: string;
  category: string;
  url: string;
  githubUrl?: string | null;
  demoUrl?: string | null;
  repoNote?: string;
  tags: string[];
  role: string;
  description: string;
  overview?: string;
  highlights: string[];
  features?: ProjectFeature[];
  coverSrc?: string;
  screenshotSrc: string;
  screenshots: ProjectScreenshot[];
  enriched?: {
    resolvedTitle?: string;
    description?: string;
    markdownExcerpt?: string;
    lastUpdated?: string;
    requestId?: string;
  };
}

export interface ClientPartner {
  id: string;
  name: string;
  domain: string;
  role: string;
  description?: string;
}

export interface DeveloperProfile {
  name: string;
  role: string;
  bio: string;
  location: string;
  email: string;
  links: {
    github: string;
    linkedin: string;
    email: string;
  };
  skills: string[];
  projects: Project[];
  clients: ClientPartner[];
}

export class PortfolioService {
  private _contextDev?: ContextDevService;

  private get contextDev(): ContextDevService {
    if (!this._contextDev) {
      this._contextDev = getContextDevService();
    }
    return this._contextDev;
  }

  private profile: DeveloperProfile = {
    name: 'Mrh Rafi',
    role: 'Flutter App Developer & Mobile UI Engineer',
    bio: 'Independent Flutter developer based in Dhaka, Bangladesh, dedicated to engineering fluid, tactile, high-performance mobile user interfaces and reliable cross-platform systems with C++ and DSA algorithmic foundations.',
    location: 'Dhaka, Bangladesh',
    email: 'mrhrafi99@gmail.com',
    links: {
      github: 'https://github.com/mrhrafi3',
      linkedin: 'https://bd.linkedin.com/in/mrhrafi',
      email: 'mrhrafi99@gmail.com',
    },
    skills: [
      'Flutter',
      'Dart',
      'Mobile UI / UX',
      'C++',
      'Data Structures & Algorithms',
      'Clean Architecture',
      'State Management (Provider/Riverpod)',
      'Custom Canvas UI',
      'SQLite / Offline Storage',
      'REST APIs',
      'Git & GitHub',
    ],
    projects: [
      {
        id: 'clocky',
        title: 'Clocky',
        accent: '.',
        tagline: 'Tactile Flutter timekeeping with glowing analog/digital World Clock, alarms, and precision stopwatch',
        category: 'Horological Utility',
        url: 'https://github.com/MrhRafi3/Clocky',
        githubUrl: 'https://github.com/MrhRafi3/Clocky',
        demoUrl: null,
        repoNote: 'Active public repository on GitHub.',
        tags: ['Flutter', 'Dart', 'Custom Canvas', 'Utility', 'Mobile UI'],
        role: 'Flutter App Developer — UI Design & Mobile Implementation',
        description:
          'A tactile Flutter timekeeping application combining a glowing analog and digital World Clock with quick multi-city timezone selection, customizable alarms, and a precision stopwatch.',
        overview:
          'Clocky blends minimal dark-mode aesthetics with responsive clock dials and precise scheduling. Engineered with custom painters, interval timers, and sub-millisecond stopwatch accuracy.',
        highlights: [
          'Designed a high-contrast World Clock pairing a glowing analog dial with live digital readout and active timezone indicator (Dhaka, London, New York, Tokyo, Singapore).',
          'Integrated searchable timezone bottom sheet and smooth alarm scheduling with flexible repeat-day toggles.',
          'Engineered circular stopwatch with live lap tracking, audio cues, and modular responsive widgets.',
        ],
        features: [
          { name: 'World Clock', detail: 'Analog dial & digital time with multi-city timezone comparison', icon: '◷' },
          { name: 'Alarms & Schedules', detail: 'Flexible repeat schedules, customizable sound triggers, and instant toggles', icon: '◉' },
          { name: 'Precision Stopwatch', detail: 'Circular progress ring, recorded lap times, and sub-millisecond precision', icon: '◎' },
        ],
        coverSrc: '/images/project-covers/clocky-cover.webp',
        screenshotSrc: '/images/clocky/screen-1.png',
        screenshots: [
          {
            src: '/images/clocky/screen-1.png',
            label: 'World Clock',
            alt: 'Clocky World Clock screen showing glowing analog dial, digital readout, and Dhaka timezone pill',
          },
          {
            src: '/images/clocky/screen-2.png',
            label: 'Select Timezone',
            alt: 'Clocky Timezone selector with search input and UTC offsets for global cities',
          },
          {
            src: '/images/clocky/screen-3.png',
            label: 'Alarms',
            alt: 'Clocky Alarm screen with scheduled alarms list and active toggles',
          },
          {
            src: '/images/clocky/screen-4.png',
            label: 'Edit Alarm',
            alt: 'Clocky Edit Alarm modal showing time picker and repeat days selector',
          },
          {
            src: '/images/clocky/screen-5.png',
            label: 'Stopwatch',
            alt: 'Clocky Stopwatch screen showing circular progress ring with Lap and Stop controls',
          },
        ],
      },
      {
        id: 'expify-beta',
        title: 'Expify Beta',
        accent: ' Beta',
        badge: 'BETA',
        tagline: 'Smart expense tracking mobile application with BDT (৳) cashflow, project budgets, and visual reports',
        category: 'Fintech / Utility',
        url: 'https://github.com/mrhrafi3',
        githubUrl: null,
        demoUrl: null,
        repoNote: 'Expify Beta repository is being prepared and will be linked once pushed to GitHub.',
        tags: ['Flutter', 'Dart', 'Fintech', 'Expense Tracking', 'Mobile UI'],
        role: 'Flutter App Developer — Architecture & UI Implementation',
        description:
          'An expense tracker mobile application built with Flutter that gives users an instant overview of their total balance in BDT (৳), income versus expenses, dedicated project budgets, and visual financial reports.',
        overview:
          'Tailored for everyday personal finance. Expify Beta provides instant transaction logging, categorical breakdown visualization, and monthly spending insights through an elegant mobile experience with offline-first persistence.',
        highlights: [
          'Built clean home dashboard featuring prominent Total Balance card (BDT ৳) with live Income/Expense summaries and recent transactions.',
          'Added dedicated Project budget tracking with spent vs. remaining progress bars and interactive donut chart in Reports.',
          'Structured bottom navigation across Home, Projects, Reports, and Settings with category-based transaction entry and Google auth flow.',
        ],
        features: [
          { name: 'Balance & Cashflow', detail: 'Live BDT (৳) balance, income/expense breakdown, and recent transactions', icon: '◈' },
          { name: 'Project Budgets', detail: 'Dedicated budget allocations with spent vs. remaining progress indicators', icon: '▤' },
          { name: 'Visual Reports', detail: 'Savings rate metrics and interactive Income vs Expense donut chart', icon: '✓' },
        ],
        coverSrc: '/images/project-covers/expify-cover.webp',
        screenshotSrc: '/images/expify/screen-1.png',
        screenshots: [
          {
            src: '/images/expify/screen-1.png',
            label: 'Home Dashboard',
            alt: 'Expify Beta home screen showing Total Balance of ৳9,450.00 and Income/Expense summary cards',
          },
          {
            src: '/images/expify/screen-2.png',
            label: 'Projects & Budgets',
            alt: 'Expify Beta Projects screen showing active projects and budget progress bars',
          },
          {
            src: '/images/expify/screen-3.png',
            label: 'Financial Reports',
            alt: 'Expify Beta Reports screen with Current Net Balance and donut chart',
          },
          {
            src: '/images/expify/screen-4.png',
            label: 'Settings',
            alt: 'Expify Beta Settings screen showing user profile card and preferences',
          },
          {
            src: '/images/expify/screen-5.png',
            label: 'Add Transaction',
            alt: 'Expify Beta Add Transaction screen with category icon grid',
          },
          {
            src: '/images/expify/screen-6.png',
            label: 'Project Detail',
            alt: 'Expify Beta Food project detail view showing budget breakdown',
          },
          {
            src: '/images/expify/screen-7.png',
            label: 'Edit Profile',
            alt: 'Expify Beta Edit Profile screen with avatar picker',
          },
          {
            src: '/images/expify/screen-8.png',
            label: 'Welcome & Sign In',
            alt: 'Expify Beta onboarding screen highlighting Smart Taka Dashboard',
          },
        ],
      },
      {
        id: 'nomnom',
        title: 'NomNom',
        accent: '.',
        badge: 'FOOD DELIVERY',
        tagline: 'Contemporary food delivery and restaurant discovery mobile application built with Flutter',
        category: 'E-Commerce / Delivery UI',
        url: 'https://github.com/mrhrafi3',
        githubUrl: null,
        demoUrl: null,
        repoNote: 'NomNom is in active development; repository and release builds will be available soon.',
        tags: ['Flutter', 'Dart', 'E-Commerce', 'Cart Architecture', 'Live Tracking'],
        role: 'Flutter App Developer — Mobile UI Design & Architecture',
        description:
          'A contemporary food delivery and restaurant discovery mobile application built with Flutter. Designed with appetizing visuals, real-time menu exploration, dish customization, intuitive cart checkout, and live order tracking.',
        overview:
          'An end-to-end mobile food ordering application demo exploring interconnected user touchpoints: customer ordering, dish customization, cart checkout, and simulated live courier dispatch tracking.',
        highlights: [
          'Designed engaging food discovery home feed with category pills, curated trending restaurants, and quick search filters.',
          'Built comprehensive dish customizer sheet supporting size choices, toppings, spice levels, and real-time order subtotal calculations.',
          'Engineered intuitive cart summary with voucher discounts and step-by-step simulated live courier dispatch tracking with 18-minute arrival countdown.',
        ],
        features: [
          { name: 'Discover & Menus', detail: 'Curated restaurant feeds, category pills, and Mirpur-6 delivery address', icon: '♨' },
          { name: 'Dish Customizer', detail: 'Portion sizes, add-on toppings, spice levels, and live price recalculation', icon: '✦' },
          { name: 'Cart & Live Tracking', detail: 'Voucher discounts, delivery address checkout, and live courier progress map', icon: '⚡' },
        ],
        coverSrc: '/images/project-covers/nomnom-cover.webp',
        screenshotSrc: '/images/NomNom/home.png',
        screenshots: [
          {
            src: '/images/NomNom/splash-interface.png',
            label: 'Splash & Brand',
            alt: 'NomNom splash branding interface featuring the bold emblem and tagline',
          },
          {
            src: '/images/NomNom/home.png',
            label: 'Home Feed & Deals',
            alt: 'NomNom main home feed showing delivery address in Mirpur-6 and food search bar',
          },
          {
            src: '/images/NomNom/explore-menu.png',
            label: 'Explore & Menus',
            alt: 'NomNom explore screen showing cuisine filter tabs and dish listings',
          },
          {
            src: '/images/NomNom/food.png',
            label: 'Dish Customizer',
            alt: 'NomNom dish customizer sheet for Fiery Crispy Chicken Royale',
          },
          {
            src: '/images/NomNom/food-combo.png',
            label: 'Feast Box Combo',
            alt: 'NomNom feast box combo view showcasing value meals',
          },
          {
            src: '/images/NomNom/cart.png',
            label: 'Cart & Checkout',
            alt: 'NomNom cart and checkout view with itemized order breakdown',
          },
          {
            src: '/images/NomNom/order-tracking.png',
            label: 'Live Order Tracker',
            alt: 'NomNom live order tracking view showing estimated arrival countdown and courier map',
          },
          {
            src: '/images/NomNom/offers.png',
            label: 'Offers & Rewards',
            alt: 'NomNom rewards and discounts screen displaying loyalty points and coupons',
          },
          {
            src: '/images/NomNom/progile-settings.png',
            label: 'Profile & Settings',
            alt: 'NomNom profile and account settings screen for Mrh Rafi',
          },
        ],
      },
    ],
    clients: [
      {
        id: 'client-1',
        name: 'GitHub',
        domain: 'github.com',
        role: 'Open-source collaboration & code repository platform',
      },
      {
        id: 'client-2',
        name: 'LinkedIn',
        domain: 'linkedin.com',
        role: 'Professional network & developer presence',
      },
      {
        id: 'client-3',
        name: 'Flutter',
        domain: 'flutter.dev',
        role: 'Primary mobile application ecosystem',
      },
    ],
  };

  constructor(contextDev?: ContextDevService) {
    if (contextDev) {
      this._contextDev = contextDev;
    }
  }

  public getProfile(): DeveloperProfile {
    return this.profile;
  }

  /**
   * Enriches project card by scraping its live site or repository
   * using Context.dev POST /web/scrape.
   */
  public async enrichProject(projectIdOrUrl: string): Promise<Project> {
    const project = this.profile.projects.find(
      (p) => p.id === projectIdOrUrl || p.url === projectIdOrUrl || (projectIdOrUrl === 'proj-1' && p.id === 'clocky')
    );
    const targetUrl = project ? project.url : projectIdOrUrl;

    const scrapeResult: ScrapeResponse = await this.contextDev.scrape({
      url: targetUrl,
      formats: { markdown: true },
      sharedParams: { mainContentOnly: true },
    });

    const markdownExcerpt = scrapeResult.markdown?.data
      ? scrapeResult.markdown.data.slice(0, 300).trim() + (scrapeResult.markdown.data.length > 300 ? '...' : '')
      : undefined;

    const enrichedData = {
      resolvedTitle: scrapeResult.metadata?.title,
      description: scrapeResult.metadata?.description || markdownExcerpt,
      markdownExcerpt,
      lastUpdated: new Date().toISOString(),
      requestId: scrapeResult.request_id,
    };

    if (project) {
      project.enriched = enrichedData;
      return project;
    }

    return {
      id: `custom-${Date.now()}`,
      title: scrapeResult.metadata?.title || 'External Project',
      tagline: scrapeResult.metadata?.description || 'Enriched via Context.dev',
      category: 'External Enriched',
      role: 'External Reference',
      description: scrapeResult.metadata?.description || 'Enriched project data via Context.dev',
      highlights: [],
      screenshotSrc: '',
      screenshots: [],
      url: targetUrl,
      tags: ['Enriched', 'Context.dev'],
      enriched: enrichedData,
    };
  }

  /**
   * Discovers and retrieves brand intelligence for clients/partners
   * using Context.dev GET /brand/search.
   */
  public async enrichClientBrand(query: string): Promise<BrandSummary[]> {
    const result = await this.contextDev.searchBrands(query);
    return result.brands || [];
  }

  /**
   * Analyzes project website design system and typography
   * using Context.dev GET /web/styleguide.
   */
  public async inspectStyleguide(domain: string, colorScheme?: 'light' | 'dark'): Promise<StyleguideResponse> {
    return this.contextDev.extractStyleguide(domain, { colorScheme });
  }
}
