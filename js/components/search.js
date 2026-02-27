// Search Component
import { DataLoader } from '../utils/data-loader.js';
import { debounce, escapeHTML } from '../utils/helpers.js';

export class Search {
    constructor() {
        this.overlay = document.getElementById('search-overlay');
        this.input = document.getElementById('search-input');
        this.resultsContainer = document.getElementById('search-results');
        this.searchIndex = [];
        this.performSearchDebounced = debounce((query) => this.performSearch(query), 300);
    }
    
    async init() {
        await this.buildSearchIndex();
        this.attachEventListeners();
    }
    
    async buildSearchIndex() {
        try {
            // Load all searchable content from merged data file
            const data = await DataLoader.loadJSON('/data/projects.json');
            
            // Build search index
            this.searchIndex = [];
            
            if (data && data.projects) {
                this.searchIndex.push(...data.projects.map(p => ({ 
                    ...p, 
                    type: 'مشروع',
                    searchText: `${p.name} ${p.description} ${p.category}`.toLowerCase()
                })));
            }
            
            if (data && data.achievements) {
                this.searchIndex.push(...data.achievements.map(a => ({ 
                    ...a, 
                    type: 'إنجاز',
                    searchText: `${a.title} ${a.description}`.toLowerCase()
                })));
            }
        } catch (error) {
            console.error('Error building search index:', error);
        }
    }
    
    attachEventListeners() {
        // Open search
        const searchToggle = document.querySelector('.search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('click', () => this.open());
        }
        
        // Close search
        const closeBtn = this.overlay.querySelector('.search-overlay__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Search input
        if (this.input) {
            this.input.addEventListener('input', (e) => {
                this.performSearchDebounced(e.target.value);
            });
            
            // Prevent form submission
            const form = this.input.closest('form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.performSearch(this.input.value);
                });
            }
        }
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.getAttribute('aria-hidden') === 'false') {
                this.close();
            }
        });
        
        // Close on background click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }
    
    open() {
        this.overlay.classList.add('search-overlay--open');
        this.overlay.setAttribute('aria-hidden', 'false');
        this.input.focus();
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.overlay.classList.remove('search-overlay--open');
        this.overlay.setAttribute('aria-hidden', 'true');
        this.input.value = '';
        this.resultsContainer.innerHTML = '';
        document.body.style.overflow = '';
    }
    
    performSearch(query) {
        if (!query || query.length < 2) {
            this.resultsContainer.innerHTML = '';
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        const results = this.searchIndex.filter(item => {
            return item.searchText.includes(lowerQuery);
        });
        
        this.displayResults(results, query);
    }
    
    displayResults(results, query) {
        if (results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="search-results__empty">
                    <p>لم يتم العثور على نتائج لـ "${escapeHTML(query)}"</p>
                    <p>جرب كلمات مفتاحية مختلفة أو تصفح أقسامنا:</p>
                    <ul>
                        <li><a href="/pages/infrastructure.html">مشاريع البنية التحتية</a></li>
                        <li><a href="/pages/agriculture.html">المبادرات الزراعية</a></li>
                        <li><a href="/pages/products.html">الموارد المحلية</a></li>
                    </ul>
                </div>
            `;
            return;
        }
        
        this.resultsContainer.innerHTML = `
            <div class="search-results__header">
                <p>تم العثور على ${results.length} نتيجة</p>
            </div>
            <ul class="search-results__list">
                ${results.map(result => this.renderResult(result, query)).join('')}
            </ul>
        `;
        
        // Attach click handlers to search results
        this.attachResultClickHandlers();
    }
    
    attachResultClickHandlers() {
        const resultLinks = this.resultsContainer.querySelectorAll('.search-result__link');
        resultLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const resultId = link.getAttribute('data-result-id');
                const resultType = link.getAttribute('data-result-type');
                this.navigateToResult(resultId, resultType);
            });
        });
    }
    
    navigateToResult(id, type) {
        // Close the search overlay
        this.close();
        
        // Navigate based on type
        if (type === 'مشروع') {
            // For projects, trigger map marker click or scroll to map
            this.navigateToProject(id);
        } else if (type === 'إنجاز') {
            // For achievements, scroll to timeline and select the achievement
            this.navigateToAchievement(id);
        }
    }
    
    navigateToProject(projectId) {
        // Scroll to map section
        const mapSection = document.getElementById('map-section');
        if (mapSection) {
            mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Wait for scroll to complete, then trigger marker click
            setTimeout(() => {
                // Dispatch custom event for map component to handle
                window.dispatchEvent(new CustomEvent('search:selectProject', { 
                    detail: { projectId } 
                }));
            }, 800);
        }
    }
    
    navigateToAchievement(achievementId) {
        // Scroll to timeline section
        const timelineSection = document.getElementById('timeline');
        if (timelineSection) {
            timelineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Wait for scroll to complete, then select achievement
            setTimeout(() => {
                // Dispatch custom event for timeline component to handle
                window.dispatchEvent(new CustomEvent('search:selectAchievement', { 
                    detail: { achievementId } 
                }));
            }, 800);
        }
    }
    
    renderResult(result, query) {
        const title = result.name || result.title;
        const description = result.description || '';
        const highlightedTitle = this.highlightQuery(escapeHTML(title), query);
        const snippet = this.createSnippet(description, query);
        
        return `
            <li class="search-result">
                <a href="#" class="search-result__link" data-result-id="${result.id}" data-result-type="${result.type}">
                    <span class="search-result__type">${result.type}</span>
                    <h3 class="search-result__title">${highlightedTitle}</h3>
                    <p class="search-result__snippet">${snippet}</p>
                </a>
            </li>
        `;
    }
    
    highlightQuery(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    createSnippet(text, query, maxLength = 150) {
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);
        
        if (index === -1) {
            const truncated = text.substring(0, maxLength);
            return escapeHTML(truncated) + (text.length > maxLength ? '...' : '');
        }
        
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 100);
        const snippet = text.substring(start, end);
        
        return (start > 0 ? '...' : '') + 
               this.highlightQuery(escapeHTML(snippet), query) + 
               (end < text.length ? '...' : '');
    }
}
