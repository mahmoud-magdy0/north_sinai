// Data Loader Utility
export class DataLoader {
    static cache = new Map();
    
    static async loadJSON(url) {
        // Check cache first
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.cache.set(url, data);
            return data;
        } catch (error) {
            console.error('Error loading JSON:', error);
            return null;
        }
    }
    
    static clearCache() {
        this.cache.clear();
    }
    
    static removeFromCache(url) {
        this.cache.delete(url);
    }
}
