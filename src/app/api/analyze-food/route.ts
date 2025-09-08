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

    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Log image details for debugging
    console.log('Received image:', {
      startsWithDataImage: image.startsWith('data:image/'),
      imageType: image.substring(0, 50) + '...',
      imageLength: image.length,
      hasJpeg: image.includes('data:image/jpeg'),
      hasPng: image.includes('data:image/png'),
      hasWebp: image.includes('data:image/webp')
    });

    // Validate image format
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid image format. Please upload a valid image file.' },
        { status: 400 }
      );
    }

    // Additional validation for image format - support more formats
    const supportedFormats = [
      'data:image/jpeg', 'data:image/jpg', 'data:image/png', 'data:image/gif', 
      'data:image/bmp', 'data:image/tiff', 'data:image/tif', 'data:image/webp', 
      'data:image/avif', 'data:image/heic', 'data:image/heif'
    ];
    
    const isSupportedFormat = supportedFormats.some(format => image.includes(format));
    
    if (!isSupportedFormat) {
      return NextResponse.json(
        { success: false, error: 'Unsupported image format. Please use JPEG, PNG, WebP, HEIC, AVIF, or other common image formats.' },
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

    console.log('Sending request to OpenAI with image length:', image.length);
    
    // Check if image is too large for OpenAI (20MB limit)
    if (image.length > 20 * 1024 * 1024) {
      console.log('Image too large for OpenAI API');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Image file is too large. Please use a smaller image.',
          details: 'The image is larger than 20MB. Please compress or resize the image and try again.'
        },
        { status: 400 }
      );
    }
    
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
    
    console.log('OpenAI response received:', {
      hasChoices: !!response.choices,
      choicesLength: response.choices?.length,
      hasContent: !!response.choices?.[0]?.message?.content
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
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('400') || error.message.includes('unsupported image') || error.message.includes('image_parse_error')) {
        console.log('OpenAI image format error detected');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Image format not supported. Please try taking a new photo or using a different image.',
            details: 'The image format is not supported by OpenAI. Try taking a new photo with your camera or using a different image file. Camera photos sometimes need to be converted to a different format.'
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes('401')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid API key. Please check your OpenAI API key.',
            details: 'The OpenAI API key is invalid or expired.'
          },
          { status: 401 }
        );
      }
      
      if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('exceeded')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'API quota exceeded. Please check your OpenAI account or try again later.',
            details: 'You have exceeded your OpenAI API usage limits. Check your account at platform.openai.com or wait for limits to reset.'
          },
          { status: 429 }
        );
      }
    }
    
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
