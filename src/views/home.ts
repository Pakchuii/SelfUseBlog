import { BlogStore } from '../core/store';
import { gsap } from 'gsap';

export function renderHome(container: HTMLElement, onNavigate: (to: string, params?: any) => void) {
  const articles = BlogStore.getArticles();
  const config = BlogStore.getConfig();
  
  const isVideo = config.bannerImageUrl?.match(/\.(mp4|webm)$/i);
  let heroBannerHtml = '';
  
  if (isVideo) {
    heroBannerHtml = `
      <div style="padding: 2rem 5rem 0 5rem; max-width: 1100px; margin: 0 auto;">
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
      <div style="padding: 2rem 5rem 0 5rem; max-width: 1100px; margin: 0 auto;">
        <section class="hero-banner" style="height: 300px; ${heroStyle} border-radius: 24px; box-shadow: 0 15px 45px rgba(0,0,0,0.1); position:relative; display: flex; flex-direction: column; justify-content: center; padding: 0 4rem; backdrop-filter: blur(var(--glass-blur));">
          <h1 style="text-shadow: 0 4px 12px rgba(0,0,0,0.3);">${config.siteTitle || ''}</h1>
          <p class="subtitle" style="text-shadow: 0 2px 8px rgba(0,0,0,0.3);">${config.bannerSubtitle || ''}</p>
        </section>
      </div>
    `;
  }

  container.innerHTML = `
    ${heroBannerHtml}

    <!-- Middle Section: Announcement + Gallery Carousel -->
    <div style="padding: 1.5rem 5rem 3rem 5rem; max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem;">
      <!-- Announcement -->
      <div style="background: var(--card-bg); backdrop-filter: blur(var(--glass-blur)); border-radius: 20px; border: 1px solid rgba(255,255,255,0.4); padding: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
        <h3 style="font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 1.2rem; color: var(--theme-primary); display: flex; align-items: center; gap: 0.8rem;">
          <span style="font-size: 1.4rem;">📊</span> ${config.homeMidTitle || '进度 / PROGRESS'}
        </h3>
        <div style="font-size: 0.95rem; line-height: 1.8; color: #475569; overflow-y: auto; max-height: 200px; padding-right: 10px;" class="ba-scrollbar">
          ${config.homeMidContent || config.announcement || '暂无内容'}
        </div>
      </div>

      <!-- Carousel -->
      <div id="home-carousel-container" class="carousel-hover-container" style="background: var(--card-bg); backdrop-filter: blur(var(--glass-blur)); border-radius: 20px; border: 1px solid rgba(255,255,255,0.4); overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.08); position: relative; height: 300px; cursor: pointer;">
        <div id="home-carousel-track" style="display: flex; width: 100%; height: 100%; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);">
           <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-family:var(--font-mono);">Loading Gallery...</div>
        </div>
        <!-- Overlays for controls -->
        <div style="position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to right, rgba(0,0,0,0.1), transparent 20%, transparent 80%, rgba(0,0,0,0.1));"></div>
        <button id="carousel-prev" class="carousel-btn" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.8); color: var(--theme-primary); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items:center; justify-content:center; font-weight:bold; transition: all 0.3s; opacity: 0;">&lt;</button>
        <button id="carousel-next" class="carousel-btn" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.8); color: var(--theme-primary); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items:center; justify-content:center; font-weight:bold; transition: all 0.3s; opacity: 0;">&gt;</button>
        
        <div id="carousel-go-btn" style="position: absolute; bottom: 15px; right: 20px; background: rgba(0,0,0,0.5); color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-family: var(--font-mono); backdrop-filter: blur(5px); z-index: 10; transition: all 0.3s; opacity: 0; transform: translateY(10px);">
          GO TO GALLERY →
        </div>

        <style>
          .carousel-hover-container:hover .carousel-btn { opacity: 1 !important; }
          .carousel-hover-container:hover #carousel-go-btn { opacity: 1 !important; transform: translateY(0) !important; }
        </style>
      </div>
    </div>

    <section class="feed-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; padding: 2rem 5rem;">
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
    ease: 'power2.out',
    clearProps: 'transform'
  });

  // Carousel Logic
  fetch('http://localhost:3001/api/assets')
    .then(r => r.json())
    .then(urls => {
      const carouselTrack = document.getElementById('home-carousel-track');
      if (!carouselTrack) return;

      let galleryUrls: string[] = [];
      try {
        galleryUrls = JSON.parse(config.galleryOrder || '[]');
      } catch (e) { galleryUrls = []; }

      // Filter valid images
      let finalImages = galleryUrls.filter(u => urls.includes(u) && !u.match(/\.(mp4|webm)$/i));
      // Fallback if gallery is empty
      if (finalImages.length === 0) {
        finalImages = urls.filter((u: string) => !u.match(/\.(mp4|webm)$/i)).slice(0, 8);
      }

      if (finalImages.length === 0) {
        carouselTrack.innerHTML = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#94a3b8;">暂无图片素材</div>';
        return;
      }

      carouselTrack.innerHTML = finalImages.map((u: string) => `
        <div style="flex: 0 0 100%; width: 100%; height: 100%;">
          <img src="${u}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      `).join('');

      let currentIndex = 0;
      const total = finalImages.length;
      let intervalId: any = null;

      const update = () => {
        carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
      };

      const next = () => {
        currentIndex = (currentIndex + 1) % total;
        update();
      };

      const startAuto = () => {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(next, 5000);
      };

      document.getElementById('carousel-prev')?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + total) % total;
        update();
        startAuto();
      });

      document.getElementById('carousel-next')?.addEventListener('click', (e) => {
        e.stopPropagation();
        next();
        startAuto();
      });

      startAuto();

      document.getElementById('home-carousel-container')?.addEventListener('click', () => {
        clearInterval(intervalId);
        onNavigate('photowall');
      });
    });

  // Events
  document.querySelectorAll('.post-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      onNavigate('article', { id });
    });
  });
}
