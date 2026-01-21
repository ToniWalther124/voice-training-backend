import OpenAI from "openai";

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

    const client = new OpenAI({ apiKey });

    const session = await client.realtime.sessions.create({
      model: "gpt-4o-realtime-preview",
      voice: "alloy",
      instructions: `
Du bist ein Trainings-Rollenspielpartner für Fitnessstudio-Mitarbeitende.
Du bleibst konsequent in der Kundenrolle.
Du coachst NICHT während des Gesprächs.
Feedback erfolgt erst nach dem Training.
      `.trim()
    });

    res.status(200).json(session.client_secret);
  } catch (err) {
    res.status(500).json({ error: err?.message || "Unknown server error" });
  }
}

