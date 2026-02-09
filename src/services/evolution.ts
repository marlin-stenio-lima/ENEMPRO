/**
 * Evolution API Service
 * 
 * Handles sending WhatsApp messages via Evolution API.
 */

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;

export class EvolutionService {
    static async sendMessage(phone: string, text: string) {
        if (!EVOLUTION_URL || !EVOLUTION_KEY) {
            console.warn('Evolution API credentials missing');
            return;
        }

        try {
            const response = await fetch(`${EVOLUTION_URL}/message/sendText/default`, { // Assuming 'default' instance, verify if needed
                method: 'POST',
                headers: {
                    'apikey': EVOLUTION_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    number: phone, // Evolution usually expects number with country code, e.g., 5511999999999
                    options: {
                        delay: 1200,
                        presence: "composing",
                        linkPreview: false
                    },
                    textMessage: {
                        text: text
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Evolution API error: ${response.status} - ${errorData}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to send WhatsApp message:', error);
            throw error;
        }
    }
}
