// Gallery Component
export class Gallery {
    constructor() {
        this.galleries = {
            infrastructure: {
                title: 'البنية التحتية',
                description: 'مشاريع الكهرباء والمياه والصرف الصحي',
                images: [
                    '/assets/images/electricity-network.jpg',
                    '/assets/images/water-plants.jpg',
                    '/assets/images/development-projects.jpg'
                ]
            },
            housing: {
                title: 'الإسكان',
                description: 'التجمعات التنموية والوحدات السكنية',
                images: [
                    '/assets/images/تجمعات تنمويه.jpg',
                    '/assets/images/تجمعات تنمويه2.jpg',
                    '/assets/images/affordable-housing.jpg',
                    '/assets/images/rafah-new-city.jpeg',
                    '/assets/images/بناء,jpg.jpg'
                ]
            },
            transportation: {
                title: 'النقل والطرق',
                description: 'الطرق والأنفاق والجسور',
                images: [
                    '/assets/images/ahmed-hamdi-tunnel.jpg',
                    '/assets/images/sinai-delta-connection.jpg',
                    '/assets/images/street.jpg'
                ]
            },
            education: {
                title: 'التعليم',
                description: 'المدارس والمرافق التعليمية',
                images: [
                    '/assets/images/schools.jpg',
                    '/assets/images/sinai-school.jpg'
                ]
            },
            healthcare: {
                title: 'الصحة',
                description: 'المستشفيات والمراكز الطبية',
                images: [
                    '/assets/images/hospitals.jpg'
                ]
            },
            agriculture: {
                title: 'الزراعة',
                description: 'استصلاح الأراضي والمشاريع الزراعية',
                images: [
                    '/assets/images/agriculture.jpg',
                    '/assets/images/الحسنه.jfif'
                ]
            }
        };
        
        this.currentGallery = null;
        this.currentIndex = 0;
    }
    
    init() {
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.modal = document.getElementById('gallery-modal');
        
        if (!this.modal) {
            console.error('Gallery modal not found in DOM');
            return;
        }
        
        this.overlay = this.modal.querySelector('.gallery-modal__overlay');
        this.closeBtn = this.modal.querySelector('.gallery-modal__close');
        this.prevBtn = this.modal.querySelector('.gallery-modal__prev');
        this.nextBtn = this.modal.querySelector('.gallery-modal__next');
        this.image = this.modal.querySelector('.gallery-modal__image');
        this.title = this.modal.querySelector('.gallery-modal__title');
        this.description = this.modal.querySelector('.gallery-modal__description');
        this.thumbnailsContainer = this.modal.querySelector('.gallery-modal__thumbnails');
        
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        // Category cards - attach click listeners
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const category = card.getAttribute('data-category');
                if (category) {
                    this.openGallery(category);
                }
            });
            
            // Make cards keyboard accessible
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const category = card.getAttribute('data-category');
                    if (category) {
                        this.openGallery(category);
                    }
                }
            });
        });
        
        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
        }
        
        // Overlay click to close
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }
        
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.prev();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.next();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.modal || this.modal.getAttribute('aria-hidden') === 'true') return;
            
            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.next(); // RTL: left goes forward
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.prev(); // RTL: right goes backward
            }
        });
    }
    
    openGallery(category) {
        this.currentGallery = this.galleries[category];
        
        if (!this.currentGallery) {
            console.error('Gallery not found for category:', category);
            return;
        }
        
        if (!this.modal) {
            console.error('Modal element not found');
            return;
        }
        
        this.currentIndex = 0;
        this.modal.classList.add('gallery-modal--open');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        this.renderThumbnails();
        this.showImage(0);
    }
    
    close() {
        if (!this.modal) return;
        
        this.modal.classList.remove('gallery-modal--open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    showImage(index) {
        if (!this.currentGallery) return;
        
        this.currentIndex = index;
        const images = this.currentGallery.images;
        
        if (this.image) {
            this.image.src = images[index];
            this.image.alt = this.currentGallery.title;
        }
        
        if (this.title) {
            this.title.textContent = this.currentGallery.title;
        }
        
        if (this.description) {
            this.description.textContent = this.currentGallery.description;
        }
        
        // Update thumbnails
        const thumbnails = this.thumbnailsContainer.querySelectorAll('.gallery-modal__thumbnail');
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('gallery-modal__thumbnail--active', i === index);
        });
        
        // Update navigation buttons
        if (this.prevBtn) {
            this.prevBtn.style.display = images.length > 1 ? 'block' : 'none';
        }
        
        if (this.nextBtn) {
            this.nextBtn.style.display = images.length > 1 ? 'block' : 'none';
        }
    }
    
    renderThumbnails() {
        if (!this.currentGallery || !this.thumbnailsContainer) return;
        
        const images = this.currentGallery.images;
        
        if (images.length <= 1) {
            this.thumbnailsContainer.style.display = 'none';
            return;
        }
        
        this.thumbnailsContainer.style.display = 'flex';
        this.thumbnailsContainer.innerHTML = images.map((img, index) => `
            <img 
                src="${img}" 
                alt="${this.currentGallery.title}" 
                class="gallery-modal__thumbnail ${index === 0 ? 'gallery-modal__thumbnail--active' : ''}"
                data-index="${index}"
            >
        `).join('');
        
        // Add click events to thumbnails
        const thumbnails = this.thumbnailsContainer.querySelectorAll('.gallery-modal__thumbnail');
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.showImage(index));
        });
    }
    
    prev() {
        if (!this.currentGallery) return;
        
        const images = this.currentGallery.images;
        this.currentIndex = (this.currentIndex - 1 + images.length) % images.length;
        this.showImage(this.currentIndex);
    }
    
    next() {
        if (!this.currentGallery) return;
        
        const images = this.currentGallery.images;
        this.currentIndex = (this.currentIndex + 1) % images.length;
        this.showImage(this.currentIndex);
    }
}
