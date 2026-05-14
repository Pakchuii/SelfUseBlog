export function initGlobalBackground(containerId: string, url: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  
  if (!url) {
    container.style.background = 'var(--bg-color)';
    return;
  }

  const isVideo = url.match(/\.(mp4|webm)$/i);
  
  if (isVideo) {
    const video = document.createElement('video');
    video.src = url;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: cover; z-index: -1; pointer-events: none; transform: translateZ(0); backface-visibility: hidden;';
    container.appendChild(video);
  } else {
    const img = document.createElement('div');
    img.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: url("${url}") center/cover no-repeat; z-index: -1; pointer-events: none;`;
    container.appendChild(img);
  }
}
