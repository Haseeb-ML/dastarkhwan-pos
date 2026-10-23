import fs from 'fs';
import path from 'path';

const cssPath = path.resolve('src/index.css');
let content = fs.readFileSync(cssPath, 'utf8');

const marker = '/* Desktop defaults for mobile-only controls */';
const markerIndex = content.indexOf(marker);

if (markerIndex === -1) {
  console.error("Marker not found in index.css!");
  process.exit(1);
}

const before = content.substring(0, markerIndex);

const newMobileCss = `/* Desktop defaults for mobile-only controls */
.mobile-hamburger-btn {
  display: none;
}
.mobile-bottom-more-btn {
  display: none;
}
.mobile-drawer-overlay {
  display: none;
}
.mobile-pos-nav-switcher {
  display: none;
}
.mobile-service-header {
  display: none;
}
.mobile-order-back-bar {
  display: none;
}
.mobile-cart {
  display: none;
}

@keyframes drawerFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes drawerSlideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
@keyframes drawerSlideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* ============================================================
   NATIVE-GRADE MOBILE RESPONSIVE ENGINE (Screens <= 800px)
   ============================================================ */
@media (max-width: 800px) {
  /* 1. Global Reset & Layout on Mobile */
  html, body {
    width: 100vw !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    -webkit-tap-highlight-color: transparent !important;
    font-size: 14px !important;
    background: #f8f6f0 !important;
  }
  #root {
    width: 100vw !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    min-height: 100dvh !important;
  }
  .app-shell {
    display: block !important;
    width: 100vw !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
    min-height: 100dvh !important;
    background: #f8f6f0 !important;
    padding-bottom: 84px !important;
  }
  .main-shell {
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  /* 2. Topbar on Mobile: Compact, Native Header */
  .topbar {
    height: 56px !important;
    min-height: 56px !important;
    padding: 0 12px !important;
    background: rgba(255, 255, 255, 0.98) !important;
    backdrop-filter: blur(12px) !important;
    border-bottom: 1.5px solid #dce4dd !important;
    position: sticky !important;
    top: 0 !important;
    z-index: 60 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px !important;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04) !important;
  }
  .topbar-brand-left {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    min-width: 0 !important;
    flex: 1 !important;
  }
  .mobile-hamburger-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    border: 1.5px solid #d4ded7 !important;
    border-radius: 10px !important;
    background: #f2f7f3 !important;
    color: #103f32 !important;
    cursor: pointer !important;
    padding: 0 !important;
    transition: background 0.15s ease !important;
  }
  .mobile-hamburger-btn:active {
    background: #e2ede4 !important;
    transform: scale(0.96) !important;
  }
  .topbar-brand-left h1 {
    font-size: 17px !important;
    font-weight: 700 !important;
    letter-spacing: -0.2px !important;
    color: #103f32 !important;
    margin: 0 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    line-height: 1.2 !important;
  }
  .topbar-brand-left p {
    display: none !important;
  }
  .app-zoom, .role-pill, .connection {
    display: none !important;
  }
  .top-actions {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    flex-shrink: 0 !important;
  }
  .top-actions .avatar {
    width: 36px !important;
    height: 36px !important;
    font-size: 11px !important;
    border-radius: 9px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: #f0f4f1 !important;
    color: #1b4b39 !important;
    border: 1px solid #d2ded5 !important;
  }

  /* 3. Slide-out Mobile Navigation Drawer */
  .mobile-drawer-overlay {
    display: flex !important;
    position: fixed !important;
    inset: 0 !important;
    background: rgba(0, 0, 0, 0.45) !important;
    backdrop-filter: blur(4px) !important;
    z-index: 9999 !important;
    animation: drawerFadeIn 0.2s ease !important;
    justify-content: flex-start !important;
  }
  html[dir="rtl"] .mobile-drawer-overlay {
    justify-content: flex-end !important;
  }
  .mobile-drawer-sheet {
    width: 82% !important;
    max-width: 320px !important;
    height: 100% !important;
    background: #ffffff !important;
    display: flex !important;
    flex-direction: column !important;
    box-shadow: 4px 0 28px rgba(0, 0, 0, 0.25) !important;
    animation: drawerSlideInLeft 0.22s ease-out !important;
    overflow: hidden !important;
  }
  html[dir="rtl"] .mobile-drawer-sheet {
    animation: drawerSlideInRight 0.22s ease-out !important;
    box-shadow: -4px 0 28px rgba(0, 0, 0, 0.25) !important;
  }
  .mobile-drawer-header {
    padding: 16px 14px !important;
    border-bottom: 1px solid #e2eae3 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    background: #f8faf8 !important;
  }
  .mobile-drawer-brand {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
  }
  .mobile-drawer-brand .brand-mark {
    width: 38px !important;
    height: 38px !important;
    background: #103f32 !important;
    color: #f7ddbb !important;
    font-size: 18px !important;
    font-weight: 700 !important;
    border-radius: 10px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .mobile-drawer-brand-text strong {
    display: block !important;
    font-size: 15px !important;
    color: #103f32 !important;
    font-weight: 700 !important;
  }
  .mobile-drawer-brand-text small {
    display: block !important;
    font-size: 11px !important;
    color: #64756c !important;
  }
  .mobile-drawer-close-btn {
    width: 36px !important;
    height: 36px !important;
    border: 0 !important;
    border-radius: 9px !important;
    background: #edf3ef !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #3b5045 !important;
    cursor: pointer !important;
  }
  .mobile-drawer-nav {
    flex: 1 !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding: 12px 10px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 4px !important;
  }
  .mobile-drawer-nav-item {
    width: 100% !important;
    min-height: 46px !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 10px 14px !important;
    border-radius: 12px !important;
    border: 0 !important;
    background: transparent !important;
    color: #31443a !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    text-align: start !important;
    transition: background 0.15s ease !important;
  }
  .mobile-drawer-nav-item:active {
    background: #e8f1eb !important;
  }
  .mobile-drawer-nav-item.active {
    background: #edf6f1 !important;
    color: #103f32 !important;
    font-weight: 700 !important;
  }
  .drawer-item-icon {
    display: flex !important;
    align-items: center !important;
    color: #1a5641 !important;
  }
  .drawer-item-label {
    flex: 1 !important;
  }
  .drawer-item-badge {
    font-size: 12px !important;
    color: #103f32 !important;
  }
  .mobile-drawer-footer {
    padding: 14px !important;
    border-top: 1px solid #e2eae3 !important;
    background: #f8faf8 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
  }
  .mobile-drawer-lang-row {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    font-size: 13px !important;
    color: #4b6054 !important;
    padding: 0 4px !important;
  }
  .mobile-drawer-logout-btn {
    width: 100% !important;
    height: 48px !important;
    border-radius: 12px !important;
    border: 1px solid #f0cfcb !important;
    background: #fdf2f1 !important;
    color: #ba2d20 !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    cursor: pointer !important;
  }

  /* 4. Bottom App Navigation Dock (5 Clean Primary Tabs) */
  .sidebar {
    position: fixed !important;
    inset: auto 0 0 0 !important;
    width: 100vw !important;
    height: 64px !important;
    padding: 2px 4px !important;
    background: #ffffff !important;
    border-top: 1.5px solid #dce4dd !important;
    z-index: 70 !important;
    box-shadow: 0 -2px 14px rgba(0, 0, 0, 0.08) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .sidebar > .brand, .side-footer {
    display: none !important;
  }
  .sidebar nav {
    margin: 0 !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-around !important;
    gap: 2px !important;
    padding: 0 2px !important;
    overflow: hidden !important;
  }
  .sidebar nav button {
    display: none !important;
    flex: 1 1 0 !important;
    min-width: 0 !important;
    height: 56px !important;
    padding: 4px 2px !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 10px !important;
    border: 0 !important;
    background: transparent !important;
    color: #55665d !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    gap: 2px !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
  }
  .sidebar nav button[aria-label="New Order"],
  .sidebar nav button[aria-label="Orders & Kitchen"],
  .sidebar nav button[aria-label="Tables"],
  .sidebar nav button[aria-label="Customers"],
  .sidebar nav button.mobile-bottom-more-btn {
    display: flex !important;
  }
  .sidebar nav button.active {
    background: #edf6f1 !important;
    color: #103f32 !important;
    font-weight: 700 !important;
  }
  .sidebar nav button svg {
    width: 20px !important;
    height: 20px !important;
  }
  .sidebar nav button span {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 100% !important;
    line-height: 1 !important;
  }

  /* 5. POS Top Segment Switcher (Menu vs Order & Bill) */
  .mobile-pos-nav-switcher {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 6px !important;
    background: #eef2ec !important;
    padding: 4px !important;
    border-radius: 13px !important;
    margin: 8px 12px 10px !important;
    border: 1.5px solid #dce4d9 !important;
  }
  .mobile-pos-nav-btn {
    height: 44px !important;
    border: 0 !important;
    border-radius: 9px !important;
    background: transparent !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #42564a !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    transition: all 0.15s ease !important;
    cursor: pointer !important;
  }
  .mobile-pos-nav-btn.active {
    background: #103f32 !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    box-shadow: 0 2px 7px rgba(16, 63, 50, 0.25) !important;
  }
  .mobile-nav-count-badge {
    background: #d56a2d !important;
    color: #ffffff !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    padding: 2px 7px !important;
    border-radius: 10px !important;
    min-width: 18px !important;
    text-align: center !important;
  }

  /* 6. POS Layout: Switching between Catalog and Order */
  .pos-layout {
    display: block !important;
    min-height: auto !important;
    height: auto !important;
    overflow: visible !important;
  }
  .pos-layout.mobile-view-catalog .catalog {
    display: block !important;
    padding: 0 12px 140px !important;
    overflow: visible !important;
  }
  .pos-layout.mobile-view-catalog .desktop-order {
    display: none !important;
  }
  .pos-layout.mobile-view-catalog .mobile-cart {
    display: flex !important;
  }

  .pos-layout.mobile-view-order .catalog {
    display: none !important;
  }
  .pos-layout.mobile-view-order .desktop-order {
    display: block !important;
    width: 100% !important;
    border: 0 !important;
    padding: 0 12px 100px !important;
    background: transparent !important;
  }
  .pos-layout.mobile-view-order .mobile-cart {
    display: none !important;
  }
  .pos-layout.mobile-view-order .order-panel {
    position: static !important;
    height: auto !important;
    min-height: auto !important;
    background: #ffffff !important;
    border-radius: 16px !important;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06) !important;
    border: 1px solid #dce2d9 !important;
    overflow: visible !important;
  }

  /* 7. Mobile Service Header (Dine-in, Takeaway, Delivery) */
  .mobile-service-header {
    display: block !important;
    margin-bottom: 10px !important;
  }
  .mobile-service-pills {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 4px !important;
    background: #e8eee6 !important;
    padding: 4px !important;
    border-radius: 12px !important;
    border: 1px solid #cfded2 !important;
  }
  .mobile-service-btn {
    height: 44px !important;
    border: 0 !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #314c3e !important;
    background: transparent !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    transition: all 0.15s ease !important;
    cursor: pointer !important;
  }
  .mobile-service-btn.active {
    background: #103f32 !important;
    color: #ffffff !important;
    box-shadow: 0 2px 7px rgba(16, 63, 50, 0.25) !important;
    font-weight: 700 !important;
  }
  .mobile-delivery-status-pill {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    width: 100% !important;
    margin-top: 8px !important;
    padding: 10px 13px !important;
    background: #fff8ee !important;
    border: 1.5px solid #f2c991 !important;
    border-radius: 10px !important;
    font-size: 13px !important;
    color: #7b4a16 !important;
    cursor: pointer !important;
  }
  .delivery-status-text {
    flex: 1 !important;
    margin: 0 8px !important;
    font-weight: 600 !important;
    font-size: 13px !important;
  }
  .delivery-status-tag {
    background: #c93b2b !important;
    color: #ffffff !important;
    font-size: 10px !important;
    padding: 3px 8px !important;
    border-radius: 6px !important;
    font-weight: 700 !important;
  }
  .mobile-takeaway-hint {
    margin-top: 8px !important;
    padding: 8px 12px !important;
    background: #eef6f1 !important;
    border: 1px solid #c7e5d3 !important;
    border-radius: 8px !important;
    font-size: 12px !important;
    color: #175439 !important;
    font-weight: 500 !important;
  }

  /* 8. Catalog Search & Food Grid on Mobile */
  .pos-layout .catalog-tools .search,
  .pos-layout .search {
    height: 46px !important;
    border-radius: 12px !important;
    padding: 0 12px !important;
    background: #ffffff !important;
    border: 1.5px solid #cadbc9 !important;
  }
  .pos-layout .search input {
    font-size: 15px !important;
    min-height: auto !important;
  }
  .pos-layout .categories {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    gap: 6px !important;
    padding: 8px 0 !important;
    margin: 0 -12px !important;
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
  .pos-layout .categories::-webkit-scrollbar {
    display: none !important;
  }
  .pos-layout .categories button {
    flex: 0 0 auto !important;
    min-height: 38px !important;
    height: 38px !important;
    padding: 0 14px !important;
    font-size: 13px !important;
    line-height: 1 !important;
    border-radius: 19px !important;
    white-space: nowrap !important;
    border: 1.5px solid #d2ded0 !important;
    background: #ffffff !important;
    color: #405749 !important;
    font-weight: 600 !important;
  }
  .pos-layout .categories button.active {
    background: #103f32 !important;
    border-color: #103f32 !important;
    color: #ffffff !important;
    box-shadow: 0 2px 7px rgba(16, 63, 50, 0.25) !important;
  }
  .pos-layout .section-title {
    padding: 8px 12px !important;
    margin: 6px 0 10px !important;
    border-radius: 12px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 6px !important;
  }
  .pos-layout .section-title h2 {
    font-size: 16px !important;
    line-height: 1.25 !important;
    margin: 0 !important;
    color: #103f32 !important;
  }
  .pos-layout .section-title p {
    font-size: 11px !important;
    line-height: 1.3 !important;
    margin: 2px 0 0 !important;
    color: #617366 !important;
  }
  .pos-layout .section-title > span {
    font-size: 11px !important;
    padding: 3px 8px !important;
    background: #ffffff !important;
    border-radius: 8px !important;
    border: 1px solid #d5dfd3 !important;
  }

  /* Food Grid - 2 Native Responsive Columns */
  .pos-layout .food-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }
  .pos-layout .food-card {
    border-radius: 14px !important;
    border: 1.5px solid #dbe3d8 !important;
    background: #ffffff !important;
    overflow: hidden !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
    text-align: start !important;
    transition: transform 0.12s ease !important;
  }
  .pos-layout .food-card:active {
    transform: scale(0.98) !important;
  }
  .pos-layout .food-card.selected {
    border-color: #d56a2d !important;
    box-shadow: 0 0 0 2px rgba(213, 106, 45, 0.2) !important;
  }
  .pos-layout .food-photo {
    height: 102px !important;
    position: relative !important;
    overflow: hidden !important;
  }
  .pos-layout .food-photo img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }
  .pos-layout .food-card .checkbox {
    width: 28px !important;
    height: 28px !important;
    top: 7px !important;
    right: 7px !important;
    border-radius: 8px !important;
  }
  .pos-layout .food-info {
    padding: 8px 10px 10px !important;
    background: #ffffff !important;
  }
  .pos-layout .food-info h3 {
    font-size: 13px !important;
    line-height: 1.35 !important;
    min-height: 35px !important;
    max-height: 38px !important;
    margin: 0 0 4px !important;
    font-weight: 700 !important;
    color: #1a3e30 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    white-space: normal !important;
  }
  .pos-layout .food-info strong {
    font-size: 14px !important;
    line-height: 1.3 !important;
    color: #b76427 !important;
    font-weight: 700 !important;
    display: block !important;
  }
  .pos-layout .food-info small {
    font-size: 11px !important;
    line-height: 1.2 !important;
    padding-top: 4px !important;
    margin-top: 4px !important;
    color: #175439 !important;
    display: block !important;
    border-top: 1px solid #edf1eb !important;
  }

  /* 9. Mobile Order Panel (Order & Bill View) */
  .mobile-order-back-bar {
    display: block !important;
    padding: 10px 14px 6px !important;
    border-bottom: 1px solid #edf1eb !important;
  }
  .mobile-back-to-menu-btn {
    width: 100% !important;
    min-height: 44px !important;
    border: 1.5px solid #c9d8ce !important;
    background: #f2f7f3 !important;
    color: #175439 !important;
    border-radius: 10px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    cursor: pointer !important;
  }
  .order-panel .order-head {
    padding: 12px 14px 8px !important;
  }
  .order-panel .order-head h2 {
    font-size: 18px !important;
    color: #103f32 !important;
  }
  .order-panel .order-head p {
    font-size: 11px !important;
  }
  .order-panel .service-toggle {
    margin: 0 14px 10px !important;
    padding: 4px !important;
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 4px !important;
    background: #edf2ea !important;
    border-radius: 11px !important;
  }
  .order-panel .service-toggle button {
    min-height: 42px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
  }
  .order-panel .service-toggle button.active {
    background: #ffffff !important;
    color: #103f32 !important;
    font-weight: 700 !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
  }
  .order-panel .draft-fields {
    padding: 0 14px 8px !important;
  }
  .order-panel .draft-fields select {
    min-height: 46px !important;
    font-size: 16px !important;
    border-radius: 10px !important;
  }

  /* DELIVERY BOX IN ORDER PANEL */
  .delivery-box {
    margin: 6px 0 12px !important;
    padding: 14px !important;
    background: #fff9f0 !important;
    border: 1.5px solid #f6cf9c !important;
    border-radius: 14px !important;
  }
  .delivery-token-hint {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #8c4e16 !important;
    margin: 0 0 10px !important;
  }
  .delivery-fields-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
  }
  .delivery-input-field span {
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #2b3e34 !important;
    margin-bottom: 4px !important;
    display: block !important;
  }
  .delivery-input-field select,
  .delivery-input-field input,
  .delivery-input-field textarea {
    width: 100% !important;
    min-height: 48px !important;
    font-size: 16px !important; /* Prevents auto zoom in mobile browser */
    padding: 10px 14px !important;
    border: 1.5px solid #d4ded7 !important;
    border-radius: 10px !important;
    background: #ffffff !important;
    color: #18201d !important;
    box-sizing: border-box !important;
  }
  .delivery-input-field textarea {
    min-height: 68px !important;
    resize: vertical !important;
  }

  /* CART ORDER ROWS */
  .order-panel .order-items {
    padding: 0 14px !important;
  }
  .order-panel .order-row {
    padding: 12px 0 !important;
    gap: 10px !important;
    border-bottom: 1px dashed #e1e7dc !important;
  }
  .order-panel .order-row img {
    width: 48px !important;
    height: 48px !important;
    border-radius: 9px !important;
  }
  .order-panel .order-copy strong {
    font-size: 14px !important;
  }
  .order-panel .order-copy span {
    font-size: 11px !important;
  }
  .order-panel .qty {
    height: 40px !important;
    border-radius: 9px !important;
    border: 1.5px solid #cfdad2 !important;
  }
  .order-panel .qty button {
    width: 38px !important;
    height: 38px !important;
    font-size: 18px !important;
    font-weight: 700 !important;
  }
  .order-panel .qty input {
    font-size: 16px !important;
    width: 44px !important;
    text-align: center !important;
  }
  .order-panel .row-bottom b {
    font-size: 14px !important;
    font-weight: 700 !important;
    color: #103f32 !important;
  }
  .order-panel .totals {
    padding: 10px 14px 4px !important;
  }
  .order-panel .totals div {
    font-size: 13px !important;
  }
  .order-panel .totals .grand strong {
    font-size: 20px !important;
    color: #103f32 !important;
  }
  .order-panel .order-actions {
    padding: 8px 14px 18px !important;
  }
  .order-panel .order-actions .primary {
    height: 52px !important;
    font-size: 16px !important;
    font-weight: 700 !important;
    border-radius: 12px !important;
    background: #103f32 !important;
    color: #ffffff !important;
    box-shadow: 0 4px 14px rgba(16, 63, 50, 0.3) !important;
  }
  .order-panel .order-actions .hold {
    min-height: 40px !important;
    font-size: 12px !important;
  }

  /* 10. Sticky Bottom Footer in Order View */
  .pos-layout.mobile-view-order .order-footer {
    position: sticky !important;
    bottom: 64px !important;
    background: #ffffff !important;
    border-top: 1.5px solid #dce4dd !important;
    border-radius: 16px 16px 0 0 !important;
    box-shadow: 0 -4px 18px rgba(0, 0, 0, 0.08) !important;
    z-index: 50 !important;
    padding: 8px 14px 14px !important;
  }

  /* 11. Floating Cart Bar (On Catalog View) */
  .mobile-cart {
    position: fixed !important;
    display: flex !important;
    left: 10px !important;
    right: 10px !important;
    bottom: 72px !important;
    height: 56px !important;
    background: #103f32 !important;
    color: #ffffff !important;
    border-radius: 16px !important;
    z-index: 65 !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 0 14px !important;
    box-shadow: 0 8px 24px rgba(16, 63, 50, 0.45) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    cursor: pointer !important;
  }
  .mobile-cart-info {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }
  .mobile-cart-badge {
    background: rgba(255, 255, 255, 0.2) !important;
    padding: 4px 8px !important;
    border-radius: 8px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
  }
  .mobile-cart-count {
    font-size: 13px !important;
    font-weight: 700 !important;
    color: #f7dfc6 !important;
  }
  .mobile-cart-btn-label {
    font-size: 12px !important;
    font-weight: 700 !important;
    background: #d56a2d !important;
    padding: 7px 12px !important;
    border-radius: 10px !important;
    color: #ffffff !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
  }

  /* 12. ROBUST RESPONSIVE TABLE ENGINE FOR ALL ERP TABLES */
  .table-wrap,
  .data-card:has(table),
  .data-card:has(.business-table),
  .business-table-wrap,
  .ledger-table-wrap {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    border-radius: 14px !important;
    box-sizing: border-box !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03) !important;
    margin-bottom: 16px !important;
  }
  .business-table {
    display: table !important;
    width: 100% !important;
    min-width: 640px !important;
    border-collapse: collapse !important;
    table-layout: auto !important;
    background: #ffffff !important;
  }
  .business-table thead {
    display: table-header-group !important;
  }
  .business-table tbody {
    display: table-row-group !important;
  }
  .business-table tr {
    display: table-row !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }
  .business-table th {
    display: table-cell !important;
    padding: 10px 12px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
    background: #f1f6f2 !important;
    color: #174b3a !important;
    border-bottom: 2px solid #d4dfd7 !important;
    text-align: start !important;
  }
  .business-table td {
    display: table-cell !important;
    padding: 11px 12px !important;
    font-size: 13px !important;
    border-bottom: 1px solid #e7eee9 !important;
    vertical-align: middle !important;
    white-space: nowrap !important;
    text-align: start !important;
  }
  .business-table td.wrap-cell,
  .business-table td:first-child {
    white-space: normal !important;
    min-width: 130px !important;
  }
  .business-table .ordered-foods {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 4px !important;
    margin: 4px 0 !important;
  }
  .business-table .ordered-foods span {
    font-size: 11px !important;
    background: #f0f5f2 !important;
    padding: 2px 6px !important;
    border-radius: 6px !important;
    color: #244b39 !important;
  }
  .business-table .row-actions {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    flex-wrap: nowrap !important;
    width: auto !important;
    margin: 0 !important;
  }
  .business-table .row-actions button {
    flex: none !important;
    padding: 6px 12px !important;
    min-height: 38px !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
    white-space: nowrap !important;
    background: #f3f7f4 !important;
    border: 1.5px solid #cbdad0 !important;
    color: #124033 !important;
  }
  .business-table .row-actions button:first-child {
    background: #103f32 !important;
    color: #ffffff !important;
    border-color: #103f32 !important;
  }

    /* 13. STAT CARDS & OVERVIEWS (Customers, Menu, Stock, Tables) */
  .customer-overview, .menu-overview, .stock-overview {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
    margin-bottom: 14px !important;
  }
  .customer-overview article, .menu-overview article, .stock-overview article {
    background: #ffffff !important;
    border: 1.5px solid #dbe4dd !important;
    border-radius: 12px !important;
    padding: 10px 12px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
  }
  .customer-overview article span, .menu-overview article span, .stock-overview article span {
    font-size: 11px !important;
    color: #617367 !important;
    margin-bottom: 2px !important;
  }
  .customer-overview article strong, .customer-overview article bdi,
  .menu-overview article strong, .menu-overview article bdi,
  .stock-overview article strong, .stock-overview article bdi {
    font-size: 17px !important;
    font-weight: 700 !important;
    color: #103f32 !important;
  }

  /* 14. Kitchen Board & Ticket Cards */
  .kitchen-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  .kitchen-card {
    border-radius: 14px !important;
    padding: 14px !important;
  }
  .kitchen-card h3 {
    font-size: 16px !important;
  }
  .kitchen-card ul {
    font-size: 13px !important;
  }

  /* 15. Tables Page */
  .easy-table-summary {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 6px !important;
    margin: 12px 0 !important;
  }
  .easy-table-summary article {
    padding: 10px 6px !important;
    border-radius: 11px !important;
    font-size: 11px !important;
    text-align: center !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 4px !important;
  }
  .easy-table-summary article strong {
    font-size: 16px !important;
  }
  .easy-table-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }
  .easy-table-grid article {
    padding: 14px !important;
    border-radius: 14px !important;
  }
  .easy-table-grid h3 {
    font-size: 16px !important;
  }
  .easy-table-grid strong {
    font-size: 13px !important;
  }

  /* 16. Dashboard & Profit Report */
  .page-content {
    padding: 12px 12px 100px !important;
  }
  .page-heading, .summary-welcome {
    gap: 8px !important;
    flex-wrap: wrap !important;
    margin-bottom: 12px !important;
  }
  .page-heading h2, .summary-welcome h2 {
    font-size: 18px !important;
    line-height: 1.25 !important;
  }
  .page-heading p, .summary-welcome p {
    font-size: 11px !important;
  }
  .subnav {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    scrollbar-width: none !important;
    margin: 0 -12px 12px !important;
    padding-left: 12px !important;
    padding-right: 12px !important;
    display: flex !important;
    gap: 6px !important;
  }
  .subnav::-webkit-scrollbar {
    display: none !important;
  }
  .subnav button {
    white-space: nowrap !important;
    padding: 8px 14px !important;
    font-size: 12px !important;
    border-radius: 9px !important;
  }
  .easy-shortcuts {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 8px !important;
    margin: 10px 0 !important;
    padding-bottom: 4px !important;
  }
  .easy-shortcuts button {
    flex: 0 0 auto !important;
    min-height: 42px !important;
    font-size: 13px !important;
    padding: 6px 14px !important;
    border-radius: 10px !important;
  }
  .easy-kitchen-status {
    padding: 12px !important;
    border-radius: 14px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
  }
  .easy-kitchen-status strong {
    font-size: 13px !important;
  }
  .easy-kitchen-status button {
    min-height: 42px !important;
    padding: 8px 12px !important;
  }
  .easy-metrics {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
    margin: 12px 0 !important;
  }
  .easy-metrics > article, .easy-metrics > button {
    padding: 12px !important;
    border-radius: 12px !important;
    min-height: 70px !important;
  }
  .easy-metrics span {
    font-size: 11px !important;
    line-height: 1.3 !important;
  }
  .easy-metrics strong {
    font-size: 16px !important;
    line-height: 1.3 !important;
  }
  .easy-breakdown, .dashboard-grid {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    margin: 14px 0 !important;
  }

  /* 17. Modals & Dialogs on Mobile */
  .modal-backdrop {
    padding: 8px !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .work-modal, .customer-editor-dialog, .dish-editor-dialog, .stock-editor-dialog {
    width: 95vw !important;
    max-width: 440px !important;
    max-height: 92dvh !important;
    border-radius: 18px !important;
    padding: 16px !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .work-modal header, .dialog-header {
    margin-bottom: 12px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .work-modal header h2 {
    font-size: 17px !important;
    margin: 0 !important;
  }
  .work-modal header button {
    width: 38px !important;
    height: 38px !important;
    font-size: 22px !important;
    border-radius: 10px !important;
    background: #f1f5f2 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  .work-modal .field, .dialog-body .field {
    margin: 10px 0 !important;
  }
  .work-modal .field span, .dialog-body .field span {
    font-size: 12px !important;
    font-weight: 600 !important;
    margin-bottom: 4px !important;
    display: block !important;
  }
  .work-modal .field input,
  .work-modal .field select,
  .work-modal .field textarea,
  .dialog-body .field input,
  .dialog-body .field select,
  .dialog-body .field textarea {
    min-height: 48px !important;
    font-size: 16px !important;
    border-radius: 10px !important;
    padding: 10px 14px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  .work-modal button.primary {
    min-height: 50px !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    border-radius: 12px !important;
    margin-top: 14px !important;
    width: 100% !important;
  }

  /* 18. Invoice / Bill Modal on Mobile */
  .invoice-bg {
    padding: 0 !important;
  }
  .invoice-modal {
    width: 100% !important;
    max-width: 100% !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
  }
  .invoice-modal > header {
    height: 56px !important;
    padding: 0 12px !important;
  }
  .invoice-layout {
    grid-template-columns: 1fr !important;
    padding: 10px !important;
    gap: 12px !important;
  }
  .receipt-preview {
    padding: 16px 12px !important;
  }
  .invoice-money-summary {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 6px !important;
  }
  .invoice-money-summary article {
    padding: 8px !important;
  }
  .invoice-money-summary strong {
    font-size: 14px !important;
  }
  .action-grid {
    gap: 8px !important;
  }
  .action-grid button {
    min-height: 48px !important;
    padding: 8px 12px !important;
    font-size: 13px !important;
  }

  /* 19. Login Page on Mobile */
  .login-page {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    min-height: 100dvh !important;
    background: #103f32 !important;
    padding: 24px 16px !important;
  }
  .login-visual {
    display: none !important;
  }
  .login-form {
    width: 100% !important;
    max-width: 390px !important;
    padding: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
  }
  .login-form > div {
    width: 100% !important;
    background: #ffffff !important;
    border-radius: 20px !important;
    padding: 24px 18px !important;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25) !important;
  }
  .login-form h2 {
    font-size: 21px !important;
    margin: 6px 0 4px !important;
    color: #103f32 !important;
  }
  .login-form p {
    font-size: 13px !important;
    color: #65756c !important;
  }
  .login-form .field {
    margin: 12px 0 !important;
  }
  .login-form .field span {
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #21332a !important;
    margin-bottom: 5px !important;
  }
  .login-form .field input {
    min-height: 48px !important;
    font-size: 16px !important;
    border-radius: 10px !important;
    padding: 0 14px !important;
    border: 1.5px solid #d4dcd6 !important;
  }
  .login-form .primary {
    min-height: 50px !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    border-radius: 12px !important;
    margin-top: 18px !important;
    background: #103f32 !important;
  }
  .login-help {
    font-size: 12px !important;
    margin-top: 16px !important;
    padding: 10px !important;
    background: #f1f6f3 !important;
    border-radius: 8px !important;
    color: #3b5648 !important;
  }
}
`;

fs.writeFileSync(cssPath, before + newMobileCss, 'utf8');
console.log("Successfully updated src/index.css with comprehensive mobile responsive engine!");
