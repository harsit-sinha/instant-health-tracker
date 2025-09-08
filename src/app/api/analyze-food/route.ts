import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { image, description } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    // Create a prompt for food analysis
    const prompt = `Analyze this food image and provide:
1. The name of the food item
2. Estimated calories (be specific and realistic)
3. A brief explanation of how you derived the calorie estimate

${description ? `Additional context: ${description}` : ''}

Please respond in the following JSON format:
{
  "name": "Food name",
  "calories": number,
  "analysis": "Brief explanation of calorie estimation"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback: create a structured response from the text
      const lines = content.split('\n').filter(line => line.trim());
      parsedResponse = {
        name: lines[0] || 'Unknown Food',
        calories: 300, // Default fallback
        analysis: content || 'Unable to analyze food item'
      };
    }

    return NextResponse.json({
      success: true,
      name: parsedResponse.name || 'Unknown Food',
      calories: parsedResponse.calories || 300,
      analysis: parsedResponse.analysis || 'Unable to analyze food item'
    });

  } catch (error) {
    console.error('Error analyzing food:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze food image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
