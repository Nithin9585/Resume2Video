import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { parsedResume } = await req.json();

    if (!parsedResume) {
      return Response.json({ error: "Missing parsedResume data" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI assistant generating a 30-40 second video script based on a parsed resume.
      The script should sound natural and engaging, structured as follows:

      1. **Introduction** (Name, location, brief background)
      2. **Education** (College, major, year)
      3. **Internships** (Company name, role, key contributions)
      4. **Projects** (Mention 1-2 major projects with impact)
      5. **Certifications & Achievements** (Highlight notable ones)
      6. **Skills & Spoken Languages** (Summarize technical and language skills)

      Format the response naturally as if the person is speaking in a video.

      Here is the parsed resume data:
      ${parsedResume}
    `;

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    console.log("API Response:", JSON.stringify(response, null, 2)); 

    const candidates = response.response?.candidates; 
    
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini API");
    }

    const videoScript = candidates[0]?.content?.parts?.[0]?.text || "Script generation failed";

    return Response.json({ script: videoScript });

  } catch (error) {
    console.error("Error generating script:", error);
    return Response.json({ error: error.message || "Failed to generate script" }, { status: 500 });
  }
}
