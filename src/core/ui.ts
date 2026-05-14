import gsap from 'gsap';

export class UI {
  static toast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const toast = document.createElement('div');
    toast.className = `fawang-toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: var(--card-bg);
      backdrop-filter: blur(20px);
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      color: var(--text-main);
      font-weight: 500;
      font-size: 0.9rem;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Remove after 3s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  static confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(5px);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      const modal = document.createElement('div');
      modal.className = 'fawang-modal';
      modal.style.cssText = `
        background: var(--card-bg);
        backdrop-filter: blur(30px);
        padding: 2rem;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.3);
        box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        max-width: 400px;
        width: 90%;
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        text-align: center;
      `;

      modal.innerHTML = `
        <h3 style="margin-bottom: 1rem; font-family: var(--font-heading);">确认操作</h3>
        <p style="margin-bottom: 2rem; color: var(--text-muted); line-height: 1.6;">${message}</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="modal-cancel" style="padding: 0.8rem 1.5rem; background: #f1f5f9; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; color: #64748b;">取消</button>
          <button id="modal-confirm" style="padding: 0.8rem 1.5rem; background: var(--theme-primary); border: none; border-radius: 10px; cursor: pointer; font-weight: 600; color: white;">确认</button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      // Animate in
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
      });

      const close = (res: boolean) => {
        overlay.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        setTimeout(() => {
          overlay.remove();
          resolve(res);
        }, 300);
      };

      modal.querySelector('#modal-cancel')?.addEventListener('click', () => close(false));
      modal.querySelector('#modal-confirm')?.addEventListener('click', () => close(true));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(false);
      });
    });
  }

  static imagePreview(url: string) {
    // Advanced Scroll Lock (Prevent jump-to-top)
    const scrollY = window.scrollY;
    const originalBodyStyle = document.body.style.cssText;
    const originalHtmlStyle = document.documentElement.style.cssText;
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll'; // Keep scrollbar to prevent layout shift

    const overlay = document.createElement('div');
    overlay.className = 'fawang-lightbox';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(30px) saturate(180%);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; cursor: default; touch-action: none;
      user-select: none;
    `;

    // Prevent default mouse gestures (context menu and drag)
    const preventGestures = (e: Event) => e.preventDefault();
    overlay.addEventListener('contextmenu', preventGestures);
    overlay.addEventListener('dragstart', preventGestures);

    const container = document.createElement('div');
    container.style.cssText = 'position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;';

    const img = document.createElement('img');
    img.src = url;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0, startY = 0;

    img.style.cssText = `
      max-width: 90%; max-height: 90%;
      border-radius: 12px; box-shadow: 0 50px 100px rgba(0,0,0,0.4);
      cursor: zoom-in; user-select: none; pointer-events: auto;
      transition: transform 0.15s ease-out;
    `;

    container.appendChild(img);
    overlay.appendChild(container);

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute; top: 1.5rem; right: 1.5rem;
      width: 44px; height: 44px; background: rgba(255,255,255,0.2);
      color: white; font-size: 1.8rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 10; transition: all 0.3s;
      backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1);
    `;
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    gsap.to(overlay, { opacity: 1, duration: 0.4 });

    const updateTransform = () => {
      img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    };

    // Zoom Logic
    overlay.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.85 : 1.15;
      const newScale = Math.min(Math.max(0.4, scale * delta), 6);
      
      const rect = img.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const ratio = newScale / scale;
      translateX -= (mouseX - rect.width / 2) * (ratio - 1);
      translateY -= (mouseY - rect.height / 2) * (ratio - 1);
      
      scale = newScale;
      img.style.cursor = scale > 1.05 ? 'move' : 'zoom-in';
      updateTransform();
    }, { passive: false });

    // Drag Logic
    img.onmousedown = (e) => {
      if (e.button !== 0) return; // Only left click
      if (scale <= 1.05) {
        scale = 2.5;
        img.style.cursor = 'move';
        updateTransform();
        return;
      }
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      img.style.transition = 'none';
    };

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        img.style.transition = 'transform 0.15s ease-out';
      }
    });

    const close = () => {
      document.body.style.cssText = originalBodyStyle;
      document.documentElement.style.cssText = originalHtmlStyle;
      window.scrollTo(0, scrollY); // Restore scroll position
      gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => overlay.remove() });
    };

    closeBtn.onclick = (e) => { e.stopPropagation(); close(); };
    overlay.onclick = (e) => { if (e.target === overlay || e.target === container) close(); };
  }

  static mediaPreview(url: string) {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
    if (!isVideo) return UI.imagePreview(url);

    const scrollY = window.scrollY;
    const originalBodyStyle = document.body.style.cssText;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(30px) saturate(180%);
      display: flex; align-items: center; justify-content: center;
      opacity: 0;
    `;

    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.style.cssText = `
      max-width: 90%; max-height: 85%;
      border-radius: 12px; box-shadow: 0 50px 100px rgba(0,0,0,0.4);
      outline: none;
    `;

    overlay.appendChild(video);

    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute; top: 1.5rem; right: 1.5rem;
      width: 44px; height: 44px; background: rgba(255,255,255,0.2);
      color: white; font-size: 1.8rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; z-index: 10; transition: all 0.3s;
      backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1);
    `;
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    gsap.to(overlay, { opacity: 1, duration: 0.4 });

    const close = () => {
      video.pause();
      document.body.style.cssText = originalBodyStyle;
      window.scrollTo(0, scrollY);
      gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => overlay.remove() });
    };

    closeBtn.onclick = (e) => { e.stopPropagation(); close(); };
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
  }
}
