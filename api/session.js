export default async function handler(req, res) {
  try {
    // Optional: CORS (schadet nicht)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    // API Key lesen (mehrere mögliche Namen, damit du flexibel bist)
    const apiKey =
      (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) ||
      (process.env.open_api_key && process.env.open_api_key.trim()) ||
      null;

    if (!apiKey) {
      res.status(500).json({ error: "Missing OPENAI_API_KEY env var" });
      return;
    }

    // Realtime client_secret erzeugen
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-4o-realtime-preview",
          output_modalities: ["audio"],
          audio: { output: { voice: "marin" } },
          instructions:
            "Du bist ein Rollenspiel-Sparringspartner für Fitnessstudio-Mitarbeitende. Bleib realistisch, freundlich, klar und gib danach kurzes Feedback."
        }
      })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      res.status(500).json({ error: "OpenAI returned non-JSON", raw: text.slice(0, 300) });
      return;
    }

    if (!response.ok) {
      res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed",
        details: data
      });
      return;
    }

    // Frontend erwartet { value: "ek_..." }
    res.status(200).json(data.client_secret);
  } catch (err) {
    res.status(500).json({
      error: err?.message || "Server error",
      where: "api/session.js"
    });
  }
}




