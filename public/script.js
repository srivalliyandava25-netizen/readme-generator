
const form = document.getElementById("readme-form");
const generateBtn = document.getElementById("generate-btn");
const resultSection = document.getElementById("result-section");
const readmeOutput = document.getElementById("readme-output");
const copyBtn = document.getElementById("copy-btn");
const statusMessage = document.getElementById("status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const projectName = document.getElementById("projectName").value.trim();
  const description = document.getElementById("description").value.trim();
  const features = document.getElementById("features").value.trim();
  const technologies = document.getElementById("technologies").value.trim();

  if (!projectName || !description || !features || !technologies) {
    statusMessage.textContent = "Please fill in all fields.";
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  statusMessage.textContent = "Generating your README. Please wait.";
  resultSection.hidden = true;

  try {
    const response = await fetch("/api/generate-readme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectName,
        description,
        features,
        technologies,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate README.");
    }

    readmeOutput.textContent = data.readme;
    resultSection.hidden = false;
    statusMessage.textContent = "README generated successfully!";
  } catch (error) {
    statusMessage.textContent = error.message;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate README";
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(readmeOutput.textContent);
    statusMessage.textContent = "README copied to clipboard!";
  } catch {
    statusMessage.textContent =
      "Could not copy automatically. Please select and copy the README manually.";
  }
});
