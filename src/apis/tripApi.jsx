// Trip type constants to match backend enum
export const TripTypes = {
  PARIS_TOUR: "paris_tour",
  LONDON_TOUR: "london_tour", 
  CUSTOM_TOUR: "custom_tour",
  BERLIN_TOUR: "berlin_tour"
};

export const tripAPI = {
  // Plan Paris tour (all 11 cities starting from Paris)
  planParisTour: async () => {
    const response = await fetch('/api/trips/paris');
    if (!response.ok) {
      throw new Error(`Failed to plan Paris tour: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Plan London tour with specified number of cities
  planLondonTour: async (numberOfCities) => {
    const url = numberOfCities 
      ? `/api/trips/london?cities=${numberOfCities}` 
      : '/api/trips/london';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to plan London tour: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Plan Berlin tour
  planBerlinTour: async () => {
    const response = await fetch('/api/trips/berlin');
    if (!response.ok) {
      throw new Error(`Failed to plan Berlin tour: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Plan custom tour with selected cities
  planCustomTour: async (startingCity, selectedCities) => {
    const requestBody = {
      startingCity: startingCity,
      cities: selectedCities,
      tripType: TripTypes.CUSTOM_TOUR
    };
    
    const response = await fetch('/api/trips/custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to plan custom tour: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Get trip details by ID
  getTripById: async (tripId) => {
    const response = await fetch(`/api/trips/${tripId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trip details: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
};

// Enhanced city and food management APIs
export const cityManagementAPI = {
  // Get all cities with distances from Berlin
  getAllCitiesWithDistances: async () => {
    const response = await fetch('/api/cities/distances');
    if (!response.ok) {
      throw new Error(`Failed to fetch cities with distances: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  // Food item management
  addFoodItem: async (cityId, foodItem) => {
    const response = await fetch(`/api/cities/${cityId}/food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(foodItem)
    });
    if (!response.ok) {
      throw new Error(`Failed to add food item: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  updateFoodItem: async (cityId, foodId, updatedFood) => {
    const response = await fetch(`/api/cities/${cityId}/food/${foodId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFood)
    });
    if (!response.ok) {
      throw new Error(`Failed to update food item: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  deleteFoodItem: async (cityId, foodId) => {
    const response = await fetch(`/api/cities/${cityId}/food/${foodId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete food item: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
};

// Single API function that fetches trip data by ID (alternative approach)
export const fetchTripData = async (tripId) => {
  try {
    const response = await fetch(`/api/trips/${tripId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Fetched data for trip ID ${tripId}:`, data);
    return data;
  } catch (error) {
    console.error('Trip API call failed:', error);
    throw error;
  }
};
