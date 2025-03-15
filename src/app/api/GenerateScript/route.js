import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { parsedResume } = await req.json();

    if (!parsedResume) {
      return Response.json({ error: "Missing parsedResume data" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an AI assistant generating a 30-40 second video script based on a parsed resume.
      The script should be concise and only include what the person would say.

      Structure the script as follows:

      1. **Introduction**: Start by stating your name and a brief, engaging introduction (e.g., "Hi, I'm [Name] from [Location]").
      2. **Education**: Briefly mention your college, major, and year of study.
      3. **Internships**: Mention the company name and your role, highlighting one key contribution or learning.
      4. **Projects**: Briefly describe 1-2 interesting projects and their purpose.
      5. **Achievements**: Highlight any significant achievements or recognitions.
      6. **Skills & Languages**: List your key technical skills and spoken languages.
      7. **Closing**: End with a call to action or a brief positive statement (e.g., "I'm eager to connect and learn more!").

      Format the response as a direct speech, without any extra descriptions about video shots, transitions, or your tone. Focus solely on the words the person would speak.

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