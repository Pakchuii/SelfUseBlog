import { BlogStore } from '../core/store';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { UI } from '../core/ui';

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
    <div style="padding: 2rem 5rem 0 5rem;">
      <section class="hero-banner" style="height: 350px; ${heroStyle} border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); position:relative; display: flex; flex-direction: column; justify-content: center; padding: 0 4rem; overflow: hidden;">
        ${isVideo ? `
          <video autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;">
            <source src="${article.thumbnailUrl}">
          </video>
          <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); z-index: 1;"></div>
        ` : ''}
        <div style="position: relative; z-index: 2;">
          <span id="back-btn" style="cursor: pointer; color: white; opacity: 0.8; font-size: 0.9rem; font-family: var(--font-mono); margin-bottom: 1rem; display: inline-block;">← 返回 / BACK</span>
          <h1 style="color: white; font-family: var(--font-heading); font-size: 3.5rem; margin-bottom: 1rem; text-shadow: 0 4px 12px rgba(0,0,0,0.3);">${article.title}</h1>
          <div style="display: flex; gap: 1rem; color: rgba(255,255,255,0.8); font-size: 0.9rem; font-family: var(--font-mono); text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <span>[ ${article.date} ]</span>
            <span>// CATEGORY: ${article.category.toUpperCase()}</span>
          </div>
        </div>
      </section>
    </div>

    <article class="feed-container" style="padding-top: 2rem;">
      <div class="post-card markdown-body" style="cursor: default; min-height: 60vh; border: 1px solid rgba(255,255,255,0.3);">
        <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main);">${safeHtml}</div>
        
        <!-- Comments Section -->
        <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(0,0,0,0.1);">
          <h3 style="font-family: var(--font-heading); margin-bottom: 2rem;">评论区 / COMMENTS (${article.comments?.length || 0})</h3>
          
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

          <div id="comment-form-area" style="background: rgba(94, 114, 228, 0.05); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(94, 114, 228, 0.1);">
            <h4 style="margin-bottom: 1rem; color: var(--theme-primary);">发表回复</h4>
            <!-- Form content will be hydrated below -->
          </div>
        </div>

      </div>
    </article>
  `;
  document.getElementById('back-btn')?.addEventListener('click', () => onNavigate('home'));

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
  const rawHtml = marked.parse(config.aboutContent || '# 关于我 / Identity\n还没有内容。') as string;
  const safeHtml = DOMPurify.sanitize(rawHtml);

  container.innerHTML = `
    <div style="padding: 2rem 5rem 0 5rem;">
      <section class="hero-banner" style="height: 200px; background: var(--fawang-gradient); border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); position:relative; display: flex; flex-direction: column; justify-content: center; padding: 0 4rem; backdrop-filter: blur(var(--glass-blur));">
        <h1 style="text-shadow: 0 4px 12px rgba(0,0,0,0.3);">关于我 / Identity</h1>
      </section>
    </div>
    <section class="feed-container">
      <div class="post-card markdown-body" style="cursor: default; border: 1px solid rgba(255,255,255,0.3); min-height: 50vh;">
        <div style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main);">${safeHtml}</div>
      </div>
    </section>
  `;
}

export function renderArticlesList(container: HTMLElement, onNavigate: (to: string, params?: any) => void, params?: any) {
  let articles = BlogStore.getArticles();
  const config = BlogStore.getConfig();
  const filterType = params?.filterType;
  const filterVal = params?.filterVal;

  // Apply filter
  if (filterType === 'category' && filterVal) {
    articles = articles.filter(a => a.category === filterVal);
  } else if (filterType === 'tag' && filterVal) {
    articles = articles.filter(a => (a.tag || '').split(',').map(t => t.trim()).includes(filterVal));
  }
  
  const isVideo = config.bannerImageUrl?.match(/\.(mp4|webm)$/i);
  let heroBannerHtml = '';
  if (isVideo) {
    heroBannerHtml = `
      <div style="padding: 2rem 5rem 0 5rem; max-width: 1100px; margin: 0 auto;">
        <section class="hero-banner" style="height: 260px; padding:0; position:relative; border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); backdrop-filter: blur(var(--glass-blur)); overflow: hidden;">
          <video autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.8;">
            <source src="${config.bannerImageUrl}">
          </video>
          <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to right, rgba(0,0,0,0.4), transparent); z-index: 1;"></div>
          <div style="position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 0 4rem;">
            <h1 style="text-shadow: 0 4px 12px rgba(0,0,0,0.3);">文章归档 / ARCHIVE</h1>
            <p class="subtitle" style="text-shadow: 0 2px 8px rgba(0,0,0,0.3);">记录所有的技术沉淀与思考</p>
          </div>
        </section>
      </div>
    `;
  } else {
    const heroStyle = config.bannerImageUrl 
      ? `background-image: linear-gradient(to right, rgba(0,0,0,0.4), transparent), url('${config.bannerImageUrl}'); background-position: center; background-size: cover; background-repeat: no-repeat;` 
      : `background: var(--fawang-gradient);`;
    heroBannerHtml = `
      <div style="padding: 2rem 5rem 0 5rem; max-width: 1100px; margin: 0 auto;">
        <section class="hero-banner" style="height: 260px; ${heroStyle} border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); position:relative; display: flex; flex-direction: column; justify-content: center; padding: 0 4rem; backdrop-filter: blur(var(--glass-blur));">
          <h1 style="text-shadow: 0 4px 12px rgba(0,0,0,0.3);">文章归档 / ARCHIVE</h1>
          <p class="subtitle" style="text-shadow: 0 2px 8px rgba(0,0,0,0.3);">记录所有的技术沉淀与思考</p>
        </section>
      </div>
    `;
  }

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

  container.innerHTML = `
    ${heroBannerHtml}
    ${filterBadge}

    <section class="feed-container" style="display: flex; flex-direction: column; gap: 2rem;">
      ${articles.length === 0 ? `<div class="post-card" style="text-align:center; padding:3rem; color:#94a3b8; cursor:default;">暂无匹配的文章</div>` : articles.map(a => `
        <article class="post-card" data-id="${a.id}" style="display: flex; flex-direction: row; gap: 2rem; cursor: pointer; border-radius: 12px; border: 2px solid rgba(255,255,255,0.3); overflow: hidden; padding: 2rem; align-items: center; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.05)';">
          <div style="flex: 1; display: flex; flex-direction: column;">
            <div class="meta" style="color: var(--theme-primary); font-family: var(--font-mono); font-size: 0.9rem; margin-bottom: 1rem;">
              [ ${a.date} ] // CATEGORY: ${a.category.toUpperCase()}
            </div>
            <h2 style="font-size: 1.8rem; margin: 0.5rem 0 1rem; color: #1e293b; font-family: var(--font-heading); line-height: 1.3;">
              ${a.title}
            </h2>
            <p style="color: #64748b; font-size: 1rem; line-height: 1.8; flex: 1;">
              ${a.excerpt}
            </p>
          </div>
          ${a.thumbnailUrl ? (a.thumbnailUrl.match(/\.(mp4|webm)$/i) ? `
            <div style="width: 280px; height: 180px; flex-shrink: 0; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
              <video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
                <source src="${a.thumbnailUrl}">
              </video>
            </div>
          ` : `
            <div style="width: 280px; height: 180px; flex-shrink: 0; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
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
  `;

  // Clear filter button
  document.getElementById('clear-filter-btn')?.addEventListener('click', () => {
    onNavigate('articles');
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
    <div style="padding: 2rem 5rem 0 5rem;">
      <section class="hero-banner" style="height: 200px; background: var(--fawang-gradient); border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); position:relative; display: flex; flex-direction: column; justify-content: center; padding: 0 4rem; backdrop-filter: blur(var(--glass-blur));">
        <h1 style="text-shadow: 0 4px 12px rgba(0,0,0,0.3);">图片墙 / Gallery</h1>
        <p style="color: white; opacity: 0.9; margin-top: 0.5rem;">记录生活瞬间与视觉灵感</p>
      </section>
    </div>
    <div id="gallery-loader" style="padding: 5rem; text-align: center; color: var(--text-main);">
       <p>正在读取资产库...</p>
    </div>
    <div class="masonry-grid" id="photo-wall-grid" style="display: none;"></div>
  `;

  const grid = document.getElementById('photo-wall-grid');
  const loader = document.getElementById('gallery-loader');

  fetch('http://localhost:3001/api/assets')
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
          <div class="gallery-item" style="break-inside: avoid; margin-bottom: 1rem; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 4px 20px rgba(0,0,0,0.1);" 
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
    .catch(err => {
      if (loader) loader.innerHTML = `<p style="color: #ef4444;">无法加载图片墙，请检查网络或后端状态。</p>`;
    });
}
