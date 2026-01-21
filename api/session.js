import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const session = await client.realtime.sessions.create({
      model: "gpt-4o-realtime-preview",
      voice: "alloy",
      instructions: `
Du bist ein Trainings-Rollenspielpartner für Fitnessstudio-Mitarbeitende.
Du spielst konsequent die Rolle eines Kunden.
Du passt dein Verhalten an das übergebene Szenario und den Kundentyp an.
Du coachst oder erklärst NICHT während des Gesprächs.
Feedback erfolgt ausschließlich nach Beendigung des Trainings.
Bleibe realistisch, authentisch und situationsgerecht.
      `.trim()
    });

    res.status(200).json(session.client_secret);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Fehler beim Erstellen der Realtime-Session"
    });
  }
}
