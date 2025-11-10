const axios = require('axios');


const captionTool = async (args) => {
  try {
    let inputImageUrl;
    
    // Expo Go case
    // Our React Native app sends images as base64 strings in case of Expo Go
    // DO NOT USE large images in Expo Go as base64 strings can be very large
    if (args.imageBase64) {
      inputImageUrl = `data:image/jpeg;base64,${args.imageBase64}`;
    } else if (args.file) {
      console.log("Caption tool received image file buffer data");
      // Web or production case, image is sent as FormData file
      const base64 = args.file.buffer.toString("base64");
      inputImageUrl = `data:${args.file.mimetype};base64,${base64}`;

    } else {
      throw new Error("No image data received");
    }

    console.log("Caption tool constructed inputImageUrl:", inputImageUrl?.substring(0, 50) + "..." );
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
                text: "Describe this image in few sentences or a paragraph.",
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

    console.log("Caption tool received response from OpenAI:", response.data?.output?.[0]?.content?.[0]);

    const textOutput = response.data?.output?.[0]?.content?.[0]?.text || "No caption generated";

    return textOutput.trim();

  } catch (err) {
    console.error("ERROR: OPENAI API error:", err.response?.data || err.message);
    throw err
  }
};

module.exports = captionTool;
