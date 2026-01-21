export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const apiKey =
      (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) ||
      (process.env.open_api_key && process.env.open_api_key.trim()) ||
      null;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY env var" });
    }

    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
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

    const text = await r.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "OpenAI returned non-JSON", raw: text.slice(0, 300) });
    }

    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.error?.message || "OpenAI request failed",
        details: data
      });
    }

    // Frontend erwartet {value:"ek_..."}
    return res.status(200).json(data.client_secret);
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
