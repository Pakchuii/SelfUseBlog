import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { initGlobalBackground } from './core/background';
import { Router } from './core/router';
import { BlogStore } from './core/store';
import { renderHome } from './views/home';
import { renderArticle, renderAbout, renderArticlesList, renderGallery } from './views/views_extra';
import { renderLogin, renderAdmin, renderProfile } from './views/admin';
import { UI } from './core/ui';
import { ChatUI } from './views/chat';
import Lenis from 'lenis';

// --- INITIALIZATION ---
const router = new Router();
const appArea = document.getElementById('content-area') as HTMLElement;

// Smooth Scroll
const lenis = new Lenis();
function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// Hydrate Sidebar & UI Parameters
export function hydrateUI() {
  const config = BlogStore.getConfig();
  document.title = config.siteTitle;

  // Background
  initGlobalBackground('canvas-container', config.globalBackgroundUrl || '');

  // Glassmorphism
  const root = document.documentElement;
  root.style.setProperty('--glass-opacity', (config.glassOpacity || 0.85).toString());
  root.style.setProperty('--glass-blur', (config.glassBlur || 10) + 'px');

  const user = BlogStore.getCurrentUser();
  const loggedInArea = document.getElementById('auth-logged-in');
  const loggedOutArea = document.getElementById('auth-logged-out');
  const avatar = document.getElementById('sidebar-avatar') as HTMLImageElement;
  const name = document.getElementById('sidebar-author-name');
  const role = document.getElementById('sidebar-author-role');
  const desc = document.getElementById('sidebar-author-desc');

  // Hydrate Nav Links
  const navAdmin = document.getElementById('nav-admin-item');

  if (user) {
    if (loggedInArea) loggedInArea.style.display = 'block';
    if (loggedOutArea) loggedOutArea.style.display = 'none';

    if (avatar) avatar.src = user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
    if (name) name.textContent = user.nickname || user.username;
    if (role) role.textContent = `[ ${user.role.toUpperCase()} ]`;
    if (desc) desc.textContent = user.bio || '这个人很懒，什么都没写。';

    if (user.role === 'admin') {
      if (navAdmin) navAdmin.style.display = 'block';
      showAdminTweaker();
    } else {
      if (navAdmin) navAdmin.style.display = 'none';
      hideAdminTweaker();
    }
  } else {
    if (loggedInArea) loggedInArea.style.display = 'none';
    if (loggedOutArea) loggedOutArea.style.display = 'flex';

    if (avatar) avatar.src = config.avatarUrl;
    if (name) name.textContent = config.authorName;
    if (role) role.textContent = config.authorRole;
    if (desc) desc.textContent = config.authorDesc;

    if (navAdmin) navAdmin.style.display = 'none';
    hideAdminTweaker();
  }

  const announcement = document.getElementById('sidebar-announcement');
  if (announcement) announcement.innerHTML = config.announcement;

  // Hydrate Dynamic Nav Links
  const navContainer = document.querySelector('.sidebar-nav');
  if (navContainer && config.navLinks) {
    try {
      const links = JSON.parse(config.navLinks);
      let navHtml = links.map((l: any) => `
        <li><a href="#" data-link="${l.view}">${l.title}</a></li>
      `).join('');

      // Add Social Links
      if (user) {
        navHtml += `
          <div style="margin: 1rem 0; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1rem;"></div>
          <li><a href="#" id="chat-trigger"><span style="color: var(--theme-primary);">●</span> 版聊 / Board Chat</a></li>
          <li><a href="#" id="friends-trigger"><span style="color: var(--accent-purple);">●</span> 好友 / Friends</a></li>
        `;
        if (user.role === 'admin') {
          navHtml += `<li><a href="#" data-link="admin" style="margin-top: 1rem; border: 1px dashed var(--theme-primary); color: var(--theme-primary);">[ 控制台 / ADMIN ]</a></li>`;
        }
      }

      navContainer.innerHTML = navHtml;

      // Re-attach listeners
      navContainer.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const to = link.getAttribute('data-link');
          if (to) navigateTo(to);
        });
      });

      // Social Listeners
      document.getElementById('chat-trigger')?.addEventListener('click', (e) => {
        e.preventDefault();
        ChatUI.openGlobalChat();
      });
      document.getElementById('friends-trigger')?.addEventListener('click', (e) => {
        e.preventDefault();
        ChatUI.openFriendList();
      });

      // Update Active State
      const currentPath = window.location.pathname.replace('/', '') || 'home';
      navContainer.querySelectorAll('a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('data-link') === currentPath);
      });
    } catch (e) {
      console.error("Failed to parse navLinks", e);
    }
  }
}

function showAdminTweaker() {
  let tweaker = document.getElementById('admin-ui-tweaker');
  if (tweaker) return;

  tweaker = document.createElement('div');
  tweaker.id = 'admin-ui-tweaker';
  tweaker.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999;';
  tweaker.innerHTML = `
    <button id="tweaker-btn" style="width: 50px; height: 50px; border-radius: 50%; background: var(--theme-primary); color: white; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: transform 0.3s;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    </button>
    <div id="tweaker-panel" style="display: none; position: absolute; bottom: 60px; right: 0; width: 250px; background: var(--card-bg); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.3); border-radius: 15px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
      <h4 style="margin-bottom: 1rem; font-size: 0.9rem; color: var(--theme-primary);">UI 参数实时调整</h4>
      <div style="margin-bottom: 1rem;">
        <label style="font-size: 0.75rem; color: #666; display: block; margin-bottom: 0.5rem;">毛玻璃透明度: <span id="opacity-val">0.85</span></label>
        <input type="range" id="opacity-slider" min="0" max="1" step="0.01" value="0.85" style="width: 100%;">
      </div>
      <div style="margin-bottom: 1.5rem;">
        <label style="font-size: 0.75rem; color: #666; display: block; margin-bottom: 0.5rem;">模糊强度 (Blur): <span id="blur-val">10px</span></label>
        <input type="range" id="blur-slider" min="0" max="40" step="1" value="10" style="width: 100%;">
      </div>
      <button id="save-tweaks-btn" style="width: 100%; padding: 0.6rem; background: var(--theme-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">保存为全局设置</button>
    </div>
  `;
  document.body.appendChild(tweaker);

  const btn = document.getElementById('tweaker-btn');
  const panel = document.getElementById('tweaker-panel');
  const opacitySlider = document.getElementById('opacity-slider') as HTMLInputElement;
  const blurSlider = document.getElementById('blur-slider') as HTMLInputElement;
  const opacityVal = document.getElementById('opacity-val');
  const blurVal = document.getElementById('blur-val');
  const saveBtn = document.getElementById('save-tweaks-btn');

  const config = BlogStore.getConfig();
  opacitySlider.value = (config.glassOpacity || 0.85).toString();
  blurSlider.value = (config.glassBlur || 10).toString();
  if (opacityVal) opacityVal.textContent = opacitySlider.value;
  if (blurVal) blurVal.textContent = blurSlider.value + 'px';

  btn?.addEventListener('click', () => {
    const isVisible = panel!.style.display === 'block';
    panel!.style.display = isVisible ? 'none' : 'block';
    btn!.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(90deg)';
  });

  const updateUI = () => {
    const opacity = opacitySlider.value;
    const blur = blurSlider.value;
    if (opacityVal) opacityVal.textContent = opacity;
    if (blurVal) blurVal.textContent = blur + 'px';
    document.documentElement.style.setProperty('--glass-opacity', opacity);
    document.documentElement.style.setProperty('--glass-blur', blur + 'px');
  };

  opacitySlider.addEventListener('input', updateUI);
  blurSlider.addEventListener('input', updateUI);

  saveBtn?.addEventListener('click', async () => {
    const newConfig = {
      ...BlogStore.getConfig(),
      glassOpacity: parseFloat(opacitySlider.value),
      glassBlur: parseInt(blurSlider.value)
    };
    await BlogStore.saveConfig(newConfig);
    UI.toast('全局 UI 参数已同步到数据库', 'success');
  });
}

function hideAdminTweaker() {
  const tweaker = document.getElementById('admin-ui-tweaker');
  if (tweaker) tweaker.remove();
}

// Navigation Handler
export function navigateTo(view: string, params?: any) {
  ChatUI.close(); // Close any open chat panels on navigation
  // Route Guard
  if (view === 'admin' && !BlogStore.isAdmin()) {
    UI.toast("Permission Denied", 'error');
    return;
  }
  if ((view === 'login' || view === 'register') && BlogStore.isLoggedIn()) {
    view = 'home';
  }

  router.navigate(() => {
    // Show/hide sidebar based on view
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    const mainContent = document.querySelector('.main-content') as HTMLElement;

    if (view === 'admin' || view === 'login' || view === 'register' || view === 'profile') {
      sidebar.style.display = 'none';
      mainContent.style.marginLeft = '0';
    } else {
      sidebar.style.display = 'flex';
      mainContent.style.marginLeft = 'var(--sidebar-width)';
    }

    if (view === 'home') renderHome(appArea, navigateTo);
    else if (view === 'articles') renderArticlesList(appArea, navigateTo);
    else if (view === 'article') renderArticle(appArea, params.id, navigateTo);
    else if (view === 'about') renderAbout(appArea);
    else if (view === 'photowall') renderGallery(appArea);
    else if (view === 'login') renderLogin(appArea, navigateTo);
    else if (view === 'admin') renderAdmin(appArea, navigateTo);
    else if (view === 'profile') renderProfile(appArea, navigateTo);
    else {
      appArea.innerHTML = `
        <div style="padding: 5rem; text-align: center; color: var(--text-main);">
          <h2 style="font-family: var(--font-heading); font-size: 3rem; margin-bottom: 1rem;">页面开发中...</h2>
          <p>您请求的视图 [ ${view} ] 尚未定义逻辑。可以在 views_extra.ts 中添加相应的渲染函数。</p>
          <button onclick="window.history.back()" style="margin-top: 2rem; padding: 0.8rem 2rem; background: var(--theme-primary); color: white; border: none; border-radius: 8px; cursor: pointer;">返回上一页</button>
        </div>
      `;
    }

    window.scrollTo(0, 0);
    hydrateUI();

    // Update Active Link
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('data-link') === view);
    });
  });
}

// Global Event Listeners
document.querySelectorAll('[data-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const to = link.getAttribute('data-link');
    if (to) navigateTo(to);
  });
});

// Bootstrapping
// 1. Initial hydration with cached data (instant)
hydrateUI();

// 2. Fetch fresh data from API
BlogStore.init().then(() => {
  hydrateUI(); // Re-hydrate with fresh data
  ChatUI.initBackgroundWatcher(); // Start watching for messages
  const currentPath = window.location.pathname.replace('/', '') || 'home';
  navigateTo(currentPath);

  // Global Logout Listener
  document.getElementById('logout-action-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    ChatUI.close();
    BlogStore.logout();
    hydrateUI();
    navigateTo('home');
  });
});
