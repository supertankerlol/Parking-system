/**
 * config.js
 * Centralized configuration for the frontend application.
 * Single source of truth for API and socket URLs.
 */

(function () {
    'use strict';

    const hostname = window.location.hostname;

    /**
     * API Base URL
     * - Defaults to http://localhost:5000/api for local development
     * - Override by setting window.API_BASE_OVERRIDE before this script loads
     */
    const API_BASE = window.API_BASE_OVERRIDE ||
        (hostname === 'localhost' || hostname === '127.0.0.1'
            ? 'http://localhost:5000/api'
            : `${window.location.origin}/api`);

    /**
     * WebSocket URL
     * - Defaults to ws://localhost:5000 for local development
     * - Override by setting window.SOCKET_URL_OVERRIDE before this script loads
     */
    const SOCKET_URL = window.SOCKET_URL_OVERRIDE ||
        (hostname === 'localhost' || hostname === '127.0.0.1'
            ? 'ws://localhost:5000'
            : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);

    // Export to window for global access
    window.APP_CONFIG = {
        API_BASE,
        SOCKET_URL
    };

    // Also export individual constants for convenience
    window.API_BASE = API_BASE;
    window.SOCKET_URL = SOCKET_URL;

    console.log('[Config] API_BASE:', API_BASE);
    console.log('[Config] SOCKET_URL:', SOCKET_URL);
})();
