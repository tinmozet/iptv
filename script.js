class PCloudFileManager {
    constructor() {
        this.files = [];
        this.filteredFiles = [];
        this.init();
    }

    async init() {
        try {
            await this.loadFiles();
            this.filteredFiles = [...this.files];
            this.renderFiles();
            this.updateStats();
            this.setupEventListeners();
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('filesContainer').innerHTML = 
                '<div class="no-files">❌ links.json ဖတ်လို့ မရပါ</div>';
        }
    }

    async loadFiles() {
        const response = await fetch('data/links.json');
        if (!response.ok) throw new Error('JSON file not found');
        this.files = await response.json();
        
        // Auto detect file type & icon
        this.files.forEach(file => {
            file.type = this.getFileType(file.name);
            file.icon = this.getFileIcon(file.type);
        });
    }

    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        return {
            'pdf': 'pdf', 'zip': 'zip', 'rar': 'zip',
            'mp4': 'video', 'avi': 'video', 'mkv': 'video',
            'mp3': 'audio', 'wav': 'audio',
            'jpg': 'image', 'png': 'image', 'jpeg': 'image', 'gif': 'image'
        }[ext] || 'other';
    }

    getFileIcon(type) {
        const icons = {
            pdf: '📄', zip: '📦', video: '🎥', audio: '🎵',
            image: '🖼️', other: '📎'
        };
        return icons[type] || '📎';
    }

    setupEventListeners() {
        document.getElementById('searchInput').addEventListener('input', (e) => this.filterFiles());
        document.getElementById('sortSelect').addEventListener('change', (e) => this.sortFiles());
    }

    filterFiles() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        this.filteredFiles = this.files.filter(file => 
            file.name.toLowerCase().includes(query) ||
            file.description.toLowerCase().includes(query)
        );
        this.sortFiles();
        this.renderFiles();
        this.updateStats();
    }

    sortFiles() {
        const sortBy = document.getElementById('sortSelect').value;
        this.filteredFiles.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'size') return a.size.localeCompare(b.size);
            if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
            return 0;
        });
    }

    renderFiles() {
        const container = document.getElementById('filesContainer');
        document.getElementById('loading').style.display = 'none';
        
        if (this.filteredFiles.length === 0) {
            container.innerHTML = '<div class="no-files">❌ File မတွေ့ပါ</div>';
            return;
        }

        container.innerHTML = this.filteredFiles.map(file => `
            <div class="file-card">
                <span class="file-icon">${file.icon}</span>
                <div class="file-header">
                    <div class="file-name">${file.name}</div>
                    <div class="file-desc">${file.description}</div>
                </div>
                <div class="file-meta">
                    <span>📏 ${file.size}</span>
                    <span>📅 ${file.date}</span>
                </div>
                <a href="${file.pcloud_link}" target="_blank" class="download-btn">
                    ⬇️ pCloud မှ Download
                </a>
            </div>
        `).join('');
    }

    updateStats() {
        document.getElementById('stats').innerHTML = `
            စုစုပေါင်း <strong>${this.files.length}</strong> ခု | 
            ပြထားတဲ့ <strong>${this.filteredFiles.length}</strong> ခု
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new PCloudFileManager();
});
