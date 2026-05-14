import { BlogStore } from '../core/store';
import { UI } from '../core/ui';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number | null;
  content: string;
  timestamp: string;
  type: 'private' | 'global';
  sender_name: string;
  sender_avatar: string;
  sender_nickname?: string;
}

export class ChatUI {
  private static lastGlobalSeen: string = localStorage.getItem('chat_last_global') || '1970-01-01T00:00:00Z';
  private static lastPrivateSeen: Record<number, string> = JSON.parse(localStorage.getItem('chat_last_private') || '{}');
  private static unreadData = { global: 0, private: {} as Record<number, number> };

  static initBackgroundWatcher() {
    setInterval(() => this.checkUpdates(), 5000);
    this.checkUpdates();
  }

  private static async checkUpdates() {
    const user = BlogStore.getCurrentUser();
    if (!user) return;

    const apiHost = window.location.hostname;
    // We check for updates since the OLDEST relevant timestamp to be safe
    const res = await fetch(`http://${apiHost}:3001/api/chat/updates?since=${this.lastGlobalSeen}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('fawang_token')}` }
    });
    if (res.ok) {
      const data = await res.json();
      this.unreadData = {
        global: data.globalCount,
        private: data.privateCounts
      };
      this.updateSidebarBadges();
    }
  }

  private static formatBadge(count: number) {
    if (count <= 0) return '';
    return count > 99 ? '99+' : count.toString();
  }

  private static updateSidebarBadges() {
    const chatTrigger = document.getElementById('chat-trigger');
    const friendsTrigger = document.getElementById('friends-trigger');

    if (chatTrigger) {
      let badge = chatTrigger.querySelector('.chat-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'chat-badge';
        badge.style.cssText = 'background: #ef4444; color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 10px; margin-left: 8px; font-family: var(--font-mono);';
        chatTrigger.appendChild(badge);
      }
      const text = this.formatBadge(this.unreadData.global);
      (badge as HTMLElement).style.display = text ? 'inline-block' : 'none';
      badge.textContent = text;
    }

    if (friendsTrigger) {
      let badge = friendsTrigger.querySelector('.chat-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'chat-badge';
        badge.style.cssText = 'background: var(--accent-purple); color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 10px; margin-left: 8px; font-family: var(--font-mono);';
        friendsTrigger.appendChild(badge);
      }
      const totalPrivate = Object.values(this.unreadData.private).reduce((a, b) => a + b, 0);
      const text = this.formatBadge(totalPrivate);
      (badge as HTMLElement).style.display = text ? 'inline-block' : 'none';
      badge.textContent = text;
    }
  }

  static async openGlobalChat() {
    this.lastGlobalSeen = new Date().toISOString();
    localStorage.setItem('chat_last_global', this.lastGlobalSeen);
    this.renderChatOverlay('版聊 / Board Chat', 'global');
    this.startPolling('global');
    this.checkUpdates(); // Refresh badges
  }

  static async openFriendList() {
    const users = await this.fetchUsers();
    this.renderUserListOverlay(users);
  }

  private static async fetchUsers() {
    const apiHost = window.location.hostname;
    const res = await fetch(`http://${apiHost}:3001/api/chat/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('fawang_token')}` }
    });
    return await res.json();
  }

  private static renderChatOverlay(title: string, type: 'global' | 'private', targetId?: number) {
    if (type === 'private' && targetId) {
      this.lastPrivateSeen[targetId] = new Date().toISOString();
      localStorage.setItem('chat_last_private', JSON.stringify(this.lastPrivateSeen));
      this.checkUpdates();
    }
    // ... rest of renderChatOverlay ...
    const existing = document.getElementById('chat-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'chat-overlay';
    overlay.style.cssText = `
      position: fixed; right: 0; top: 0; bottom: 0; width: 400px;
      background: var(--card-bg); backdrop-filter: blur(25px);
      border-left: 1px solid rgba(255,255,255,0.3);
      z-index: 10000; display: flex; flex-direction: column;
      box-shadow: -10px 0 30px rgba(0,0,0,0.2);
      transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    overlay.innerHTML = `
      <div style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: var(--theme-primary); font-family: var(--font-heading);">${title}</h3>
        <button id="close-chat" style="background: none; border: none; color: #888; cursor: pointer; font-size: 1.5rem;">&times;</button>
      </div>
      <div id="chat-messages" data-lenis-prevent style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        <div style="text-align: center; color: #888; font-size: 0.8rem;">正在同步通讯频道...</div>
      </div>
      <div style="padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.05);">
        <div style="display: flex; gap: 0.5rem;">
          <textarea id="chat-input" placeholder="输入信息... (Ctrl+Enter 发送)" style="flex: 1; background: rgba(255,255,255,0.5); border: 1px solid #ddd; border-radius: 8px; padding: 0.8rem; height: 60px; resize: none; font-family: var(--font-mono); font-size: 0.9rem;"></textarea>
          <button id="send-chat" class="action-btn" style="padding: 0 1.2rem; background: var(--theme-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">发送</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.style.transform = 'translateX(0)', 10);

    const closeBtn = overlay.querySelector('#close-chat')!;
    closeBtn.onclick = () => ChatUI.close();

    const input = overlay.querySelector('#chat-input') as HTMLTextAreaElement;
    const sendBtn = overlay.querySelector('#send-chat') as HTMLButtonElement;

    const sendMessage = async () => {
      const content = input.value.trim();
      if (!content) return;
      input.value = '';
      
      if (type === 'global') {
        this.lastGlobalSeen = new Date().toISOString();
        localStorage.setItem('chat_last_global', this.lastGlobalSeen);
      } else if (targetId) {
        this.lastPrivateSeen[targetId] = new Date().toISOString();
        localStorage.setItem('chat_last_private', JSON.stringify(this.lastPrivateSeen));
      }

      const apiHost = window.location.hostname;
      const endpoint = type === 'global' ? '/api/chat/global' : `/api/chat/private/${targetId}`;
      await fetch(`http://${apiHost}:3001${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fawang_token')}`
        },
        body: JSON.stringify({ content })
      });
      this.refreshMessages(type, targetId);
    };

    sendBtn.onclick = sendMessage;
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && e.ctrlKey) sendMessage();
    };
  }

  private static renderUserListOverlay(users: any[]) {
    const existing = document.getElementById('chat-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'chat-overlay';
    overlay.style.cssText = `
      position: fixed; right: 0; top: 0; bottom: 0; width: 400px;
      background: var(--card-bg); backdrop-filter: blur(25px);
      border-left: 1px solid rgba(255,255,255,0.3);
      z-index: 10000; display: flex; flex-direction: column;
      box-shadow: -10px 0 30px rgba(0,0,0,0.2);
      transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    overlay.innerHTML = `
      <div style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: var(--theme-primary); font-family: var(--font-heading);">在线用户 / Peers</h3>
        <button id="close-chat" style="background: none; border: none; color: #888; cursor: pointer; font-size: 1.5rem;">&times;</button>
      </div>
      <div id="friends-list" data-lenis-prevent style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
        ${users.map(u => {
          const count = this.unreadData.private[u.id] || 0;
          const badgeHtml = count > 0 ? `<span style="background: var(--theme-primary); color: white; font-size: 0.65rem; padding: 2px 8px; border-radius: 10px; font-family: var(--font-mono);">${this.formatBadge(count)}</span>` : '';
          
          return `
            <div class="user-item action-btn" data-id="${u.id}" data-name="${u.nickname || u.username}" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 12px; cursor: pointer; transition: all 0.3s; background: ${count > 0 ? 'rgba(94, 114, 228, 0.05)' : 'transparent'};">
              <img src="${u.avatarUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + u.username}" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--theme-primary); object-fit: cover;">
              <div style="flex: 1;">
                <div style="font-weight: bold; font-family: var(--font-heading); display: flex; align-items: center; gap: 8px;">
                  ${u.nickname || u.username}
                  ${badgeHtml}
                </div>
                <div style="font-size: 0.7rem; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${u.bio || '无简介'}</div>
              </div>
              <div style="color: var(--theme-primary); font-size: 0.8rem;">私聊 →</div>
            </div>
          `;
        }).join('')}
        ${users.length === 0 ? '<div style="text-align: center; color: #888; padding: 2rem;">暂时没有其他用户在线</div>' : ''}
      </div>
    `;

    document.body.appendChild(overlay);
    setTimeout(() => overlay.style.transform = 'translateX(0)', 10);

    overlay.querySelector('#close-chat')!.onclick = () => ChatUI.close();

    overlay.querySelectorAll('.user-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.getAttribute('data-id')!);
        const name = item.getAttribute('data-name')!;
        this.renderChatOverlay(`与 ${name} 私聊`, 'private', id);
        this.startPolling('private', id);
      });
    });
  }

  private static startPolling(type: 'global' | 'private', targetId?: number) {
    this.stopPolling();
    this.refreshMessages(type, targetId);
    this.pollTimer = setInterval(() => this.refreshMessages(type, targetId), 3000);
  }

  static close() {
    const overlay = document.getElementById('chat-overlay');
    if (overlay) {
      overlay.style.transform = 'translateX(100%)';
      setTimeout(() => overlay.remove(), 400);
    }
    this.stopPolling();
  }

  private static stopPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = null;
  }

  private static async refreshMessages(type: 'global' | 'private', targetId?: number) {
    const apiHost = window.location.hostname;
    const endpoint = type === 'global' ? '/api/chat/global' : `/api/chat/private/${targetId}`;
    try {
      const res = await fetch(`http://${apiHost}:3001${endpoint}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('fawang_token')}` }
      });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const messages = await res.json();
      this.updateMessageUI(messages);
    } catch (e) {
      console.error("Chat sync failed:", e);
    }
  }

  private static updateMessageUI(messages: Message[]) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    if (messages.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #888; font-size: 0.8rem; margin-top: 2rem;">暂无通话记录</div>';
      return;
    }

    const currentUser = BlogStore.getCurrentUser();
    if (!currentUser) return;

    const html = messages.map(m => {
      const isMe = m.sender_id === currentUser.id;
      const senderName = m.sender_nickname || m.sender_name;
      
      return `
        <div style="display: flex; gap: 0.8rem; flex-direction: ${isMe ? 'row-reverse' : 'row'}; align-items: flex-start; margin-bottom: 0.5rem;">
          <img src="${m.sender_avatar}" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); object-fit: cover; flex-shrink: 0;">
          <div style="max-width: 80%; display: flex; flex-direction: column; align-items: ${isMe ? 'flex-end' : 'flex-start'};">
            <div style="font-size: 0.65rem; color: #888; margin-bottom: 0.2rem;">${senderName} • ${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div style="padding: 0.6rem 0.9rem; border-radius: 12px; border-top-${isMe ? 'right' : 'left'}-radius: 2px; background: ${isMe ? 'var(--theme-primary)' : 'rgba(255,255,255,0.15)'}; color: ${isMe ? 'white' : 'var(--text-main)'}; font-size: 0.85rem; box-shadow: 0 4px 15px rgba(0,0,0,0.05); word-break: break-all; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1);">
              ${m.content}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    container.innerHTML = html;
    if (atBottom) container.scrollTop = container.scrollHeight;
  }
}
