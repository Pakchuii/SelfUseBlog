import { BlogStore } from '../core/store';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { UI } from '../core/ui';

function getHeroBannerHtml(title: string, subtitle?: string) {
  const config = BlogStore.getConfig();
  const isVideo = config.bannerImageUrl?.match(/\.(mp4|webm)$/i);
  
  if (isVideo) {
    return `
      <div style="padding: 2rem 5rem 0 5rem; max-width: 1100px; margin: 0 auto;">
        <section class="hero-banner glass-premium" style="height: 260px; padding:0; position:relative; border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); overflow: hidden;">
          <video autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.8;">
            <source src="${config.bannerImageUrl}">
          </video>
          <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to right, rgba(0,0,0,0.4), transparent); z-index: 1;"></div>
          <div style="position: relative; z-index: 10; display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 0 4rem; transform: translateZ(30px); pointer-events: auto;">
            <h1 style="text-shadow: 0 4px 12px rgba(0,0,0,0.3);">${title}</h1>
            ${subtitle ? `<p class="subtitle" style="text-shadow: 0 2px 8px rgba(0,0,0,0.3);">${subtitle}</p>` : ''}
          </div>
        </section>
      </div>
    `;
  } else {
    const heroStyle = config.bannerImageUrl 
      ? `background-image: linear-gradient(to right, rgba(0,0,0,0.4), transparent), url('${config.bannerImageUrl}'); background-position: center; background-size: cover; background-repeat: no-repeat;` 
      : `background: var(--fawang-gradient);`;
    return `
      <div style="padding: 2rem 5rem 0 5rem; max-width: 1100px; margin: 0 auto;">
        <section class="hero-banner glass-premium" style="height: 260px; ${heroStyle} border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); position:relative; display: flex; flex-direction: column; justify-content: center; padding: 0 4rem;">
          <h1 style="text-shadow: 0 4px 12px rgba(0,0,0,0.3);">${title}</h1>
          ${subtitle ? `<p class="subtitle" style="text-shadow: 0 2px 8px rgba(0,0,0,0.3);">${subtitle}</p>` : ''}
        </section>
      </div>
    `;
  }
}

export function renderArticle(container: HTMLElement, id: string, onNavigate: (to: string, params?: any) => void) {
  const article = BlogStore.getArticles().find(a => a.id === id);
  if (!article) return onNavigate('home');

  const rawHtml = marked.parse(article.content, { 
    breaks: true,
    gfm: true
  }) as string;
  const safeHtml = DOMPurify.sanitize(rawHtml);

  const isVideo = article.thumbnailUrl?.match(/\.(mp4|webm)$/i);
  const heroStyle = article.thumbnailUrl && !isVideo
    ? `background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${article.thumbnailUrl}'); background-position: center; background-size: cover;`
    : `background: var(--fawang-gradient);`;

  container.innerHTML = `
    <!-- Reading Progress Bar -->
    <div id="reading-progress-container" style="position: fixed; top: 0; left: 0; width: 100%; height: 4px; z-index: 2000; background: rgba(255,255,255,0.1); backdrop-filter: blur(4px);">
      <div id="reading-progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--theme-primary), var(--theme-accent)); box-shadow: 0 0 10px var(--theme-primary); transition: width 0.1s ease-out;"></div>
    </div>

    <div style="padding: 2rem 2rem 0 2rem; max-width: 1400px; width: 100%; margin: 0 auto;">
      <section class="hero-banner glass-premium" style="height: 350px; ${heroStyle} border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); position:relative; display: flex; flex-direction: column; justify-content: center; padding: 0 3rem; overflow: hidden;">
        ${isVideo ? `
          <video autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;">
            <source src="${article.thumbnailUrl}">
          </video>
          <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); z-index: 1;"></div>
        ` : ''}
        <div style="position: relative; z-index: 10; transform: translateZ(50px);">
          <h1 style="color: white; font-family: var(--font-heading); font-size: 3.5rem; margin-bottom: 1rem; text-shadow: 0 4px 12px rgba(0,0,0,0.3);">${article.title}</h1>
          <div style="display: flex; gap: 1rem; color: rgba(255,255,255,0.8); font-size: 0.9rem; font-family: var(--font-mono); text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <span>[ ${article.date} ]</span>
            <span>// CATEGORY: ${article.category.toUpperCase()}</span>
          </div>
        </div>
      </section>
    </div>

    <article class="feed-container" style="padding-top: 2rem; max-width: 1400px; width: 100%; margin: 0 auto; padding-left: 2rem; padding-right: 2rem;">
      <div style="display: flex; gap: 2rem; align-items: flex-start;">
        <!-- Main Post Card -->
        <div class="post-card markdown-body glass-premium" style="cursor: default; min-height: 60vh; flex: 1; margin: 0;">
          <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main);">${safeHtml}</div>
        </div>

        <!-- Sticky Mini Sidebar (C-A-B Order) -->
        <aside style="width: 220px; position: sticky; top: 100px; display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- C: Back Button -->
          <div class="glass-premium" style="padding: 1.2rem; border-radius: 20px; text-align: center; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="window.navigateTo('home')">
            <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-muted);">← 返回首页 / BACK</span>
          </div>

          <!-- A: Navigation -->
          <div class="glass-premium" style="padding: 1.5rem; border-radius: 20px;">
            <h4 style="font-family: var(--font-heading); font-size: 0.9rem; margin-bottom: 1rem; color: var(--theme-primary);">快捷导航 / NAV</h4>
            <ul style="list-style: none; padding: 0; font-size: 0.8rem; line-height: 1.8; color: var(--text-muted);">
              <li style="cursor: pointer; transition: all 0.3s;" onclick="window.scrollTo({top: 0, behavior: 'smooth'})"># 返回顶部 / Top</li>
              <li style="cursor: pointer; transition: all 0.3s;" onclick="document.querySelector('.feed-container').scrollIntoView({behavior: 'smooth'})"># 开始阅读 / Read</li>
              <li style="cursor: pointer; transition: all 0.3s;" onclick="document.getElementById('comments-list').scrollIntoView({behavior: 'smooth'})"># 查看评论 / Comments</li>
            </ul>
          </div>
          
          <!-- B: Article Info -->
          <div class="glass-premium" style="padding: 1.5rem; border-radius: 20px; font-size: 0.8rem; color: var(--text-muted);">
             <div style="margin-bottom: 0.8rem; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.2rem;">👁️</span> 
              <span>阅读次数: ${article.views || 0}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.2rem;">📅</span> 
              <span>写作时间: ${article.date}</span>
            </div>
          </div>
        </aside>
      </div>

      <!-- Comments Section Card (Kept original width for perfection) -->
      <div class="glass-premium" style="margin-top: 3rem; padding: 3rem; border-radius: 24px; width: 100%; max-width: 1000px; margin: 3rem auto 0 auto;">
        <h3 style="font-family: var(--font-heading); margin-bottom: 2rem; color: var(--theme-primary);">评论区 / COMMENTS (${article.comments?.length || 0})</h3>
        
        <div id="comments-list" style="margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
          ${(article.comments || []).map(c => `
            <div style="background: rgba(255,255,255,0.4); backdrop-filter: blur(10px); padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; gap: 1rem; align-items: flex-start;">
              <img src="${c.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author}`}" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); object-fit: cover;">
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; align-items: center;">
                  <strong style="color: var(--text-main); font-size: 1rem;">${c.author}</strong>
                  <span style="font-size: 0.75rem; color: #94a3b8; font-family: var(--font-mono);">${(c.date && c.date !== 'null') ? new Date(c.date).toLocaleString() : '未知时间'}</span>
                </div>
                <p style="margin: 0; color: #475569; line-height: 1.6; font-size: 0.95rem;">${c.content}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div id="comment-form-area" style="background: rgba(94, 114, 228, 0.05); padding: 1.5rem; border-radius: 15px; border: 1px solid rgba(94, 114, 228, 0.1);">
          <h4 style="margin-bottom: 1rem; color: var(--theme-primary);">发表回复</h4>
          <!-- Form content will be hydrated below -->
        </div>
      </div>
    </article>
  `;

  // Increment view count
  BlogStore.viewArticle(id);

  // Handle Reading Progress
  const progressFill = document.getElementById('reading-progress-fill');
  const updateProgress = () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (progressFill) progressFill.style.width = scrolled + "%";
  };
  window.addEventListener('scroll', updateProgress, { passive: true });

  // Cleanup scroll listener when navigating away (handled by router usually, but good for SPA)
  const originalOnNavigate = onNavigate;
  onNavigate = (to: string, p?: any) => {
    window.removeEventListener('scroll', updateProgress);
    originalOnNavigate(to, p);
  };

  const commentArea = document.getElementById('comment-form-area');
  const user = BlogStore.getCurrentUser();

  if (commentArea) {
    if (user) {
      commentArea.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
          <img src="${user.avatarUrl}" style="width: 40px; height: 40px; border-radius: 50%;">
          <strong style="color: #555;">${user.nickname || user.username}</strong>
        </div>
        <textarea id="comment-content" placeholder="输入内容... (Content)" style="width: 100%; padding: 0.8rem; margin-bottom: 1rem; border: 1px solid #ccc; border-radius: 4px; min-height: 100px;"></textarea>
        <button id="submit-comment-btn" style="padding: 0.8rem 1.5rem; background: var(--theme-primary); color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">发送 / SUBMIT</button>
      `;

      document.getElementById('submit-comment-btn')?.addEventListener('click', () => {
        const content = (document.getElementById('comment-content') as HTMLTextAreaElement).value;
        if (!content) return UI.toast('请输入评论内容', 'error');

        BlogStore.addComment(id, { 
          author: user.nickname || user.username, 
          content,
          avatarUrl: user.avatarUrl,
          date: new Date().toISOString()
        });
        
        // Refresh the article view to show the new comment
        renderArticle(container, id, onNavigate);
      });
    } else {
      commentArea.innerHTML = `
        <p style="color: #888; font-size: 0.9rem;">您需要登录后才能发表评论。</p>
        <button id="comment-login-btn" style="padding: 0.5rem 1rem; background: var(--theme-primary); color: white; border: none; border-radius: 4px; cursor: pointer;">前往登录</button>
      `;
      document.getElementById('comment-login-btn')?.addEventListener('click', () => {
        onNavigate('login');
      });
    }
  }
}

export function renderAbout(container: HTMLElement) {
  const config = BlogStore.getConfig();
  
  // Helper functions for fallbacks
  const getBannerUrls = () => [
    config.about_banner_1_img || '/uploads/about_hero.png',
    config.about_banner_2_img || '/uploads/about_hero.png',
    config.about_banner_3_img || '/uploads/about_hero.png'
  ];
  const getMascotUrl = () => config.about_mascot || '/uploads/mascot.png';
  const getIdentityTitle = () => config.about_identity_title || 'Pakchuii, Visual Architect & Tech Enthusiast';
  const getIdentityDesc = () => config.about_identity_desc || '致力于探索技术与艺术的边界。在这里，我记录关于代码、设计以及生活的琐碎灵感。系统全域连接中...';
  const getProfileAvatar = () => config.avatarUrl || '/uploads/avatar.png';
  const getProfileName = () => config.about_profile_name || config.authorName || 'PAKCHUII';
  const getProfileBio = () => config.about_profile_bio || 'NODE_OPERATOR // CODENAME: PHANTOM';
  const getVisual1 = () => config.about_visual_1_img || '/uploads/visual_1.png';
  const getVisual2 = () => config.about_visual_2_img || '/uploads/visual_2.png';

  const banners = getBannerUrls();

  container.innerHTML = `
    <div class="about-dashboard">
      
      <!-- TOP HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.2rem 1rem; border-bottom: 1px solid rgba(0,0,0,0.05); height: 30px; width: 100%;">
         <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); letter-spacing: 2px;">
           DASHBOARD / ${config.authorName ? config.authorName.toUpperCase() : 'ADMIN'}
         </div>
         <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted);">
           ${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
         </div>
      </div>

      <!-- TOP BANNER (CAROUSEL) -->
      <section class="about-hero-banner glass-premium" data-tilt data-jp="SYSTEM_BANNER // 系统横幅" style="width: 100%; height: 220px; overflow: hidden; position: relative; margin-bottom: 0.8rem; border-radius: 20px; flex-shrink: 0;">
        <img id="about-banner-img" src="${banners[0]}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9; transition: opacity 1s ease-in-out;">
        
        <div style="position: absolute; bottom: 0; left: 0; padding: 1.5rem 2rem; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); width: 100%; z-index: 2;">
           <div style="font-family: var(--font-mono); color: var(--theme-primary); font-size: 0.8rem; letter-spacing: 2px; margin-bottom: 0.5rem;">[ COMM_LINK: ESTABLISHED ]</div>
           <h1 style="margin: 0; font-family: var(--font-heading); font-size: 2.2rem; color: #fff; text-shadow: 0 0 20px rgba(99,102,241,0.5);">Identity Matrix</h1>
           <div style="font-family: var(--font-mono); color: rgba(255,255,255,0.6); font-size: 0.7rem;">SYSTEM_UID: ${config.authorName ? config.authorName.toUpperCase() : 'PAKCHUII'}_v3.0</div>
        </div>
        
        <div id="about-banner-indicators" style="position: absolute; top: 1.5rem; right: 2rem; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; z-index: 5;">
           <div style="text-align: right; margin-bottom: 4px;">
              <span style="display: block; font-family: var(--font-mono); color: rgba(255,255,255,0.6); font-size: 0.6rem; letter-spacing: 1px;">NODE_SCANNING...</span>
              <span id="banner-counter" style="display: block; font-family: var(--font-mono); color: var(--theme-primary); font-size: 0.7rem; font-weight: bold;">01 / 03</span>
           </div>
           <div style="display: flex; gap: 4px;">
              <div class="banner-dot active" style="width: 15px; height: 3px; background: var(--theme-primary); border-radius: 2px; transition: all 0.3s;"></div>
              <div class="banner-dot" style="width: 8px; height: 3px; background: rgba(255,255,255,0.3); border-radius: 2px; transition: all 0.3s;"></div>
              <div class="banner-dot" style="width: 8px; height: 3px; background: rgba(255,255,255,0.3); border-radius: 2px; transition: all 0.3s;"></div>
           </div>
        </div>
      </section>

      <div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 0.8rem; width: 100%;">
        
        <div style="grid-column: span 8; display: flex; flex-direction: column; gap: 0.8rem; min-height: 0;">
          
          <section class="about-widget glass-premium" data-tilt data-jp="USER_ID // 身份识别" style="flex: none; height: 380px; padding: 0; position: relative; display: flex; align-items: stretch; overflow: hidden; margin-bottom: 0.8rem;">
             <!-- Left Content -->
             <div style="flex: 1; padding: 3rem; z-index: 5; display: flex; flex-direction: column; justify-content: center; position: relative; background: linear-gradient(to right, rgba(255,255,255,0.05), transparent);">
                <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem;">
                   <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 10px #4ade80;"></div>
                   <span style="font-family: var(--font-mono); font-size: 0.6rem; color: var(--theme-primary); font-weight: bold; letter-spacing: 1px;">系统在线 // IDENTITY_VERIFIED</span>
                </div>
                <h2 style="font-size: 3.2rem; margin: 0; font-family: var(--font-heading); color: var(--text-main); line-height: 1.1; letter-spacing: -1px;">
                   ${getIdentityTitle().split(',').map((part, i) => i === 0 ? part + ',' : `<span style="color: var(--theme-primary);">${part}</span>`).join('')}
                </h2>
                <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.8; margin-top: 1.5rem; max-width: 100%; font-weight: 500;">
                   ${getIdentityDesc()}
                </p>
             </div>
             
             <!-- Right Mascot -->
             <div style="width: 50%; height: 100%; position: relative; z-index: 2; pointer-events: none; overflow: hidden; display: flex; align-items: stretch;">
                <img src="${getMascotUrl()}" style="width: 100%; height: 100%; object-fit: cover; object-position: center right; filter: drop-shadow(-10px 0 30px rgba(0,0,0,0.3)); mask-image: linear-gradient(to left, black 70%, transparent); -webkit-mask-image: linear-gradient(to left, black 70%, transparent); transition: transform 0.5s ease-out;">
             </div>

             <div style="position: absolute; top: 1rem; left: 1rem; width: 100px; height: 1px; background: linear-gradient(to right, var(--theme-primary), transparent);"></div>
             <div style="position: absolute; top: 1rem; left: 1rem; height: 100px; width: 1px; background: linear-gradient(to bottom, var(--theme-primary), transparent);"></div>
          </section>

          <div style="flex: none; height: 180px; display: flex; gap: 0.8rem;">
             <section class="about-widget glass-premium" data-tilt data-jp="USER_PROFILE // 用户档案" style="flex: 1.5; display: flex; align-items: center; gap: 1.5rem; padding: 1.2rem; height: 100%;">
                <div style="width: 85px; height: 85px; border-radius: 50%; border: 3px solid var(--theme-primary); padding: 5px; background: rgba(255,255,255,0.05); flex-shrink: 0; box-shadow: 0 0 25px rgba(99,102,241,0.25);">
                   <img src="${config.avatarUrl || getProfileAvatar()}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                </div>
                <div>
                   <h3 style="margin: 0; font-family: var(--font-heading); color: var(--text-main); font-size: 1.3rem;">${getProfileName()}</h3>
                   <p style="margin: 0.4rem 0 0 0; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6; opacity: 0.8;">${getProfileBio()}</p>
                </div>
             </section>

             <section class="about-widget glass-premium" data-tilt data-jp="VISUAL_B1 // 视觉单元-01" style="padding: 0; overflow: hidden; position: relative; flex: 1; height: 100%;">
                <img src="${getVisual1()}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;">
             </section>

             <section class="about-widget glass-premium" data-tilt data-jp="VISUAL_B2 // 视觉单元-02" style="padding: 0; overflow: hidden; position: relative; flex: 1; height: 100%;">
                <img src="${getVisual2()}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;">
             </section>
          </div>
        </div>

        <div style="grid-column: span 4; display: flex; flex-direction: column; gap: 0.8rem; min-height: 0;">
          <section class="about-widget glass-premium" id="about-carousel-hub" data-tilt data-jp="FEATURE_HUB // 综合展示中心" style="flex: none; height: 420px; padding: 0.8rem; display: flex; flex-direction: column; overflow: hidden;">
             <div style="flex: 1; position: relative; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 0.8rem; min-height: 0;">
                <img id="about-carousel-img" src="${config.about_carousel_1_img || '/uploads/carousel_1.png'}" style="width: 100%; height: 100%; object-fit: cover; transition: opacity 0.8s ease-in-out;">
                <div id="about-carousel-indicators" style="position: absolute; bottom: 1rem; width: 100%; display: flex; justify-content: center; gap: 6px; z-index: 10;">
                   <div class="carousel-dot active" style="width: 20px; height: 4px; border-radius: 10px; background: var(--theme-primary); transition: all 0.3s;"></div>
                   <div class="carousel-dot" style="width: 6px; height: 4px; border-radius: 10px; background: rgba(255,255,255,0.3); transition: all 0.3s;"></div>
                   <div class="carousel-dot" style="width: 6px; height: 4px; border-radius: 10px; background: rgba(255,255,255,0.3); transition: all 0.3s;"></div>
                </div>
             </div>
             <div style="height: 100px; padding: 0.2rem 0.8rem; display: flex; flex-direction: column; justify-content: center; flex-shrink: 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                   <span style="font-size: 0.5rem; background: var(--theme-primary); color: white; padding: 1px 5px; border-radius: 3px; font-weight: bold; letter-spacing: 1px;">AUTOSCAN</span>
                   <span id="carousel-counter" style="font-size: 0.55rem; color: var(--text-muted); font-family: var(--font-mono);">01 / 03</span>
                </div>
                <h3 id="carousel-title" style="margin: 0; font-family: var(--font-heading); color: var(--text-main); font-size: 1rem; line-height: 1.2;">${config.about_carousel_1_title || 'PROJECT: NEURAL_NET_v2'}</h3>
                <p id="carousel-desc" style="margin: 0.3rem 0 0 0; font-size: 0.7rem; color: var(--text-muted); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${config.about_carousel_1_desc || '基于神经网络的实时数据可视化阵列。采用了最新的高密度点云渲染技术。'}</p>
             </div>
          </section>

          <section class="about-widget glass-premium" id="about-haptic-hub" data-tilt data-jp="HAPTIC // 触控交互" style="flex: none; height: 140px; padding: 0; overflow: hidden; position: relative; display: flex; flex-direction: column;">
             <div style="position: absolute; top: 0.8rem; left: 1rem; z-index: 5; pointer-events: none;">
                <h3 style="margin: 0; font-family: var(--font-heading); color: var(--theme-primary); font-size: 0.8rem; opacity: 0.8;">HAPTIC_INTERFACE</h3>
                <p style="margin: 0; font-size: 0.5rem; color: var(--text-muted); font-family: var(--font-mono);">GRID_STABILIZER // ACTIVE</p>
             </div>
             <canvas id="haptic-canvas" style="flex: 1; width: 100%; cursor: crosshair;"></canvas>
             <div style="position: absolute; bottom: 0.8rem; right: 1rem; z-index: 5; pointer-events: none; text-align: right;">
                <span style="font-size: 0.5rem; color: var(--theme-primary); font-family: var(--font-mono); display: block;">SIGNAL_STRENGTH: 98%</span>
                <span style="font-size: 0.45rem; color: var(--text-muted); font-family: var(--font-mono);">CALIBRATED_TO_${config.authorName ? config.authorName.toUpperCase() : 'PAKCHUII'}</span>
             </div>
          </section>
        </div>
      </div>
    </div>
  `;

  const initHapticPad = async () => {
    const THREE = await import('three');
    const canvas = document.getElementById('haptic-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(rect.width, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, rect.width / rect.height, 0.1, 100);
    camera.position.z = 8;

    const count = 12;
    const spacing = 1.2;
    const totalPoints = count * count;
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(totalPoints * 3);
    const origPositions = new Float32Array(totalPoints * 3);
    
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const idx = (i * count + j) * 3;
        const x = (i - count / 2) * spacing;
        const y = (j - count / 2) * spacing;
        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = 0;
        origPositions[idx] = x;
        origPositions[idx + 1] = y;
        origPositions[idx + 2] = 0;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const lineIndices = [];
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const curr = i * count + j;
        if (i < count - 1) lineIndices.push(curr, (i + 1) * count + j);
        if (j < count - 1) lineIndices.push(curr, i * count + (j + 1));
      }
    }
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeom.setIndex(lineIndices);

    const pointsMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x6366f1,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const linesMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, pointsMat);
    const lines = new THREE.LineSegments(lineGeom, linesMat);
    
    const group = new THREE.Group();
    group.add(points);
    group.add(lines);
    scene.add(group);

    let mouse = new THREE.Vector2(-999, -999);
    let targetMouse = new THREE.Vector2(-999, -999);
    
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    canvas.addEventListener('mouseleave', () => {
      targetMouse.set(-999, -999);
    });

    const animate = () => {
      if (!document.getElementById('haptic-canvas')) return;
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      
      if (targetMouse.x !== -999) {
        mouse.lerp(targetMouse, 0.1);
      } else {
        mouse.set(-999, -999);
      }

      const pos = geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
          const idx = (i * count + j) * 3;
          const ox = origPositions[idx];
          const oy = origPositions[idx + 1];
          
          let x = ox + Math.sin(time + ox) * 0.1;
          let y = oy + Math.cos(time + oy) * 0.1;
          let z = Math.sin(time * 0.5 + ox * 0.5 + oy * 0.5) * 0.3;

          if (mouse.x !== -999) {
            const mv = new THREE.Vector3(mouse.x * 10, mouse.y * 5, 0);
            const pv = new THREE.Vector3(x, y, 0);
            const dist = pv.distanceTo(mv);
            
            if (dist < 3) {
              const pull = Math.pow((3 - dist) / 3, 2) * 1.5;
              const dir = mv.sub(pv).normalize();
              x += dir.x * pull;
              y += dir.y * pull;
              z += pull * 2;
            }
          }

          pos[idx] = x;
          pos[idx + 1] = y;
          pos[idx + 2] = z;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      lineGeom.attributes.position.needsUpdate = true;
      
      group.rotation.y = Math.sin(time * 0.2) * 0.1;
      group.rotation.x = Math.cos(time * 0.2) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
       const newRect = canvas.getBoundingClientRect();
       if (newRect.width > 0) {
          renderer.setSize(newRect.width, newRect.height);
          camera.aspect = newRect.width / newRect.height;
          camera.updateProjectionMatrix();
       }
    });
  };

  initHapticPad();

  // --- FEATURE CAROUSEL LOGIC ---
  const carouselData = [
    {
      img: config.about_carousel_1_img || '/uploads/carousel_1.png',
      title: config.about_carousel_1_title || 'PROJECT: NEURAL_NET_v2',
      desc: config.about_carousel_1_desc || '基于神经网络的实时数据可视化阵列。采用了最新的高密度点云渲染技术。',
      count: '01 / 03'
    },
    {
      img: config.about_carousel_2_img || '/uploads/carousel_2.png',
      title: config.about_carousel_2_title || 'CORE_SYNC // 核心同步',
      desc: config.about_carousel_2_desc || '系统多维度数据流同步中心。确保所有子系统在毫秒级延迟内达成一致。',
      count: '02 / 03'
    },
    {
      img: config.about_carousel_3_img || '/uploads/about_banner.png',
      title: config.about_carousel_3_title || 'DASHBOARD_v3 // 视角切换',
      desc: config.about_carousel_3_desc || '正在全屏扫描系统架构... 身份识别正常。欢迎回来。',
      count: '03 / 03'
    }
  ];

  let featureIdx = 0;
  const updateFeatureCarousel = () => {
    const hub = document.getElementById('about-carousel-hub');
    if (!hub) return; 

    featureIdx = (featureIdx + 1) % carouselData.length;
    const data = carouselData[featureIdx];

    const imgEl = document.getElementById('about-carousel-img') as HTMLImageElement;
    const titleEl = document.getElementById('carousel-title');
    const descEl = document.getElementById('carousel-desc');
    const counterEl = document.getElementById('carousel-counter');
    const dots = document.querySelectorAll('.carousel-dot');

    if (imgEl) {
      imgEl.style.opacity = '0';
      setTimeout(() => {
        imgEl.src = data.img;
        if (titleEl) titleEl.innerText = data.title;
        if (descEl) descEl.innerText = data.desc;
        if (counterEl) counterEl.innerText = data.count;
        
        dots.forEach((dot, idx) => {
          (dot as HTMLElement).style.width = idx === featureIdx ? '20px' : '6px';
          (dot as HTMLElement).style.background = idx === featureIdx ? 'var(--theme-primary)' : 'rgba(255,255,255,0.3)';
        });
        
        imgEl.style.opacity = '1';
      }, 800);
    }
    
    setTimeout(updateFeatureCarousel, 5000);
  };

  // --- BANNER CAROUSEL LOGIC ---
  let bannerIdx = 0;
  const updateBannerCarousel = () => {
    const banner = document.getElementById('about-banner-img');
    if (!banner) return;

    bannerIdx = (bannerIdx + 1) % banners.length;
    const imgEl = banner as HTMLImageElement;
    const counterEl = document.getElementById('banner-counter');
    const dots = document.querySelectorAll('.banner-dot');

    imgEl.style.opacity = '0';
    setTimeout(() => {
      imgEl.src = banners[bannerIdx];
      if (counterEl) counterEl.innerText = `0${bannerIdx + 1} / 03`;
      
      dots.forEach((dot, idx) => {
        (dot as HTMLElement).style.width = idx === bannerIdx ? '15px' : '8px';
        (dot as HTMLElement).style.background = idx === bannerIdx ? 'var(--theme-primary)' : 'rgba(255,255,255,0.3)';
      });
      
      imgEl.style.opacity = '1';
    }, 1000);

    setTimeout(updateBannerCarousel, 6000);
  };

  setTimeout(updateFeatureCarousel, 5000);
  setTimeout(updateBannerCarousel, 6000);

  UI.initTiltEffect();
}

export function renderArticlesList(container: HTMLElement, onNavigate: (to: string, params?: any) => void, params?: any) {
  const PAGE_SIZE = 5;
  let articles = BlogStore.getArticles();
  const filterType = params?.filterType;
  const filterVal = params?.filterVal;
  const page = params?.page || 1;

  // Apply filter
  if (filterType === 'category' && filterVal) {
    articles = articles.filter(a => a.category === filterVal);
  } else if (filterType === 'tag' && filterVal) {
    articles = articles.filter(a => (a.tag || '').split(',').map(t => t.trim()).includes(filterVal));
  }
  
  const totalPages = Math.ceil(articles.length / PAGE_SIZE);
  const startIndex = (page - 1) * PAGE_SIZE;
  const displayedArticles = articles.slice(startIndex, startIndex + PAGE_SIZE);

  const heroBannerHtml = getHeroBannerHtml('文章归档 / ARCHIVE', '记录所有的技术沉淀与思考');

  // Filter badge
  const filterBadge = filterVal ? `
    <div style="padding: 0 5rem; margin-top: 1rem;">
      <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(99,102,241,0.1); color: var(--theme-primary); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
        <span>${filterType === 'category' ? '📂 分类' : '🏷️ 标签'}：${filterVal}</span>
        <span style="font-size: 0.75rem; color: #94a3b8;">(${articles.length} 篇)</span>
        <button id="clear-filter-btn" style="background: none; border: none; color: var(--theme-primary); cursor: pointer; font-size: 1.1rem; line-height: 1; padding: 0 0.2rem; opacity: 0.7;" title="清除筛选">×</button>
      </div>
    </div>
  ` : '';

  const paginationHtml = totalPages > 1 ? `
    <div class="pagination-container" style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; margin-bottom: 6rem;">
      <button id="prev-page-btn" ${page <= 1 ? 'disabled' : ''} class="glass-premium" style="padding: 0.6rem 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); color: ${page <= 1 ? '#94a3b8' : 'var(--text-main)'}; cursor: ${page <= 1 ? 'not-allowed' : 'pointer'}; font-weight: 600; font-family: var(--font-mono); font-size: 0.8rem; transition: all 0.3s;">
        < PREV
      </button>
      <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); letter-spacing: 1px;">
        PAGE <span style="color: var(--theme-primary); font-weight: 800;">${page}</span> / ${totalPages}
      </div>
      <button id="next-page-btn" ${page >= totalPages ? 'disabled' : ''} class="glass-premium" style="padding: 0.6rem 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); color: ${page >= totalPages ? '#94a3b8' : 'var(--text-main)'}; cursor: ${page >= totalPages ? 'not-allowed' : 'pointer'}; font-weight: 600; font-family: var(--font-mono); font-size: 0.8rem; transition: all 0.3s;">
        NEXT >
      </button>
    </div>
  ` : '';

  container.innerHTML = `
    ${heroBannerHtml}
    ${filterBadge}

    <section class="feed-container" style="display: flex; flex-direction: column; gap: 2rem;">
      ${displayedArticles.length === 0 ? `<div class="post-card glass-premium" style="text-align:center; padding:3rem; color:#94a3b8; cursor:default;">暂无匹配的文章</div>` : displayedArticles.map(a => `
        <article class="post-card glass-premium" data-id="${a.id}" style="display: flex; flex-direction: row; gap: 2rem; cursor: pointer; border-radius: 12px; overflow: hidden; padding: 2rem; align-items: center; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.05)';">
          <div style="flex: 1; display: flex; flex-direction: column;">
            <div class="meta" style="color: var(--theme-primary); font-family: var(--font-mono); font-size: 0.9rem; margin-bottom: 1rem;">
              [ ${a.date} ] // CATEGORY: ${a.category.toUpperCase()}
            </div>
            <h2 style="font-size: 1.8rem; margin: 0.5rem 0 1rem; color: var(--text-main); font-family: var(--font-heading); line-height: 1.3;">
              ${a.title}
            </h2>
            <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.8; flex: 1;">
              ${a.excerpt}
            </p>
          </div>
          ${a.thumbnailUrl ? (a.thumbnailUrl.match(/\.(mp4|webm)$/i) ? `
            <div style="width: 280px; height: 180px; flex-shrink: 0; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
              <video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
                <source src="${a.thumbnailUrl}">
              </video>
            </div>
          ` : `
            <div style="width: 280px; height: 180px; flex-shrink: 0; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
              <img src="${a.thumbnailUrl}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
            </div>
          `) : `
            <div style="width: 280px; height: 180px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: var(--fawang-gradient); display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-weight: bold; opacity: 0.5;">NO_IMAGE</span>
            </div>
          `}
        </article>
      `).join('')}
    </section>

    ${paginationHtml}
  `;

  // Clear filter button
  document.getElementById('clear-filter-btn')?.addEventListener('click', () => {
    onNavigate('articles');
  });

  // Pagination buttons
  document.getElementById('prev-page-btn')?.addEventListener('click', () => {
    if (page > 1) onNavigate('articles', { ...params, page: page - 1 });
  });

  document.getElementById('next-page-btn')?.addEventListener('click', () => {
    if (page < totalPages) onNavigate('articles', { ...params, page: page + 1 });
  });

  document.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      onNavigate('article', { id });
    });
  });
}

export function renderGallery(container: HTMLElement) {
  container.innerHTML = `
    ${getHeroBannerHtml('图片墙 / Gallery', '记录生活瞬间与视觉灵感')}
    <div id="gallery-loader" style="padding: 5rem; text-align: center; color: var(--text-main);">
       <p>正在读取资产库...</p>
    </div>
    <div class="masonry-grid" id="photo-wall-grid" style="display: none;"></div>
  `;

  const grid = document.getElementById('photo-wall-grid');
  const loader = document.getElementById('gallery-loader');

  fetch(`${BlogStore.getApiBase()}/assets`)
    .then(r => r.json())
    .then(urls => {
      const config = BlogStore.getConfig();
      let galleryUrls: string[] = [];
      try {
        galleryUrls = JSON.parse(config.galleryOrder || '[]');
      } catch (e) { galleryUrls = []; }

      // ONLY show the ones explicitly selected in the designer order
      const finalImages = galleryUrls.filter(u => urls.includes(u) && !u.match(/\.(mp4|webm)$/i));

      if (grid && loader) {
        loader.style.display = 'none';
        grid.style.display = 'block';
        grid.innerHTML = finalImages.map((url: string) => `
          <div class="gallery-item glass-premium" style="break-inside: avoid; margin-bottom: 1rem; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 4px 20px rgba(0,0,0,0.1);" 
               onmouseover="this.style.transform='scale(1.03) translateY(-5px)'" 
               onmouseout="this.style.transform='scale(1) translateY(0)'"
               data-url="${url}">
            <img src="${url}" style="width: 100%; display: block; object-fit: cover;">
          </div>
        `).join('');

        // Add click listeners for preview
        grid.querySelectorAll('.gallery-item').forEach(item => {
          item.addEventListener('click', () => {
            const url = item.getAttribute('data-url');
            if (url) UI.imagePreview(url);
          });
        });
      }
    })
    .catch(_err => {
      if (loader) loader.innerHTML = `<p style="color: #ef4444;">无法加载图片墙，请检查网络或后端状态。</p>`;
    });
}
