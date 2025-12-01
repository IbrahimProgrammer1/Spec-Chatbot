const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const key = "AIzaSyBL_frqWmDB9GoEwmq-iX4G3_K_JKE8jKI";
        // Access the model directly via REST if SDK doesn't expose listModels easily, 
        // or try to use the SDK's method if I recall correctly.
        // Actually, let's try a simple fetch to the API endpoint to list models.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
