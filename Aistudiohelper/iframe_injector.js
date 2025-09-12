
(function() {
    'use strict';

    // Prevent this script from being injected multiple times
    if (window.monicaErrorListenerInjected) {
        return;
    }
    window.monicaErrorListenerInjected = true;

    const postError = (error) => {
        // We post to a specific target origin for security, but in a sandboxed iframe
        // it may be null. '*' is a fallback, but less secure.
        const targetOrigin = window.location.origin === 'null' ? '*' : window.location.origin;
        window.parent.postMessage({
            type: 'MONICA_IFRAME_ERROR',
            error: error,
        }, targetOrigin);
    };

    // 1. Capture console.error
    const originalConsoleError = console.error;
    console.error = function(...args) {
        // Format the arguments into a single string
        const errorString = args.map(arg => {
            if (arg instanceof Error) {
                return arg.stack || arg.message;
            }
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return '[Unserializable Object]';
                }
            }
            return String(arg);
        }).join(' ');

        postError(`console.error: ${errorString}`);
        originalConsoleError.apply(console, args);
    };

    // 2. Capture window.onerror
    window.onerror = function(message, source, lineno, colno, error) {
        let errorDetails = `Uncaught Error: ${message}`;
        if (source) errorDetails += ` at ${source}:${lineno}:${colno}`;
        if (error && error.stack) {
            errorDetails += `\nStack: ${error.stack}`;
        }
        postError(errorDetails);
        return false; // Let the default handler run as well
    };
    
    // 3. Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        let reason = event.reason;
        let errorDetails = 'Unhandled Promise Rejection: ';
        if (reason instanceof Error) {
            errorDetails += reason.stack || reason.message;
        } else {
            try {
                errorDetails += JSON.stringify(reason);
            } catch (e) {
                errorDetails += String(reason);
            }
        }
        postError(errorDetails);
    });

})();
