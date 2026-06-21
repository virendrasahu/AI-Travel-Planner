const Trip = require('../models/Trip');

// Clean JSON response helper that removes potential markdown formatting blocks
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  }
  return JSON.parse(cleaned.trim());
}

// Exponential backoff executor for external API resilience
async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if ((response.status === 429 || response.status === 503) && retries > 0) {
        console.warn(`External API status ${response.status}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw new Error(`External API Error: Status Code ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch exception: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

function mapAccommodationToHotels(accommodation) {
  if (!accommodation || !accommodation.length) return [];
  return accommodation.map((h) => ({
    name: h.name,
    tier: h.type,
    estimatedCostNightUSD: h.estimatedCostPerNightUSD,
    rating: h.rating
  }));
}

function buildTripDocument(userId, from, destination, durationDays, budgetTier, interests, tripData, usdToInrRate = 83, travelType = 'solo', travelers = 1) {
  return {
    userId,
    from,
    destination,
    durationDays,
    budgetTier,
    interests: interests || [],
    travelType,
    travelers: Number(travelers) || 1,
    tripSummary: tripData.tripSummary,
    transportation: tripData.transportation,
    importantTips: tripData.importantTips,
    nearbyAttractions: tripData.nearbyAttractions || [],
    itinerary: tripData.itinerary,
    accommodation: tripData.accommodation || [],
    hotels: mapAccommodationToHotels(tripData.accommodation) || tripData.hotels || [],
    estimatedBudget: tripData.estimatedBudget,
    packingList: tripData.packingList,
    usdToInrRate
  };
}

async function fetchUsdToInrRate() {
  try {
    const exchangeRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const exchangeData = await exchangeRes.json();
    return exchangeData.rates.INR || 83;
  } catch (error) {
    console.warn(`Failed to fetch USD/INR rate, using default 83: ${error.message}`);
    return 83;
  }
}

async function createAndSaveTrip(userId, from, destination, durationDays, budgetTier, interests, tripData, travelType = 'solo', travelers = 1) {
  const usdToInrRate = await fetchUsdToInrRate();
  const newTrip = new Trip(buildTripDocument(
    userId, from, destination, durationDays, budgetTier, interests, tripData, usdToInrRate, travelType, travelers
  ));
  return newTrip.save();
}

// Generates a mock trip response if Gemini API key is missing
function generateMockTrip(from, destination, durationDays, budgetTier, interests) {
  const duration = Number(durationDays) || 3;
  const itinerary = [];
  const interestsList = interests && interests.length > 0 ? interests : ['Sightseeing', 'Food'];

  // Base costs depending on budget tier
  let transportCost = 100;
  let hotelCostPerNight = 80;
  let foodCostPerDay = 30;
  let activityCostPerItem = 15;

  if (budgetTier === 'Low') {
    transportCost = 50;
    hotelCostPerNight = 40;
    foodCostPerDay = 15;
    activityCostPerItem = 8;
  } else if (budgetTier === 'High') {
    transportCost = 250;
    hotelCostPerNight = 200;
    foodCostPerDay = 80;
    activityCostPerItem = 45;
  }

  for (let i = 1; i <= duration; i++) {
    itinerary.push({
      dayNumber: i,
      dayTheme: i === 1 ? 'Arrival and City Orientation' : `Day ${i} — ${interestsList[0] || 'Exploration'}`,
      activities: [
        {
          title: `Explore ${interestsList[0] || 'Local Landmarks'}`,
          description: `Visit the central cultural and scenic areas in ${destination} focusing on local heritage.`,
          estimatedCostUSD: activityCostPerItem,
          timeOfDay: 'Morning',
          location: `${destination} city center`,
          duration: '2 hours',
          tips: 'Arrive early to avoid crowds.',
          mapsSearchQuery: `${destination} city center landmarks`
        },
        {
          title: `Taste of ${destination} - Culinary Session`,
          description: `Enjoy popular regional dishes at a budget-friendly local dining spot.`,
          estimatedCostUSD: Math.round(foodCostPerDay / 2),
          timeOfDay: 'Afternoon',
          location: `Local market, ${destination}`,
          duration: '1.5 hours',
          tips: 'Ask locals for their favorite street food stalls.',
          mapsSearchQuery: `${destination} local food market`
        },
        {
          title: `Evening Walk & ${interestsList[1] || 'Leisure Time'}`,
          description: `Relax and wander through night markets or vibrant streets.`,
          estimatedCostUSD: 0,
          timeOfDay: 'Evening',
          location: `${destination} old town`,
          duration: '2 hours',
          tips: 'Carry small cash for street vendors.',
          mapsSearchQuery: `${destination} night market`
        }
      ],
      meals: [
        {
          mealTime: 'Breakfast',
          restaurantName: `Morning Brew Cafe, ${destination}`,
          cuisine: 'Local breakfast',
          mustTry: 'Regional specialty breakfast plate',
          estimatedCostUSD: Math.round(foodCostPerDay / 3),
          location: `${destination} downtown`
        },
        {
          mealTime: 'Lunch',
          restaurantName: `Local Kitchen, ${destination}`,
          cuisine: 'Traditional local',
          mustTry: 'Signature regional dish',
          estimatedCostUSD: Math.round(foodCostPerDay / 3),
          location: `${destination} city center`
        },
        {
          mealTime: 'Dinner',
          restaurantName: `Evening Table, ${destination}`,
          cuisine: 'Local fusion',
          mustTry: 'Chef special tasting plate',
          estimatedCostUSD: Math.round(foodCostPerDay / 3),
          location: `${destination} old town`
        }
      ],
      dailyCostBreakdown: {
        activities: activityCostPerItem * 2,
        meals: foodCostPerDay,
        transport: 10,
        misc: 5,
        dayTotal: activityCostPerItem * 2 + foodCostPerDay + 15
      }
    });
  }

  const accommodationCost = hotelCostPerNight * (duration - 1 || 1);
  const totalFoodCost = foodCostPerDay * duration;
  const totalActivityCost = activityCostPerItem * duration;
  const grandTotal = transportCost + accommodationCost + totalFoodCost + totalActivityCost;

  const accommodation = [
    {
      name: `Grand ${destination} View Hotel`,
      type: budgetTier === 'Low' ? 'Hostel' : budgetTier === 'High' ? 'Resort' : 'Hotel',
      area: `${destination} city center`,
      estimatedCostPerNightUSD: hotelCostPerNight,
      rating: '4.4/5',
      whyRecommended: 'Central location with good reviews for budget travelers.',
      bookingTip: 'Book 2–3 weeks ahead on major booking platforms.'
    }
  ];

  return {
    tripSummary: {
      from: from || 'Home',
      to: destination,
      totalDays: duration,
      budgetTier,
      bestTimeToVisit: 'Spring and autumn',
      language: 'Local language',
      currency: 'Local currency',
      timeZone: 'Local timezone',
      emergencyNumbers: {
        police: '112',
        ambulance: '112',
        'tourist helpline': 'Local tourist helpline'
      }
    },
    transportation: {
      fromToDestination: [
        {
          mode: 'Flight',
          operator: 'Regional airline',
          duration: '2h 30min',
          estimatedCostUSD: transportCost,
          bookingTip: 'Book 4–6 weeks in advance for best fares.'
        }
      ],
      localTransport: [
        {
          mode: 'Metro/Bus',
          usedFor: 'Daily city travel',
          estimatedCostPerDayUSD: 10,
          tip: 'Get a multi-day transit pass at the airport or main station.'
        }
      ]
    },
    itinerary,
    accommodation,
    hotels: mapAccommodationToHotels(accommodation),
    estimatedBudget: {
      transport: transportCost,
      accommodation: accommodationCost,
      food: totalFoodCost,
      activities: totalActivityCost,
      shopping: 50,
      misc: 30,
      total: grandTotal + 80,
      budgetTips: [
        'Use public transit instead of taxis for daily travel.',
        'Eat at local markets for affordable authentic meals.',
        'Book free walking tours to learn about the city.'
      ]
    },
    packingList: [
      { item: 'Passport & Travel Visa', category: 'Documents', isPacked: false, isEssential: true },
      { item: 'Boarding Passes & Booking Confirmations', category: 'Documents', isPacked: false, isEssential: true },
      { item: budgetTier === 'High' ? 'Formal Attire' : 'Comfortable Walking Shoes', category: 'Clothing', isPacked: false, isEssential: true },
      { item: 'Climate-Appropriate Wear (Layered Clothing)', category: 'Clothing', isPacked: false, isEssential: false },
      { item: 'Universal Power Adapter', category: 'Electronics', isPacked: false, isEssential: true },
      { item: 'Reusable Water Bottle', category: 'Gear', isPacked: false, isEssential: false },
      { item: 'Basic First Aid Kit', category: 'Medicine', isPacked: false, isEssential: true },
      { item: 'Personal Toiletries & SPF Protection', category: 'Other', isPacked: false, isEssential: false }
    ],
    importantTips: {
      cultural: ['Respect local customs and dress modestly at religious sites.'],
      safety: ['Keep valuables in a hotel safe and stay aware in crowded areas.'],
      food: ['Try local specialties but choose busy, clean food stalls.'],
      money: ['Use ATMs at major banks; notify your bank before traveling.'],
      connectivity: ['Buy a local SIM at the airport for affordable data.'],
      health: ['Carry any prescription medications in original packaging.']
    },
    nearbyAttractions: [
      {
        name: `Scenic day trip near ${destination}`,
        distanceFromMain: '45 min by train',
        estimatedCostUSD: 25,
        bestFor: 'Nature lovers and photographers'
      }
    ]
  };
}

exports.generateNewTrip = async (req, res) => {
  const { from, destination, durationDays, budgetTier, interests, travelType, travelers } = req.body;
  const userId = req.user.id;

  if (!from || !destination || !durationDays || !budgetTier || !interests?.length) {
    return res.status(400).json({ message: 'Missing required trip parameters' });
  }

  const tripTravelType = travelType || 'solo';
  const tripTravelers = Number(travelers) || 1;

  const travelTypeLabel = {
    solo: 'solo',
    couple: 'couple',
    family: 'family',
    friends: 'friends'
  }[tripTravelType] || 'solo';

  const travelContext = `This is a ${travelTypeLabel} trip for ${tripTravelers} traveler${tripTravelers > 1 ? 's' : ''}.
Plan activities and accommodations suitable for this travel type:
- If family: include family-friendly activities, kid-friendly restaurants, and spacious accommodation
- If couple: include romantic spots, fine dining, and intimate experiences
- If solo: include safe solo travel tips, social activities, and a flexible schedule
- If friends: include group activities, nightlife options, and shared accommodation where appropriate
Scale food, activity, and transport cost estimates for ${tripTravelers} travelers where applicable.`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to locally generated mock itinerary.");
    const mockTripData = generateMockTrip(from, destination, durationDays, budgetTier, interests);

    try {
      const savedTrip = await createAndSaveTrip(
        userId, from, destination, durationDays, budgetTier, interests, mockTripData, tripTravelType, tripTravelers
      );
      return res.status(201).json(savedTrip);
    } catch (dbErr) {
      console.error("Database save failed:", dbErr);
      return res.status(500).json({ message: 'Database saving failed' });
    }
  }

  const prompt = `
You are an expert travel planner. Create a complete, realistic, and 
detailed travel plan for a trip FROM ${from} TO ${destination} 
for ${durationDays} days with a ${budgetTier} budget.
The traveler's interests are: ${(interests || []).join(', ')}.

${travelContext}

You MUST output ONLY a valid JSON object with NO extra text, 
NO markdown, NO backticks. Follow this EXACT structure:

{
  "tripSummary": {
    "from": "${from}",
    "to": "${destination}",
    "totalDays": ${durationDays},
    "budgetTier": "${budgetTier}",
    "bestTimeToVisit": "string - best season/months to visit",
    "language": "string - local language",
    "currency": "string - local currency name and symbol",
    "timeZone": "string - timezone",
    "emergencyNumbers": {
      "police": "string",
      "ambulance": "string",
      "tourist helpline": "string"
    }
  },

  "transportation": {
    "fromToDestination": [
      {
        "mode": "string - Flight/Train/Bus/Car",
        "operator": "string - airline or service name",
        "duration": "string - e.g. 2h 30min",
        "estimatedCostUSD": number,
        "bookingTip": "string - where to book, how early"
      }
    ],
    "localTransport": [
      {
        "mode": "string - Metro/Auto/Taxi/Bus/Rental bike",
        "usedFor": "string - best use case",
        "estimatedCostPerDayUSD": number,
        "tip": "string - practical advice"
      }
    ]
  },

  "accommodation": [
    {
      "name": "string - hotel/hostel name",
      "type": "string - Hotel/Hostel/Airbnb/Resort",
      "area": "string - which neighborhood/area",
      "estimatedCostPerNightUSD": number,
      "rating": "string - e.g. 4.2/5",
      "whyRecommended": "string - brief reason",
      "bookingTip": "string - book directly or which platform"
    }
  ],

  "itinerary": [
    {
      "dayNumber": 1,
      "dayTheme": "string - e.g. Arrival and City Orientation",
      "activities": [
        {
          "timeOfDay": "Morning/Afternoon/Evening/Night",
          "title": "string - activity name",
          "description": "string - detailed what to do and see",
          "location": "string - exact place name",
          "estimatedCostUSD": number,
          "duration": "string - e.g. 2 hours",
          "tips": "string - insider tip or advice",
          "mapsSearchQuery": "string - exact search term for Google Maps"
        }
      ],
      "meals": [
        {
          "mealTime": "Breakfast/Lunch/Dinner/Snack",
          "restaurantName": "string - recommended place",
          "cuisine": "string - type of food",
          "mustTry": "string - specific dish to order",
          "estimatedCostUSD": number,
          "location": "string - area or address"
        }
      ],
      "dailyCostBreakdown": {
        "activities": number,
        "meals": number,
        "transport": number,
        "misc": number,
        "dayTotal": number
      }
    }
  ],

  "estimatedBudget": {
    "transport": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "shopping": number,
    "misc": number,
    "total": number,
    "budgetTips": [
      "string - money saving tip 1",
      "string - money saving tip 2",
      "string - money saving tip 3"
    ]
  },

  "packingList": [
    {
      "item": "string",
      "category": "Documents/Clothing/Gear/Medicine/Electronics/Other",
      "isPacked": false,
      "isEssential": true or false
    }
  ],

  "importantTips": {
    "cultural": ["string - cultural do and dont"],
    "safety": ["string - safety advice"],
    "food": ["string - food tips"],
    "money": ["string - money and ATM tips"],
    "connectivity": ["string - sim card and wifi tips"],
    "health": ["string - health and medicine tips"]
  },

  "nearbyAttractions": [
    {
      "name": "string - place name",
      "distanceFromMain": "string - e.g. 45 min by train",
      "estimatedCostUSD": number,
      "bestFor": "string - what type of traveler"
    }
  ]
}

Make ALL cost estimates realistic for ${budgetTier} budget travelers 
in ${destination} as of 2025. 
Include local transport costs within the city every day.
Make meal recommendations specific with actual restaurant names.
Make packing list specific to the destination climate and activities.
Include at least 3 activities per day covering morning, afternoon and evening.
Include breakfast, lunch and dinner recommendations every day.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const parsedResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedResponseText) {
      throw new Error("Could not extract generation data from response.");
    }

    const cleanResult = cleanJsonResponse(parsedResponseText);

    const usdToInrRate = await fetchUsdToInrRate();
    const newTrip = new Trip(buildTripDocument(
      userId, from, destination, durationDays, budgetTier, interests, cleanResult, usdToInrRate, tripTravelType, tripTravelers
    ));

    const savedTrip = await newTrip.save();
    return res.status(201).json(savedTrip);

  } catch (error) {
    console.error("Critical AI Generation Error:", error);
    // Graceful fallback to mock data on rate-limits/network errors
    console.log("Using mock data as graceful API fallback...");
    const mockTripData = generateMockTrip(from, destination, durationDays, budgetTier, interests);
    const savedTrip = await createAndSaveTrip(
      userId, from, destination, durationDays, budgetTier, interests, mockTripData, tripTravelType, tripTravelers
    );
    return res.status(201).json(savedTrip);
  }
};

exports.fetchUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Fetch trips error:', error);
    res.status(500).json({ message: 'Server error retrieving trips' });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Get trip by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving trip' });
  }
};

exports.updateTrip = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    let trip = await Trip.findOne({ _id: id, userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    if (req.body.itinerary) {
      trip.itinerary = req.body.itinerary;
      
      // Recalculate activities total cost and grand budget total
      let activitiesTotal = 0;
      trip.itinerary.forEach(day => {
        if (day.activities) {
          day.activities.forEach(act => {
            activitiesTotal += Number(act.estimatedCostUSD || 0);
          });
        }
      });
      trip.estimatedBudget.activities = activitiesTotal;
      trip.estimatedBudget.total = 
        Number(trip.estimatedBudget.transport || 0) + 
        Number(trip.estimatedBudget.accommodation || 0) + 
        Number(trip.estimatedBudget.food || 0) + 
        activitiesTotal;
    }

    if (req.body.packingList) {
      trip.packingList = req.body.packingList;
    }

    if (req.body.from) trip.from = req.body.from;
    if (req.body.travelType) trip.travelType = req.body.travelType;
    if (req.body.travelers) trip.travelers = req.body.travelers;
    if (req.body.destination) trip.destination = req.body.destination;
    if (req.body.tripSummary) trip.tripSummary = req.body.tripSummary;
    if (req.body.transportation) trip.transportation = req.body.transportation;
    if (req.body.importantTips) trip.importantTips = req.body.importantTips;
    if (req.body.nearbyAttractions) trip.nearbyAttractions = req.body.nearbyAttractions;
    if (req.body.accommodation) trip.accommodation = req.body.accommodation;
    if (req.body.durationDays) trip.durationDays = req.body.durationDays;
    if (req.body.budgetTier) trip.budgetTier = req.body.budgetTier;
    if (req.body.interests) trip.interests = req.body.interests;
    if (req.body.hotels) trip.hotels = req.body.hotels;
    if (req.body.estimatedBudget && !req.body.itinerary) {
      trip.estimatedBudget = req.body.estimatedBudget;
    }

    const savedTrip = await trip.save();
    res.json(savedTrip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Server error updating trip' });
  }
};

exports.deleteTrip = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const deletedTrip = await Trip.findOneAndDelete({ _id: id, userId });
    if (!deletedTrip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }
    res.json({ message: 'Trip deleted successfully', id });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Server error deleting trip' });
  }
};

exports.regenerateDay = async (req, res) => {
  const { id } = req.params;
  const { dayNumber, prompt: userInstructions } = req.body;
  const userId = req.user.id;

  if (!dayNumber || !userInstructions) {
    return res.status(400).json({ message: 'Missing day number or custom instructions' });
  }

  try {
    const trip = await Trip.findOne({ _id: id, userId });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    const dayNum = Number(dayNumber);
    const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === dayNum);
    if (dayIndex === -1) {
      return res.status(400).json({ message: `Day ${dayNumber} does not exist in this trip` });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Using mock regeneration.");
      const regeneratedActivities = [
        {
          title: `Regenerated Activity: ${userInstructions.substring(0, 30)}`,
          description: `Custom activities for Day ${dayNumber} matching request: "${userInstructions}".`,
          estimatedCostUSD: 20,
          timeOfDay: 'Morning'
        },
        {
          title: `Exploring local ${trip.destination} neighborhood`,
          description: 'Alternative afternoon activity aligned with your travel plan.',
          estimatedCostUSD: 10,
          timeOfDay: 'Afternoon'
        }
      ];

      trip.itinerary[dayIndex].activities = regeneratedActivities;

      let activitiesTotal = 0;
      trip.itinerary.forEach(day => {
        day.activities.forEach(act => {
          activitiesTotal += Number(act.estimatedCostUSD || 0);
        });
      });
      trip.estimatedBudget.activities = activitiesTotal;
      trip.estimatedBudget.total = 
        Number(trip.estimatedBudget.transport || 0) + 
        Number(trip.estimatedBudget.accommodation || 0) + 
        Number(trip.estimatedBudget.food || 0) + 
        activitiesTotal;

      const savedTrip = await trip.save();
      return res.json(savedTrip);
    }

    const promptText = `
      You are an AI travel assistant. We have an existing trip to ${trip.destination} for ${trip.durationDays} days.
      The user wants to regenerate the itinerary for Day ${dayNum}.
      User's request for changes: "${userInstructions}"

      Current details of the trip:
      - Budget tier: ${trip.budgetTier}
      - Interests: ${(trip.interests || []).join(', ')}

      Output ONLY a valid JSON array of activities for Day ${dayNum} conforming to this schema:
      [
        {
          "title": "Activity name",
          "description": "Brief description of the activity matching the requested changes",
          "estimatedCostUSD": 25,
          "timeOfDay": "Morning"
        }
      ]

      The elements of timeOfDay must be: 'Morning', 'Afternoon', or 'Evening'.
      Only return the JSON. No explanations, no markdown formatting outside the JSON.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const parsedResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedResponseText) {
      throw new Error("Could not extract generation data from response.");
    }

    const cleanResult = cleanJsonResponse(parsedResponseText);

    trip.itinerary[dayIndex].activities = cleanResult;

    // Recalculate activities total
    let activitiesTotal = 0;
    trip.itinerary.forEach(day => {
      day.activities.forEach(act => {
        activitiesTotal += Number(act.estimatedCostUSD || 0);
      });
    });
    trip.estimatedBudget.activities = activitiesTotal;
    trip.estimatedBudget.total = 
      Number(trip.estimatedBudget.transport || 0) + 
      Number(trip.estimatedBudget.accommodation || 0) + 
      Number(trip.estimatedBudget.food || 0) + 
      activitiesTotal;

    const savedTrip = await trip.save();
    return res.json(savedTrip);

  } catch (error) {
    console.error("Critical AI Regeneration Error:", error);
    return res.status(500).json({ message: "API encountered an error regenerating this day. Please try again." });
  }
};
