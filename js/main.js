// Main Application Entry Point
import { Navigation } from './components/navigation.js';
import { Timeline } from './components/timeline.js';
import { Search } from './components/search.js';
import { Gallery } from './components/gallery.js';
import { AchievementMap } from './components/map.js';
import { LazyLoader } from './utils/lazy-load.js';
import { ErrorHandler } from './utils/error-handler.js';

class App {
    constructor() {
        this.components = {};
    }
    
    async init() {
        try {
            // Initialize error handling
            ErrorHandler.init();
            
            // Initialize global components
            this.components.navigation = new Navigation();
            this.components.navigation.init();
            
            this.components.search = new Search();
            await this.components.search.init();
            
            // Initialize lazy loading for images
            this.components.lazyLoader = new LazyLoader();
            this.components.lazyLoader.observe();
            
            // Initialize page-specific components
            this.initPageComponents();
            
            // Initialize gallery after everything else
            setTimeout(() => {
                this.components.gallery = new Gallery();
                this.components.gallery.init();
            }, 500);
        } catch (error) {
            ErrorHandler.logError('App Initialization', error);
        }
    }
    
    initPageComponents() {
        const page = document.body.dataset.page;
        
        if (page === 'home') {
            this.initHomePage();
        }
    }
    
    async initHomePage() {
        try {
            // Initialize map
            const mapContainer = document.getElementById('achievements-map-container');
            if (mapContainer) {
                this.components.map = new AchievementMap('achievements-map-container', '/data/projects.json');
                await this.components.map.init();
            }
            
            // Initialize timeline - now using projects.json for both
            const timelineElement = document.getElementById('timeline');
            if (timelineElement) {
                this.components.timeline = new Timeline('timeline', '/data/projects.json');
                await this.components.timeline.init();
            }
        } catch (error) {
            ErrorHandler.logError('Home Page Initialization', error);
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new App();
        app.init();
    });
} else {
    const app = new App();
    app.init();
}
