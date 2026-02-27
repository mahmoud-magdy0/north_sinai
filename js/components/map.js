// Interactive Map Component for North Sinai Achievements
export class AchievementMap {
    constructor(containerId, dataUrl) {
        this.containerId = containerId;
        this.dataUrl = dataUrl;
        this.map = null;
        this.markers = [];
        this.infoPanel = null;
    }
    
    async init() {
        try {
            const data = await this.loadData();
            this.createMapContainer();
            this.initMap();
            this.addMarkers(data.projects); // Changed from data.locations to data.projects
            this.createInfoPanel();
            this.setupSearchListener();
        } catch (error) {
            console.error('Map initialization error:', error);
        }
    }
    
    setupSearchListener() {
        // Listen for search navigation events
        window.addEventListener('search:selectProject', (e) => {
            const { projectId } = e.detail;
            this.selectProjectById(projectId);
        });
    }
    
    selectProjectById(projectId) {
        // Find the marker with matching project ID
        const markerData = this.markers.find(m => m.project.id === projectId);
        if (markerData) {
            // Trigger the marker click to show info
            markerData.marker.fire('click');
            
            // Optionally pan to the marker
            this.map.panTo(markerData.marker.getLatLng());
        }
    }
    
    async loadData() {
        const response = await fetch(this.dataUrl);
        if (!response.ok) throw new Error('Failed to load map data');
        return await response.json();
    }
    
    createMapContainer() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="map-wrapper">
                <div id="achievement-map" class="achievement-map"></div>
                <div id="map-info-panel" class="map-info-panel hidden">
                    <button class="map-info-panel__close" aria-label="إغلاق">×</button>
                    <div class="map-info-panel__content"></div>
                </div>
            </div>
        `;
    }

    
    initMap() {
        const mapElement = document.getElementById('achievement-map');
        if (!mapElement) return;
        
        // Initialize Leaflet map centered on North Sinai, Egypt with fixed view
        // North Sinai coordinates: approximately 30.5°N, 33.8°E
        this.map = L.map('achievement-map', {
            center: [30.8, 33.9],
            zoom: 8,
            minZoom: 8,
            maxZoom: 8,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            zoomControl: false
        });
        
        // Add colored base map tiles - using CartoDB Voyager for colorful map
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);
    }
    
    addMarkers(projects) {
        if (!projects || !Array.isArray(projects)) return;
        
        projects.forEach(project => {
            const marker = L.marker([project.location.lat, project.location.lng], {
                icon: this.createCustomIcon(project.category),
                title: '' // Remove tooltip on hover
            }).addTo(this.map);
            
            // Remove any default popup or tooltip
            marker.unbindPopup();
            marker.unbindTooltip();
            
            marker.on('click', () => this.showLocationInfo(project));
            this.markers.push({ marker, project });
        });
    }
    
    createCustomIcon(category) {
        const colors = {
            infrastructure: '#3498db',
            housing: '#e74c3c',
            transportation: '#f39c12',
            education: '#9b59b6',
            healthcare: '#1abc9c',
            agriculture: '#27ae60',
            security: '#34495e'
        };
        
        const color = colors[category] || '#95a5a6';
        
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-container">
                    <div class="marker-pin" style="background-color: ${color};">
                        <div class="marker-dot"></div>
                    </div>
                    <div class="marker-shadow"></div>
                </div>
            `,
            iconSize: [40, 50],
            iconAnchor: [20, 50],
            popupAnchor: [0, -50]
        });
    }

    
    createInfoPanel() {
        this.infoPanel = document.getElementById('map-info-panel');
        const closeBtn = this.infoPanel?.querySelector('.map-info-panel__close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideInfoPanel());
        }
    }
    
    showLocationInfo(project) {
        if (!this.infoPanel) return;
        
        const content = this.infoPanel.querySelector('.map-info-panel__content');
        if (!content) return;
        
        const categoryNames = {
            infrastructure: 'البنية التحتية',
            housing: 'الإسكان',
            transportation: 'النقل والطرق',
            education: 'التعليم',
            healthcare: 'الصحة',
            agriculture: 'الزراعة',
            security: 'الأمن'
        };
        
        const statusBadge = project.status ? `
            <span class="location-info__status location-info__status--${project.status === 'مكتمل' ? 'completed' : 'ongoing'}">
                ${project.status}
            </span>
        ` : '';
        
        content.innerHTML = `
            <div class="location-info">
                <div class="location-info__header">
                    <span class="location-info__category">${categoryNames[project.category] || project.category}</span>
                    ${statusBadge}
                </div>
                <h3 class="location-info__title">${project.name}</h3>
                <p class="location-info__description">${project.description}</p>
                ${project.images && project.images.length > 0 ? `
                    <div class="location-info__images">
                        ${project.images.map(img => `
                            <img src="${img}" alt="${project.name}" class="location-info__image">
                        `).join('')}
                    </div>
                ` : ''}
                ${project.metrics ? `
                    <div class="location-info__metrics">
                        ${Object.entries(project.metrics).map(([key, value]) => `
                            <div class="metric-item">
                                <span class="metric-item__label">${key}:</span>
                                <span class="metric-item__value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${project.completionDate ? `
                    <div class="location-info__date">
                        <span class="date-label">تاريخ الإنجاز:</span>
                        <span class="date-value">${project.completionDate}</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.infoPanel.classList.remove('hidden');
    }
    
    hideInfoPanel() {
        if (this.infoPanel) {
            this.infoPanel.classList.add('hidden');
        }
    }
}
