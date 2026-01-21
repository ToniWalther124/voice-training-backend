export default async function handler(req, res) {
  try {
    const apiKey =
      (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) ||
      (process.env.open_api_key && process.env.open_api_key.trim()) ||
      null;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "Missing API key. Set OPENAI_API_KEY (recommended) or open_api_key in Vercel Environment Variables (Production)."
      });
    }

    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Optional: TTL in seconds (10..7200). Default ist 600.
        // seconds: 600,

        session: {
          type: "realtime",                 // ✅ DAS war der fehlende Pflicht-Parameter
          model: "gpt-realtime-2025-08-25",
          modalities: ["audio", "text"],
          voice: "alloy",
          instructions:
            "Du bist ein Trainings-Rollenspielpartner für Fitnessstudio-Mitarbeitende. Du bleibst konsequent in der Kundenrolle. Du coachst NICHT während des Gesprächs. Feedback erfolgt erst nach dem Training."
        }
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.error?.message || "Failed to create realtime client secret",
        details: data
      });
    }

    return res.status(200).json(data.client_secret);
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Unknown server error" });
  }
}


