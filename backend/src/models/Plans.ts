import mongoose, { Document, Schema } from 'mongoose';

// ─── MealPlan ────────────────────────────────────────────────────────────────

export interface IMeal {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedCost: number;
  preparationTime: number; // minutes
  instructions: string;
}

export interface IDayPlan {
  day: string;
  meals: {
    breakfast: IMeal;
    lunch: IMeal;
    dinner: IMeal;
    snacks: IMeal[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCost: number;
}

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  duration: number; // days
  dailyBudget: number;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  plan: IDayPlan[];
  weeklyGroceryCost: number;
  isActive: boolean;
  createdAt: Date;
}

const mealSchema = new Schema({
  name: String,
  ingredients: [String],
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  estimatedCost: Number,
  preparationTime: Number,
  instructions: String,
});

const mealPlanSchema = new Schema<IMealPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    duration: { type: Number, default: 7 },
    dailyBudget: Number,
    dailyCalorieTarget: Number,
    dailyProteinTarget: Number,
    plan: [
      {
        day: String,
        meals: {
          breakfast: mealSchema,
          lunch: mealSchema,
          dinner: mealSchema,
          snacks: [mealSchema],
        },
        totalCalories: Number,
        totalProtein: Number,
        totalCost: Number,
      },
    ],
    weeklyGroceryCost: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── WorkoutPlan ─────────────────────────────────────────────────────────────

export interface IExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  instructions: string;
  targetMuscles: string[];
  equipment: string;
}

export interface IWorkoutDay {
  day: string;
  focus: string;
  exercises: IExercise[];
  estimatedDuration: number; // minutes
  caloriesBurned: number;
}

export interface IWorkoutPlan extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'gym' | 'home' | 'both';
  goal: string;
  daysPerWeek: number;
  plan: IWorkoutDay[];
  isActive: boolean;
  createdAt: Date;
}

const workoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    type: { type: String, enum: ['gym', 'home', 'both'], default: 'home' },
    goal: String,
    daysPerWeek: { type: Number, default: 4 },
    plan: [
      {
        day: String,
        focus: String,
        exercises: [
          {
            name: String,
            sets: Number,
            reps: String,
            restSeconds: Number,
            instructions: String,
            targetMuscles: [String],
            equipment: String,
          },
        ],
        estimatedDuration: Number,
        caloriesBurned: Number,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── GroceryPlan ─────────────────────────────────────────────────────────────

export interface IGroceryItem {
  name: string;
  quantity: string;
  unit: string;
  estimatedPrice: number;
  category: string;
  nutritionPer100g: { protein: number; calories: number; carbs: number; fat: number };
  affordabilityScore: number; // protein per rupee
}

export interface IGroceryPlan extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  weeklyBudget: number;
  items: IGroceryItem[];
  totalEstimatedCost: number;
  totalProtein: number;
  nutritionSummary: { totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number };
  createdAt: Date;
}

const groceryPlanSchema = new Schema<IGroceryPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: String,
    weeklyBudget: Number,
    items: [
      {
        name: String,
        quantity: String,
        unit: String,
        estimatedPrice: Number,
        category: String,
        nutritionPer100g: { protein: Number, calories: Number, carbs: Number, fat: Number },
        affordabilityScore: Number,
      },
    ],
    totalEstimatedCost: Number,
    totalProtein: Number,
    nutritionSummary: { totalCalories: Number, totalProtein: Number, totalCarbs: Number, totalFat: Number },
  },
  { timestamps: true }
);

// ─── AIChat ───────────────────────────────────────────────────────────────────

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IAIChat extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const aiChatSchema = new Schema<IAIChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New Chat' },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ─── ProgressEntry ────────────────────────────────────────────────────────────

export interface IProgressEntry extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  weight?: number;
  calories?: number;
  protein?: number;
  water?: number; // liters
  workoutCompleted?: boolean;
  mood?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: Date;
}

const progressEntrySchema = new Schema<IProgressEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    weight: Number,
    calories: Number,
    protein: Number,
    water: Number,
    workoutCompleted: Boolean,
    mood: { type: Number, min: 1, max: 5 },
    notes: String,
  },
  { timestamps: true }
);

progressEntrySchema.index({ userId: 1, date: -1 });

// ─── Exports ──────────────────────────────────────────────────────────────────

export const MealPlan = mongoose.model<IMealPlan>('MealPlan', mealPlanSchema);
export const WorkoutPlan = mongoose.model<IWorkoutPlan>('WorkoutPlan', workoutPlanSchema);
export const GroceryPlan = mongoose.model<IGroceryPlan>('GroceryPlan', groceryPlanSchema);
export const AIChat = mongoose.model<IAIChat>('AIChat', aiChatSchema);
export const ProgressEntry = mongoose.model<IProgressEntry>('ProgressEntry', progressEntrySchema);
