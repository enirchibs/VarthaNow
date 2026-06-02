const apiKey = process.env.LEONARDO_API_KEY || "caa189c3-0676-41f4-9095-11c7eac9ca28";

async function testGeneration() {
  console.log("Initiating test generation with apiKey:", apiKey);
  try {
    const response = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        prompt: "A beautiful, highly detailed professional editorial photograph of a sunny day at the seaside in Visakhapatnam, India, Bay of Bengal, palm trees, no text, no watermarks, realistic photojournalism style.",
        negative_prompt: "cartoon, anime, painting, illustration, blurry text, distorted text, watermark, logo, low quality, unrealistic faces, AI artifacts.",
        modelId: "5c232a9e-9061-4777-980a-ddc8e65647c6", // Leonardo Vision XL (SDXL Platform standard)
        num_images: 1,
        width: 1024,
        height: 576, // 16:9 Aspect Ratio
        public: false
      })
    });

    console.log("Generation response status:", response.status, response.statusText);
    const data = await response.json();
    console.log("Generation response data:", JSON.stringify(data, null, 2));

    const generationId = data.sdGenerationJob?.generationId;
    if (!generationId) {
      console.error("No generationId found.");
      return;
    }

    console.log("Queued successfully! Polling for generation ID:", generationId);

    let attempts = 0;
    let imageUrl = null;
    while (attempts < 15) {
      await new Promise(r => setTimeout(r, 4000));
      attempts++;
      
      const pollRes = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });
      
      if (!pollRes.ok) {
        console.warn(`Polling failed on attempt ${attempts} with status: ${pollRes.status}`);
        continue;
      }
      
      const pollData = await pollRes.json();
      const generation = pollData.generations_by_pk;
      if (generation) {
        console.log(`[Attempt ${attempts}/15] Status: ${generation.status}`);
        if (generation.status === "COMPLETE") {
          imageUrl = generation.generated_images?.[0]?.url || null;
          break;
        } else if (generation.status === "FAILED") {
          console.error("Image generation failed.");
          return;
        }
      }
    }

    if (imageUrl) {
      console.log("SUCCESS! Generated Image URL:", imageUrl);
    } else {
      console.error("FAILED! Image generation timed out or no image URL returned.");
    }
  } catch (error) {
    console.error("Error during generation:", error);
  }
}

testGeneration();
