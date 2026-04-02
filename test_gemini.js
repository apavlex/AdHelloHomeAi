import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

(async () => {
try {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent("Say 'SDK Works'");
  console.log("SUCCESS:", response.text());
} catch (e) {
  console.error("SDK ERROR:", e);
}
})();
