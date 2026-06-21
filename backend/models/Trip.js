const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  estimatedCostUSD: { type: Number, default: 0 },
  timeOfDay: { type: String, enum: ['Morning', 'Afternoon', 'Evening', 'Night'] },
  location: { type: String },
  duration: { type: String },
  tips: { type: String },
  mapsSearchQuery: { type: String }
});

const MealSchema = new mongoose.Schema({
  mealTime: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'] },
  restaurantName: { type: String },
  cuisine: { type: String },
  mustTry: { type: String },
  estimatedCostUSD: { type: Number, default: 0 },
  location: { type: String }
});

const DailyCostBreakdownSchema = new mongoose.Schema({
  activities: { type: Number, default: 0 },
  meals: { type: Number, default: 0 },
  transport: { type: Number, default: 0 },
  misc: { type: Number, default: 0 },
  dayTotal: { type: Number, default: 0 }
});

const TripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  from: { type: String },
  destination: { type: String, required: true },
  durationDays: { type: Number, required: true },
  budgetTier: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  interests: [{ type: String }],
  travelType: { type: String, enum: ['solo', 'couple', 'family', 'friends'], default: 'solo' },
  travelers: { type: Number, default: 1, min: 1 },
  tripSummary: { type: mongoose.Schema.Types.Mixed },
  transportation: { type: mongoose.Schema.Types.Mixed },
  importantTips: { type: mongoose.Schema.Types.Mixed },
  nearbyAttractions: [{ type: mongoose.Schema.Types.Mixed }],
  itinerary: [{
    dayNumber: { type: Number, required: true },
    dayTheme: { type: String },
    activities: [ActivitySchema],
    meals: [MealSchema],
    dailyCostBreakdown: DailyCostBreakdownSchema
  }],
  accommodation: [{
    name: { type: String },
    type: { type: String },
    area: { type: String },
    estimatedCostPerNightUSD: { type: Number },
    rating: { type: String },
    whyRecommended: { type: String },
    bookingTip: { type: String }
  }],
  hotels: [{
    name: { type: String, required: true },
    tier: { type: String },
    estimatedCostNightUSD: { type: Number },
    rating: { type: String }
  }],
  estimatedBudget: {
    transport: { type: Number, default: 0 },
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    shopping: { type: Number, default: 0 },
    misc: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    budgetTips: [{ type: String }]
  },
  packingList: [{
    item: { type: String, required: true },
    category: {
      type: String,
      enum: ['Documents', 'Clothing', 'Gear', 'Medicine', 'Electronics', 'Other'],
      default: 'Other'
    },
    isPacked: { type: Boolean, default: false },
    isEssential: { type: Boolean, default: false }
  }],
  usdToInrRate: { type: Number, default: 83 }
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
