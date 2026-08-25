// ==UserScript==
// @name         Reddit · JetBrains / Darcula 外观
// @namespace    https://www.reddit.com/
// @version      0.2.1
// @description  把 Reddit（shreddit 新 UI）换成 JetBrains IDE / Darcula 风格（支持 IDEA / PyCharm 切换）。仅改变外观，保留站点原有内容与交互。
// @author       czm15053
// @match        https://www.reddit.com/*
// @match        https://reddit.com/*
// @icon         https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png
// @grant        none
// @noframes
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const STYLE_ID = "reddit-idea-theme";
  const FAVICON_ID = "idea-favicon";
  const HOME_CLASS = "idea-ide-home";
  const TOPIC_CLASS = "idea-ide-topic";
  const DARK_CLASS = "idea-dark";
  const PRODUCT_KEY = "reddit-idea-product";
  const DARK_KEY = "reddit-idea-dark";

  let scheduled = false;

  // Brand marks adapted from Wikimedia Commons (JetBrains product icons).
  const IDEA_MARK_SVG = (idPrefix, sizeAttr) => `<svg ${sizeAttr} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${idPrefix}-a" x1="0" y1="8" x2="24" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0.1" stop-color="#FC801D"/>
        <stop offset="0.59" stop-color="#FE2857"/>
      </linearGradient>
      <linearGradient id="${idPrefix}-b" x1="6" y1="58" x2="62" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0.21" stop-color="#FE2857"/>
        <stop offset="0.7" stop-color="#007EFF"/>
      </linearGradient>
    </defs>
    <path fill="#FF8100" d="M14 6H4C1.8 6 0 7.8 0 10v11.5c0 1.2.5 2.3 1.4 3.1L38.5 56.8c.7.6 1.7 1 2.7 1H53c2.2 0 4-1.8 4-4V42.2c0-1.2-.5-2.3-1.4-3.1L17.6 6.9C16.9 6.3 15.9 6 14.9 6H14z"/>
    <path fill="url(#${idPrefix}-a)" d="M14.5 6H4C1.8 6 0 7.8 0 10v13c0 .2 0 .4.05.6L5.2 59.5C5.5 61.5 7.2 63 9.2 63H25c2.2 0 4-1.8 4-4l-.01-18.3c0-.45-.07-.88-.21-1.3L18.4 8.7C17.85 7.05 16.3 6 14.55 6h-.05z"/>
    <path fill="url(#${idPrefix}-b)" d="M60 0H26c-1.6 0-3.1 1-3.75 2.5L6.2 39.2c-.22.5-.33 1.05-.33 1.6V59c0 2.2 1.8 4 4 4h18c.8 0 1.6-.24 2.25-.7L61.8 41.2c1.15-.75 1.85-2.05 1.85-3.4V4c0-2.2-1.8-4-4-4H60z"/>
    <rect x="12" y="12" width="40" height="40" fill="#000"/>
    <path fill="#fff" d="M17 29.4h3v-9.8H17V17h8.8v2.6h-3v9.8h3V32H17v-2.6z"/>
    <path fill="#fff" d="M27.3 29.3h2.2c1.3 0 2.2-.9 2.2-2.2V17h2.9v10.3c0 2.7-1.8 4.7-4.8 4.7h-2.5v-2.7z"/>
    <rect x="17" y="44" width="16" height="3" fill="#fff"/>
  </svg>`;

  const PYCHARM_MARK_SVG = (idPrefix, sizeAttr) => `<svg ${sizeAttr} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${idPrefix}-a" x1="8" y1="64" x2="60" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0.1" stop-color="#00D886"/>
        <stop offset="0.59" stop-color="#F0EB18"/>
      </linearGradient>
      <linearGradient id="${idPrefix}-b" x1="58" y1="58" x2="2" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0.3" stop-color="#F0EB18"/>
        <stop offset="0.7" stop-color="#00C4F4"/>
      </linearGradient>
    </defs>
    <path fill="#00D886" d="M6 48l.01 11.9C6.01 62.1 7.8 64 10 64h11.5c1.2 0 2.3-.52 3.1-1.42L57.2 24.4c.63-.74.98-1.68.98-2.65V9.9c0-2.25-1.82-4.07-4.07-4.07H42.6c-1.19 0-2.32.52-3.09 1.42L6.8 45.4c-.63.74-.98 1.68-.98 2.65z"/>
    <path fill="url(#${idPrefix}-a)" d="M6 49.5v10.4C6 62.1 7.8 64 10 64h13c.19 0 .38-.01.57-.04l36.9-5.28c2.01-.29 3.5-2 3.5-4.03V39c0-2.25-1.82-4.07-4.07-4.07l-18.54.01c-.44 0-.87.07-1.29.21L8.6 45.6C6.94 46.16 5.82 47.72 5.82 49.47V49.5H6z"/>
    <path fill="url(#${idPrefix}-b)" d="M0 4.07V38c0 1.63.97 3.1 2.47 3.74L40 57.85c.51.22 1.05.33 1.6.33h18.4c2.25 0 4.07-1.82 4.07-4.07V36.1c0-.8-.24-1.59-.69-2.26L41.9 1.81C41.16.68 39.89 0 38.52 0H4.07C1.82 0 0 1.82 0 4.07z"/>
    <rect x="12" y="12" width="40" height="40" fill="#000"/>
    <path fill="#fff" d="M17.1 17h6.9c3.9 0 6.3 2.3 6.3 5.7v.1c0 3.8-2.9 5.8-6.6 5.8h-2.8V37h-3.8V17zm6.5 8.4c1.8 0 2.9-1.1 2.9-2.5v-.1c0-1.6-1.1-2.5-2.9-2.5h-2.7v5.1h2.7z"/>
    <path fill="#fff" d="M33.4 31.2c1.17.67 2.47 1.01 3.9 1.01 1.21 0 2.33-.23 3.34-.68 1.02-.45 1.86-1.08 2.53-1.89.68-.81 1.13-1.75 1.36-2.8h-3.07c-.2.54-.5 1.02-.9 1.44-.39.41-.87.72-1.43.94-.56.22-1.16.33-1.82.33-.89 0-1.69-.22-2.4-.66-.72-.44-1.28-1.05-1.69-1.82-.4-.78-.6-1.66-.6-2.63s.2-1.84.6-2.62c.41-.78.97-1.39 1.69-1.83.71-.44 1.51-.66 2.4-.66.66 0 1.26.11 1.82.33.56.22 1.04.54 1.43.95.4.41.7.88.9 1.43h3.07c-.23-1.05-.68-1.98-1.36-2.79-.67-.81-1.51-1.45-2.53-1.9-1.01-.45-2.13-.67-3.34-.67-1.44 0-2.74.34-3.9 1.02-1.17.67-2.08 1.6-2.75 2.79-.66 1.18-1 2.5-1 3.95 0 1.46.33 2.78 1 3.97.66 1.18 1.58 2.11 2.75 2.78z"/>
    <rect x="17" y="44" width="16" height="3" fill="#fff"/>
  </svg>`;

  const PRODUCTS = {
    idea: {
      id: "idea",
      name: "IntelliJ IDEA",
      accent: "#4A9FD8",
      ext: "java",
      menus: [
        "File",
        "Edit",
        "View",
        "Navigate",
        "Code",
        "Refactor",
        "Build",
        "Run",
        "Tools",
        "VCS",
        "Window",
        "Help"
      ],
      stripLeft: [
        { label: "Project", icon: "folder", active: true },
        { label: "Commit", icon: "commit" },
        { label: "Bookmarks", icon: "bookmark" }
      ],
      stripRight: [
        { label: "Maven", icon: "maven" },
        { label: "Database", icon: "database" },
        { label: "AI", icon: "ai" }
      ],
      mark: IDEA_MARK_SVG
    },
    pycharm: {
      id: "pycharm",
      name: "PyCharm",
      accent: "#21D789",
      ext: "py",
      menus: [
        "File",
        "Edit",
        "View",
        "Navigate",
        "Code",
        "Refactor",
        "Run",
        "Tools",
        "VCS",
        "Window",
        "Help"
      ],
      stripLeft: [
        { label: "Project", icon: "folder", active: true },
        { label: "Structure", icon: "structure" },
        { label: "Bookmarks", icon: "bookmark" }
      ],
      stripRight: [
        { label: "Python", icon: "python" },
        { label: "Database", icon: "database" },
        { label: "AI", icon: "ai" }
      ],
      mark: PYCHARM_MARK_SVG
    }
  };

  function getProductId() {
    try {
      const value = localStorage.getItem(PRODUCT_KEY);
      if (value && PRODUCTS[value]) return value;
    } catch {
      /* ignore */
    }
    return "idea";
  }

  function getProduct() {
    return PRODUCTS[getProductId()] || PRODUCTS.idea;
  }

  function setProductId(id) {
    if (!PRODUCTS[id]) return;
    try {
      localStorage.setItem(PRODUCT_KEY, id);
    } catch {
      /* ignore */
    }
  }

  function isDarkMode() {
    try {
      const value = localStorage.getItem(DARK_KEY);
      if (value !== null) return value === "1";
    } catch {
      /* ignore */
    }
    return true;
  }

  function setDarkMode(on) {
    try {
      localStorage.setItem(DARK_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  function brandDataUri(product) {
    return `data:image/svg+xml,${encodeURIComponent(product.mark(`${product.id}-fi`, `width="32" height="32"`))}`;
  }

  function replaceFavicon() {
    if (!document.documentElement) return;
    let link = document.getElementById(FAVICON_ID);
    if (!link) {
      link = document.createElement("link");
      link.id = FAVICON_ID;
      link.rel = "icon";
      const host = document.head || document.documentElement;
      host.append(link);
    }
    link.href = brandDataUri(getProduct());
  }

  const RAW_CSS = String.raw`
    html.idea-ide-theme {
      color-scheme: light !important;
      --idea-accent: #4A9FD8;
      --idea-accent-strong: #3592C4;
      --idea-accent-soft: #6CB2D9;
      --idea-bg: #FFFFFF;
      --idea-panel: #F2F2F2;
      --idea-panel-2: #E8E8E8;
      --idea-editor: #FFFFFF;
      --idea-fill-hover: #E5F3FF;
      --idea-row-hover: #E5F3FF;
      --idea-line: #C9C9C9;
      --idea-line-2: #D9D9D9;
      --idea-line-soft: #E5E5E5;
      --idea-line-strong: #A0A0A0;
      --idea-text: #000000;
      --idea-text-2: #444444;
      --idea-text-3: #777777;
      --idea-text-muted: #999999;
      --idea-selection: #A6D2FF;
      --idea-tab-active: #FFFFFF;
      --idea-tab-idle: #D9D9D9;
      --idea-scrollbar: #C1C1C1;
      --idea-shadow-1: rgb(0 0 0 / 8%);
      --idea-shadow-2: rgb(0 0 0 / 14%);
      --idea-shadow-3: rgb(0 0 0 / 22%);
      --idea-menu: #F2F2F2;
      --idea-status: #F2F2F2;
      --idea-strip-bg: #F2F2F2;
      --idea-strip-hover: #E5F3FF;
      --idea-strip-active: #A6D2FF;
      --idea-strip-text: #444444;
      --idea-strip-border: #C9C9C9;
      --idea-pv-bg: #F2F2F2;
      --idea-pv-path: #E8E8E8;
      --idea-pv-text: #000000;
      --idea-pv-muted: #6E6E6E;
      --idea-pv-hover: #E5F3FF;
      --idea-pv-selected: #A6D2FF;
      --idea-pv-border: #C9C9C9;
      --idea-pv-folder: #B8860B;
      --idea-pv-dot: #4A9EFF;
      --idea-promo-bg: #FFF7E0;
      --idea-promo: #C1862E;
      --idea-tool-strip: 40px;
      --idea-mono: "JetBrains Mono", "SF Mono", Menlo, Consolas, Monaco, monospace;
      --idea-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
    }

    html.idea-ide-theme.idea-dark {
      color-scheme: dark !important;
      --idea-accent: #4A9FD8;
      --idea-accent-strong: #6CB2D9;
      --idea-accent-soft: #3D7A99;
      --idea-bg: #3C3F41;
      --idea-panel: #3C3F41;
      --idea-panel-2: #313335;
      --idea-editor: #2B2B2B;
      --idea-fill-hover: #4B6EAF;
      --idea-row-hover: #4B6EAF;
      --idea-line: #555555;
      --idea-line-2: #2C2E2F;
      --idea-line-soft: #323232;
      --idea-line-strong: #282828;
      --idea-text: #BBBBBB;
      --idea-text-2: #A9B7C6;
      --idea-text-3: #808080;
      --idea-text-muted: #606366;
      --idea-selection: #214283;
      --idea-tab-active: #4B6EAF;
      --idea-tab-idle: #3C3F41;
      --idea-scrollbar: #616161;
      --idea-shadow-1: rgb(0 0 0 / 25%);
      --idea-shadow-2: rgb(0 0 0 / 40%);
      --idea-shadow-3: rgb(0 0 0 / 55%);
      --idea-menu: #3C3F41;
      --idea-status: #3C3F41;
      --idea-strip-bg: #2B2D30;
      --idea-strip-hover: #393B40;
      --idea-strip-active: #2D4A6F;
      --idea-strip-text: #BBBBBB;
      --idea-strip-border: #1E1F22;
      --idea-pv-bg: #2B2D30;
      --idea-pv-path: #3C3F41;
      --idea-pv-text: #BCBEC4;
      --idea-pv-muted: #6E6E6E;
      --idea-pv-hover: #393B40;
      --idea-pv-selected: #2D4A6F;
      --idea-pv-border: #1E1F22;
      --idea-pv-folder: #E8B86D;
      --idea-pv-dot: #4A9EFF;
      --idea-promo-bg: #2E2410;
      --idea-promo: #E0A84A;
    }

    html.idea-ide-theme,
    html.idea-ide-theme body {
      background: var(--idea-bg) !important;
      color: var(--idea-text) !important;
    }

    html.idea-ide-theme body {
      font-family: var(--idea-ui) !important;
      padding-bottom: 22px;
    }

    html.idea-ide-theme ::selection {
      background: var(--idea-selection) !important;
    }

    /* IDE-style scrollbars */
    html.idea-ide-theme :not(body) {
      scrollbar-width: thin;
      scrollbar-color: var(--idea-scrollbar) var(--idea-editor);
    }

    /* Global boxes: square, edge-to-edge */
    html.idea-ide-theme :is(shreddit-app, shreddit-post, shreddit-comment, shreddit-feed, article, main, aside, section, button, faceplate-card) {
      border-radius: 0 !important;
    }

    /* ===== Native chrome stripped; own IDE top bar ===== */
    html.idea-ide-theme :is(
      reddit-header-large, shreddit-header, header[role="banner"],
      faceplate-tracker[noun="header"], reddit-header,
      [data-testid="header"], [data-testid="reddit-header"],
      reddit-sidebar-nav, left-nav, nav[aria-label="Primary navigation"],
      #left-sidebar-container, #right-sidebar-container,
      [data-testid="left-sidebar"], [data-testid="right-sidebar"], [data-testid="sidebar-container"],
      shreddit-sidebar, reddit-sidebar, #column-right,
      shreddit-app aside, [aria-label="Community information"],
      [aria-label="Related communities"], [aria-label="Popular communities"],
      shreddit-sidebar-carousel, community-highlight-carousel,
      shreddit-community-highlight-carousel, [data-testid="community-highlights"]
    ) {
      display: none !important;
    }

    html.idea-ide-theme reddit-logo,
    html.idea-ide-theme faceplate-logo {
      display: none !important;
    }

    html.idea-ide-theme shreddit-app {
      padding-top: 36px;
    }

    html.idea-ide-theme #idea-topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2147483646;
      display: flex;
      align-items: center;
      gap: 2px;
      height: 36px;
      padding: 0 10px 0 6px;
      background: var(--idea-menu);
      border-bottom: 1px solid var(--idea-line-strong);
      box-shadow: inset 0 1px 0 var(--idea-line);
      color: var(--idea-text-2);
      font-family: var(--idea-ui);
      user-select: none;
      box-sizing: border-box;
    }

    html.idea-ide-theme #idea-topbar .idea-topbar-links {
      display: flex;
      align-items: center;
      gap: 1px;
      min-width: 0;
      overflow: hidden;
    }

    html.idea-ide-theme #idea-topbar .idea-topbar-links a {
      display: inline-flex;
      align-items: center;
      height: 24px;
      padding: 0 8px;
      border: 0;
      border-radius: 2px;
      background: transparent;
      color: var(--idea-text-2);
      font-size: 12px;
      line-height: 24px;
      text-decoration: none;
      white-space: nowrap;
    }

    html.idea-ide-theme #idea-topbar .idea-topbar-links a:hover {
      background: var(--idea-fill-hover);
      color: var(--idea-text);
    }

    html.idea-ide-theme #idea-topbar .idea-topbar-search {
      flex: 1 1 auto;
      max-width: 560px;
      min-width: 120px;
      height: 24px;
      margin: 0 10px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      border: 1px solid var(--idea-line-2);
      border-radius: 2px;
      background: var(--idea-panel-2);
    }

    html.idea-ide-theme #idea-topbar .idea-topbar-search input {
      flex: 1 1 auto;
      min-width: 0;
      height: 22px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--idea-text);
      font: 12px var(--idea-mono);
      outline: none;
    }

    html.idea-ide-theme #idea-topbar .idea-topbar-spacer {
      flex: 1 1 0;
      min-width: 8px;
    }

    html.idea-ide-theme #idea-topbar .idea-topbar-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      min-height: 24px;
      margin: 0 1px;
      padding: 0 12px;
      border: 1px solid var(--idea-line);
      border-radius: 2px;
      background: transparent;
      color: var(--idea-text-2);
      font-size: 12px;
      text-decoration: none;
      white-space: nowrap;
    }

    html.idea-ide-theme #idea-topbar .idea-topbar-action:hover {
      background: var(--idea-fill-hover);
      border-color: var(--idea-accent-soft);
      color: var(--idea-text);
    }

    html.idea-ide-theme #idea-topbar .idea-topbar-action.is-primary {
      background: var(--idea-accent);
      border-color: var(--idea-accent);
      color: #FFFFFF;
    }

    /* Injected brand + menubar */
    html.idea-ide-theme .idea-brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-right: 4px;
      padding: 2px 6px 2px 2px;
      border-radius: 4px;
      color: var(--idea-text) !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      letter-spacing: 0.2px;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
    }

    html.idea-ide-theme .idea-brand:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    html.idea-ide-theme .idea-brand svg {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      border-radius: 3px;
    }

    html.idea-ide-theme .idea-brand-caret {
      color: var(--idea-text-muted);
      font-size: 9px;
    }

    html.idea-ide-theme .idea-menubar {
      display: flex;
      align-items: center;
      gap: 1px;
      min-width: 0;
      overflow: hidden;
    }

    html.idea-ide-theme .idea-menubar button {
      height: 24px;
      padding: 0 8px;
      border: 0;
      border-radius: 2px;
      background: transparent;
      color: var(--idea-text-2);
      font-size: 12px;
      line-height: 24px;
      cursor: default;
      white-space: nowrap;
    }

    html.idea-ide-theme .idea-menubar button:hover {
      background: var(--idea-fill-hover);
      color: var(--idea-text);
    }

    html.idea-ide-theme .idea-theme-btn {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-width: 24px !important;
      height: 24px !important;
      margin: 0 2px 0 6px !important;
      padding: 0 6px !important;
      border: 1px solid transparent !important;
      border-radius: 2px !important;
      background: transparent !important;
      color: var(--idea-text-2) !important;
      font-size: 11px !important;
      cursor: pointer !important;
    }

    html.idea-ide-theme .idea-theme-btn:hover {
      background: var(--idea-fill-hover) !important;
      border-color: var(--idea-accent-soft) !important;
      color: var(--idea-text) !important;
    }

    /* Brand dropdown */
    html.idea-ide-theme .idea-brand-menu {
      position: fixed;
      z-index: 2147483646;
      min-width: 220px;
      padding: 4px;
      border: 1px solid var(--idea-line);
      border-radius: 4px;
      background: var(--idea-panel);
      color: var(--idea-text);
      box-shadow: 0 8px 24px var(--idea-shadow-3);
      font-family: var(--idea-ui);
    }

    html.idea-ide-theme .idea-brand-menu button {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      width: 100% !important;
      height: auto !important;
      min-height: 32px !important;
      margin: 0 !important;
      padding: 6px 10px !important;
      border: 0 !important;
      border-radius: 3px !important;
      background: transparent !important;
      color: var(--idea-text) !important;
      text-align: left !important;
      font-size: 12px !important;
      cursor: pointer !important;
    }

    html.idea-ide-theme .idea-brand-menu button:hover,
    html.idea-ide-theme .idea-brand-menu button.is-current {
      background: var(--idea-fill-hover) !important;
    }

    html.idea-ide-theme .idea-brand-menu button svg {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
      border-radius: 2px;
    }

    html.idea-ide-theme .idea-brand-menu .idea-brand-menu-desc {
      display: block;
      color: var(--idea-text-muted);
      font-size: 11px;
    }

    /* ===== Tool window strips ===== */
    html.idea-ide-theme .idea-tool-strip {
      position: fixed;
      top: 36px;
      bottom: 22px;
      z-index: 2147483600;
      width: var(--idea-tool-strip);
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 1px;
      padding: 4px 0;
      background: var(--idea-strip-bg);
      border-color: var(--idea-strip-border);
      color: var(--idea-strip-text);
      font-family: var(--idea-ui);
      user-select: none;
      overflow: hidden;
    }

    html.idea-ide-theme .idea-tool-strip-left {
      left: 0;
      border-right: 1px solid var(--idea-strip-border);
    }

    html.idea-ide-theme .idea-tool-strip-right {
      right: 0;
      border-left: 1px solid var(--idea-strip-border);
    }

    html.idea-ide-theme .idea-tool-strip-spacer {
      flex: 1 1 auto;
      min-height: 8px;
      pointer-events: none;
    }

    html.idea-ide-theme .idea-tool-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      width: 100%;
      min-height: 42px;
      margin: 0;
      padding: 4px 2px;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: inherit;
      cursor: default;
      appearance: none;
    }

    html.idea-ide-theme .idea-tool-btn:hover {
      background: var(--idea-strip-hover);
    }

    html.idea-ide-theme .idea-tool-btn.is-active {
      background: var(--idea-strip-active);
      color: var(--idea-pv-text);
    }

    html.idea-ide-theme .idea-tool-btn-icon {
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      color: var(--idea-accent);
    }

    html.idea-ide-theme .idea-tool-btn-icon svg {
      width: 14px;
      height: 14px;
      display: block;
      fill: currentColor;
    }

    html.idea-ide-theme .idea-tool-btn-label {
      display: block;
      max-width: 100%;
      padding: 0 1px;
      font-size: 9px;
      line-height: 1.15;
      text-align: center;
      word-break: break-all;
      overflow: hidden;
      max-height: 2.4em;
    }

    html.idea-ide-theme main {
      max-width: none !important;
      min-width: 0 !important;
      margin-left: var(--idea-tool-strip) !important;
      margin-right: var(--idea-tool-strip) !important;
    }

    /* ===== Left rail replaced by own Project View panel ===== */
    html.idea-ide-theme .idea-project-panel {
      position: fixed;
      top: 36px;
      bottom: 22px;
      left: var(--idea-tool-strip);
      z-index: 2147483590;
      width: 252px;
      display: flex;
      flex-direction: column;
      background: var(--idea-pv-bg);
      border-right: 1px solid var(--idea-pv-border);
      color: var(--idea-pv-text);
      font-family: var(--idea-mono);
      font-size: 13px;
      overflow: hidden;
      user-select: none;
    }

    html.idea-ide-theme .idea-project-panel ul {
      list-style: none !important;
      margin: 0 !important;
      padding: 6px 6px 10px !important;
      overflow-y: auto;
    }

    html.idea-ide-theme .idea-project-panel li {
      margin: 0 !important;
      padding: 0 !important;
    }

    html.idea-ide-theme .idea-project-panel a {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      min-height: 22px !important;
      margin: 0 !important;
      padding: 2px 8px !important;
      border: 0 !important;
      border-radius: 3px !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--idea-pv-text) !important;
      text-decoration: none !important;
      font-size: 13px !important;
      font-family: var(--idea-mono) !important;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    html.idea-ide-theme .idea-project-panel a::before {
      content: "▸";
      width: 16px;
      min-width: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--idea-pv-folder);
      font-size: 10px;
      font-family: var(--idea-ui);
    }

    html.idea-ide-theme .idea-project-panel a:hover {
      background: var(--idea-pv-hover) !important;
    }

    html.idea-ide-theme .idea-project-panel a.is-active {
      background: var(--idea-pv-selected) !important;
    }

    html.idea-ide-theme.idea-rail-left main {
      margin-left: calc(var(--idea-tool-strip) + 252px) !important;
    }

    html.idea-ide-theme .idea-project-title {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 28px;
      padding: 6px 12px;
      background: var(--idea-pv-path);
      border-bottom: 1px solid var(--idea-pv-border);
      color: var(--idea-pv-text);
      font-family: var(--idea-ui);
      font-size: 12px;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    html.idea-ide-theme .idea-project-title-icon {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
      color: var(--idea-pv-folder);
    }

    html.idea-ide-theme .idea-project-title-icon svg {
      width: 16px;
      height: 16px;
      display: block;
      fill: currentColor;
    }

    html.idea-ide-theme .idea-project-title-path {
      min-width: 0;
      color: var(--idea-pv-text);
      opacity: 0.8;
      font-family: var(--idea-mono);
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    html.idea-ide-theme :is(reddit-sidebar-nav, left-nav, nav[aria-label="Primary navigation"], #left-sidebar-container) ul {
      list-style: none !important;
      margin: 0 !important;
      padding: 6px 6px 10px !important;
    }

    html.idea-ide-theme :is(reddit-sidebar-nav, left-nav, nav[aria-label="Primary navigation"], #left-sidebar-container) :is(a, button) {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      width: 100% !important;
      min-height: 22px !important;
      margin: 0 !important;
      padding: 2px 8px !important;
      border: 0 !important;
      border-radius: 3px !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--idea-pv-text) !important;
      text-decoration: none !important;
      font-size: 13px !important;
      font-family: var(--idea-mono);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    html.idea-ide-theme :is(reddit-sidebar-nav, left-nav, nav[aria-label="Primary navigation"], #left-sidebar-container) :is(a, button)::before {
      content: "▸";
      width: 16px;
      min-width: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--idea-pv-folder);
      font-size: 10px;
      font-family: var(--idea-ui);
    }

    html.idea-ide-theme :is(reddit-sidebar-nav, left-nav, nav[aria-label="Primary navigation"], #left-sidebar-container) :is(a, button):hover {
      background: var(--idea-pv-hover) !important;
      color: var(--idea-pv-text) !important;
    }

    html.idea-ide-theme :is(reddit-sidebar-nav, left-nav, nav[aria-label="Primary navigation"], #left-sidebar-container) :is(a, button)[aria-current="page"] {
      background: var(--idea-pv-selected) !important;
      color: var(--idea-pv-text) !important;
    }

    /* ===== Right rail: tool-window panels ===== */
    html.idea-ide-theme :is(#right-sidebar-container, [data-testid="right-sidebar"], [aria-label="Community information"] .right-sidebar-container) {
      margin: 0 var(--idea-tool-strip) 0 0 !important;
      padding: 0 !important;
      background: var(--idea-panel) !important;
      border-left: 1px solid var(--idea-line-2) !important;
      color: var(--idea-text-2) !important;
    }

    html.idea-ide-theme :is(#right-sidebar-container, [data-testid="right-sidebar"]) > * {
      margin: 0 !important;
      padding: 10px 12px !important;
      border: 0 !important;
      border-bottom: 1px solid var(--idea-line-soft) !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    html.idea-ide-theme :is(#right-sidebar-container, [data-testid="right-sidebar"]) :is(h1, h2, h3, h4) {
      color: var(--idea-text) !important;
      font-family: var(--idea-ui) !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      text-transform: none !important;
    }

    html.idea-ide-theme :is(#right-sidebar-container, [data-testid="right-sidebar"]) p,
    html.idea-ide-theme :is(#right-sidebar-container, [data-testid="right-sidebar"]) span,
    html.idea-ide-theme :is(#right-sidebar-container, [data-testid="right-sidebar"]) div {
      font-family: var(--idea-ui);
      font-size: 12px;
    }

    html.idea-ide-theme :is(#right-sidebar-container, [data-testid="right-sidebar"]) :is(button, a) {
      font-family: var(--idea-ui);
      font-size: 12px !important;
    }

    html.idea-ide-theme :is(#right-sidebar-container, [data-testid="right-sidebar"]) img {
      border-radius: 2px !important;
    }

    /* ===== Subreddit header ===== */
    html.idea-ide-theme :is(community-header, shreddit-subreddit-header, subreddit-header) {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      width: 100% !important;
      max-width: none !important;
      min-height: 44px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 6px 16px !important;
      border: 0 !important;
      border-bottom: 1px solid var(--idea-line-strong) !important;
      background: var(--idea-panel) !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    html.idea-ide-theme :is(community-header, shreddit-subreddit-header, subreddit-header) * {
      background-image: none !important;
    }

    html.idea-ide-theme :is(community-header, shreddit-subreddit-header, subreddit-header) :is(
      picture, faceplate-img, img:not([alt="r"]):not([class*="icon"]), [class*="banner"],
      [data-testid*="banner"], [style*="background-image"]
    ) {
      display: none !important;
    }

    html.idea-ide-theme :is(community-header, shreddit-subreddit-header, subreddit-header) :is(h1, h2, span, p, a, faceplate-text):not(picture *) {
      opacity: 1 !important;
      color: var(--idea-text) !important;
      -webkit-text-fill-color: var(--idea-text) !important;
      font-family: var(--idea-ui) !important;
      text-shadow: none !important;
    }

    html.idea-ide-theme :is(community-header, shreddit-subreddit-header, subreddit-header) :is(a[href*="/join"], a[href*="/subscribe"], button) {
      height: 24px !important;
      min-height: 24px !important;
      padding: 0 12px !important;
      border: 1px solid var(--idea-line) !important;
      border-radius: 2px !important;
      background: var(--idea-panel-2) !important;
      box-shadow: none !important;
      color: var(--idea-text) !important;
      font-size: 12px !important;
    }

    /* ===== Home: feed as Git Log ===== */
    html.idea-ide-home shreddit-app,
    html.idea-ide-home main {
      background: var(--idea-editor) !important;
    }

    html.idea-ide-home shreddit-feed,
    html.idea-ide-home shreddit-posts-page {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      background: var(--idea-editor) !important;
      font-family: var(--idea-ui) !important;
    }

    html.idea-ide-home .idea-git-row {
      position: relative !important;
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 6px 16px 6px 8px !important;
      border: 0 !important;
      border-bottom: 1px solid var(--idea-line-soft) !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      overflow: hidden !important;
    }

    html.idea-ide-home .idea-git-row:hover {
      background: var(--idea-row-hover) !important;
    }

    html.idea-ide-home .idea-git-row shreddit-post {
      position: relative !important;
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 2px 0 2px var(--idea-lane-w, 64px) !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      font-family: var(--idea-ui) !important;
    }

    html.idea-ide-home .idea-git-graph {
      position: absolute;
      left: 2px;
      top: 0;
      bottom: 0;
      width: auto;
      margin: 0;
      pointer-events: none;
      overflow: visible;
    }

    html.idea-ide-home .idea-git-graph svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    html.idea-ide-home .idea-git-dot {
      position: absolute;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      top: 13px;
      pointer-events: none;
    }

    /* Vote column */
    html.idea-ide-home shreddit-post :is([data-post-click-location="vote"], shreddit-post-vote-button, [data-testid="vote-arrows"]) {
      position: absolute !important;
      left: 4px !important;
      top: 4px !important;
      width: 36px !important;
      max-width: 36px !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      text-align: center !important;
      color: var(--idea-text-muted) !important;
      font-family: var(--idea-mono) !important;
      font-size: 11px !important;
    }

    html.idea-ide-home faceplate-number,
    html.idea-ide-home shreddit-post faceplate-number,
    html.idea-ide-home faceplate-count,
    html.idea-ide-home shreddit-comment faceplate-number {
      color: inherit !important;
      font-family: var(--idea-mono) !important;
      font-variant-numeric: tabular-nums;
    }

    /* Title row */
    html.idea-ide-home shreddit-post :is(a[id^="post-title"], a[slot="title"], [slot="title"] a) {
      display: inline !important;
      margin: 0 !important;
      padding: 0 !important;
      color: var(--idea-text) !important;
      font-family: var(--idea-ui) !important;
      font-size: 13.5px !important;
      font-weight: 600 !important;
      line-height: 1.35 !important;
      text-decoration: none !important;
      overflow-wrap: anywhere !important;
    }

    html.idea-ide-home shreddit-post :is(a[id^="post-title"], a[slot="title"], [slot="title"] a):visited {
      color: var(--idea-text) !important;
    }

    html.idea-ide-home shreddit-post :is(a[id^="post-title"], a[slot="title"], [slot="title"] a):hover {
      color: var(--idea-accent-strong) !important;
      text-decoration: none !important;
    }

    /* Credit line: r/sub · u/author · time */
    html.idea-ide-home shreddit-post :is([slot="credit-bar"], [data-testid="credit-bar"], [data-post-click-location="author"]) {
      display: block !important;
      margin: 1px 0 !important;
      padding: 0 !important;
      color: var(--idea-text-3) !important;
      font-family: var(--idea-mono) !important;
      font-size: 11px !important;
      line-height: 1.3 !important;
    }

    html.idea-ide-home shreddit-post :is([slot="credit-bar"], [data-testid="credit-bar"]) a {
      color: var(--idea-text-3) !important;
      text-decoration: none !important;
    }

    html.idea-ide-home shreddit-post :is([slot="credit-bar"], [data-testid="credit-bar"]) a:hover {
      color: var(--idea-accent-strong) !important;
    }

    html.idea-ide-home shreddit-post :is([slot="credit-bar"], [data-testid="credit-bar"]) a[href^="/r/"] {
      color: var(--idea-accent) !important;
      font-weight: 600;
    }

    /* Body excerpt */
    html.idea-ide-home shreddit-post :is([slot="text-body"], [data-testid="post-text-container"]) {
      margin: 3px 0 !important;
      padding: 0 !important;
      color: var(--idea-text-3) !important;
      font-family: var(--idea-mono) !important;
      font-size: 12px !important;
    }

    html.idea-ide-home shreddit-post :is([slot="text-body"], [data-testid="post-text-container"]) * {
      color: inherit !important;
      font: inherit !important;
      background: transparent !important;
      border: 0 !important;
    }

    /* Action row: comments · share */
    html.idea-ide-home shreddit-post :is([slot="post-footer"], shreddit-post-action-row, [data-testid="post-action-row"]) {
      display: flex !important;
      flex-wrap: wrap !important;
      align-items: center !important;
      gap: 10px !important;
      min-height: 20px !important;
      margin: 2px 0 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      color: var(--idea-text-muted) !important;
      font-family: var(--idea-mono) !important;
      font-size: 11px !important;
    }

    html.idea-ide-home shreddit-post :is([slot="post-footer"], shreddit-post-action-row, [data-testid="post-action-row"]) button {
      min-width: 0 !important;
      min-height: 20px !important;
      margin: 0 !important;
      padding: 2px 4px !important;
      border: 0 !important;
      border-radius: 2px !important;
      background: transparent !important;
      color: inherit !important;
      font-size: 11px !important;
      font-family: var(--idea-mono);
    }

    html.idea-ide-home shreddit-post :is([slot="post-footer"], shreddit-post-action-row, [data-testid="post-action-row"]) button:hover {
      background: var(--idea-fill-hover) !important;
    }

    /* Feed media: modest, square; avatars off */
    html.idea-ide-home .idea-git-row :is(reddit-avatar, [data-testid="avatar"]) {
      display: none !important;
    }

    html.idea-ide-home .idea-git-row img {
      max-height: 100px !important;
      max-width: 240px !important;
      width: auto !important;
      height: auto !important;
      margin: 4px 0 !important;
      border-radius: 2px !important;
      box-shadow: none !important;
      display: inline-block !important;
    }

    html.idea-ide-home .idea-git-row video,
    html.idea-ide-home .idea-git-row shreddit-player {
      max-height: 160px !important;
      border-radius: 2px !important;
      margin: 4px 0 !important;
    }

    /* Awards off */
    html.idea-ide-theme :is(shreddit-award-button, awards-bar, [data-testid="award-button"], [aria-label*="Award"]) {
      display: none !important;
    }

    /* Promoted */
    html.idea-ide-theme :is(shreddit-ad-post, shreddit-post[is-promoted="true"], shreddit-post[promoted="true"]) {
      position: relative !important;
      background: var(--idea-promo-bg) !important;
      outline: 1px solid var(--idea-promo) !important;
      outline-offset: -1px !important;
    }

    html.idea-ide-theme :is(shreddit-ad-post, shreddit-post[is-promoted="true"], shreddit-post[promoted="true"])::after {
      content: "// sponsored";
      position: absolute;
      top: 6px;
      right: 14px;
      color: var(--idea-promo);
      font-family: var(--idea-mono);
      font-size: 10px;
    }

    /* ===== Topic page: code editor frame ===== */
    html.idea-ide-topic :is(shreddit-app, main) {
      background: var(--idea-editor) !important;
    }

    html.idea-ide-topic .idea-topic-context {
      display: flex;
      align-items: center;
      gap: 6px;
      min-height: 28px;
      padding: 4px 16px;
      border-bottom: 1px solid var(--idea-line-strong);
      background: var(--idea-panel);
      color: var(--idea-text-2);
      font-size: 12px;
      font-family: var(--idea-mono);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    html.idea-ide-topic .idea-topic-context-sep {
      color: var(--idea-text-muted);
    }

    html.idea-ide-topic .idea-editor-tabs {
      display: flex;
      align-items: flex-end;
      gap: 0;
      min-height: 32px;
      padding: 0 0 0 8px;
      border-bottom: 1px solid var(--idea-line-strong);
      background: var(--idea-panel-2);
      overflow-x: auto;
    }

    html.idea-ide-topic .idea-editor-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 28px;
      padding: 0 14px;
      border: 1px solid transparent;
      border-bottom: 0;
      background: transparent;
      color: var(--idea-text-3);
      font-size: 12px;
      font-family: var(--idea-mono);
      white-space: nowrap;
      user-select: none;
    }

    html.idea-ide-topic .idea-editor-tab.active {
      background: var(--idea-editor);
      color: var(--idea-text);
      border-color: var(--idea-line-2);
      box-shadow: inset 0 2px 0 var(--idea-accent);
    }

    html.idea-ide-topic .idea-editor-tab-icon {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      background: linear-gradient(135deg, #CC7832, #6A8759);
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 25%);
      flex: 0 0 auto;
    }

    html.idea-product-pycharm.idea-ide-topic .idea-editor-tab-icon {
      background: linear-gradient(135deg, #3572A5, #21D789);
    }

    /* Post header */
    html.idea-ide-topic shreddit-post > h1,
    html.idea-ide-topic shreddit-post [slot="title"] h1 {
      margin: 14px 20px 4px !important;
      padding: 0 !important;
      color: var(--idea-text) !important;
      font-family: var(--idea-ui) !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      line-height: 1.35 !important;
    }

    html.idea-ide-topic shreddit-post {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      background: transparent !important;
    }

    html.idea-ide-topic shreddit-post :is([slot="text-body"], [data-testid="post-text-container"]) {
      margin: 0 !important;
      padding: 10px 20px 14px !important;
      color: var(--idea-text-2) !important;
      font-family: var(--idea-mono) !important;
      font-size: 13px !important;
      line-height: 20px !important;
    }

    /* Markdown in topic */
    html.idea-ide-topic :is(shreddit-post, shreddit-comment) :is(.md, [slot="text-body"]) {
      counter-reset: ideaLine;
    }

    html.idea-ide-topic :is(shreddit-post, shreddit-comment) .md > :is(p, li) {
      counter-increment: ideaLine;
      position: relative;
      margin: 2px 0;
      padding-left: 56px;
      color: var(--idea-text-2) !important;
      font-family: var(--idea-mono) !important;
      font-size: 13px !important;
      line-height: 20px !important;
    }

    html.idea-ide-topic :is(shreddit-post, shreddit-comment) .md > :is(p, li)::before {
      content: counter(ideaLine);
      position: absolute;
      left: 0;
      top: 0;
      width: 44px;
      padding-right: 10px;
      color: var(--idea-text-muted);
      font-family: var(--idea-mono);
      font-size: 12px;
      text-align: right;
      user-select: none;
      font-variant-numeric: tabular-nums;
    }

    html.idea-ide-topic :is(shreddit-post, shreddit-comment) .md {
      margin: 0 20px !important;
      padding: 4px 0 !important;
    }

    html.idea-ide-topic :is(shreddit-post, shreddit-comment) .md :is(blockquote) {
      margin: 4px 0 4px 8px !important;
      padding: 4px 10px !important;
      border-left: 3px solid var(--idea-accent-soft) !important;
      background: color-mix(in srgb, var(--idea-accent) 10%, var(--idea-editor)) !important;
      border-radius: 0 !important;
    }

    html.idea-ide-topic :is(shreddit-post, shreddit-comment) .md :is(pre, code) {
      border-radius: 2px !important;
      font-family: var(--idea-mono) !important;
      font-size: 12px !important;
      line-height: 1.55 !important;
      white-space: pre-wrap !important;
    }

    html.idea-ide-topic :is(shreddit-post, shreddit-comment) .md code {
      background: var(--idea-panel-2) !important;
      color: #CC7832 !important;
      padding: 1px 3px !important;
    }

    html.idea-ide-topic :is(shreddit-post, shreddit-comment) .md pre {
      background: var(--idea-panel-2) !important;
      color: #A9B7C6 !important;
      padding: 8px 10px !important;
      border: 1px solid var(--idea-line-soft) !important;
      overflow-x: auto !important;
    }

    html.idea-ide-topic :is(shreddit-post, shreddit-comment) .md a {
      color: #6A8759 !important;
      text-decoration: underline !important;
      text-underline-offset: 2px;
    }

    /* ===== Comments: editor reading area ===== */
    html.idea-ide-topic shreddit-comment-tree {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 0 48px !important;
      background: var(--idea-editor) !important;
    }

    html.idea-ide-topic shreddit-comment {
      position: relative !important;
      display: block !important;
      width: auto !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 2px 20px 2px 4px !important;
      border: 0 !important;
      background: transparent !important;
      color: var(--idea-text-2) !important;
    }

    html.idea-ide-topic shreddit-comment[depth="0"] {
      border-top: 1px solid var(--idea-line-soft) !important;
      padding-top: 8px !important;
    }

    html.idea-ide-topic shreddit-comment[depth="1"] { margin-left: 24px !important; }
    html.idea-ide-topic shreddit-comment[depth="2"] { margin-left: 48px !important; }
    html.idea-ide-topic shreddit-comment[depth="3"] { margin-left: 72px !important; }
    html.idea-ide-topic shreddit-comment[depth="4"] { margin-left: 96px !important; }
    html.idea-ide-topic shreddit-comment[depth="5"] { margin-left: 116px !important; }

    html.idea-ide-topic shreddit-comment[depth]:not([depth="0"])::before {
      content: "";
      position: absolute;
      left: -13px;
      top: -2px;
      bottom: -2px;
      width: 1px;
      background: var(--idea-line);
      opacity: 0.55;
      pointer-events: none;
    }

    /* Meta row */
    html.idea-ide-topic shreddit-comment :is([slot="commentMeta"], [data-testid="comment-meta"], [data-testid="comment-header"]) {
      position: relative;
      display: block !important;
      margin: 0 0 2px 0 !important;
      padding: 2px 0 2px 56px !important;
      color: var(--idea-text-3) !important;
      font-family: var(--idea-mono) !important;
      font-size: 11px !important;
      line-height: 1.4 !important;
    }

    html.idea-ide-topic shreddit-comment[depth]:not([depth="0"]) :is([slot="commentMeta"], [data-testid="comment-meta"])::before {
      content: "└──";
      position: absolute;
      left: 0;
      color: var(--idea-text-muted);
      letter-spacing: -2px;
    }

    html.idea-ide-topic shreddit-comment :is([slot="commentMeta"], [data-testid="comment-meta"]) :is(a, span, faceplate-text) {
      color: var(--idea-text-3) !important;
      font-family: var(--idea-mono) !important;
      font-size: 11px !important;
      background: transparent !important;
      border: 0 !important;
    }

    html.idea-ide-topic shreddit-comment :is([slot="commentMeta"], [data-testid="comment-meta"]) a:hover {
      color: var(--idea-accent-strong) !important;
    }

    html.idea-ide-topic shreddit-comment :is([slot="comment"], [data-testid="comment"]) {
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      color: var(--idea-text-2) !important;
      font-family: var(--idea-mono) !important;
      font-size: 13px !important;
      line-height: 20px !important;
    }

    /* Comment media */
    html.idea-ide-topic shreddit-comment :is(picture, faceplate-img, img):not([width]):not([height]) {
      max-width: min(560px, 100%) !important;
      max-height: 260px !important;
      border-radius: 2px !important;
      box-shadow: none !important;
    }

    html.idea-ide-topic shreddit-comment :is(p, ul, ol, blockquote) {
      max-width: none !important;
      margin-top: 2px !important;
      margin-bottom: 2px !important;
    }

    html.idea-ide-topic :is(p, ul, ol) {
      font-family: var(--idea-mono);
      font-size: 13px;
      line-height: 20px;
      color: var(--idea-text-2);
    }

    /* Comment votes / actions: quiet */
    html.idea-ide-topic shreddit-comment :is(shreddit-comment-vote, faceplate-vdot, [data-testid="comment-footer"], div[slot="commentActions"]) {
      color: var(--idea-text-muted) !important;
      font-family: var(--idea-mono) !important;
      font-size: 11px !important;
    }

    html.idea-ide-topic shreddit-comment table {
      border-collapse: collapse !important;
    }

    html.idea-ide-topic shreddit-comment table :is(td, th) {
      border: 1px solid var(--idea-line-soft) !important;
      padding: 4px 8px !important;
      font-family: var(--idea-mono);
      font-size: 12px;
    }

    /* ===== Status bar ===== */
    html.idea-ide-theme::after {
      content: "UTF-8  ·  4 spaces  ·  Reddit  ·  Darcula";
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2147483644;
      height: 22px;
      padding: 0 12px;
      border-top: 1px solid var(--idea-line-2);
      background: var(--idea-status);
      color: var(--idea-text-3);
      font-size: 11px;
      line-height: 22px;
      font-family: var(--idea-mono);
      pointer-events: none;
      user-select: none;
    }

    /* ===== Cleanup: prompts, footers, rails for guests ===== */
    html.idea-ide-theme :is(
      rpl-modal-card, shreddit-signup-drawer, reddit-live-update-card,
      shreddit-recommended-posts, shreddit-community-recommendation,
      shreddit-recent-pages, community-highlight-carousel, trending-today,
      [data-testid="get-app"], [data-testid="app-download"], [data-testid="footer"],
      footer, reddit-footer, shreddit-suggestion-pane
    ) {
      display: none !important;
    }

    /* Narrow screens */
    @media (max-width: 960px) {
      html.idea-ide-theme .idea-tool-strip {
        display: none !important;
      }

      html.idea-ide-theme .idea-project-panel,
      html.idea-ide-theme.idea-rail-left main {
        margin-left: 0 !important;
      }

      html.idea-ide-theme .idea-project-panel {
        display: none !important;
      }

      html.idea-ide-theme main {
        margin-left: 0 !important;
      }

      html.idea-ide-theme .idea-menubar {
        display: none !important;
      }

      html.idea-ide-theme .idea-topbar-search {
        display: none !important;
      }
    }
  `;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    if (!document.documentElement) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = RAW_CSS;
    document.documentElement.append(style);
  }

  function applyColorMode() {
    document.documentElement.classList.toggle(DARK_CLASS, isDarkMode());
  }

  function routeClass() {
    const isTopicPage = /\/(comments|s|s\/)\//.test(location.pathname);
    document.documentElement.classList.toggle(TOPIC_CLASS, isTopicPage);
    document.documentElement.classList.toggle(HOME_CLASS, !isTopicPage);
  }

  function applyProductChrome() {
    const product = getProduct();
    const html = document.documentElement;
    html.classList.toggle("idea-product-" + product.id, true);
    ["idea", "pycharm"].forEach((id) => {
      if (id !== product.id) html.classList.remove("idea-product-" + id);
    });
    const brand = document.getElementById("idea-brand");
    if (brand) {
      brand.innerHTML = product.mark(`${product.id}-br`, `width="18" height="18"`)
        + `<span class="idea-brand-name">${product.name}</span><span class="idea-brand-caret">▾</span>`;
    }
    replaceFavicon();
  }

  const STRIP_ICONS = {
    folder: '<svg viewBox="0 0 16 16"><path d="M1.5 2h5l1.5 2h6.5v9.5H1.5z"/></svg>',
    commit: '<svg viewBox="0 0 16 16"><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 16h7a4.5 4.5 0 0 1-7 0zM4.5 0a4.5 4.5 0 0 1 7 0z"/></svg>',
    bookmark: '<svg viewBox="0 0 16 16"><path d="M4 0h8v16l-4-3.5L4 16z"/></svg>',
    structure: '<svg viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="3"/><rect x="2" y="6.5" width="12" height="3" opacity=".8"/><rect x="2" y="11" width="12" height="3" opacity=".6"/></svg>',
    maven: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    python: '<svg viewBox="0 0 16 16"><path d="M8 1C5 1 4.5 2.2 4.5 4v2h7V4c0-1.8-.5-3-3.5-3zM4.5 11v1c0 1.8.5 3 3.5 3s3.5-1.2 3.5-3v-1z"/></svg>',
    database: '<svg viewBox="0 0 16 16"><ellipse cx="8" cy="3.5" rx="6" ry="2.5"/><path d="M2 3.5v9c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-9"/><path d="M2 8c0 1.4 2.7 2.5 6 2.5S14 9.4 14 8"/></svg>',
    ai: '<svg viewBox="0 0 16 16"><path d="M3 2h10l1 12H2L3 2zm3 4l2 3 2-3"/></svg>'
  };

  function buildToolStripButton(spec) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "idea-tool-btn" + (spec.active ? " is-active" : "");
    button.title = spec.label;
    button.innerHTML = `
      <span class="idea-tool-btn-icon">${STRIP_ICONS[spec.icon] || STRIP_ICONS.folder}</span>
      <span class="idea-tool-btn-label">${spec.label}</span>
    `;
    return button;
  }

  function ensureToolStrip(side, buttons) {
    if (document.getElementById(`idea-strip-${side}`)) return;
    const strip = document.createElement("div");
    strip.id = `idea-strip-${side}`;
    strip.className = `idea-tool-strip idea-tool-strip-${side}`;
    buttons.forEach((spec) => strip.appendChild(buildToolStripButton(spec)));
    const spacer = document.createElement("span");
    spacer.className = "idea-tool-strip-spacer";
    strip.appendChild(spacer);
    document.body.appendChild(strip);
  }

  function makeToolStrips() {
    if (!document.body) return;
    const product = getProduct();
    ensureToolStrip("left", product.stripLeft);
    ensureToolStrip("right", product.stripRight);
  }

  function makeTopBar() {
    if (document.getElementById("idea-topbar")) return;
    if (!document.body) return;

    const product = getProduct();

    const bar = document.createElement("header");
    bar.id = "idea-topbar";
    bar.setAttribute("role", "banner");

    const brand = document.createElement("button");
    brand.id = "idea-brand";
    brand.type = "button";
    brand.className = "idea-brand";
    brand.title = "切换产品（IntelliJ IDEA / PyCharm）";
    brand.innerHTML = product.mark(`${product.id}-br`, `width="18" height="18"`)
      + `<span class="idea-brand-name">${product.name}</span><span class="idea-brand-caret">▾</span>`;
    bindBrandMenu(brand);

    const menubar = document.createElement("nav");
    menubar.className = "idea-menubar";
    menubar.setAttribute("aria-label", "IDE menu");
    product.menus.forEach((label) => {
      const item = document.createElement("button");
      item.type = "button";
      item.textContent = label;
      menubar.appendChild(item);
    });

    const links = document.createElement("nav");
    links.className = "idea-topbar-links";
    links.setAttribute("aria-label", "Reddit navigation");
    [["/", "Home"], ["/r/popular/", "Popular"], ["/r/all/", "All"]].forEach(([href, label]) => {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      links.appendChild(a);
    });

    const search = document.createElement("form");
    search.className = "idea-topbar-search";
    search.action = "/search/";
    search.method = "get";
    const input = document.createElement("input");
    input.type = "text";
    input.name = "q";
    input.placeholder = "Search Reddit…";
    input.autocomplete = "off";
    search.appendChild(input);

    const spacer = document.createElement("span");
    spacer.className = "idea-topbar-spacer";

    const themeBtn = document.createElement("button");
    themeBtn.id = "idea-theme-btn";
    themeBtn.type = "button";
    themeBtn.className = "idea-theme-btn";
    themeBtn.textContent = isDarkMode() ? "dark" : "light";
    themeBtn.title = "深色 / 浅色（Darcula vs. IDEA 浅色）";
    themeBtn.addEventListener("click", () => {
      setDarkMode(!isDarkMode());
      applyColorMode();
      themeBtn.textContent = isDarkMode() ? "dark" : "light";
    });

    bar.append(brand, menubar, links, search, spacer, themeBtn);

    /* Keep auth reachable: clone native login/signup links, else generic account. */
    const login = document.querySelector('header a[href^="/login"], [data-testid="login-button"], a[href="/login/"]');
    const signup = document.querySelector('header a[href^="/signup"], [data-testid="signup-button"], a[href="/signup/"]');
    if (login) {
      const clone = login.cloneNode(true);
      clone.classList.add("idea-topbar-action");
      bar.appendChild(clone);
    }
    if (signup) {
      const clone = signup.cloneNode(true);
      clone.classList.add("idea-topbar-action", "is-primary");
      bar.appendChild(clone);
    }
    if (!login && !signup) {
      const account = document.createElement("a");
      account.className = "idea-topbar-action";
      account.href = "/settings";
      account.textContent = "account";
      bar.appendChild(account);
    }

    document.body.prepend(bar);
  }

  function closeBrandMenu() {
    document.querySelector(".idea-brand-menu")?.remove();
  }

  function openBrandMenu(anchor) {
    closeBrandMenu();
    const menu = document.createElement("div");
    menu.className = "idea-brand-menu";
    menu.innerHTML = Object.values(PRODUCTS)
      .map(
        (p) => `<button data-product="${p.id}" type="button">
          ${p.mark(`${p.id}-mm`, `width="16" height="16"`)}
          <span>${p.name}<span class="idea-brand-menu-desc">*.${p.ext}  ·  ${p.accent}</span></span>
        </button>`
      )
      .join("");
    document.body.appendChild(menu);
    const rect = anchor.getBoundingClientRect();
    menu.style.left = `${Math.min(rect.left, window.innerWidth - 260)}px`;
    menu.style.top = `${rect.bottom + 4}px`;
    const current = getProductId();
    menu.querySelectorAll("button").forEach((button) => {
      if (button.dataset.product === current) button.classList.add("is-current");
      button.addEventListener("click", () => {
        setProductId(button.dataset.product);
        applyProductChrome();
        closeBrandMenu();
      });
    });
  }

  function bindBrandMenu(anchor) {
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (document.querySelector(".idea-brand-menu")) closeBrandMenu();
      else openBrandMenu(anchor);
    });
    document.addEventListener("mousedown", (event) => {
      if (!document.querySelector(".idea-brand-menu")) return;
      if (event.target.closest(".idea-brand-menu") || event.target.closest(".idea-brand")) return;
      closeBrandMenu();
    }, true);
  }

  function makeHeaderChrome() {
    /* removed: header chrome is now a fully injected top bar */
  }

  const FOLDER_ICON_SVG = '<svg viewBox="0 0 16 16"><path d="M1.5 2h5l1.5 2h6.5v9.5H1.5z"/></svg>';

  function ensureProjectPanel() {
    if (document.getElementById("idea-project-panel")) return;
    if (!document.body) return;

    const panel = document.createElement("aside");
    panel.id = "idea-project-panel";
    panel.className = "idea-project-panel";

    const pathParts = location.pathname.split("/").filter(Boolean);
    const path = ["reddit", ...pathParts.slice(0, 2)].join(" / ");

    const title = document.createElement("div");
    title.className = "idea-project-title";
    title.innerHTML = `<span class="idea-project-title-icon">${FOLDER_ICON_SVG}</span>
      <span class="idea-project-title-path">${escapeHtml(path)}</span>`;

    const list = document.createElement("ul");
    const sections = [["/", "Home"], ["/r/popular/", "Popular"], ["/r/all/", "All"]];
    if (pathParts[0] === "r" && pathParts[1]) {
      sections.push([location.pathname.replace(/\/+$/, "") || "/", `r/${pathParts[1]}`]);
    }
    sections.forEach(([href, label]) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = label;
      const current = href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);
      if (current) a.classList.add("is-active");
      li.appendChild(a);
      list.appendChild(li);
    });

    panel.append(title, list);
    document.body.appendChild(panel);
    document.documentElement.classList.add("idea-rail-left");
  }

  const GIT_GRAPH_COLORS = ["#4A9FD8", "#499C54", "#C1862E", "#954F72", "#39A7AC", "#D05A4E"];

  const laneState = new Map();

  function resetLanes() {
    laneState.clear();
  }

  function gitLaneX(lane) {
    return 4 + lane * 12;
  }

  function syncGitLogRows() {
    if (!document.documentElement.classList.contains(HOME_CLASS)) return;
    const scope = document.querySelector("shreddit-feed") || document.querySelector("shreddit-posts-page");
    if (!scope) return;

    const posts = Array.from(scope.querySelectorAll("shreddit-post"));
    if (!posts.length) return;

    const rows = [];
    const seen = new Set();
    posts.forEach((post) => {
      const row = post.parentElement;
      if (!row || seen.has(row)) return;
      seen.add(row);
      rows.push({ row, post });
    });
    if (!rows.length) return;

    let laneCount = 0;
    for (const { row, post } of rows) {
      const sub = post.getAttribute("subreddit-prefixed-name")
        || post.getAttribute("subreddit-name")
        || post.getAttribute("name")
        || "frontpage";
      if (!laneState.has(sub)) {
        laneState.set(sub, laneState.size);
      }
      row.dataset.ideaSub = sub;
      row.dataset.ideaLane = String(laneState.get(sub));
      laneCount = Math.max(laneCount, laneState.size);
    }

    let prevSub = null;
    rows.forEach(({ row }) => {
      row.classList.add("idea-git-row");
      const sub = row.dataset.ideaSub;
      const lane = Number(row.dataset.ideaLane);
      const laneIndex = laneState.get(sub);
      const width = gitLaneX(laneCount) + 10;

      let graph = row.querySelector(".idea-git-graph");
      if (!graph) {
        graph = document.createElement("span");
        graph.className = "idea-git-graph";
        row.prepend(graph);
      }
      graph.style.width = `${width}px`;
      row.style.setProperty("--idea-lane-w", `${width + 8}px`);

      if (graph.dataset.ideaSub === sub) {
        prevSub = sub;
        return;
      }
      graph.dataset.ideaSub = sub;

      let svg = "";
      for (let l = 0; l < laneCount; l++) {
        const color = GIT_GRAPH_COLORS[l % GIT_GRAPH_COLORS.length];
        svg += `<line x1="${gitLaneX(l)}" y1="0" x2="${gitLaneX(l)}" y2="100%" stroke="${color}" opacity="0.32" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
      }
      if (prevSub && laneState.get(prevSub) !== lane) {
        const from = gitLaneX(laneState.get(prevSub));
        const to = gitLaneX(lane);
        const color = GIT_GRAPH_COLORS[laneIndex % GIT_GRAPH_COLORS.length];
        svg += `<line x1="${from}" y1="17" x2="${to}" y2="17" stroke="${color}" opacity="0.85" stroke-width="1" vector-effect="non-scaling-stroke"/>`;
      }
      prevSub = sub;

      graph.innerHTML = `<svg viewBox="0 0 ${width} 40" preserveAspectRatio="none">${svg}</svg>` +
        `<span class="idea-git-dot" style="left:${gitLaneX(lane) - 4.5}px;background:${GIT_GRAPH_COLORS[laneIndex % GIT_GRAPH_COLORS.length]}"></span>`;
    });
  }

  function sanitizeFileStem(title) {
    return String(title || "").replace(/[^0-9A-Za-z\u4e00-\u9fa5 ]/g, "_").replace(/\s+/g, "_").slice(0, 60);
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function makeTopicChrome() {
    if (!document.documentElement.classList.contains(TOPIC_CLASS)) return;
    const tree = (document.querySelector("shreddit-comment-tree") || document.querySelector("[data-testid='comment-tree']"))
      || document.querySelector("shreddit-comment");
    const main = document.querySelector("main") || document.querySelector("shreddit-app");
    if (!tree && !main) return;

    const post = document.querySelector("shreddit-post");
    let title = "";
    try {
      title = (post && post.getAttribute("post-title")) || (document.querySelector("h1")?.textContent || "").trim();
    } catch { /* ignore */ }

    const product = getProduct();
    const pathParts = location.pathname.split("/").filter(Boolean);
    const sub = pathParts[0] === "r" ? `r/${pathParts[1]}` : "r/frontpage";

    if (!document.getElementById("idea-topic-context")) {
      const ctx = document.createElement("div");
      ctx.id = "idea-topic-context";
      ctx.className = "idea-topic-context";
      ctx.innerHTML = `${escapeHtml(location.hostname)}
        <span class="idea-topic-context-sep">/</span> ${escapeHtml(sub)}
        <span class="idea-topic-context-sep">/</span> comments
        <span class="idea-topic-context-sep">/</span> ${escapeHtml(pathParts[pathParts.length - 1] || "")}`;
      const target = tree || main;
      target.parentElement && target !== main ? target.before(ctx) : main.prepend(ctx);
    }

    if (!document.getElementById("idea-editor-tabs")) {
      const tabs = document.createElement("nav");
      tabs.id = "idea-editor-tabs";
      tabs.className = "idea-editor-tabs";
      const stem = sanitizeFileStem(title);
      tabs.innerHTML = `<span class="idea-editor-tab active">
        <span class="idea-editor-tab-icon"></span>${escapeHtml(stem)}.${product.ext}</span>`;
      const target = tree || main;
      target.parentElement && target !== main ? target.before(tabs) : main.prepend(tabs);
    }
  }

  function applyTheme() {
    if (!document.documentElement) return;
    injectStyle();
    applyColorMode();
    applyProductChrome();
    routeClass();
    makeTopBar();
    makeTopicChrome();
    ensureProjectPanel();
    syncGitLogRows();
    makeToolStrips();
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      try {
        applyTheme();
      } catch { /* ignore */ }
    }, 200);
  }

  function patchHistory() {
    const wrap = (fn) => function (...args) {
      const result = fn.apply(this, args);
      resetLanes();
      scheduleApply();
      return result;
    };
    try {
      history.pushState = wrap(history.pushState);
      history.replaceState = wrap(history.replaceState);
    } catch { /* ignore */ }
    window.addEventListener("popstate", () => {
      resetLanes();
      scheduleApply();
    });
  }

  function bootstrap() {
    if (!document.documentElement) {
      requestAnimationFrame(bootstrap);
      return;
    }
    document.documentElement.classList.add("idea-ide-theme");
    applyTheme();

    const observer = new MutationObserver(() => scheduleApply());
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      makeToolStrips();
    } else {
      document.documentElement.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, { childList: true, subtree: true });
        makeToolStrips();
      });
    }
    patchHistory();
  }

  bootstrap();
})();
