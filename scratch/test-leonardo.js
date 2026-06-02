const apiKey = process.env.LEONARDO_API_KEY || "caa189c3-0676-41f4-9095-11c7eac9ca28";

async function testLeonardo() {
  console.log("Testing Leonardo API Key:", apiKey);
  try {
    const response = await fetch("https://cloud.leonardo.ai/api/rest/v1/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    console.log("Response status for /me:", response.status, response.statusText);
    const text = await response.text();
    console.log("Response body for /me:", text);

    const modelsRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/platformModels", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });
    console.log("Response status for /platformModels:", modelsRes.status, modelsRes.statusText);
    const modelsText = await modelsRes.text();
    console.log("Response body for /platformModels length:", modelsText.length);
  } catch (error) {
    console.error("Error connecting to Leonardo API:", error);
  }
}

testLeonardo();
