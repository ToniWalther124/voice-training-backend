export default async function handler(req, res) {
  // Wichtig: IMMER etwas zurückgeben
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
          instructions: "Sag nur: 'Hallo, ich bin bereit.'"
        }
      })
    });

    const text = await r.text();

    // Debug: wenn OpenAI nicht ok ist, geben wir das als JSON zurück
    if (!r.ok) {
      return res.status(r.status).json({ error: "OpenAI error", raw: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "Non-JSON from OpenAI", raw: text });
    }

    // DAS ist die wichtigste Zeile: Body darf nicht leer sein
    return res.status(200).json(data.client_secret);
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
