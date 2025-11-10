const axios = require('axios');

// get Image Caption - handler function for /api/caption endpoint
const getImageCaption = async (req, res) => {
  try {
    let inputImageUrl;
    
    // Expo Go case
    // Our React Native app sends images as base64 strings in case of Expo Go
    // DO NOT USE large images in Expo Go as base64 strings can be very large
    if (req.body.imageBase64) {
      inputImageUrl = `data:image/jpeg;base64,${req.body.imageBase64}`;
    } else if (req?.file?.buffer) {
      // Web or production case, image is sent as FormData file
      const base64 = req.file.buffer.toString("base64");
      inputImageUrl = `data:${req.file.mimetype};base64,${base64}`;
    } else {
      return res.status(400).send("No image data received");
    }

    // Call OpenAI API with image input
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Describe this image in one sentence and predict the emotion it evokes.",
              },
              {
                type: "input_image",
                image_url: inputImageUrl,
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.output[0].content[0].text;
    const match = text.match(/emotion\s*(?:is|:)?\s*(\w+)/i);
    console.log("Extracted emotion:", match);
    const emotion = match ? match[1] : "neutral";

    res.json({ caption: text, emotions: [emotion] });
  } catch (err) {
    console.error("ERROR: OPENAI API error:", err.response?.data || err.message);
    res.status(500).send(err.message);
  }
};

module.exports = getImageCaption;

