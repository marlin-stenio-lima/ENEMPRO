

const API_KEYS = [
    import.meta.env.VITE_ABACATE_KEY_1,
    import.meta.env.VITE_ABACATE_KEY_2,
    import.meta.env.VITE_ABACATE_KEY_3,
].filter(Boolean) as string[];

const BASE_URL = "https://api.abacatepay.com/v1";

export class AbacatePayService {
    private static async request(endpoint: string, options: RequestInit = {}) {
        let lastError;

        // Fallback if no keys defined (dev mode)
        if (API_KEYS.length === 0) {
            console.warn("No Abacate Pay Keys found. Check your .env file for VITE_ABACATE_KEY_1, etc.");
            throw new Error("Missing Abacate Pay API Keys");
        }

        for (const apiKey of API_KEYS) {
            try {
                const url = `${BASE_URL}${endpoint}`;
                console.log(`AbacatePay: Calling ${url} with key ending in ...${apiKey.slice(-4)}`);

                const response = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("AbacatePay API Error Response:", {
                        status: response.status,
                        statusText: response.statusText,
                        body: errorText,
                        endpoint
                    });
                    throw new Error(`AbacatePay Error (${response.status}): ${errorText}`);
                }

                const result = await response.json();
                console.log("AbacatePay Success Response:", result);
                return result;
            } catch (error: any) {
                console.warn(`AbacatePay attempt failed for key ending in ...${apiKey.slice(-4)}. Error:`, error.message);
                lastError = error;
                continue;
            }
        }

        console.error("AbacatePay: All API keys exhausted or network error.", lastError);
        throw lastError || new Error(`All AbacatePay API keys failed.`);
    }

    static async createBilling(data: {
        customer: { name: string; email: string; cellphone: string; taxId: string };
        amount: number; // in cents
        description: string;
    }) {
        // Sanitize
        let cleanPhone = data.customer.cellphone.replace(/\D/g, '');
        if (cleanPhone.length === 11 || cleanPhone.length === 10) {
            cleanPhone = '55' + cleanPhone;
        }
        const cleanTaxId = data.customer.taxId.replace(/\D/g, '');

        const payload = {
            frequency: "ONE_TIME",
            methods: ["PIX"],
            products: [
                {
                    externalId: "enem-pro-sub",
                    name: "Assinatura ENEM Pro",
                    description: data.description,
                    quantity: 1,
                    price: data.amount
                }
            ],
            returnUrl: window.location.origin + "/thank-you",
            completionUrl: window.location.origin + "/thank-you",
            customerId: cleanTaxId, // Using CPF as ID or unique
            customer: {
                name: data.customer.name,
                email: data.customer.email,
                cellphone: cleanPhone,
                taxId: cleanTaxId
            },
            metadata: {
                source: "enem-pro-checkout"
            }
        };

        console.log("AbacatePay: Creating Billing with payload:", payload);

        return this.request('/billing/create', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    static async createPixCharge(data: {
        customer: { name: string; email: string; cellphone: string; taxId: string };
        amount: number; // in cents
        description: string;
    }) {
        let cleanPhone = data.customer.cellphone.replace(/\D/g, '');
        if (cleanPhone.length === 11 || cleanPhone.length === 10) {
            cleanPhone = '55' + cleanPhone;
        }
        const cleanTaxId = data.customer.taxId.replace(/\D/g, '');

        const payload = {
            amount: data.amount,
            expiresIn: 3600, // 1 hour
            description: data.description.substring(0, 37), // Max 37 chars
            customer: {
                name: data.customer.name,
                email: data.customer.email,
                cellphone: cleanPhone,
                taxId: cleanTaxId
            },
            metadata: {
                source: "enem-pro-checkout"
            }
        };

        // Debug log
        console.log("AbacatePay: Creating PIX charge with payload:", payload);

        return this.request('/pixQrCode/create', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    static async createExtraEssayCharge(user: { name: string; email: string; cellphone: string; taxId: string }) {
        return this.createPixCharge({
            customer: user,
            amount: 499, // R$ 4,99
            description: "Correção Extra ENEM Pro"
        });
    }

    static async createUpgradeCharge(user: { name: string; email: string; cellphone: string; taxId: string }, amountDiff: number, newPlanName: string) {
        return this.createPixCharge({
            customer: user,
            amount: amountDiff,
            description: `Upgrade para ${newPlanName}`
        });
    }

    static async checkPaymentStatus(pixId: string) {
        const response = await this.request(`/pixQrCode/check?id=${pixId}`);
        console.log("AbacatePay Raw Check Response:", response);
        return response;
    }
}
