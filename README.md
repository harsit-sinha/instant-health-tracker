# 🍎 Instant Health Tracker

A modern web application that uses AI to analyze food photos and track your daily calorie intake.

## Features

- 📸 **Photo Upload**: Take or upload photos of your food
- 🤖 **AI Analysis**: Uses OpenAI's GPT-4 Vision to analyze food and estimate calories
- 📝 **Food Logging**: Track what you eat throughout the day
- ✏️ **Edit Items**: Modify food items after logging
- 📅 **Calendar View**: See your calorie intake over time
- 🎯 **Goal Tracking**: Set and track daily calorie goals
- �� **Local Storage**: All data is stored locally in your browser

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up OpenAI API**:
   - Get your API key from [OpenAI](https://platform.openai.com/api-keys)
   - Copy `.env.local.example` to `.env.local`
   - Add your API key to `.env.local`:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Upload a food photo**: Click "Add Food" tab and upload a photo of your meal
2. **Add description** (optional): Provide additional context about the food
3. **Analyze**: Click "Analyze Food" to get AI-powered calorie estimation
4. **Review**: Check the analysis and edit if needed
5. **Track progress**: View your daily goal progress and calendar

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 Vision API
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Storage**: Browser localStorage

## API Usage

The app uses OpenAI's GPT-4 Vision API for food analysis. Make sure you have sufficient API credits.

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
