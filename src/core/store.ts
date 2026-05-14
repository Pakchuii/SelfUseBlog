export interface Article {
  id: string;
  title: string;
  category: string;
  tag: string;
  thumbnailUrl?: string;
  excerpt: string;
  content: string;
  date: string;
  comments?: any[];
}

export interface SiteConfig {
  siteTitle: string;
  avatarUrl: string;
  authorName: string;
  authorRole: string;
  authorDesc: string;
  announcement: string;
  bannerImageUrl?: string;
  bannerSubtitle?: string;
  globalBackgroundUrl?: string;
  glassOpacity?: number;
  glassBlur?: number;
  navLinks?: string; // JSON Array of navigation items
  aboutContent?: string; // Markdown content for About page
   galleryOrder?: string; // JSON Array of asset URLs in custom order
  homeMidTitle?: string;
  homeMidContent?: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  nickname?: string;
  avatarUrl?: string;
  bio?: string;
}

// Global state
let articles: Article[] = [];

// Try to load cached config from localStorage
const cachedConfig = localStorage.getItem('fawang_config');
let config: SiteConfig = cachedConfig ? JSON.parse(cachedConfig) : {
  siteTitle: "Pakchui's Blog",
  avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Pakchui",
  authorName: "Pakchui",
  authorRole: "[ ADMIN ]",
  authorDesc: "这个人很懒，什么都没写。",
  announcement: "欢迎来到我的个人博客！",
  globalBackgroundUrl: "",
  glassOpacity: 0.85,
  glassBlur: 10,
  navLinks: JSON.stringify([
    { title: "首页 / Terminal", view: "home" },
    { title: "文章 / Articles", view: "articles" },
    { title: "关于我 / Identity", view: "about" }
  ]),
  aboutContent: "# 关于我 / Identity\n\n痴迷于安全技术的小白帽。记录自己技术增长过程的博客。\n\n> 孩儿立志出乡关，学不成名誓不还。"
};

// Try to load cached user
const cachedUser = localStorage.getItem('fawang_user');
let currentUser: User | null = (cachedUser && cachedUser !== 'undefined') ? JSON.parse(cachedUser) : null;

let token: string | null = localStorage.getItem('fawang_token');

const API_BASE = 'http://localhost:3001/api';

const getHeaders = () => {
  const h: any = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

export const BlogStore = {
  // Initialization: Fetch all initial data
  init: async () => {
    try {
      // 1. Fetch Config & Articles
      const [cfgRes, artRes] = await Promise.all([
        fetch(`${API_BASE}/config`).then(r => r.json()).catch(() => ({ error: true })),
        fetch(`${API_BASE}/articles`).then(r => r.json()).catch(() => [])
      ]);
      
      if (cfgRes && !cfgRes.error) {
        config = { ...config, ...cfgRes };
        localStorage.setItem('fawang_config', JSON.stringify(config));
      }
      if (Array.isArray(artRes)) articles = artRes;

      // 2. Refresh user profile if token exists
      if (token) {
        try {
          const profileRes = await fetch(`${API_BASE}/users/profile`, {
            headers: getHeaders()
          });
          if (profileRes.ok) {
            currentUser = await profileRes.json();
            localStorage.setItem('fawang_user', JSON.stringify(currentUser));
          } else if (profileRes.status === 401 || profileRes.status === 403) {
            // Only clear if explicitly unauthorized
            token = null;
            currentUser = null;
            localStorage.removeItem('fawang_token');
            localStorage.removeItem('fawang_user');
          }
        } catch(e) {
          console.error("Network error while refreshing profile, keeping cached user.");
        }
      }
      
    } catch (e) {
      console.error("Failed to initialize BlogStore", e);
    }
  },

  getArticles: () => articles,
  
  saveArticle: async (article: Article) => {
    const res = await fetch(`${API_BASE}/articles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(article)
    });
    if (res.ok) await BlogStore.init(); // Refresh
  },

  deleteArticle: async (id: string) => {
    const res = await fetch(`${API_BASE}/articles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.ok) await BlogStore.init();
  },

  addComment: async (articleId: string, comment: any) => {
    const res = await fetch(`${API_BASE}/articles/${articleId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(comment)
    });
    if (res.ok) await BlogStore.init();
  },

  getConfig: () => config,
  
  saveConfig: async (newConfig: SiteConfig) => {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newConfig)
    });
    if (res.ok) {
      config = newConfig;
      localStorage.setItem('fawang_config', JSON.stringify(config));
    }
  },

  // Auth
  login: async (username: string, pwd: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pwd })
      });
      const data = await res.json();
      
      if (res.status === 403) return { success: false, error: '您的账号正在审核中，请稍后再试。' };
      if (!res.ok) return { success: false, error: '用户名或密码错误。' };

      if (data.success) {
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('fawang_token', token as string);
        localStorage.setItem('fawang_user', JSON.stringify(currentUser));
        return { success: true };
      }
      return { success: false, error: data.error || '登录失败' };
    } catch (e) {
      return { success: false, error: '网络连接失败，请检查后端服务。' };
    }
  },

  register: async (username: string, pwd: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pwd, reason })
      });
      const data = await res.json();
      return data.success === true;
    } catch(e) {
      return false;
    }
  },

  logout: () => {
    currentUser = null;
    token = null;
    localStorage.removeItem('fawang_token');
    localStorage.removeItem('fawang_user');
  },

  isLoggedIn: () => currentUser !== null,
  isAdmin: () => currentUser?.role === 'admin',
  getCurrentUser: () => currentUser,

  updateUserProfile: async (username: string, profile: Partial<User>) => {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profile)
    });
    if (res.ok && currentUser) {
      currentUser = { ...currentUser, ...profile };
      localStorage.setItem('fawang_user', JSON.stringify(currentUser));
    }
  }
};
