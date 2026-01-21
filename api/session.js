// api/session.js
export default async function handler(req, res) {
  try {
    // Falls du in Vercel den Key anders benannt hast:
    const apiKey =
      process.env.OPENAI_API_KEY ||
      process.env.open_api_key ||
      process.env.OPEN_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "No API key found. Set OPENAI_API_KEY (recommended) or open_api_key in Vercel env vars.",
      });
    }

    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime", // Pflicht
          // model optional, aber sinnvoll
          model: "gpt-4o-realtime-preview",
          output_modalities: ["audio"], // oder ["text"]
          audio: {
            output: {
              voice: "marin", // <-- HIER ist die Voice korrekt
              // format ist optional, kann aber drin bleiben:
              format: { type: "audio/pcm", rate: 24000 },
            },
          },
          instructions:
            "Du bist ein Rollenspiel-Sparringspartner für Fitnessstudio-Mitarbeitende. Bleib realistisch, freundlich, klar und gib danach kurzes Feedback.",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed",
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
}




