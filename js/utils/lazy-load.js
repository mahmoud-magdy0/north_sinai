// Lazy Loading Utility
export class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px',
            threshold: 0.01,
            ...options
        };
        this.observer = null;
    }
    
    observe() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                this.options
            );
            
            // Observe all images with loading="lazy"
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => this.observer.observe(img));
        } else {
            // Fallback: load all images immediately
            this.loadAllImages();
        }
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }
    
    loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
        
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
        }
        
        img.classList.add('loaded');
    }
    
    loadAllImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => this.loadImage(img));
    }
    
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
