
// Declare fbq as a global function to avoid TypeScript errors
declare global {
    interface Window {
        fbq: any;
    }
}

/**
 * Meta Pixel Tracking Utility
 */
export const Pixel = {
    /**
     * Track Standard Events
     * @param eventName Name of the Meta standard event (e.g., 'PageView', 'Purchase', 'InitiateCheckout')
     * @param params Optional parameters like value, currency, content_name, etc.
     */
    track: (eventName: string, params?: Record<string, any>) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', eventName, params);
            if (import.meta.env.DEV) {
                console.log(`[Meta Pixel] Event: ${eventName}`, params);
            }
        }
    },

    /**
     * Track Custom Events
     * @param eventName Name of the custom event
     * @param params Optional parameters
     */
    trackCustom: (eventName: string, params?: Record<string, any>) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('trackCustom', eventName, params);
            if (import.meta.env.DEV) {
                console.log(`[Meta Pixel] Custom Event: ${eventName}`, params);
            }
        }
    }
};
