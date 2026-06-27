import Groq from 'groq-sdk';
import logger from '../utils/logger';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// Free and fast Groq model — swap to 'llama-3.3-70b-versatile' for higher quality
const MODEL_NAME = 'llama-3.1-8b-instant';

export interface ProfileContext {
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  fitnessGoal?: string;
  foodPreference?: string;
  allergies?: string[];
  monthlyBudget?: number;
  dailyCalorieTarget?: number;
  dailyProteinTarget?: number;
  activityLevel?: string;
  city?: string;
  gymPreference?: string;
}

const SYSTEM_CONTEXT = `You are FitRupee AI — an expert nutritionist, fitness coach, and budget planner specializing in affordable Indian nutrition. You have deep knowledge of:
- Affordable Indian foods: soya chunks, eggs, dal, chana, peanuts, poha, oats, rice, curd, paneer, tofu, moong dal, rajma, chicken (non-veg)
- Indian market prices, regional variations, seasonal availability
- High protein-per-rupee foods and nutrition optimization
- Traditional Indian recipes adapted for fitness goals
- Workout plans suitable for Indian lifestyle (home and gym)
Always respond with accurate JSON when requested. Focus on budget-conscious, practical advice for Indian users.`;

// ─── Helper: call Groq chat completion ───────────────────────────────────────

const callGroq = async (prompt: string, maxTokens: number = 4096): Promise<string> => {
  const completion = await groq.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: SYSTEM_CONTEXT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  return completion.choices[0]?.message?.content || '';
};

// ─── Meal Plan Generation ─────────────────────────────────────────────────────

export const generateMealPlan = async (
  profile: ProfileContext,
  days: number = 7
): Promise<any> => {
  const dailyBudget = Math.round((profile.monthlyBudget || 3000) / 30);

  const prompt = `Generate a ${days}-day meal plan for an Indian user with these details:
- Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight}kg, Height: ${profile.height}cm
- Goal: ${profile.fitnessGoal}, Activity: ${profile.activityLevel}
- Food preference: ${profile.foodPreference}
- Allergies: ${profile.allergies?.join(', ') || 'none'}
- Daily calorie target: ${profile.dailyCalorieTarget} kcal
- Daily protein target: ${profile.dailyProteinTarget}g
- Daily food budget: ₹${dailyBudget}
- City: ${profile.city}

Return ONLY a valid JSON object with this exact structure:
{
  "title": "7-Day Budget Fitness Meal Plan",
  "weeklyGroceryCost": 850,
  "plan": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": {
          "name": "Masala Oats with Peanuts",
          "ingredients": ["50g oats", "20g peanuts", "vegetables"],
          "calories": 350,
          "protein": 15,
          "carbs": 45,
          "fat": 10,
          "estimatedCost": 18,
          "preparationTime": 10,
          "instructions": "Boil oats, add vegetables and peanuts, season with spices"
        },
        "lunch": {},
        "dinner": {},
        "snacks": [{}]
      },
      "totalCalories": 1800,
      "totalProtein": 120,
      "totalCost": 95
    }
  ]
}

Focus on affordable Indian foods. Ensure variety across days. Include dal, soya chunks, eggs (if non-veg/eggetarian), paneer, peanuts, oats, rice, poha etc. Keep costs realistic for Indian markets.`;

  const text = await callGroq(prompt);
  return parseJsonResponse(text);
};

// ─── Workout Plan Generation ──────────────────────────────────────────────────

export const generateWorkoutPlan = async (profile: ProfileContext): Promise<any> => {
  const prompt = `Generate a weekly workout plan for:
- Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight}kg
- Goal: ${profile.fitnessGoal}
- Activity level: ${profile.activityLevel}
- Gym preference: ${profile.gymPreference}

Return ONLY valid JSON:
{
  "title": "4-Day Home Strength Program",
  "level": "beginner",
  "type": "${profile.gymPreference}",
  "goal": "${profile.fitnessGoal}",
  "daysPerWeek": 4,
  "plan": [
    {
      "day": "Monday",
      "focus": "Upper Body",
      "estimatedDuration": 45,
      "caloriesBurned": 250,
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "10-12",
          "restSeconds": 60,
          "instructions": "Keep body straight, lower chest to ground",
          "targetMuscles": ["chest", "shoulders", "triceps"],
          "equipment": "bodyweight"
        }
      ]
    }
  ]
}`;

  const text = await callGroq(prompt);
  return parseJsonResponse(text);
};

// ─── Grocery Plan ─────────────────────────────────────────────────────────────

export const generateGroceryPlan = async (
  profile: ProfileContext,
  weeklyBudget: number
): Promise<any> => {
  const prompt = `Generate a weekly grocery list for an Indian ${profile.foodPreference} person.
Details: weekly budget ₹${weeklyBudget}, goal: ${profile.fitnessGoal}, protein target: ${profile.dailyProteinTarget}g/day, city: ${profile.city}, allergies: ${profile.allergies?.join(', ') || 'none'}.

Rules:
- Include exactly 10 grocery items (no more, no less)
- Prioritize high protein-per-rupee foods
- affordabilityScore = protein grams per ₹10 spent
- Output ONLY the raw JSON object below. No explanation, no markdown, no extra text.

{"title":"Weekly Budget Grocery Plan","totalEstimatedCost":0,"items":[{"name":"","quantity":"","unit":"g","estimatedPrice":0,"category":"","nutritionPer100g":{"protein":0,"calories":0,"carbs":0,"fat":0},"affordabilityScore":0}],"nutritionSummary":{"totalCalories":0,"totalProtein":0,"totalCarbs":0,"totalFat":0}}`;

  const text = await callGroq(prompt, 6000);
  return parseJsonResponse(text);
};

// ─── Protein Under ₹100 ───────────────────────────────────────────────────────

export const generateProteinBudgetPlan = async (
  profile: ProfileContext,
  budget: number = 100
): Promise<any> => {
  const prompt = `Create a maximum-protein meal plan for exactly ₹${budget}/day for an Indian ${profile.foodPreference} person targeting ${profile.dailyProteinTarget}g protein.

Return ONLY valid JSON:
{
  "title": "Max Protein ₹${budget}/day Plan",
  "totalBudget": ${budget},
  "totalProtein": 95,
  "totalCalories": 1600,
  "meals": [
    {
      "name": "Soya Chunk Dal Khichdi",
      "time": "Breakfast",
      "ingredients": [{"item": "Soya chunks", "quantity": "50g", "cost": 4.5, "protein": 26}],
      "totalCost": 22,
      "totalProtein": 32,
      "totalCalories": 380,
      "recipe": "Cook soya chunks with moong dal and rice..."
    }
  ],
  "proteinSources": [
    {"food": "Soya Chunks", "proteinPer100g": 52, "costPer100g": 9, "proteinPerRupee": 5.8}
  ],
  "tips": ["Buy soya chunks in bulk for better pricing", "..."]
}`;

  const text = await callGroq(prompt);
  return parseJsonResponse(text);
};

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export const chatWithAI = async (
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  profile: ProfileContext
): Promise<string> => {
  const profileContext = `User profile: ${profile.age}yr ${profile.gender}, ${profile.weight}kg, goal: ${profile.fitnessGoal}, diet: ${profile.foodPreference}, budget: ₹${profile.monthlyBudget}/month, city: ${profile.city}.`;

  const systemPrompt = `${SYSTEM_CONTEXT}\n\n${profileContext}\n\nYou are a helpful fitness and nutrition assistant. Be concise, friendly, and practical.`;

  const groqMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const completion = await groq.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: systemPrompt },
      ...groqMessages,
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || '';
};

// ─── Food Image Analysis (Groq is text-only — returns helpful message) ────────

export const analyzeFoodImage = async (_imageBase64: string, _mimeType: string): Promise<any> => {
  // Groq does not support vision/image input on free tier models.
  // Return a structured placeholder so the frontend doesn't break.
  logger.warn('analyzeFoodImage called but Groq does not support image input. Returning placeholder.');
  return {
    detectedFoods: ['Unable to analyze — image input not supported with Groq'],
    estimatedCalories: 0,
    estimatedProtein: 0,
    estimatedCarbs: 0,
    estimatedFat: 0,
    portionSize: 'Unknown',
    healthScore: 0,
    nutritionNotes:
      'Image analysis requires a vision-capable model. Please switch to Gemini or OpenAI for this feature.',
    affordabilityNote: 'N/A',
    suggestions: ['Describe your meal in the chat for a manual nutrition estimate.'],
    alternativeRecipes: [],
  };
};

// ─── Food Substitution ────────────────────────────────────────────────────────

export const getFoodSubstitutions = async (
  food: string,
  profile: ProfileContext
): Promise<any> => {
  const prompt = `Suggest budget-friendly Indian alternatives to "${food}" for a ${profile.foodPreference} person with ₹${profile.monthlyBudget}/month budget.

Return ONLY valid JSON:
{
  "originalFood": "${food}",
  "substitutes": [
    {
      "name": "Soya Chunks",
      "reason": "High protein, much cheaper than chicken",
      "costComparison": "₹9/100g vs ₹40/100g",
      "proteinComparison": "52g vs 25g per 100g",
      "availability": "Available at all kirana stores",
      "preparationTip": "Boil in salted water for 5 minutes before using"
    }
  ]
}`;

  const text = await callGroq(prompt);
  return parseJsonResponse(text);
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const parseJsonResponse = (text: string): any => {
  try {
    const cleaned = text
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (firstError) {
    try {
      const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (secondError) {
      logger.error('Secondary JSON parse failed');
    }
    logger.error(`Failed AI response (first 1000 chars): ${text.substring(0, 1000)}`);
    throw new Error('AI response parsing failed');
  }
};