import { BlogStore } from '../core/store';
import { gsap } from 'gsap';

export function renderHome(container: HTMLElement, onNavigate: (to: string, params?: any) => void) {
  const articles = BlogStore.getArticles();
  const config = BlogStore.getConfig();
  
  const isVideo = config.bannerImageUrl?.match(/\.(mp4|webm)$/i);
  let heroBannerHtml = '';
  
  if (isVideo) {
    heroBannerHtml = `
      <div style="padding: 2rem 5rem 0 5rem;">
        <section class="hero-banner" style="height: 300px; padding:0; position:relative; border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); background: var(--card-bg); backdrop-filter: blur(var(--glass-blur)); overflow: hidden;">
          <video autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; opacity: 0.8;">
            <source src="${config.bannerImageUrl}">
          </video>
          <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to right, rgba(0,0,0,0.4), transparent); z-index: 1;"></div>
          <div style="position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 0 4rem;">
            <h1 style="text-shadow: 0 4px 12px rgba(0,0,0,0.3);">${config.siteTitle || ''}</h1>
            <p class="subtitle" style="text-shadow: 0 2px 8px rgba(0,0,0,0.3);">${config.bannerSubtitle || ''}</p>
          </div>
        </section>
      </div>
    `;
  } else {
    const heroStyle = config.bannerImageUrl 
      ? `background-image: linear-gradient(to right, rgba(0,0,0,0.4), transparent), url('${config.bannerImageUrl}'); background-position: center; background-size: cover; background-repeat: no-repeat;` 
      : `background: var(--fawang-gradient);`;
    heroBannerHtml = `
      <div style="padding: 2rem 5rem 0 5rem;">
        <section class="hero-banner" style="height: 300px; ${heroStyle} border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); position:relative; display: flex; flex-direction: column; justify-content: center; padding: 0 4rem; backdrop-filter: blur(var(--glass-blur));">
          <h1 style="text-shadow: 0 4px 12px rgba(0,0,0,0.3);">${config.siteTitle || ''}</h1>
          <p class="subtitle" style="text-shadow: 0 2px 8px rgba(0,0,0,0.3);">${config.bannerSubtitle || ''}</p>
        </section>
      </div>
    `;
  }

  container.innerHTML = `
    ${heroBannerHtml}

    <section class="feed-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
      ${articles.map(a => `
        <article class="post-card" data-id="${a.id}" style="padding: 0; display: flex; flex-direction: column; overflow: hidden; border-radius: 12px; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 10px 25px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 20px 40px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.05)';">
          ${a.thumbnailUrl ? (a.thumbnailUrl.match(/\.(mp4|webm)$/i) ? `
            <div style="width: 100%; height: 180px; position: relative;">
              <video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;">
                <source src="${a.thumbnailUrl}">
              </video>
              <div style="position: absolute; bottom: 0; right: 0; background: var(--theme-primary); color: white; padding: 0.3rem 0.8rem; font-weight: bold; border-top-left-radius: 12px; font-size: 0.8rem;">
                ${a.category.toUpperCase()}
              </div>
            </div>
          ` : `
            <div style="width: 100%; height: 180px; position: relative;">
              <img src="${a.thumbnailUrl}" style="width: 100%; height: 100%; object-fit: cover;">
              <div style="position: absolute; bottom: 0; right: 0; background: var(--theme-primary); color: white; padding: 0.3rem 0.8rem; font-weight: bold; border-top-left-radius: 12px; font-size: 0.8rem;">
                ${a.category.toUpperCase()}
              </div>
            </div>
          `) : `
            <div style="width: 100%; height: 180px; background: var(--fawang-gradient); position: relative; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-weight: bold; font-size: 1.5rem; opacity: 0.5;">SEC_TERMINAL</span>
              <div style="position: absolute; bottom: 0; right: 0; background: var(--text-main); color: white; padding: 0.3rem 0.8rem; font-weight: bold; border-top-left-radius: 12px; font-size: 0.8rem;">
                ${a.category.toUpperCase()}
              </div>
            </div>
          `}
          <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
            <div class="meta" style="color: var(--theme-primary); font-weight: bold; margin-bottom: 0.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem;">[ ${a.date} ]</div>
            <h2 style="font-size: 1.2rem; margin: 0.5rem 0; color: #1e293b; font-weight: 800; font-family: var(--font-heading);">${a.title}</h2>
            <p style="color: #64748b; font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">${a.excerpt}</p>
            <div style="display: flex; align-items: center; justify-content: flex-end; margin-top: auto;">
              <span style="font-size: 0.8rem; font-weight: bold; color: var(--theme-primary); border: 1px solid var(--theme-primary); padding: 0.2rem 0.6rem; border-radius: 4px; transition: all 0.3s ease;" onmouseover="this.style.background='var(--theme-primary)'; this.style.color='white';" onmouseout="this.style.background='transparent'; this.style.color='var(--theme-primary)';">READ MORE</span>
            </div>
          </div>
        </article>
      `).join('')}
    </section>
  `;

  // Entrance Animation
  gsap.from('.post-card', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.out'
  });

  // Events
  document.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      onNavigate('article', { id });
    });
  });
}
