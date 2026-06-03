export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: `
Luxury modern living room.
Green modular sofa.
Beige designer armchair.
Wood coffee table.
Premium interior design.
Ultra realistic furniture photography.
Natural daylight.
High-end villa.
`,
          size: "1024x1024"
        })
      }
    );

const data = await response.json();

const imageBase64 = data.data[0].b64_json;

return res.status(200).json({
  image: `data:image/png;base64,${imageBase64}`
});

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
