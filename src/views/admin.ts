import { BlogStore } from '../core/store';
import { hydrateUI } from '../main';
import { UI } from '../core/ui';

export function renderLogin(container: HTMLElement, onNavigate: (to: string) => void) {
  container.innerHTML = `
    <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80') center/cover; position: relative;">
      <div style="position: absolute; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(5px);"></div>
      
      <div class="post-card" style="width: 400px; text-align: center; position: relative; z-index: 10; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-radius: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.2);">
        <div style="display: flex; margin-bottom: 2rem; border-bottom: 2px solid #e2e8f0;">
          <div id="tab-login" style="flex: 1; padding: 1rem; cursor: pointer; font-weight: bold; color: var(--theme-primary); border-bottom: 2px solid var(--theme-primary); margin-bottom: -2px;">登录 / LOGIN</div>
          <div id="tab-register" style="flex: 1; padding: 1rem; cursor: pointer; font-weight: bold; color: #94a3b8;">注册 / REGISTER</div>
        </div>

        <div id="form-login">
          <input type="text" id="login-user" placeholder="Username / 账号" style="width: 100%; padding: 1rem; margin-bottom: 1rem; border: 1px solid #cbd5e1; border-radius: 8px; font-family: var(--font-mono); background: #f8fafc;">
          <input type="password" id="login-pwd" placeholder="Password / 密码" style="width: 100%; padding: 1rem; margin-bottom: 1rem; border: 1px solid #cbd5e1; border-radius: 8px; font-family: var(--font-mono); background: #f8fafc;">
          <button id="login-btn" class="action-btn" style="width: 100%; padding: 1rem; background: var(--fawang-gradient); color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(94, 114, 228, 0.4);">ACCESS_TERMINAL</button>
          <p id="login-error" style="color: #ef4444; margin-top: 1rem; display: none; font-size: 0.9rem;">Invalid Username or Password</p>
        </div>

        <div id="form-register" style="display: none; padding: 0 1rem;">
          <p style="font-size: 0.8rem; color: #888; margin-bottom: 1.5rem;">新用户注册 (Register)，提交后请联系管理员审核。</p>
          <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left;">
            <div>
              <label style="font-size: 0.75rem; color: #64748b; font-weight: 600;">用户名 (ID)</label>
              <input id="reg-user" type="text" placeholder="设置独一无二的 ID" style="width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 0.3rem;">
            </div>
            <div style="display: flex; gap: 1rem;">
              <div style="flex: 1;">
                <label style="font-size: 0.75rem; color: #64748b; font-weight: 600;">设置密码</label>
                <input id="reg-pwd" type="password" placeholder="Password" style="width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 0.3rem;">
              </div>
              <div style="flex: 1;">
                <label style="font-size: 0.75rem; color: #64748b; font-weight: 600;">确认密码</label>
                <input id="reg-pwd-confirm" type="password" placeholder="Repeat" style="width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 0.3rem;">
              </div>
            </div>
            <div>
              <label style="font-size: 0.75rem; color: #64748b; font-weight: 600;">申请理由 (Reason)</label>
              <textarea id="reg-reason" placeholder="简单说明您申请账号的原因..." style="width: 100%; padding: 0.8rem; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 0.3rem; min-height: 80px; resize: vertical;"></textarea>
            </div>
          </div>
          <button id="reg-btn" class="action-btn" style="width: 100%; padding: 1rem; background: #10b981; color: white; border: none; border-radius: 10px; margin-top: 1.5rem; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">提交注册申请</button>
          <p id="reg-error" style="color: #ef4444; font-size: 0.8rem; margin-top: 1rem; display: none;">该用户名已存在或注册受限</p>
        </div>

        <p style="margin-top: 2rem; font-size: 0.8rem; cursor: pointer; color: #64748b;" id="back-home-btn">← 返回首页</p>
      </div>
    </div>
  `;

  document.getElementById('back-home-btn')?.addEventListener('click', () => onNavigate('home'));
  
  const tabLogin = document.getElementById('tab-login')!;
  const tabRegister = document.getElementById('tab-register')!;
  const formLogin = document.getElementById('form-login')!;
  const formRegister = document.getElementById('form-register')!;

  tabLogin.addEventListener('click', () => {
    tabLogin.style.color = 'var(--theme-primary)';
    tabLogin.style.borderBottom = '2px solid var(--theme-primary)';
    tabRegister.style.color = '#94a3b8';
    tabRegister.style.borderBottom = 'none';
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
  });

  tabRegister.addEventListener('click', () => {
    tabRegister.style.color = 'var(--theme-primary)';
    tabRegister.style.borderBottom = '2px solid var(--theme-primary)';
    tabLogin.style.color = '#94a3b8';
    tabLogin.style.borderBottom = 'none';
    formRegister.style.display = 'block';
    formLogin.style.display = 'none';
  });
  
  document.getElementById('login-btn')?.addEventListener('click', async () => {
    const user = (document.getElementById('login-user') as HTMLInputElement).value;
    const pwd = (document.getElementById('login-pwd') as HTMLInputElement).value;
    const res = await BlogStore.login(user, pwd);
    if (res.success) {
      hydrateUI();
      onNavigate(BlogStore.isAdmin() ? 'admin' : 'home');
    } else {
      const errEl = document.getElementById('login-error') as HTMLElement;
      errEl.textContent = res.error || '登录失败';
      errEl.style.display = 'block';
    }
  });

  document.getElementById('reg-btn')?.addEventListener('click', async () => {
    const user = (document.getElementById('reg-user') as HTMLInputElement).value;
    const pwd = (document.getElementById('reg-pwd') as HTMLInputElement).value;
    const pwdConfirm = (document.getElementById('reg-pwd-confirm') as HTMLInputElement).value;
    const reason = (document.getElementById('reg-reason') as HTMLTextAreaElement).value;

    if (!user || !pwd) return UI.toast("请填写完整的账号和密码", 'error');
    if (pwd !== pwdConfirm) return UI.toast("两次输入的密码不一致", 'error');
    if (!reason) return UI.toast("请填写申请理由，这有助于通过审核", 'error');

    const success = await BlogStore.register(user, pwd, reason);
    if (success) {
      UI.toast("申请已提交！请联系管理员审核。", 'info');
      tabLogin.click(); // Switch to login tab
    } else {
      const errEl = document.getElementById('reg-error') as HTMLElement;
      errEl.textContent = '该用户名已存在，或您已有账号正在审核中。';
      errEl.style.display = 'block';
    }
  });
}

export function renderAdmin(container: HTMLElement, onNavigate: (to: string) => void) {
  const config = BlogStore.getConfig();
  const articles = BlogStore.getArticles();

  container.innerHTML = `
    <div id="admin-viewport" style="height: 100vh; background: transparent; padding: 2rem 0; display: flex; flex-direction: column; overflow: hidden; position: relative; z-index: 10; perspective: 2000px;">
      
      <!-- Fixed Header -->
      <div id="admin-header" style="padding: 0 4rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; transition: all 0.5s ease;">
        <div>
          <h1 style="font-family: var(--font-heading); font-size: 2.2rem; margin: 0; color: #ffffff; text-shadow: 0 0 20px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.8); letter-spacing: 1px;">管理矩阵 / <span style="color: #4cd137; text-shadow: 0 0 10px rgba(76, 209, 55, 0.5);">MATRIX</span></h1>
          <p style="color: rgba(255,255,255,1); margin-top: 0.3rem; font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 3px; font-weight: 900; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">SYSTEM_V3 // SELECT_MODULE_TO_EXPAND</p>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button id="close-admin-btn" style="padding: 0.8rem 1.8rem; background: rgba(255,255,255,0.25); color: white; border: 1px solid rgba(255,255,255,0.4); border-radius: 12px; cursor: pointer; backdrop-filter: blur(20px); font-weight: 800; transition: all 0.3s; text-shadow: 0 2px 4px rgba(0,0,0,0.3); box-shadow: 0 4px 15px rgba(0,0,0,0.2);">返回主页</button>
          <button id="logout-btn" style="padding: 0.8rem 1.8rem; background: #ff4757; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 800; box-shadow: 0 4px 15px rgba(255,71,87,0.4);">注销</button>
        </div>
      </div>

      <!-- Tile Matrix Flow -->
      <div id="admin-matrix-container" class="ba-scrollbar" style="flex: 1; display: flex; flex-flow: column wrap; gap: 1.5rem; padding: 1rem 4rem 4rem 4rem; overflow-x: auto; width: 100%; align-content: flex-start; transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);">
        
        <!-- Tile 1: Site Identity -->
        <div class="admin-tile" data-lenis-prevent data-module="identity" style="width: 280px; height: 200px; background: rgba(255,255,255,0.95); border-radius: 24px; padding: 1.5rem; cursor: pointer; position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
           <div class="tile-preview">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🆔</div>
              <h3 style="margin: 0; color: #1e293b; font-size: 1.2rem;">基础身份</h3>
              <p style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 0.8rem;">修改网站名称、作者简介...</p>
           </div>
           <div class="tile-full-content" style="display: none; opacity: 0; transition: opacity 0.4s;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                 <h2 style="margin:0; color: #1e293b;">基础身份 / IDENTITY</h2>
                 <div style="display: flex; gap: 1rem;">
                    <button class="save-card-btn action-btn" data-type="identity" style="padding: 0.6rem 1.5rem; background: var(--theme-primary); color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer;">保存修改</button>
                    <button class="close-tile-btn" style="padding: 0.6rem 1.2rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; cursor: pointer;">返回矩阵</button>
                 </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                 <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div class="input-group">
                       <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">网站标题</label>
                       <input id="cfg-siteTitle" value="${config.siteTitle}" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b; font-size: 1.1rem; font-weight: 600;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                       <div>
                          <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">作者</label>
                          <input id="cfg-authorName" value="${config.authorName}" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b;">
                       </div>
                       <div>
                          <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">头衔</label>
                          <input id="cfg-authorRole" value="${config.authorRole}" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b;">
                       </div>
                    </div>
                 </div>
                 <div>
                    <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">个人简介</label>
                    <textarea id="cfg-authorDesc" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b; min-height: 180px; resize: none; line-height: 1.6;">${config.authorDesc}</textarea>
                 </div>
              </div>
           </div>
        </div>

        <!-- Tile 2: Visuals -->
        <div class="admin-tile" data-lenis-prevent data-module="visuals" style="width: 280px; height: 200px; background: rgba(255,255,255,0.95); border-radius: 24px; padding: 1.5rem; cursor: pointer; position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
           <div class="tile-preview">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎨</div>
              <h3 style="margin: 0; color: #1e293b; font-size: 1.2rem;">视觉呈现</h3>
              <p style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 0.8rem;">背景大图、全局动态壁纸...</p>
           </div>
           <div class="tile-full-content" style="display: none; opacity: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                 <h2 style="margin:0; color: #1e293b;">视觉呈现 / VISUALS</h2>
                 <div style="display: flex; gap: 1rem;">
                    <button class="save-card-btn action-btn" data-type="visuals" style="padding: 0.6rem 1.5rem; background: #2ed573; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer;">保存</button>
                    <button class="close-tile-btn" style="padding: 0.6rem 1.2rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; cursor: pointer;">返回</button>
                 </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                 <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div>
                       <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">头像链接</label>
                       <input id="cfg-avatarUrl" value="${config.avatarUrl}" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b;">
                    </div>
                    <div>
                       <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">首页 Banner (URL/Upload)</label>
                       <div style="display: flex; gap: 0.8rem;">
                          <input id="cfg-bannerImageUrl" value="${config.bannerImageUrl || ''}" style="flex: 1; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b;">
                          <button id="cfg-banner-upload-btn" style="padding: 0 1.2rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 15px; cursor: pointer;">↑</button>
                          <input type="file" id="cfg-banner-upload" accept="image/*" style="display: none;">
                       </div>
                    </div>
                 </div>
                 <div>
                    <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">全局动态壁纸 (URL/Upload)</label>
                    <div style="display: flex; gap: 0.8rem; margin-bottom: 1.5rem;">
                       <input id="cfg-globalBackgroundUrl" value="${config.globalBackgroundUrl || ''}" style="flex: 1; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b;">
                       <button id="cfg-global-bg-upload-btn" style="padding: 0 1.2rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 15px; cursor: pointer;">↑</button>
                       <input type="file" id="cfg-global-bg-upload" accept="image/*,video/mp4,video/webm" style="display: none;">
                    </div>
                    <div>
                       <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">首页副标题</label>
                       <input id="cfg-bannerSubtitle" value="${config.bannerSubtitle || ''}" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b;">
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Tile 3: Media Center (Gallery + Assets) -->
        <div class="admin-tile" data-lenis-prevent data-module="media" style="width: 580px; height: 415px; background: rgba(255,255,255,0.95); border-radius: 24px; padding: 1.5rem; cursor: pointer; position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
           <div class="tile-preview">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🖼️</div>
              <h3 style="margin: 0; color: #1e293b; font-size: 1.2rem;">媒体中心</h3>
              <p style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 0.8rem;">照片墙设计 + 资产管理库...</p>
           </div>
           <div class="tile-full-content" style="display: none; opacity: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                 <h2 style="margin:0; color: #1e293b;">媒体中心 / MEDIA_CENTER</h2>
                 <div style="display: flex; gap: 1rem;">
                    <button id="upload-asset-btn" style="padding: 0.6rem 1.5rem; background: #3742fa; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer;">+ 上传素材</button>
                    <button class="close-tile-btn" style="padding: 0.6rem 1.2rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; cursor: pointer;">返回矩阵</button>
                    <input type="file" id="asset-upload-input" multiple style="display: none;">
                 </div>
              </div>
              
              <div style="display: flex; gap: 2rem; height: calc(100% - 100px); min-height: 0;">
                 <!-- Left: Gallery Designer -->
                 <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                       <h4 style="margin:0; color: #1e293b; font-size: 0.95rem; font-weight: 800;">1. 照片墙设计 / DESIGNER</h4>
                       <div style="display: flex; gap: 0.5rem; align-items: center;">
                          <button id="clear-gallery-btn" style="padding: 2px 8px; background: #fee2e2; color: #ef4444; border: none; border-radius: 4px; font-size: 0.6rem; cursor: pointer; font-weight: bold;">清空全部</button>
                          <span style="font-size: 0.7rem; color: #94a3b8;">拖拽素材至此排版</span>
                       </div>
                    </div>
                    <div id="gallery-designer-grid" class="ba-scrollbar" style="flex: 1; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 20px; padding: 1.5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); grid-auto-rows: min-content; gap: 1.2rem; overflow-y: auto;">
                       <!-- Gallery items -->
                    </div>
                 </div>

                 <!-- Right: Asset Library -->
                 <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                       <h4 style="margin:0; color: #1e293b; font-size: 0.95rem; font-weight: 800;">2. 媒体资产库 / LIBRARY</h4>
                       <span style="font-size: 0.7rem; color: #94a3b8;">源文件管理区</span>
                    </div>
                    <div id="asset-drop-zone" class="ba-scrollbar" style="flex: 1; background: #f8fafc; border: 2px solid #f1f5f9; border-radius: 20px; padding: 1.5rem; overflow-y: auto;">
                       <div id="asset-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1.2rem;">
                          <!-- Assets -->
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Tile 4: Home Sections -->
        <div class="admin-tile" data-lenis-prevent data-module="home-mid" style="width: 280px; height: 200px; background: rgba(255,255,255,0.95); border-radius: 24px; padding: 1.5rem; cursor: pointer; position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
           <div class="tile-preview">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🏠</div>
              <h3 style="margin: 0; color: #1e293b; font-size: 1.2rem;">首页配置</h3>
              <p style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 0.8rem;">板块标题、公告栏内容...</p>
           </div>
           <div class="tile-full-content" style="display: none; opacity: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                 <h2 style="margin:0; color: #1e293b;">首页板块 / HOME_CONFIG</h2>
                 <div style="display: flex; gap: 1rem;">
                    <button class="save-card-btn action-btn" data-type="home-mid" style="padding: 0.6rem 1.5rem; background: #ffa502; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer;">保存</button>
                    <button class="close-tile-btn" style="padding: 0.6rem 1.2rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; cursor: pointer;">返回</button>
                 </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                 <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div>
                       <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">中段板块标题</label>
                       <input id="cfg-homeMidTitle" value="${config.homeMidTitle || ''}" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b;">
                    </div>
                    <div>
                       <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">中段描述正文</label>
                       <textarea id="cfg-homeMidContent" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b; min-height: 150px; resize: none;">${config.homeMidContent || ''}</textarea>
                    </div>
                 </div>
                 <div>
                    <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">公告栏内容 (Sidebar)</label>
                    <textarea id="cfg-announcement" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b; min-height: 230px; resize: none;">${config.announcement}</textarea>
                 </div>
              </div>
           </div>
        </div>

        <!-- Tile 5: Navigation -->
        <div class="admin-tile" data-lenis-prevent data-module="navigation" style="width: 280px; height: 200px; background: rgba(255,255,255,0.95); border-radius: 24px; padding: 1.5rem; cursor: pointer; position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
           <div class="tile-preview">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔗</div>
              <h3 style="margin: 0; color: #1e293b; font-size: 1.2rem;">导航与页面</h3>
              <p style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 0.8rem;">JSON 导航链、About 页面...</p>
           </div>
           <div class="tile-full-content" style="display: none; opacity: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                 <h2 style="margin:0; color: #1e293b;">导航与页面 / NAV_PAGES</h2>
                 <div style="display: flex; gap: 1rem;">
                    <button id="save-pages-btn" style="padding: 0.6rem 1.5rem; background: #3742fa; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer;">应用更新</button>
                    <button class="close-tile-btn" style="padding: 0.6rem 1.2rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; cursor: pointer;">返回</button>
                 </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
                 <div>
                    <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">JSON 导航配置</label>
                    <textarea id="cfg-navLinks" style="width: 100%; padding: 1rem; background: #1e293b; border: none; border-radius: 15px; color: #55efc4; font-family: var(--font-mono); font-size: 0.9rem; min-height: 300px;">${config.navLinks || ''}</textarea>
                 </div>
                 <div>
                    <label style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 0.6rem; font-weight: 700;">关于页面 Markdown</label>
                    <textarea id="cfg-aboutContent" style="width: 100%; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; color: #1e293b; min-height: 300px;">${config.aboutContent || ''}</textarea>
                 </div>
              </div>
           </div>
        </div>

        <!-- Tile 6: User Management -->
        <div class="admin-tile" data-lenis-prevent data-module="users" style="width: 280px; height: 200px; background: rgba(255,255,255,0.95); border-radius: 24px; padding: 1.5rem; cursor: pointer; position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
           <div class="tile-preview">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">👥</div>
              <h3 style="margin: 0; color: #1e293b; font-size: 1.2rem;">用户管理</h3>
              <p style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 0.8rem;">成员审批、权限修改...</p>
           </div>
           <div class="tile-full-content" style="display: none; opacity: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                 <h2 style="margin:0; color: #1e293b;">成员管理 / USER_MANAGEMENT</h2>
                 <button class="close-tile-btn" style="padding: 0.6rem 1.2rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; cursor: pointer;">返回矩阵</button>
              </div>
              <div id="user-management-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; max-height: 500px; overflow-y: auto; padding: 1rem; background: #f8fafc; border-radius: 20px;">
                 <!-- User list -->
              </div>
           </div>
        </div>

        <!-- Tile 7: Article Library (Large Preview) -->
        <div class="admin-tile" data-lenis-prevent data-module="articles" style="width: 580px; height: 415px; background: rgba(255,255,255,0.95); border-radius: 24px; padding: 1.5rem; cursor: pointer; position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
           <div class="tile-preview">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">📄</div>
              <h3 style="margin: 0; color: #1e293b; font-size: 1.2rem;">文稿管理中心</h3>
              <p style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 0.8rem;">发布新章、编辑或删除已有文章...</p>
           </div>
           <div class="tile-full-content" style="display: none; opacity: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                 <h2 id="editor-title-label" style="margin:0; color: #1e293b;">稿件库 / ARTICLES</h2>
                 <div style="display: flex; gap: 1rem;">
                    <button id="new-post-btn" style="padding: 0.6rem 1.5rem; background: #2ed573; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer;">+ 撰写新章</button>
                    <button class="close-tile-btn" style="padding: 0.6rem 1.2rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; cursor: pointer;">返回矩阵</button>
                 </div>
              </div>
              
              <div style="height: calc(100% - 80px); overflow-y: auto; padding-right: 1rem;" class="ba-scrollbar">
                <div id="admin-post-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 20px; margin-bottom: 2rem;">
                  ${articles.map(a => `
                    <div style="padding: 1.2rem; background: white; border: 1px solid #f1f5f9; border-radius: 15px; display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <strong style="display: block; font-size: 1rem; color: #1e293b;">${a.title}</strong>
                        <span style="font-size: 0.75rem; color: #94a3b8; font-family: var(--font-mono);">${a.date} | ${a.category}</span>
                      </div>
                      <div style="display: flex; gap: 0.6rem;">
                        <button class="edit-post-btn" data-id="${a.id}" style="padding: 0.4rem 1rem; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-size: 0.75rem; font-weight: bold;">编辑</button>
                        <button class="delete-post-btn" data-id="${a.id}" style="padding: 0.4rem 1rem; background: #fff1f2; color: #ff4757; border: none; border-radius: 8px; cursor: pointer; font-size: 0.75rem;">删除</button>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Editor Overlay (Persistent in scroll) -->
                <div id="editor-overlay" style="display: none; border-top: 2px dashed #f1f5f9; padding-top: 2rem; padding-bottom: 2rem;">
                   <input type="hidden" id="ed-id">
                   <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem;">
                         <input id="ed-title" placeholder="文章标题" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; font-weight: bold; font-size: 1.1rem;">
                         <input id="ed-category" placeholder="分类" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px;">
                         <input id="ed-tag" placeholder="标签" style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px;">
                      </div>
                      <div>
                         <label style="font-size: 0.8rem; color: #64748b; font-weight: bold; margin-bottom: 0.5rem; display: block;">文章头图 (Cover Image URL)</label>
                         <input id="ed-thumbnail" placeholder="https://..." style="width: 100%; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px;">
                      </div>
                      <div>
                         <label style="font-size: 0.8rem; color: #64748b; font-weight: bold; margin-bottom: 0.5rem; display: block;">文章摘要</label>
                         <textarea id="ed-excerpt" style="width: 100%; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; min-height: 80px; resize: none;"></textarea>
                      </div>
                      <div style="display: flex; gap: 1rem; align-items: center; background: #f8fafc; padding: 1rem; border-radius: 12px;">
                         <button id="ed-insert-img-btn" style="padding: 0.6rem 1.2rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; cursor: pointer; font-weight: bold;">🖼️ 插入图片</button>
                         <button id="ed-preview-toggle-btn" style="padding: 0.6rem 1.2rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">👁️ 预览模式</button>
                         <button id="ed-import-md-btn" style="padding: 0.6rem 1.2rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">📄 导入 Markdown</button>
                         <input type="file" id="ed-img-upload" accept="image/*" style="display: none;">
                         <input type="file" id="ed-md-import" accept=".md,.txt" style="display: none;">
                      </div>
                      <div id="editor-main-container" style="position: relative; min-height: 500px;">
                         <textarea id="ed-content" placeholder="在此输入正文 (Markdown)..." style="width: 100%; min-height: 500px; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 15px; font-family: var(--font-mono); line-height: 1.7; transition: all 0.3s;"></textarea>
                         <div id="ed-preview-area" class="ba-scrollbar markdown-body" style="display: none; width: 100%; height: 500px; padding: 1.5rem; border: 1px solid var(--theme-primary); border-radius: 15px; background: white; overflow-y: auto;"></div>
                      </div>
                      <div style="display: flex; gap: 1rem; position: sticky; bottom: 0; background: white; padding: 1rem 0; border-top: 1px solid #eee;">
                         <button id="save-post-btn" style="flex: 1; padding: 1.2rem; background: #1e293b; color: white; border: none; border-radius: 15px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">立即发布 / UPDATE</button>
                         <button id="cancel-post-btn" style="padding: 1.2rem 2.5rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 15px; cursor: pointer;">取消</button>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </div>

        <!-- Tile 8: System Maintenance -->
        <div class="admin-tile" data-lenis-prevent data-module="system" style="width: 280px; height: 200px; background: rgba(255,255,255,0.95); border-radius: 24px; padding: 1.5rem; cursor: pointer; position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid white; box-shadow: 0 15px 35px rgba(0,0,0,0.1);">
           <div class="tile-preview">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🛡️</div>
              <h3 style="margin: 0; color: #1e293b; font-size: 1.2rem;">系统运维</h3>
              <p style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 0.8rem;">清除缓存、聊天记录物理清除...</p>
           </div>
           <div class="tile-full-content" style="display: none; opacity: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                 <h2 style="margin:0; color: #1e293b;">系统运维 / MAINTENANCE</h2>
                 <button class="close-tile-btn" style="padding: 0.6rem 1.2rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; cursor: pointer;">返回矩阵</button>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                 <div style="padding: 2rem; background: #fff1f2; border-radius: 24px;">
                    <h4 style="color: #be123c; margin-top: 0;">清空版聊数据</h4>
                    <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                       <input type="datetime-local" id="chat-del-start" style="flex:1; padding: 0.8rem; border-radius: 10px; border: 1px solid #fecaca;">
                       <input type="datetime-local" id="chat-del-end" style="flex:1; padding: 0.8rem; border-radius: 10px; border: 1px solid #fecaca;">
                    </div>
                    <button id="clear-global-chat-btn" style="width: 100%; padding: 1rem; background: #ff4757; color: white; border: none; border-radius: 15px; font-weight: bold; cursor: pointer;">物理清除</button>
                 </div>
                 <div style="padding: 2rem; background: #f8fafc; border-radius: 24px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <button id="clear-all-private-chat-btn" style="width: 100%; padding: 1.5rem; background: #1e293b; color: white; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; font-size: 1.1rem;">一键清除全域私聊数据</button>
                    <p style="margin-top: 1rem; color: #94a3b8; font-size: 0.8rem;">* 此操作不可逆，请谨慎操作</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>

    <style>
      #admin-matrix-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.3) transparent;
      }
      #admin-matrix-container::-webkit-scrollbar {
        height: 8px;
      }
      #admin-matrix-container::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.3);
        border-radius: 10px;
      }
      
      .admin-tile {
        break-inside: avoid;
        user-select: none;
      }
      
      .admin-tile:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 30px 60px rgba(0,0,0,0.15);
      }
      
      /* Focus State Logic */
      .has-focus #admin-header {
        opacity: 0.1;
        transform: translateY(-20px);
        pointer-events: none;
      }
      
      .has-focus .admin-tile:not(.focused) {
        opacity: 0.05;
        filter: blur(20px);
        transform: scale(0.7);
        pointer-events: none;
      }
      
      .admin-tile.focused {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 90vw !important;
        height: 90vh !important;
        max-width: 1400px !important;
        z-index: 1000 !important;
        cursor: default !important;
        background: white !important;
        box-shadow: 0 100px 200px rgba(0,0,0,0.6) !important;
        padding: 3rem !important;
        border: 2px solid var(--theme-primary) !important;
        overflow-y: auto !important;
      }
      
      .admin-tile.focused .tile-preview {
        display: none;
      }
      
      .admin-tile.focused .tile-full-content {
        display: block !important;
        opacity: 1 !important;
        height: 100%;
      }
      
      .admin-tile input:focus, .admin-tile textarea:focus {
        border-color: var(--theme-primary) !important;
        background: white !important;
        box-shadow: 0 0 0 4px rgba(94,114,228,0.1);
        outline: none;
      }
    </style>
  `;

  // --- Logic Extensions ---
  const matrixContainer = document.getElementById('admin-matrix-container');
  const viewport = document.getElementById('admin-viewport');

  // 1. Horizontal Scroll via Mouse Wheel (Only in Matrix mode)
  window.addEventListener('wheel', (e) => {
    // If a tile is focused, the browser should handle vertical scrolling naturally
    // thanks to data-lenis-prevent. We only intervene if we're in Matrix mode.
    if (viewport?.classList.contains('has-focus')) return; 
    
    const matrix = document.getElementById('admin-matrix-container');
    if (!matrix) return;

    // Check if we are over the matrix
    const isOverMatrix = (e.target as HTMLElement).closest('#admin-matrix-container');
    if (isOverMatrix) {
       e.preventDefault();
       matrix.scrollLeft += e.deltaY;
    }
  }, { passive: false });
  
  // 2. Focus Toggle Logic
  document.querySelectorAll('.admin-tile').forEach(tile => {
    tile.addEventListener('click', (e) => {
      if (tile.classList.contains('focused')) {
        const target = e.target as HTMLElement;
        if (target.closest('.close-tile-btn')) {
           tile.classList.remove('focused');
           viewport?.classList.remove('has-focus');
           if (matrixContainer) matrixContainer.style.overflowX = 'auto'; 
        }
        return;
      }
      tile.classList.add('focused');
      viewport?.classList.add('has-focus');
      if (matrixContainer) matrixContainer.style.overflowX = 'hidden'; 
    });
  });

  // Events
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    BlogStore.logout();
    onNavigate('home');
  });

  document.getElementById('close-admin-btn')?.addEventListener('click', () => {
    onNavigate('home');
  });

  // Banner Image Upload Logic
  const bannerUploadBtn = document.getElementById('cfg-banner-upload-btn');
  const bannerUploadInput = document.getElementById('cfg-banner-upload') as HTMLInputElement;
  const bannerUrlInput = document.getElementById('cfg-bannerImageUrl') as HTMLInputElement;

  bannerUploadBtn?.addEventListener('click', () => bannerUploadInput.click());
  bannerUploadInput?.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    bannerUploadBtn!.textContent = '上传中...';
    try {
      const apiHost = window.location.hostname;
      const res = await fetch(`http://${apiHost}:3001/api/upload?type=asset`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        bannerUrlInput.value = data.url;
        bannerUploadBtn!.textContent = '上传成功!';
        setTimeout(() => bannerUploadBtn!.textContent = '上传背景大图', 2000);
      } else {
        UI.toast('上传失败', 'error');
        bannerUploadBtn!.textContent = '上传背景大图';
      }
    } catch (err) {
      UI.toast('上传出错', 'error');
      bannerUploadBtn!.textContent = '上传背景大图';
    }
  });

  // Global Bg Upload Logic
  const globalBgUploadBtn = document.getElementById('cfg-global-bg-upload-btn');
  const globalBgUploadInput = document.getElementById('cfg-global-bg-upload') as HTMLInputElement;
  const globalBgUrlInput = document.getElementById('cfg-globalBackgroundUrl') as HTMLInputElement;

  globalBgUploadBtn?.addEventListener('click', () => globalBgUploadInput.click());
  globalBgUploadInput?.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    globalBgUploadBtn!.textContent = '上传中...';
    try {
      const apiHost = window.location.hostname;
      const res = await fetch(`http://${apiHost}:3001/api/upload?type=asset`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        globalBgUrlInput.value = data.url;
        globalBgUploadBtn!.textContent = '上传成功!';
        setTimeout(() => globalBgUploadBtn!.textContent = '上传全局壁纸', 2000);
      } else {
        UI.toast('上传失败', 'error');
        globalBgUploadBtn!.textContent = '上传全局壁纸';
      }
    } catch (err) {
      UI.toast('上传出错', 'error');
      globalBgUploadBtn!.textContent = '上传全局壁纸';
    }
  });

  // Save Config
  // Delegated Save Config for Cards
  document.querySelectorAll('.save-card-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = (btn as HTMLElement).getAttribute('data-type');
      const currentConfig = BlogStore.getConfig();
      let newConfig = { ...currentConfig };

      if (type === 'identity') {
        newConfig.siteTitle = (document.getElementById('cfg-siteTitle') as HTMLInputElement).value;
        newConfig.authorName = (document.getElementById('cfg-authorName') as HTMLInputElement).value;
        newConfig.authorRole = (document.getElementById('cfg-authorRole') as HTMLInputElement).value;
        newConfig.authorDesc = (document.getElementById('cfg-authorDesc') as HTMLTextAreaElement).value;
      } else if (type === 'visuals') {
        newConfig.avatarUrl = (document.getElementById('cfg-avatarUrl') as HTMLInputElement).value;
        newConfig.bannerImageUrl = (document.getElementById('cfg-bannerImageUrl') as HTMLInputElement).value;
        newConfig.globalBackgroundUrl = (document.getElementById('cfg-globalBackgroundUrl') as HTMLInputElement).value;
        newConfig.bannerSubtitle = (document.getElementById('cfg-bannerSubtitle') as HTMLInputElement).value;
      } else if (type === 'home-mid') {
        newConfig.homeMidTitle = (document.getElementById('cfg-homeMidTitle') as HTMLInputElement).value;
        newConfig.homeMidContent = (document.getElementById('cfg-homeMidContent') as HTMLTextAreaElement).value;
        newConfig.announcement = (document.getElementById('cfg-announcement') as HTMLTextAreaElement).value;
      }

      await BlogStore.saveConfig(newConfig);
      hydrateUI();
      UI.toast('该板块设置已更新', 'success');
    });
  });

  // Save Pages & Nav
  document.getElementById('save-pages-btn')?.addEventListener('click', () => {
    const aboutContent = (document.getElementById('cfg-aboutContent') as HTMLTextAreaElement).value;
    const navLinksStr = (document.getElementById('cfg-navLinks') as HTMLTextAreaElement).value;
    
    // Validate JSON
    try {
      JSON.parse(navLinksStr);
    } catch (e) {
      return UI.toast('导航配置 JSON 格式错误，请检查！', 'error');
    }

    const newConfig = {
      ...BlogStore.getConfig(),
      aboutContent,
      navLinks: navLinksStr
    };
    
    BlogStore.saveConfig(newConfig).then(() => {
      hydrateUI();
      UI.toast('页面与导航已成功更新', 'success');
    });
  });

  // Post Management: Use delegation for dynamic list
  const editorOverlay = document.getElementById('editor-overlay') as HTMLElement;
  const postList = document.getElementById('admin-post-list');
  
  document.getElementById('new-post-btn')?.addEventListener('click', () => {
    editorOverlay.style.display = 'block';
    const label = document.getElementById('editor-title-label');
    if (label) label.textContent = '新文章 / NEW POST';
    // clear fields
    ['ed-id', 'ed-title', 'ed-category', 'ed-tag', 'ed-thumbnail', 'ed-excerpt', 'ed-content'].forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) el.value = '';
    });
  });

  postList?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.edit-post-btn');
    if (btn) {
      const id = btn.getAttribute('data-id');
      const article = articles.find(a => a.id === id);
      if (article) {
        editorOverlay.style.display = 'block';
        const label = document.getElementById('editor-title-label');
        if (label) label.textContent = '编辑文章 / EDIT POST';
        (document.getElementById('ed-id') as HTMLInputElement).value = article.id || '';
        (document.getElementById('ed-title') as HTMLInputElement).value = article.title || '';
        (document.getElementById('ed-category') as HTMLInputElement).value = article.category || '';
        (document.getElementById('ed-tag') as HTMLInputElement).value = article.tag || '';
        (document.getElementById('ed-thumbnail') as HTMLInputElement).value = article.thumbnailUrl || '';
        (document.getElementById('ed-excerpt') as HTMLTextAreaElement).value = article.excerpt || '';
        (document.getElementById('ed-content') as HTMLTextAreaElement).value = article.content || '';
        
        // Scroll to editor
        editorOverlay.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    const delBtn = (e.target as HTMLElement).closest('.delete-post-btn');
    if (delBtn) {
       const id = delBtn.getAttribute('data-id');
       if (id) {
          UI.confirm('确认删除？').then(ok => {
             if (ok) {
                BlogStore.deleteArticle(id);
                renderAdmin(container, onNavigate);
             }
          });
       }
    }
  });

  document.getElementById('cancel-post-btn')?.addEventListener('click', () => {
    editorOverlay.style.display = 'none';
  });

  document.getElementById('save-post-btn')?.addEventListener('click', async () => {
    const id = (document.getElementById('ed-id') as HTMLInputElement).value;
    const title = (document.getElementById('ed-title') as HTMLInputElement).value;
    if (!title) return UI.toast('标题不能为空', 'error');

    const existingArticle = id ? articles.find(a => a.id === id) : null;

    BlogStore.saveArticle({
      id: id || Date.now().toString(),
      title,
      category: (document.getElementById('ed-category') as HTMLInputElement).value || '未分类',
      tag: (document.getElementById('ed-tag') as HTMLInputElement).value || '',
      thumbnailUrl: (document.getElementById('ed-thumbnail') as HTMLInputElement).value || '',
      excerpt: (document.getElementById('ed-excerpt') as HTMLTextAreaElement).value || '',
      content: (document.getElementById('ed-content') as HTMLTextAreaElement).value || '',
      date: existingArticle ? existingArticle.date : new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
      comments: existingArticle ? existingArticle.comments : []
    });
    
    // Refresh admin view
    renderAdmin(container, onNavigate);
    UI.toast('文章已保存', 'success');
  });

  // Delete buttons logic moved to delegation above


  // Assets Management
  const loadAssets = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/assets');
      if (!res.ok) throw new Error('Failed to fetch assets');
      const allAssets = await res.json();
      const config = BlogStore.getConfig();
      
      const assetGrid = document.getElementById('asset-grid');
      const designerGrid = document.getElementById('gallery-designer-grid');

      // 1. Render Full Asset Library
      if (assetGrid) {
        assetGrid.innerHTML = allAssets.map((url: string) => {
          const isVideo = url.match(/\.(mp4|webm)$/i);
          const previewContent = isVideo 
            ? `<video src="${url}" style="width: 100%; height: 120px; object-fit: cover; pointer-events: none;" preload="metadata" muted playsinline></video>`
            : `<img src="${url}" style="width: 100%; height: 120px; object-fit: cover; pointer-events: none;" draggable="false">`;
            
          return `
            <div class="asset-source-item" draggable="true" data-url="${url}" style="border: 1px solid #eee; border-radius: 12px; overflow: hidden; position: relative; cursor: pointer; user-select: none; background: #fff; transition: all 0.3s ease;">
              ${previewContent}
              <div style="padding: 0.6rem; background: #f8fafc; font-size: 0.7rem; color: #64748b; display: flex; flex-direction: column; gap: 0.4rem;">
                 <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold;">${url.split('/').pop()}</div>
                 <button class="copy-asset-url-btn" data-url="${url}" style="padding: 0.3rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.65rem; cursor: pointer; color: var(--theme-primary); font-weight: bold;">复制链接</button>
              </div>
              <button class="delete-asset-btn" data-url="${url}" style="position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; background: rgba(239,68,68,0.9); color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">×</button>
            </div>
          `;
        }).join('');

        // Show delete button on card hover
        assetGrid.querySelectorAll('.asset-source-item').forEach(item => {
          const delBtn = item.querySelector('.delete-asset-btn') as HTMLElement;
          if (delBtn) {
            item.addEventListener('mouseenter', () => delBtn.style.opacity = '1');
            item.addEventListener('mouseleave', () => delBtn.style.opacity = '0');
          }
        });
      }

      // 2. Render Gallery Designer (Strictly based on galleryOrder)
      if (designerGrid) {
        let galleryUrls: string[] = [];
        try {
          galleryUrls = JSON.parse(config.galleryOrder || '[]');
        } catch (e) { galleryUrls = []; }

        // Filter out URLs that no longer exist
        galleryUrls = galleryUrls.filter(u => allAssets.includes(u));

        designerGrid.innerHTML = galleryUrls.map((url, index) => `
          <div class="gallery-drag-item" draggable="true" data-url="${url}" style="position: relative; aspect-ratio: 1; overflow: hidden; border-radius: 8px; border: 2px solid var(--theme-primary); cursor: move; user-select: none;">
            <img src="${url}" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;" draggable="false">
            <div style="position: absolute; top: 0; left: 0; background: var(--theme-primary); color: white; padding: 2px 6px; font-size: 10px;">${index + 1}</div>
            <button class="remove-gallery-item-btn" data-url="${url}" style="position: absolute; top: 2px; right: 2px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; font-size: 10px; display: flex; align-items: center; justify-content: center;">×</button>
          </div>
        `).join('');

        if (galleryUrls.length === 0) {
          designerGrid.innerHTML = `<div style="grid-column: 1/-1; padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.9rem;">目前照片墙为空。从下方的资产库中「拖拽图片」到这里来添加。</div>`;
        }

        initDesignerInteractions(designerGrid);
      }

      attachAssetListeners();

    } catch (err) {
      console.error('Failed to load assets', err);
    }
  };

  const initDesignerInteractions = (grid: HTMLElement) => {
    let draggedItem: HTMLElement | null = null;

    // 1. Reordering within designer
    grid.querySelectorAll('.gallery-drag-item').forEach(item => {
      const el = item as HTMLElement;
      el.addEventListener('dragstart', (e) => {
        draggedItem = el;
        e.dataTransfer?.setData('text/plain', el.getAttribute('data-url') || '');
        el.style.opacity = '0.5';
      });

      el.addEventListener('dragend', () => {
        el.style.opacity = '1';
        saveGalleryOrder();
      });

      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetItem = (e.target as HTMLElement).closest('.gallery-drag-item') as HTMLElement;
        if (targetItem && targetItem !== draggedItem && draggedItem?.classList.contains('gallery-drag-item')) {
          const rect = targetItem.getBoundingClientRect();
          const next = (e.clientX - rect.left) / (rect.right - rect.left) > 0.5;
          grid.insertBefore(draggedItem!, next ? targetItem.nextSibling : targetItem);
        }
      });
    });

    // 2. Drop from Asset Library
    grid.addEventListener('dragover', (e) => {
      e.preventDefault();
      grid.style.background = 'rgba(99, 102, 241, 0.05)';
    });

    grid.addEventListener('dragleave', () => {
      grid.style.background = 'transparent';
    });

    grid.addEventListener('drop', (e) => {
      e.preventDefault();
      grid.style.background = 'transparent';
      const url = e.dataTransfer?.getData('text/plain');
      if (url && !Array.from(grid.querySelectorAll('.gallery-drag-item')).some(el => el.getAttribute('data-url') === url)) {
        // Only if it's a new drop from outside
        if (!grid.querySelector(`[data-url="${url}"]`)) {
          const newItem = document.createElement('div');
          newItem.className = 'gallery-drag-item';
          newItem.draggable = true;
          newItem.setAttribute('data-url', url);
          newItem.style.cssText = 'position: relative; aspect-ratio: 1; overflow: hidden; border-radius: 8px; border: 2px solid var(--theme-primary); cursor: move; user-select: none;';
          newItem.innerHTML = `
            <img src="${url}" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;" draggable="false">
            <div style="position: absolute; top: 0; left: 0; background: var(--theme-primary); color: white; padding: 2px 6px; font-size: 10px;">?</div>
            <button class="remove-gallery-item-btn" data-url="${url}" style="position: absolute; top: 2px; right: 2px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; cursor: pointer; font-size: 10px; display: flex; align-items: center; justify-content: center;">×</button>
          `;
          grid.appendChild(newItem);
          saveGalleryOrder();
          loadAssets(); // Re-init to attach reorder listeners
        }
      }
    });

    // 3. Remove from Gallery button
    grid.querySelectorAll('.remove-gallery-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = (e.target as HTMLElement).closest('.gallery-drag-item');
        if (item) {
          item.remove();
          saveGalleryOrder();
        }
      });
    });

    document.getElementById('clear-gallery-btn')?.addEventListener('click', async () => {
       if (await UI.confirm('确定要清空照片墙的所有选定图片吗？')) {
          grid.innerHTML = '';
          saveGalleryOrder();
          loadAssets();
       }
    });
  };

  const saveGalleryOrder = () => {
    const designerGrid = document.getElementById('gallery-designer-grid');
    if (!designerGrid) return;
    const urls = Array.from(designerGrid.querySelectorAll('.gallery-drag-item')).map(el => el.getAttribute('data-url'));
    const newConfig = {
      ...BlogStore.getConfig(),
      galleryOrder: JSON.stringify(urls)
    };
    BlogStore.saveConfig(newConfig).then(() => {
      designerGrid.querySelectorAll('.gallery-drag-item').forEach((el, i) => {
        const label = el.querySelector('div');
        if (label) label.textContent = (i + 1).toString();
      });
    });
  };

  const attachAssetListeners = () => {
    // Prevent default drag halo on the whole page for a cleaner feel
    document.addEventListener('dragover', (e) => e.preventDefault(), false);
    document.addEventListener('drop', (e) => e.preventDefault(), false);

    document.querySelectorAll('.asset-source-item').forEach(item => {
      // Drag for gallery designer
      item.addEventListener('dragstart', (e: any) => {
        const url = (e.target as HTMLElement).closest('.asset-source-item')?.getAttribute('data-url');
        e.dataTransfer.setData('text/plain', url || '');
        e.dataTransfer.effectAllowed = 'copy';
      });

      // Click to preview
      item.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.delete-asset-btn') || target.closest('.copy-asset-url-btn')) return;
        const url = (item as HTMLElement).getAttribute('data-url');
        if (url) UI.mediaPreview(url);
      });
    });

    document.querySelectorAll('.copy-asset-url-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = (btn as HTMLElement).getAttribute('data-url');
        if (url) {
          navigator.clipboard.writeText(url).then(() => {
            UI.toast('链接已复制到剪贴板', 'success');
          });
        }
      });
    });

    document.querySelectorAll('.delete-asset-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = (e.currentTarget as HTMLElement).getAttribute('data-url');
        if (url && await UI.confirm('确定要永久物理删除这个文件吗？')) {
          const filename = url.split('/').pop();
          try {
            const token = localStorage.getItem('fawang_token');
            const apiHost = window.location.hostname;
            const delRes = await fetch(`http://${apiHost}:3001/api/assets/${filename}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (delRes.ok) {
              loadAssets();
              UI.toast('文件已成功物理删除', 'success');
            } else {
              UI.toast('删除失败', 'error');
            }
          } catch (err) {
            UI.toast('删除出错', 'error');
          }
        }
      });
    });
  };

  // Chat Moderation Listeners
  const getDelParams = () => {
    const start = (document.getElementById('chat-del-start') as HTMLInputElement).value;
    const end = (document.getElementById('chat-del-end') as HTMLInputElement).value;
    let params = '';
    if (start) params += `&startDate=${new Date(start).toISOString()}`;
    if (end) params += `&endDate=${new Date(end).toISOString()}`;
    return params;
  };

  document.getElementById('clear-global-chat-btn')?.addEventListener('click', async () => {
    if (await UI.confirm('确定要永久删除选定时间段内的所有版聊记录吗？')) {
      const apiHost = window.location.hostname;
      const res = await fetch(`http://${apiHost}:3001/api/admin/chat?type=global${getDelParams()}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fawang_token')}` }
      });
      const data = await res.json();
      if (res.ok) UI.toast(`已清理 ${data.count} 条记录`, 'success');
    }
  });

  document.getElementById('clear-targeted-private-btn')?.addEventListener('click', async () => {
    const userA = (document.getElementById('chat-del-user-a') as HTMLInputElement).value;
    const userB = (document.getElementById('chat-del-user-b') as HTMLInputElement).value;
    if (!userA || !userB) return UI.toast("请填入两个用户的 ID", 'error');
    
    if (await UI.confirm(`确定要清空 ID ${userA} 与 ID ${userB} 之间的私聊记录吗？`)) {
      const apiHost = window.location.hostname;
      const res = await fetch(`http://${apiHost}:3001/api/admin/chat?type=private&userId=${userA}&targetUserId=${userB}${getDelParams()}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fawang_token')}` }
      });
      const data = await res.json();
      if (res.ok) UI.toast(`已清理 ${data.count} 条记录`, 'success');
    }
  });

  document.getElementById('clear-all-private-chat-btn')?.addEventListener('click', async () => {
    if (await UI.confirm('确定要清空全站私聊记录吗？(含时间过滤)')) {
      const apiHost = window.location.hostname;
      const res = await fetch(`http://${apiHost}:3001/api/admin/chat?type=all_private${getDelParams()}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fawang_token')}` }
      });
      const data = await res.json();
      if (res.ok) UI.toast(`已清理 ${data.count} 条记录`, 'success');
    }
  });

  // Load Users (Updated with chat clearing)
  const loadUsers = async () => {
    const list = document.getElementById('user-management-list');
    if (!list) return;

    try {
      const token = localStorage.getItem('fawang_token');
      const apiHost = window.location.hostname;
      const url = `http://${apiHost}:3001/api/admin/users`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = await res.json();

      list.innerHTML = users.map((u: any) => `
        <div style="display: flex; flex-direction: column; padding: 1.2rem; border: 1px solid #f1f5f9; border-radius: 12px; background: #fff; gap: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <img src="${u.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + u.username}" style="width: 45px; height: 45px; border-radius: 50%; border: 1px solid #eee;">
              <div>
                <div style="font-weight: bold; font-size: 1rem; color: #1e293b;">${u.nickname || u.username} <span style="font-weight: normal; color: #94a3b8; font-size: 0.8rem;">(ID: ${u.id} | @${u.username})</span></div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.3rem;">
                  <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${u.role === 'admin' ? '#fef3c7' : '#f1f5f9'}; color: ${u.role === 'admin' ? '#92400e' : '#64748b'}; font-weight: bold;">${u.role.toUpperCase()}</span>
                  <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${u.status === 'approved' ? '#dcfce7' : '#fee2e2'}; color: ${u.status === 'approved' ? '#166534' : '#991b1b'}; font-weight: bold;">${u.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              ${u.status === 'pending' ? `
                <button class="approve-user-btn action-btn" data-id="${u.id}" style="padding: 0.5rem 1rem; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">批准</button>
              ` : `
                ${u.role !== 'admin' ? `<button class="delete-user-btn action-btn" data-id="${u.id}" style="padding: 0.5rem 1rem; background: #f8fafc; color: #ef4444; border: 1px solid #fee2e2; border-radius: 8px; cursor: pointer; font-size: 0.85rem;">注销</button>` : ''}
              `}
            </div>
          </div>
        </div>
      `).join('');

      // Attach Listeners
      // (clear-user-chat-btn listener removed)

      // Attach Listeners
      list.querySelectorAll('.approve-user-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = (e.target as HTMLElement).getAttribute('data-id');
          if (id) {
            const apiHost = window.location.hostname;
            const res = await fetch(`http://${apiHost}:3001/api/admin/users/${id}/status`, {
              method: 'PUT',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'approved' })
            });
            if (res.ok) {
              UI.toast('用户已批准', 'success');
              loadUsers();
            }
          }
        });
      });

      list.querySelectorAll('.reject-user-btn, .delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = (e.target as HTMLElement).getAttribute('data-id');
          const isReject = (e.target as HTMLElement).classList.contains('reject-user-btn');
          const msg = isReject ? '确认驳回该申请并删除账号？' : '确认永久删除该用户？';
          
          if (id && await UI.confirm(msg)) {
            const apiHost = window.location.hostname;
            const res = await fetch(`http://${apiHost}:3001/api/admin/users/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              UI.toast(isReject ? '申请已驳回' : '用户已删除', 'success');
              loadUsers();
            }
          }
        });
      });

    } catch (err) {
      list.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">加载失败: ${err}</div>`;
    }
  };

  loadUsers();
  loadAssets();

  // --- Batch Upload Helper ---
  const uploadFiles = async (files: FileList | File[]) => {
    const btn = document.getElementById('upload-asset-btn') as HTMLButtonElement;
    const total = files.length;
    let done = 0;
    btn.textContent = `上传中 0/${total}...`;
    btn.disabled = true;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const apiHost = window.location.hostname;
        await fetch(`http://${apiHost}:3001/api/upload?type=asset`, { method: 'POST', body: formData });
      } catch (err) { console.error(err); }
      done++;
      btn.textContent = `上传中 ${done}/${total}...`;
    }
    btn.textContent = '+ 批量上传';
    btn.disabled = false;
    loadAssets();
    UI.toast(`${done} 个文件上传完成`, 'success');
  };

  // --- Click Upload (batch) ---
  const fileInput = document.getElementById('asset-upload-input') as HTMLInputElement;
  document.getElementById('upload-asset-btn')?.addEventListener('click', () => fileInput.click());
  fileInput?.addEventListener('change', async () => {
    if (fileInput.files && fileInput.files.length > 0) {
      await uploadFiles(fileInput.files);
      fileInput.value = '';
    }
  });

  // --- Drag & Drop Upload to Asset Zone ---
  const dropZone = document.getElementById('asset-drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = '#6366f1';
      dropZone.style.background = 'rgba(99,102,241,0.05)';
    });
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'transparent';
      dropZone.style.background = '';
    });
    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = 'transparent';
      dropZone.style.background = '';
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) await uploadFiles(files);
    });
  }

  // --- Markdown Import ---
  document.getElementById('ed-import-md-btn')?.addEventListener('click', () => {
    (document.getElementById('ed-md-import') as HTMLInputElement)?.click();
  });
  document.getElementById('ed-md-import')?.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      (document.getElementById('ed-content') as HTMLTextAreaElement).value = reader.result as string;
      UI.toast('Markdown 已导入', 'success');
    };
    reader.readAsText(file);
    (e.target as HTMLInputElement).value = '';
  });

  // --- Insert Image into Editor ---
  document.getElementById('ed-insert-img-btn')?.addEventListener('click', () => {
    (document.getElementById('ed-img-upload') as HTMLInputElement)?.click();
  });
  document.getElementById('ed-img-upload')?.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    UI.toast('图片上传中...', 'info');
    try {
      const apiHost = window.location.hostname;
      const res = await fetch(`http://${apiHost}:3001/api/upload?type=asset`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        const textarea = document.getElementById('ed-content') as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        // Sanitize alt text (remove brackets to avoid Markdown confusion)
        const safeAlt = file.name.replace(/[\[\]]/g, '');
        const imgMd = `\n![${safeAlt}](${data.url})\n`;
        
        textarea.value = text.substring(0, start) + imgMd + text.substring(end);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + imgMd.length;
        UI.toast('图片已成功插入正文', 'success');
      }
    } catch (err) { UI.toast('图片上传失败', 'error'); }
    (e.target as HTMLInputElement).value = '';
  });

  // --- Preview Toggle ---
  const previewToggle = document.getElementById('ed-preview-toggle-btn');
  const edContent = document.getElementById('ed-content') as HTMLTextAreaElement;
  const edPreview = document.getElementById('ed-preview-area') as HTMLElement;
  let isPreview = false;

  previewToggle?.addEventListener('click', async () => {
    isPreview = !isPreview;
    if (isPreview) {
       previewToggle.textContent = '✏️ 编辑模式';
       edContent.style.display = 'none';
       edPreview.style.display = 'block';
       
       const { micromark } = await import('micromark');
       edPreview.innerHTML = micromark(edContent.value);
    } else {
       previewToggle.textContent = '👁️ 预览模式';
       edContent.style.display = 'block';
       edPreview.style.display = 'none';
    }
  });
}



function showCropModal(imgUrl: string, onCrop: (blob: Blob) => void) {
  // Lock Scroll
  const scrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 11000;
    background: rgba(0,0,0,0.85); backdrop-filter: blur(15px);
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: var(--card-bg); width: 90%; max-width: 500px;
    border-radius: 24px; padding: 2rem; position: relative;
    transform: scale(0.9); box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  `;

  modal.innerHTML = `
    <h3 style="margin-bottom: 0.5rem; text-align: center; color: var(--theme-primary);">裁剪头像 / CROP AVATAR</h3>
    <p style="font-size: 0.8rem; color: #888; text-align: center; margin-bottom: 1.5rem;">拖动图片以对齐圆形区域，滚轮可缩放</p>
    
    <div id="crop-container" style="width: 100%; aspect-ratio: 1; position: relative; overflow: hidden; border-radius: 12px; background: #000; cursor: move;">
      <img id="crop-img" src="${imgUrl}" style="position: absolute; transition: none; user-select: none; pointer-events: none; transform-origin: center;">
      <div style="position: absolute; inset: 0; border: 2px solid var(--theme-primary); border-radius: 50%; pointer-events: none; box-shadow: 0 0 0 9999px rgba(0,0,0,0.6);"></div>
    </div>

    <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
      <button id="crop-cancel" class="action-btn" style="flex: 1; padding: 0.8rem; background: #f1f5f9; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; color: #64748b;">取消</button>
      <button id="crop-confirm" class="action-btn" style="flex: 1; padding: 0.8rem; background: var(--theme-primary); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold;">确认裁剪</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  import('gsap').then(({ default: gsap }) => {
    gsap.to(overlay, { opacity: 1, duration: 0.3 });
    gsap.to(modal, { scale: 1, duration: 0.4, ease: 'back.out(1.7)' });
  });

  const cropImg = modal.querySelector('#crop-img') as HTMLImageElement;
  const cropContainer = modal.querySelector('#crop-container') as HTMLElement;
  
  let posX = 0, posY = 0;
  let zoom = 1;
  let isDragging = false;
  let startX = 0, startY = 0;

  const updateTransform = () => {
    cropImg.style.transform = `translate(${posX}px, ${posY}px) scale(${zoom})`;
  };

  cropContainer.onmousedown = (e) => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  };

  window.onmousemove = (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
  };

  window.onmouseup = () => isDragging = false;

  // Zoom Logic
  cropContainer.onwheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    zoom = Math.max(0.01, Math.min(20, zoom + delta));
    updateTransform();
  };

  const close = () => {
    // Unlock Scroll
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);

    import('gsap').then(({ default: gsap }) => {
      gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => overlay.remove() });
    });
    window.onmousemove = null;
    window.onmouseup = null;
  };

  modal.querySelector('#crop-cancel')?.addEventListener('click', close);
  modal.querySelector('#crop-confirm')?.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const rect = cropContainer.getBoundingClientRect();
      const imgRect = cropImg.getBoundingClientRect();
      
      const ratio = cropImg.naturalWidth / imgRect.width;
      const sx = (rect.left - imgRect.left) * ratio;
      const sy = (rect.top - imgRect.top) * ratio;
      const sw = rect.width * ratio;
      const sh = rect.height * ratio;
      
      ctx.drawImage(cropImg, sx, sy, sw, sh, 0, 0, 400, 400);
      canvas.toBlob((blob) => {
        if (blob) {
          onCrop(blob);
          close();
        }
      }, 'image/jpeg', 0.9);
    }
  });
}

export function renderProfile(container: HTMLElement, onNavigate: (to: string) => void) {
  const user = BlogStore.getCurrentUser();
  if (!user) return onNavigate('login');

  container.innerHTML = `
    <div style="min-height: 100%; padding-bottom: 5rem; background: var(--bg-color); padding: 2rem; display: flex; justify-content: center; align-items: flex-start;">
      <div class="post-card" style="width: 100%; max-width: 600px; padding: 2rem; margin-top: 5vh; cursor: default;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h2 style="color: var(--theme-primary);">个人主页 / PROFILE</h2>
          <button id="prof-back-btn" class="action-btn" style="padding: 0.5rem 1rem; background: #eee; color: #333; border: none; border-radius: 4px; cursor: pointer;">返回首页</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="${user.avatarUrl}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--theme-primary);">
            <div>
              <p style="font-weight: bold; font-size: 1.2rem; margin: 0;">${user.username}</p>
              <span class="github-badge" style="margin-top: 0.5rem;"><span class="label">ROLE</span><span class="value" style="background:#2dce89">${user.role.toUpperCase()}</span></span>
            </div>
          </div>

          <div>
            <label style="font-size: 0.8rem; color: #888;">自定义头像</label>
            <div style="display: flex; gap: 1rem; margin-top: 0.5rem; align-items: center;">
              <input type="file" id="prof-avatar-upload" accept="image/*" style="display: none;">
              <button id="prof-upload-btn" class="action-btn" style="padding: 0.5rem 1rem; background: #e2e8f0; color: #334155; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">上传本地图片</button>
              <input id="prof-avatar" value="${user.avatarUrl || ''}" placeholder="或直接输入网络图片 URL" style="flex: 1; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;">
            </div>
          </div>
          
          <div>
            <label style="font-size: 0.8rem; color: #888;">显示昵称</label>
            <input id="prof-nickname" value="${user.nickname || user.username}" style="width: 100%; padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; margin-top: 0.5rem;">
          </div>
          
          <div>
            <label style="font-size: 0.8rem; color: #888;">个人简介</label>
            <textarea id="prof-bio" style="width: 100%; padding: 0.8rem; border: 1px solid #ccc; border-radius: 4px; min-height: 100px; margin-top: 0.5rem;">${user.bio || ''}</textarea>
          </div>

          <button id="save-prof-btn" class="action-btn" style="padding: 1rem; background: var(--theme-primary); color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 1rem;">保存更改 / UPDATE</button>
          
          <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px dashed #e2e8f0; display: flex; flex-direction: column; gap: 1rem;">
            <p style="font-size: 0.8rem; color: #64748b; text-align: center;">需要切换账号或退出系统？</p>
            <button id="profile-logout-btn" class="action-btn" style="padding: 1rem; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">安全退出 / LOGOUT</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('prof-back-btn')?.addEventListener('click', () => onNavigate('home'));
  document.getElementById('profile-logout-btn')?.addEventListener('click', () => {
    BlogStore.logout();
    onNavigate('login');
  });

  const uploadBtn = document.getElementById('prof-upload-btn') as HTMLButtonElement;
  const uploadInput = document.getElementById('prof-avatar-upload') as HTMLInputElement;
  const urlInput = document.getElementById('prof-avatar') as HTMLInputElement;
  
  uploadBtn?.addEventListener('click', () => uploadInput.click());
  uploadInput?.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Show Cropping Modal
    const reader = new FileReader();
    reader.onload = (re) => {
      const imgUrl = re.target?.result as string;
      showCropModal(imgUrl, async (croppedBlob) => {
        const formData = new FormData();
        formData.append('file', croppedBlob, 'avatar.jpg');
        
        uploadBtn!.textContent = '上传中...';
        try {
          const apiHost = window.location.hostname;
          const res = await fetch(`http://${apiHost}:3001/api/upload?type=user`, { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) {
            urlInput.value = data.url;
            UI.toast("头像已裁剪并上传", 'success');
          }
        } catch (err) {
          UI.toast("上传失败", 'error');
        } finally {
          uploadBtn!.textContent = '上传本地图片';
        }
      });
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('save-prof-btn')?.addEventListener('click', () => {
    BlogStore.updateUserProfile(user.username, {
      avatarUrl: urlInput.value,
      nickname: (document.getElementById('prof-nickname') as HTMLInputElement).value,
      bio: (document.getElementById('prof-bio') as HTMLTextAreaElement).value
    }).then(() => {
      UI.toast('个人信息已更新', 'success');
      import('../main').then(m => m.hydrateUI());
    });
  });
}
