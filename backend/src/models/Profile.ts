import mongoose, { Document, Schema } from 'mongoose';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'maintain' | 'endurance' | 'general_fitness';
export type FoodPreference = 'veg' | 'non-veg' | 'vegan' | 'eggetarian';
export type GymPreference = 'gym' | 'home' | 'both';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  foodPreference: FoodPreference;
  allergies: string[];
  monthlyBudget: number; // INR
  city: string;
  gymPreference: GymPreference;
  targetWeight?: number;
  bmi?: number;
  dailyCalorieTarget?: number;
  dailyProteinTarget?: number;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    age: { type: Number, min: 10, max: 100 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    height: { type: Number, min: 100, max: 250 },
    weight: { type: Number, min: 20, max: 300 },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate',
    },
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'maintain', 'endurance', 'general_fitness'],
      default: 'general_fitness',
    },
    foodPreference: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'eggetarian'],
      default: 'veg',
    },
    allergies: [{ type: String }],
    monthlyBudget: { type: Number, default: 3000 },
    city: { type: String, default: 'Mumbai' },
    gymPreference: { type: String, enum: ['gym', 'home', 'both'], default: 'home' },
    targetWeight: { type: Number },
    bmi: { type: Number },
    dailyCalorieTarget: { type: Number },
    dailyProteinTarget: { type: Number },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Calculate BMI and targets before save
profileSchema.pre('save', function (next) {
  if (this.height && this.weight) {
    const heightM = this.height / 100;
    this.bmi = Math.round((this.weight / (heightM * heightM)) * 10) / 10;
  }

  if (this.age && this.gender && this.weight && this.height && this.activityLevel) {
    // Mifflin-St Jeor equation
    let bmr: number;
    if (this.gender === 'male') {
      bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5;
    } else {
      bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const tdee = bmr * (activityMultipliers[this.activityLevel] || 1.55);

    if (this.fitnessGoal === 'weight_loss') {
      this.dailyCalorieTarget = Math.round(tdee - 500);
    } else if (this.fitnessGoal === 'muscle_gain') {
      this.dailyCalorieTarget = Math.round(tdee + 300);
    } else {
      this.dailyCalorieTarget = Math.round(tdee);
    }

    this.dailyProteinTarget = Math.round(
      this.fitnessGoal === 'muscle_gain' ? this.weight * 2 : this.weight * 1.6
    );
  }

  this.isProfileComplete = !!(
    this.age && this.gender && this.height && this.weight && this.city && this.monthlyBudget
  );

  next();
});

export default mongoose.model<IProfile>('Profile', profileSchema);
