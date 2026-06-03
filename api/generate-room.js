export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { products = [] } = req.body || {};

    console.log('PRODUCTS:', products);

    const productNames = products
      .map((p) => p.title)
      .filter(Boolean)
      .join(', ');

    const prompt = `
Create a luxury modern living room interior.

Use these exact furniture products from the customer's Shopify cart:
${productNames}

Important:
- Use the cart products as the main furniture items.
- Keep the style close to the selected products.
- Create a premium villa living room.
- Ultra realistic furniture photography.
- Natural daylight.
- Interior design magazine quality.
- Clean, elegant, high-end composition.
`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: 'OpenAI API error',
        details: data
      });
    }

    const imageBase64 = data.data?.[0]?.b64_json;

    if (!imageBase64) {
      return res.status(500).json({
        error: 'No image returned from OpenAI',
        details: data
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`,
      products,
      prompt
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
