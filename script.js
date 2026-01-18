class LinksDirectory {
    constructor() {
        this.linksData = [];
        this.filteredLinks = [];
        this.init();
    }

    async init() {
        await this.loadLinks();
        this.renderCategories();
        this.setupEventListeners();
        this.updateStats();
    }

    async loadLinks() {
        try {
            const response = await fetch('data/links.json');
            this.linksData = await response.json();
            this.filteredLinks = [...this.linksData.categories];
        } catch (error) {
            console.error('Error loading links:', error);
            document.getElementById('categoriesContainer').innerHTML = 
                '<div class="error">❌ Failed to load links data</div>';
        }
    }

    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        container.innerHTML = '';

        this.filteredLinks.forEach(category => {
            const categoryElement = this.createCategoryElement(category);
            container.appendChild(categoryElement);
        });
    }

    createCategoryElement(category) {
        const div = document.createElement('div');
        div.className = 'category';
        div.style.borderTop = `5px solid ${category.color}`;
        
        div.innerHTML = `
            <div class="category-header">
                <span class="category-icon">${category.icon}</span>
                <div class="category-title">${category.name}</div>
            </div>
            <div class="links-grid">
                ${category.links.map(link => this.createLinkCard(link, category.color)).join('')}
            </div>
        `;

        return div;
    }

    createLinkCard(link, color) {
        return `
            <div class="link-card" onclick="window.open('${link.url}', '_blank')">
                <div class="link-name">${link.name}</div>
                <div class="link-url">${this.formatUrl(link.url)}</div>
                <div class="link-desc">${link.description}</div>
            </div>
        `;
    }

    formatUrl(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        searchInput.addEventListener('input', (e) => this.searchLinks(e.target.value));
        searchBtn.addEventListener('click', () => this.searchLinks(searchInput.value));
        
        // Enter key support
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLinks(searchInput.value);
            }
        });
    }

    searchLinks(query) {
        const q = query.toLowerCase().trim();
        
        if (!q) {
            this.filteredLinks = [...this.linksData.categories];
        } else {
            this.filteredLinks = this.linksData.categories
                .map(category => ({
                    ...category,
                    links: category.links.filter(link => 
                        link.name.toLowerCase().includes(q) ||
                        link.description.toLowerCase().includes(q) ||
                        link.url.toLowerCase().includes(q)
                    )
                }))
                .filter(category => category.links.length > 0);
        }
        
        this.renderCategories();
        this.updateStats();
    }

    updateStats() {
        const totalLinks = this.linksData.categories.reduce((sum, cat) => sum + cat.links.length, 0);
        const visibleCategories = this.filteredLinks.length;
        const visibleLinks = this.filteredLinks.reduce((sum, cat) => sum + cat.links.length, 0);
        
        document.getElementById('totalLinks').textContent = visibleLinks;
        document.getElementById('totalCategories').textContent = visibleCategories;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LinksDirectory();
});
            <div class="channel-card ${channel.id === 'mmtv' ? 'active' : ''}" data-id="${channel.id}">
                <div class="channel-icon">${channel.logo}</div>
                <div class="channel-title">${channel.name}</div>
                <div class="channel-category">${channel.category.toUpperCase()}</div>
                <div class="channel-status">
                    <div class="status-dot"></div>
                    <span>${channel.status.toUpperCase()}</span>
                </div>
            </div>
        `).join('');
    }

    renderSidebar() {
        const list = document.getElementById('channelsList');
        list.innerHTML = this.channels.map(channel => `
            <div class="channel-item" data-id="${channel.id}">
                <span>${channel.logo} ${channel.name}</span>
                <i class="fas fa-star favorite-btn" data-id="${channel.id}"></i>
            </div>
        `).join('');
    }

    initPlayer() {
        const video = document.getElementById('mainPlayer');
        this.player = videojs(video, {
            fluid: true,
            responsive: true,
            playbackRates: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
            html5: {
                vhs: {
                    overrideNative: !videojs.browser.IS_SAFARI,
                    withCredentials: false,
                    bandwidth: 2000000,
                    limitRenditionByPlayerDimensions: true
                }
            }
        });

        if (Hls.isSupported()) {
            this.player.ready(() => {
                const videoEl = this.player.el().querySelector('video');
                this.hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90,
                    maxBufferLength: 60,
                    liveSyncDurationCount: 3
                });
                this.hls.attachMedia(videoEl);
            });
        }
    }

    loadChannel(channelId) {
        const channel = this.channels.find(c => c.id === channelId);
        if (!channel) return;

        // Update UI
        document.querySelectorAll('.channel-card.active, .channel-item.active').forEach(el => el.classList.remove('active'));
        document.querySelector(`[data-id="${channelId}"]`).classList.add('active');
        
        document.getElementById('heroTitle').textContent = channel.name;
        document.getElementById('currentChannelName').textContent = channel.name;
        document.getElementById('heroDesc').textContent = `${channel.category.toUpperCase()} - ${channel.status.toUpperCase()}`;

        // Load stream
        this.player.src({
            src: channel.url,
            type: 'application/x-mpegURL'
        });

        this.player.play();
    }

    loadFeaturedChannel() {
        this.initPlayer();
        this.loadChannel('mmtv');
    }

    bindEvents() {
        // Channel clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.channel-card')) {
                const channelId = e.target.closest('.channel-card').dataset.id;
                this.loadChannel(channelId);
            }
            
            if (e.target.closest('.favorite-btn')) {
                const channelId = e.target.dataset.id;
                this.toggleFavorite(channelId, e.target);
            }
        });

        // Sidebar toggle
        document.getElementById('gridToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        document.getElementById('closeSidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('active');
        });

        // Direct URL
        document.getElementById('loadDirect').addEventListener('click', () => {
            const url = document.getElementById('directUrl').value.trim();
            if (url) {
                this.player.src({ src: url, type: 'application/x-mpegURL' });
                this.player.play();
            }
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterChannels(e.target.value);
        });

        // Theater mode
        document.getElementById('theaterBtn').addEventListener('click', () => {
            document.body.classList.toggle('theater-mode');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.player.paused() ? this.player.play() : this.player.pause();
            }
            if (e.code === 'KeyF') {
                document.documentElement.requestFullscreen();
            }
            if (e.code === 'KeyS') {
                document.getElementById('sidebar').classList.toggle('active');
            }
        });

        // Player events
        this.player.on('loadstart', () => this.updateStatus('🔄 Loading...'));
        this.player.on('playing', () => this.updateStatus('▶️ Playing'));
        this.player.on('error', () => this.updateStatus('❌ Stream Error'));
        this.player.on('waiting', () => this.updateStatus('⏳ Buffering...'));
    }

    toggleFavorite(channelId, btn) {
        if (this.favorites.has(channelId)) {
            this.favorites.delete(channelId);
            btn.style.color = '#666';
        } else {
            this.favorites.add(channelId);
            btn.style.color = '#ffd700';
        }
    }

    filterChannels(query) {
        const cards = document.querySelectorAll('.channel-card');
        cards.forEach(card => {
            const name = card.querySelector('.channel-title').textContent.toLowerCase();
            card.style.display = name.includes(query.toLowerCase()) ? 'block' : 'none';
        });
    }

    updateStatus(message) {
        const statusEl = document.querySelector('.hero-badge');
        statusEl.textContent = message;
        statusEl.style.background = message.includes('Error') ? '#ef4444' : 
                                   message.includes('Loading') ? '#f59e0b' : '#10b981';
    }
}

// Initialize Premium Player
document.addEventListener('DOMContentLoaded', () => {
    new PremiumIPTV();
});
        });
    }
}

// Channel Switch
document.querySelectorAll('.channel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.channel-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        const src = btn.dataset.src;
        loadChannel(src);
    });
});

function loadChannel(channelKey) {
    if (!channels[channelKey]) return;
    
    currentSource = channels[channelKey];
    player.src({ src: currentSource, type: 'application/x-mpegURL' });
    player.play();
}

// Custom URL
function loadCustom() {
    const url = document.getElementById('custom-url').value.trim();
    if (url) {
        currentSource = url;
        player.src({ src: url, type: 'application/x-mpegURL' });
        player.play();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initPlayer();
    loadChannel('CHANNEL1_M3U8'); // Default channel
});
