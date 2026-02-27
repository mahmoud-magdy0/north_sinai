// Error Handler Utility
export class ErrorHandler {
    static init() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.logError('Uncaught Error', event.error);
            this.showUserMessage('حدث خطأ غير متوقع. يرجى تحديث الصفحة.');
        });
        
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason);
            this.showUserMessage('فشل تحميل بعض المحتوى. يرجى المحاولة مرة أخرى.');
        });
    }
    
    static logError(type, error) {
        console.error(`[${type}]`, error);
        // In production, send to error tracking service
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Send to error tracking endpoint
            // this.sendToErrorTracking(type, error);
        }
    }
    
    static showUserMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('error-toast--visible');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('error-toast--visible');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}
