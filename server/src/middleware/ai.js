import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ⚠️ only for demo, move to backend later!
});

export const getAIFeedback = async (req, res) => {
  try {
    const { documentText } = req.body;

    // const prompt = `
    // You are an assistant that checks proposals.
    // The document should include these fields:
    // - ACTIVITY TITLE
    // - PROPONENT/S
    // - DATE
    // - VENUE
    // - TARGET PARTICIPANTS
    // - NUMBER OF BENEFECIARIES
    // - BUDGET REQUIREMENTS
    // - SOURCE OF FUNDS
    // - ALIGNED SDGS

    // Task:
    // 1. Check if each field is present in the document.
    // 2. If missing, list them clearly.
    // 3. Provide constructive feedback on how the proposal could be improved.

    // Document content:
    // ---
    // ${documentText}
    // ---
    // `;

    const prompt = `
    create a simple feed back based on the document content

         Document content:
    ---
   ${documentText}
    ---
    
    `;
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ feedback: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get AI feedback" });
  }
};
