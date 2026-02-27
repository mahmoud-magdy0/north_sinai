// Navigation Component
export class Navigation {
    constructor() {
        this.nav = document.querySelector('.main-nav');
        if (!this.nav) return;
        
        this.toggle = this.nav.querySelector('.main-nav__toggle');
        this.menu = this.nav.querySelector('.main-nav__menu');
        this.links = this.nav.querySelectorAll('.main-nav__link');
    }
    
    init() {
        if (!this.nav) return;
        
        this.attachEventListeners();
        this.setupSmoothScroll();
        this.setActiveLink();
    }
    
    attachEventListeners() {
        // Mobile menu toggle
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleMenu());
        }
        
        // Close menu on outside click
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeMenu();
        });
        
        // Close mobile menu when clicking a link
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    this.closeMenu();
                }
            });
        });
        
        // Update active link on scroll
        window.addEventListener('scroll', () => this.updateActiveOnScroll());
    }
    
    setupSmoothScroll() {
        this.links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        const headerOffset = 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            }
        });
    }
    
    toggleMenu() {
        const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';
        this.toggle.setAttribute('aria-expanded', !isExpanded);
        this.menu.classList.toggle('main-nav__menu--open');
        
        // Prevent body scroll when menu is open
        if (!isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    setActiveLink() {
        const hash = window.location.hash;
        if (hash) {
            this.links.forEach(link => {
                link.classList.remove('main-nav__link--active');
                if (link.getAttribute('href') === hash) {
                    link.classList.add('main-nav__link--active');
                }
            });
        }
    }
    
    updateActiveOnScroll() {
        const sections = ['main-content', 'map-section', 'timeline', 'categories', 'education-message'];
        const scrollPosition = window.scrollY + 150;
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    this.links.forEach(link => {
                        link.classList.remove('main-nav__link--active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('main-nav__link--active');
                        }
                    });
                }
            }
        });
    }
    
    closeMenu() {
        if (this.toggle) {
            this.toggle.setAttribute('aria-expanded', 'false');
        }
        this.menu.classList.remove('main-nav__menu--open');
        document.body.style.overflow = '';
    }
    
    handleOutsideClick(event) {
        if (!this.nav.contains(event.target)) {
            this.closeMenu();
        }
    }
}
