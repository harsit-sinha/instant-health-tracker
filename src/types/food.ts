export interface FoodItem {
  id: string;
  name: string;
  description?: string;
  calories: number;
  analysis: string;
  imageUrl?: string;
  timestamp: string;
}

export interface DailyLog {
  date: string;
  items: FoodItem[];
  totalCalories: number;
}

export interface OpenAIResponse {
  name: string;
  calories: number;
  analysis: string;
}
