const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
    try {
        const key = "AIzaSyBL_frqWmDB9GoEwmq-iX4G3_K_JKE8jKI";
        console.log("Testing key:", key);
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testKey();
