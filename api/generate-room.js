export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { products = [] } = req.body || {};

    const cleanProducts = products
      .filter((p) => p.title && p.image)
      .slice(0, 4);

    console.log('PRODUCTS:', JSON.stringify(cleanProducts, null, 2));

    const prompt = `
Create a luxury modern living room interior using the furniture products shown in the uploaded product images.

Very important:
- Use the product images as visual references.
- Keep the sofa, table, TV stand, colors, materials, and shapes as close as possible to the reference images.
- Do not invent completely different furniture.
- Create a premium villa living room.
- Ultra realistic interior photography.
- Natural daylight.
- High-end furniture catalog quality.
`;

    const content = [
      {
        type: 'input_text',
        text: prompt
      },
      ...cleanProducts.map((product) => ({
        type: 'input_image',
        image_url: product.image
      }))
    ];

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'user',
            content
          }
        ],
        tools: [
          {
            type: 'image_generation'
          }
        ]
      })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {
      return res.status(500).json({
        error: 'OpenAI API error',
        details: data
      });
    }

    const imageOutput = data.output?.find(
      (item) => item.type === 'image_generation_call'
    );

    const imageBase64 = imageOutput?.result;

    if (!imageBase64) {
      return res.status(500).json({
        error: 'No image returned from OpenAI',
        details: data
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${imageBase64}`,
      products: cleanProducts
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
