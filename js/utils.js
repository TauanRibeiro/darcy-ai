// Utility functions for Darcy AI
const Utils = {
    
    // DOM utilities
    dom: {
        /**
         * Get element by ID
         * @param {string} id - Element ID
         * @returns {HTMLElement|null}
         */
        getId: (id) => document.getElementById(id),
        
        /**
         * Get element by selector
         * @param {string} selector - CSS selector
         * @returns {HTMLElement|null}
         */
        getSelector: (selector) => document.querySelector(selector),
        
        /**
         * Get elements by selector
         * @param {string} selector - CSS selector
         * @returns {NodeList}
         */
        getAllSelector: (selector) => document.querySelectorAll(selector),
        
        /**
         * Create element with attributes
         * @param {string} tag - HTML tag
         * @param {Object} attributes - Element attributes
         * @param {string} textContent - Text content
         * @returns {HTMLElement}
         */
        createElement: (tag, attributes = {}, textContent = '') => {
            const element = document.createElement(tag);
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.classList.add(...value.split(' '));
                } else if (key === 'dataset') {
                    Object.entries(value).forEach(([dataKey, dataValue]) => {
                        element.dataset[dataKey] = dataValue;
                    });
                } else {
                    element.setAttribute(key, value);
                }
            });
            if (textContent) element.textContent = textContent;
            return element;
        },
        
        /**
         * Add event listener with delegation
         * @param {HTMLElement} parent - Parent element
         * @param {string} selector - Child selector
         * @param {string} event - Event type
         * @param {Function} handler - Event handler
         */
        delegate: (parent, selector, event, handler) => {
            parent.addEventListener(event, (e) => {
                if (e.target.matches(selector)) {
                    handler(e);
                }
            });
        }
    },
    
    // Text utilities
    text: {
        /**
         * Sanitize HTML to prevent XSS
         * @param {string} text - Input text
         * @returns {string}
         */
        sanitizeHtml: (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        /**
         * Format text with basic markdown-like formatting
         * @param {string} text - Input text
         * @returns {string}
         */
        formatText: (text) => {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        },
        
        /**
         * Truncate text to specified length
         * @param {string} text - Input text
         * @param {number} length - Maximum length
         * @returns {string}
         */
        truncate: (text, length = 100) => {
            return text.length > length ? text.substring(0, length) + '...' : text;
        },
        
        /**
         * Generate random ID
         * @param {number} length - ID length
         * @returns {string}
         */
        generateId: (length = 8) => {
            return Math.random().toString(36).substring(2, 2 + length);
        }
    },
    
    // Date/Time utilities
    time: {
        /**
         * Format timestamp to readable time
         * @param {Date|number} timestamp - Timestamp
         * @returns {string}
         */
        formatTime: (timestamp = new Date()) => {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        /**
         * Format timestamp to readable date
         * @param {Date|number} timestamp - Timestamp
         * @returns {string}
         */
        formatDate: (timestamp = new Date()) => {
            const date = new Date(timestamp);
            return date.toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        
        /**
         * Get relative time (e.g., "2 minutes ago")
         * @param {Date|number} timestamp - Timestamp
         * @returns {string}
         */
        getRelativeTime: (timestamp) => {
            const now = new Date();
            const diff = now - new Date(timestamp);
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            
            if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
            if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
            if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
            return 'agora mesmo';
        }
    },
    
    // File utilities
    file: {
        /**
         * Get file extension
         * @param {string} filename - File name
         * @returns {string}
         */
        getExtension: (filename) => {
            return filename.split('.').pop().toLowerCase();
        },
        
        /**
         * Format file size
         * @param {number} bytes - File size in bytes
         * @returns {string}
         */
        formatSize: (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        /**
         * Check if file type is allowed
         * @param {string} filename - File name
         * @param {Array} allowedTypes - Allowed file extensions
         * @returns {boolean}
         */
        isAllowedType: (filename, allowedTypes) => {
            const extension = Utils.file.getExtension(filename);
            return allowedTypes.includes(extension);
        },
        
        /**
         * Read file as text
         * @param {File} file - File object
         * @returns {Promise<string>}
         */
        readAsText: (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        },
        
        /**
         * Read file as data URL
         * @param {File} file - File object
         * @returns {Promise<string>}
         */
        readAsDataURL: (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
    },
    
    // API utilities
    api: {
        /**
         * Make HTTP request
         * @param {string} url - Request URL
         * @param {Object} options - Request options
         * @returns {Promise<Response>}
         */
        request: async (url, options = {}) => {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            const mergedOptions = { ...defaultOptions, ...options };
            
            try {
                const response = await fetch(url, mergedOptions);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response;
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        },
        
        /**
         * Make POST request with JSON data
         * @param {string} url - Request URL
         * @param {Object} data - Request data
         * @param {Object} headers - Additional headers
         * @returns {Promise<any>}
         */
        post: async (url, data, headers = {}) => {
            const response = await Utils.api.request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: JSON.stringify(data)
            });
            return response.json();
        }
    },
    
    // Animation utilities
    animation: {
        /**
         * Smooth scroll to element
         * @param {HTMLElement} element - Target element
         * @param {number} duration - Animation duration
         */
        scrollTo: (element, duration = 300) => {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            });
        },
        
        /**
         * Fade in element
         * @param {HTMLElement} element - Target element
         * @param {number} duration - Animation duration
         */
        fadeIn: (element, duration = 300) => {
            element.style.opacity = '0';
            element.style.display = 'block';
            
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = progress.toString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        },
        
        /**
         * Fade out element
         * @param {HTMLElement} element - Target element
         * @param {number} duration - Animation duration
         */
        fadeOut: (element, duration = 300) => {
            const start = performance.now();
            const initialOpacity = parseFloat(getComputedStyle(element).opacity);
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                element.style.opacity = (initialOpacity * (1 - progress)).toString();
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                }
            };
            
            requestAnimationFrame(animate);
        }
    },
    
    // Validation utilities
    validation: {
        /**
         * Validate email format
         * @param {string} email - Email address
         * @returns {boolean}
         */
        isValidEmail: (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        /**
         * Validate URL format
         * @param {string} url - URL string
         * @returns {boolean}
         */
        isValidUrl: (url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        
        /**
         * Check if string is empty or whitespace
         * @param {string} str - Input string
         * @returns {boolean}
         */
        isEmpty: (str) => {
            return !str || str.trim().length === 0;
        }
    },
    
    // Notification utilities
    notification: {
        /**
         * Show toast notification
         * @param {string} message - Notification message
         * @param {string} type - Notification type (success, error, warning, info)
         * @param {number} duration - Display duration
         */
        showToast: (message, type = 'info', duration = 3000) => {
            const toast = Utils.dom.createElement('div', {
                className: `toast toast-${type}`,
                role: 'alert'
            }, message);
            
            // Add to DOM
            document.body.appendChild(toast);
            
            // Show animation
            setTimeout(() => toast.classList.add('show'), 100);
            
            // Hide and remove
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    },
    
    // Theme utilities
    theme: {
        /**
         * Set theme
         * @param {string} theme - Theme name (light, dark)
         */
        setTheme: (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
        },
        
        /**
         * Get current theme
         * @returns {string}
         */
        getTheme: () => {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        },
        
        /**
         * Toggle theme
         */
        toggleTheme: () => {
            const currentTheme = Utils.theme.getTheme();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            Utils.theme.setTheme(newTheme);
        }
    },
    
    // Debounce utility
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle utility
    throttle: (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
