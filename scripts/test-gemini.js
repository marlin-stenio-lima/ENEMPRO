import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDJNIKtsVTdIDcN5Ftm5qLhyOZR3JkIeOY";

console.log(`🔑 Testando chave hardcoded: ${API_KEY.substring(0, 10)}...`);

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // List models to check connectivity
        // Note: The SDK does not have a direct 'listModels' on the main class in some versions, 
        // but we can try a simple generation on a known model or handle the specific 404 better.

        // Let's try gemini-1.5-flash again as it's the newest standard
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("📡 Tentando conectar com gemini-1.5-flash...");
        const result = await model.generateContent("Oi");
        const response = await result.response;
        console.log("✅ SUCESSO com gemini-1.5-flash!");
        console.log(response.text());

    } catch (error) {
        console.error("❌ Erro detalhado:");
        console.error(JSON.stringify(error, null, 2));

        // Fallback to pro
        try {
            console.log("📡 Tentando fallback para gemini-1.0-pro...");
            const genAI2 = new GoogleGenerativeAI(API_KEY);
            const model2 = genAI2.getGenerativeModel({ model: "gemini-1.0-pro" });
            const result2 = await model2.generateContent("Oi");
            console.log("✅ SUCESSO com gemini-1.0-pro!");
        } catch (e) {
            console.error("❌ Falha também no fallback.");
        }
    }
}

test();
