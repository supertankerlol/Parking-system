/**
 * socket-client.js
 * WebSocket client for real-time updates.
 * 
 * Depends on:
 * - config.js (must be loaded first for SOCKET_URL)
 * - Socket.IO client library (https://cdn.socket.io/4.x/socket.io.min.js)
 */

(function () {
    'use strict';

    let socket = null;

    /**
     * Initialize the Socket.IO client connection.
     * 
     * @param {Function} [onConnect] - Callback fired when connection is established
     * @param {Object} [handlers] - Map of event names to handler functions
     * @returns {Object} The socket instance
     * 
     * @example
     * initSocket(
     *     () => console.log('Connected!'),
     *     {
     *         'booking:confirmed': (data) => console.log('Booking confirmed:', data),
     *         'spot:released': (data) => console.log('Spot released:', data)
     *     }
     * );
     */
    function initSocket(onConnect, handlers = {}) {
        // Ensure config is loaded
        const socketUrl = window.SOCKET_URL;
        if (!socketUrl) {
            console.error('[Socket] SOCKET_URL not configured. Ensure config.js is loaded before socket-client.js');
            return null;
        }

        // Check if Socket.IO client is available
        if (typeof io === 'undefined') {
            console.error('[Socket] Socket.IO client not loaded. Include socket.io.min.js before this script.');
            return null;
        }

        // Prevent multiple connections
        if (socket && socket.connected) {
            console.warn('[Socket] Already connected, returning existing socket');
            return socket;
        }

        // Create socket connection
        socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection event handlers
        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            if (typeof onConnect === 'function') {
                onConnect(socket);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            window.dispatchEvent(new CustomEvent('socket:disconnected', {
                detail: { reason }
            }));
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
            window.dispatchEvent(new CustomEvent('socket:error', {
                detail: { error: error.message }
            }));
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
            window.dispatchEvent(new CustomEvent('socket:reconnected', {
                detail: { attemptNumber }
            }));
        });

        // Listen for spot:update and dispatch as window CustomEvent
        socket.on('spot:update', (payload) => {
            console.log('[Socket] spot:update received:', payload);
            window.dispatchEvent(new CustomEvent('spot:update', {
                detail: payload
            }));
        });

        // Register custom handlers
        if (handlers && typeof handlers === 'object') {
            Object.entries(handlers).forEach(([event, handler]) => {
                if (typeof handler === 'function') {
                    socket.on(event, handler);
                    console.log('[Socket] Registered handler for:', event);
                }
            });
        }

        return socket;
    }

    /**
     * Get the current socket instance.
     * @returns {Object|null} The socket instance or null if not initialized
     */
    function getSocket() {
        return socket;
    }

    /**
     * Disconnect the socket connection.
     */
    function disconnectSocket() {
        if (socket) {
            socket.disconnect();
            socket = null;
            console.log('[Socket] Manually disconnected');
        }
    }

    /**
     * Emit an event to the server.
     * @param {string} event - Event name
     * @param {any} data - Data to send
     */
    function emitEvent(event, data) {
        if (socket && socket.connected) {
            socket.emit(event, data);
        } else {
            console.warn('[Socket] Cannot emit, socket not connected');
        }
    }

    // Export to window for global access
    window.initSocket = initSocket;
    window.getSocket = getSocket;
    window.disconnectSocket = disconnectSocket;
    window.emitEvent = emitEvent;

    // Also export as a namespace
    window.SocketClient = {
        init: initSocket,
        get: getSocket,
        disconnect: disconnectSocket,
        emit: emitEvent
    };
})();
