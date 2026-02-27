// Timeline Component
import { DataLoader } from '../utils/data-loader.js';
import { formatDate, escapeHTML } from '../utils/helpers.js';

export class Timeline {
    constructor(containerId, dataUrl) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.dataUrl = dataUrl;
        this.data = [];
        this.currentIndex = 0;
    }
    
    async init() {
        try {
            await this.loadData();
            this.render();
            this.attachEventListeners();
            this.setupSearchListener();
            if (this.data.length > 0) {
                this.showAchievement(0);
            }
        } catch (error) {
            console.error('Timeline initialization error:', error);
            this.showError();
        }
    }
    
    setupSearchListener() {
        // Listen for search navigation events
        window.addEventListener('search:selectAchievement', (e) => {
            const { achievementId } = e.detail;
            this.selectAchievementById(achievementId);
        });
    }
    
    selectAchievementById(achievementId) {
        // Find the achievement index by ID
        const index = this.data.findIndex(a => a.id === achievementId);
        if (index !== -1) {
            this.showAchievement(index);
        }
    }
    
    async loadData() {
        const response = await DataLoader.loadJSON(this.dataUrl);
        if (response && response.achievements) {
            this.data = response.achievements.sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );
        }
    }
    
    render() {
        const track = this.container.querySelector('.timeline__track');
        if (!track) return;
        
        if (this.data.length === 0) {
            track.innerHTML = '<p style="text-align: center; padding: 2rem;">لا توجد إنجازات متاحة حالياً</p>';
            return;
        }
        
        track.innerHTML = this.data.map((achievement, index) => `
            <article class="timeline__item" data-index="${index}" tabindex="0" role="button" aria-label="${escapeHTML(achievement.title)}">
                <time class="timeline__date" datetime="${achievement.date}">
                    ${formatDate(achievement.date)}
                </time>
                <h3 class="timeline__title">${escapeHTML(achievement.title)}</h3>
                <div class="timeline__marker"></div>
            </article>
        `).join('');
    }
    
    attachEventListeners() {
        const prevBtn = this.container.querySelector('.timeline__nav--prev');
        const nextBtn = this.container.querySelector('.timeline__nav--next');
        const items = this.container.querySelectorAll('.timeline__item');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigate(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigate(1));
        }
        
        items.forEach((item, index) => {
            item.addEventListener('click', () => this.showAchievement(index));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showAchievement(index);
                }
            });
        });
        
        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigate(1); // RTL: left arrow goes forward
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigate(-1); // RTL: right arrow goes backward
            }
        });
    }
    
    navigate(direction) {
        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.data.length) {
            this.showAchievement(newIndex);
        }
    }
    
    showAchievement(index) {
        this.currentIndex = index;
        const achievement = this.data[index];
        
        // Update active state
        const items = this.container.querySelectorAll('.timeline__item');
        items.forEach((item, i) => {
            item.classList.toggle('timeline__item--active', i === index);
        });
        
        // Update navigation buttons
        const prevBtn = this.container.querySelector('.timeline__nav--prev');
        const nextBtn = this.container.querySelector('.timeline__nav--next');
        
        if (prevBtn) {
            prevBtn.disabled = index === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = index === this.data.length - 1;
        }
        
        // Update details panel
        const details = this.container.querySelector('.timeline__details');
        if (details) {
            // Handle both single image and multiple images
            const images = achievement.images || (achievement.image ? [achievement.image] : []);
            const imagesHTML = images.length > 0 ? `
                <div class="achievement-images">
                    ${images.map(img => `
                        <img src="${img}" alt="${escapeHTML(achievement.title)}" loading="lazy">
                    `).join('')}
                </div>
            ` : '';
            
            // Handle sources
            const sourcesHTML = achievement.sources && achievement.sources.length > 0 ? `
                <div class="achievement-sources">
                    <h3>المصادر الرسمية:</h3>
                    <ul>
                        ${achievement.sources.map(source => `
                            <li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.name)}</a></li>
                        `).join('')}
                    </ul>
                </div>
            ` : '';
            
            details.innerHTML = `
                <article class="achievement-detail">
                    <time datetime="${achievement.date}">${formatDate(achievement.date)}</time>
                    <h2>${escapeHTML(achievement.title)}</h2>
                    <p>${escapeHTML(achievement.description)}</p>
                    ${imagesHTML}
                    ${achievement.metrics ? this.renderMetrics(achievement.metrics) : ''}
                    ${sourcesHTML}
                </article>
            `;
        }
        
        // Scroll timeline item into view
        if (items[index]) {
            items[index].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
            });
        }
    }
    
    renderMetrics(metrics) {
        return `
            <dl class="achievement-metrics">
                ${Object.entries(metrics).map(([key, value]) => `
                    <div class="achievement-metrics__item">
                        <dt>${escapeHTML(key)}</dt>
                        <dd>${escapeHTML(String(value))}</dd>
                    </div>
                `).join('')}
            </dl>
        `;
    }
    
    showError() {
        const track = this.container.querySelector('.timeline__track');
        if (track) {
            track.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--color-error);">حدث خطأ في تحميل الإنجازات</p>';
        }
    }
}
