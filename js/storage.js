// Storage management for Darcy AI
const Storage = {
    
    /**
     * Get item from localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any}
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error getting item from storage: ${key}`, error);
            return defaultValue;
        }
    },
    
    /**
     * Set item in localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} - Success status
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting item in storage: ${key}`, error);
            return false;
        }
    },
    
    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} - Success status
     */
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing item from storage: ${key}`, error);
            return false;
        }
    },
    
    /**
     * Clear all localStorage
     * @returns {boolean} - Success status
     */
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage', error);
            return false;
        }
    },
    
    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    isAvailable: () => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    },
    
    // Settings management
    settings: {
        /**
         * Get all settings
         * @returns {Object}
         */
        getAll: () => {
            return Storage.get(CONFIG.STORAGE_KEYS.SETTINGS, CONFIG.DEFAULTS);
        },
        
        /**
         * Get specific setting
         * @param {string} key - Setting key
         * @param {any} defaultValue - Default value
         * @returns {any}
         */
        get: (key, defaultValue = null) => {
            const settings = Storage.settings.getAll();
            return settings[key] !== undefined ? settings[key] : defaultValue;
        },
        
        /**
         * Set specific setting
         * @param {string} key - Setting key
         * @param {any} value - Setting value
         * @returns {boolean}
         */
        set: (key, value) => {
            const settings = Storage.settings.getAll();
            settings[key] = value;
            return Storage.set(CONFIG.STORAGE_KEYS.SETTINGS, settings);
        },
        
        /**
         * Update multiple settings
         * @param {Object} newSettings - Settings object
         * @returns {boolean}
         */
        update: (newSettings) => {
            const currentSettings = Storage.settings.getAll();
            const updatedSettings = { ...currentSettings, ...newSettings };
            return Storage.set(CONFIG.STORAGE_KEYS.SETTINGS, updatedSettings);
        },
        
        /**
         * Reset settings to defaults
         * @returns {boolean}
         */
        reset: () => {
            return Storage.set(CONFIG.STORAGE_KEYS.SETTINGS, CONFIG.DEFAULTS);
        }
    },
    
    // Chat history management
    chatHistory: {
        /**
         * Get all chat history
         * @returns {Array}
         */
        getAll: () => {
            return Storage.get(CONFIG.STORAGE_KEYS.CHAT_HISTORY, []);
        },
        
        /**
         * Add message to chat history
         * @param {Object} message - Message object
         * @returns {boolean}
         */
        addMessage: (message) => {
            const history = Storage.chatHistory.getAll();
            const messageWithId = {
                id: Utils.text.generateId(),
                timestamp: Date.now(),
                ...message
            };
            history.push(messageWithId);
            
            // Keep only last 1000 messages to prevent storage overflow
            const maxMessages = 1000;
            if (history.length > maxMessages) {
                history.splice(0, history.length - maxMessages);
            }
            
            return Storage.set(CONFIG.STORAGE_KEYS.CHAT_HISTORY, history);
        },
        
        /**
         * Get recent messages
         * @param {number} limit - Number of messages to retrieve
         * @returns {Array}
         */
        getRecent: (limit = 50) => {
            const history = Storage.chatHistory.getAll();
            return history.slice(-limit);
        },
        
        /**
         * Search messages by content
         * @param {string} query - Search query
         * @param {number} limit - Maximum results
         * @returns {Array}
         */
        search: (query, limit = 20) => {
            const history = Storage.chatHistory.getAll();
            const lowerQuery = query.toLowerCase();
            
            return history
                .filter(message => 
                    message.content.toLowerCase().includes(lowerQuery) ||
                    (message.sender && message.sender.toLowerCase().includes(lowerQuery))
                )
                .slice(-limit);
        },
        
        /**
         * Clear chat history
         * @returns {boolean}
         */
        clear: () => {
            return Storage.set(CONFIG.STORAGE_KEYS.CHAT_HISTORY, []);
        },
        
        /**
         * Export chat history as JSON
         * @returns {string}
         */
        export: () => {
            const history = Storage.chatHistory.getAll();
            return JSON.stringify(history, null, 2);
        },
        
        /**
         * Import chat history from JSON
         * @param {string} jsonData - JSON string
         * @returns {boolean}
         */
        import: (jsonData) => {
            try {
                const history = JSON.parse(jsonData);
                if (Array.isArray(history)) {
                    return Storage.set(CONFIG.STORAGE_KEYS.CHAT_HISTORY, history);
                }
                return false;
            } catch (error) {
                console.error('Error importing chat history:', error);
                return false;
            }
        }
    },
    
    // API keys management (encrypted storage would be better in production)
    apiKeys: {
        /**
         * Get all API keys
         * @returns {Object}
         */
        getAll: () => {
            return Storage.get(CONFIG.STORAGE_KEYS.API_KEYS, {});
        },
        
        /**
         * Get API key for specific provider
         * @param {string} provider - Provider name
         * @returns {string|null}
         */
        get: (provider) => {
            const keys = Storage.apiKeys.getAll();
            return keys[provider] || null;
        },
        
        /**
         * Set API key for provider
         * @param {string} provider - Provider name
         * @param {string} key - API key
         * @returns {boolean}
         */
        set: (provider, key) => {
            const keys = Storage.apiKeys.getAll();
            keys[provider] = key;
            return Storage.set(CONFIG.STORAGE_KEYS.API_KEYS, keys);
        },
        
        /**
         * Remove API key for provider
         * @param {string} provider - Provider name
         * @returns {boolean}
         */
        remove: (provider) => {
            const keys = Storage.apiKeys.getAll();
            delete keys[provider];
            return Storage.set(CONFIG.STORAGE_KEYS.API_KEYS, keys);
        },
        
        /**
         * Clear all API keys
         * @returns {boolean}
         */
        clear: () => {
            return Storage.set(CONFIG.STORAGE_KEYS.API_KEYS, {});
        }
    },
    
    // Session management
    session: {
        /**
         * Get session data
         * @param {string} key - Session key
         * @param {any} defaultValue - Default value
         * @returns {any}
         */
        get: (key, defaultValue = null) => {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error(`Error getting session item: ${key}`, error);
                return defaultValue;
            }
        },
        
        /**
         * Set session data
         * @param {string} key - Session key
         * @param {any} value - Value to store
         * @returns {boolean}
         */
        set: (key, value) => {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error(`Error setting session item: ${key}`, error);
                return false;
            }
        },
        
        /**
         * Remove session data
         * @param {string} key - Session key
         * @returns {boolean}
         */
        remove: (key) => {
            try {
                sessionStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error(`Error removing session item: ${key}`, error);
                return false;
            }
        },
        
        /**
         * Clear all session data
         * @returns {boolean}
         */
        clear: () => {
            try {
                sessionStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing session storage', error);
                return false;
            }
        }
    },
    
    // Cache management with expiration
    cache: {
        /**
         * Set cache item with expiration
         * @param {string} key - Cache key
         * @param {any} value - Value to cache
         * @param {number} ttl - Time to live in milliseconds
         * @returns {boolean}
         */
        set: (key, value, ttl = 3600000) => { // Default 1 hour
            const item = {
                value,
                expiry: Date.now() + ttl
            };
            return Storage.set(`cache_${key}`, item);
        },
        
        /**
         * Get cache item if not expired
         * @param {string} key - Cache key
         * @param {any} defaultValue - Default value
         * @returns {any}
         */
        get: (key, defaultValue = null) => {
            const item = Storage.get(`cache_${key}`);
            if (!item) return defaultValue;
            
            if (Date.now() > item.expiry) {
                Storage.remove(`cache_${key}`);
                return defaultValue;
            }
            
            return item.value;
        },
        
        /**
         * Remove cache item
         * @param {string} key - Cache key
         * @returns {boolean}
         */
        remove: (key) => {
            return Storage.remove(`cache_${key}`);
        },
        
        /**
         * Clear expired cache items
         * @returns {number} - Number of items cleared
         */
        clearExpired: () => {
            let cleared = 0;
            const now = Date.now();
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('cache_')) {
                    const item = Storage.get(key);
                    if (item && now > item.expiry) {
                        Storage.remove(key);
                        cleared++;
                    }
                }
            }
            
            return cleared;
        }
    }
};

// Auto-clear expired cache items on load
if (Storage.isAvailable()) {
    Storage.cache.clearExpired();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
