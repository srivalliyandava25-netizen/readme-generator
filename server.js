
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ message: "README Generator backend is running!" });
});

app.post("/api/generate-readme", async (req, res) => {
  try {
    const { projectName, description, features, technologies } = req.body;

    if (
      typeof projectName !== "string" ||
      typeof description !== "string" ||
      typeof features !== "string" ||
      typeof technologies !== "string" ||
      !projectName.trim() ||
      !description.trim() ||
      !features.trim() ||
      !technologies.trim()
    ) {
      return res.status(400).json({
        error: "Please provide all project details.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is missing. Check your .env file.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are a professional technical writer.
Generate a clear, beginner-friendly README.md in Markdown.

Use only the information supplied below. Do not invent links,
installation commands, features, or project capabilities.
If important information is missing, use a clear placeholder.

Project name: ${projectName.trim()}
Description: ${description.trim()}
Key features:
${features.trim()}

Technologies: ${technologies.trim()}

Include these sections where appropriate:
- Project title
- Description
- Features
- Technologies Used
- Installation and Setup (use placeholders if commands are unknown)
- Usage
- Future Improvements (only if appropriate)
- License (say "Not specified" if unknown)

Return only the Markdown content, without surrounding code fences.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const readme = response.text;

    if (!readme || !readme.trim()) {
      return res.status(502).json({
        error: "Gemini returned an empty response. Please try again.",
      });
    }

    res.json({ readme: readme.trim() });

  } catch (error) {
    console.error("README generation error:", error);

    res.status(500).json({
      error: "Could not generate README. Check your API key and try again.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
