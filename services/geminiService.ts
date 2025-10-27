
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    // This is a placeholder check. In a real environment, the key would be set.
    // We will proceed assuming it's available, as per the instructions.
    console.warn("API_KEY environment variable not set. The application will not be able to connect to the Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const summarizeCode = async (code: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                You are an expert code analyst. Below is a concatenation of multiple code files.
                Provide a concise, high-level summary of what this code does.
                Focus on the overall purpose, the main components or classes, and how they interact.
                Use markdown for formatting, including bullet points for key features.
                Do not analyze each file separately; provide a holistic view of the entire codebase.

                Code:
                \`\`\`
                ${code}
                \`\`\`
            `,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
};
