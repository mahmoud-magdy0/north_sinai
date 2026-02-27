// Helper Utility Functions

export function formatDate(dateString, locale = 'ar-EG') {
    // Handle date ranges like "2015-2025"
    if (dateString && dateString.includes('-') && dateString.split('-').length === 2) {
        const parts = dateString.split('-');
        if (parts[0].length === 4 && parts[1].length === 4) {
            // It's a year range
            return dateString;
        }
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid
    }
    
    return date.toLocaleDateString(locale, { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
    });
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function truncate(str, maxLength) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
}

export function isLocalStorageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

export function getStorage() {
    if (isLocalStorageAvailable()) {
        return localStorage;
    }
    // Fallback to in-memory storage
    const storage = new Map();
    return {
        getItem: (key) => storage.get(key) || null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
        clear: () => storage.clear()
    };
}
