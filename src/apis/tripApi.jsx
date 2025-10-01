export const TripTypes = {
  PARIS_TOUR: "paris_tour",
  LONDON_TOUR: "london_tour", 
  CUSTOM_TOUR: "custom_tour",
  BERLIN_TOUR: "berlin_tour"
};

// Internal helper to produce better diagnostics for missing backend endpoints.
async function fetchWithDiagnostics(url, options, friendlyName) {
  const response = await fetch(url, options);
  if (!response.ok) {
    // Provide more context specifically for 404 (likely endpoint not implemented on backend)
    if (response.status === 404) {
      throw new Error(`${friendlyName} endpoint not found (404). Your backend does not implement '${url}'. Either:
  1) Add this route to the backend
  2) Update the frontend tripAPI to the correct path
  3) Temporarily mock the response until backend work is done.`);
    }
    throw new Error(`${friendlyName} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const tripAPI = {
  // Plan Paris tour (all 11 cities starting from Paris)
  planParisTour: async () => {
    return fetchWithDiagnostics('/api/trips/paris', undefined, 'Plan Paris tour');
  },

  // Plan London tour with specified number of cities
  planLondonTour: async (numberOfCities) => {
    const url = numberOfCities
      ? `/api/trips/london?cities=${numberOfCities}`
      : '/api/trips/london';
    return fetchWithDiagnostics(url, undefined, 'Plan London tour');
  },

  // Plan Berlin tour
  planBerlinTour: async () => {
    return fetchWithDiagnostics('/api/trips/berlin', undefined, 'Plan Berlin tour');
  },

  // Plan custom tour with selected cities
  planCustomTour: async (startingCity, selectedCities) => {
    const requestBody = {
      startingCity,
      cities: selectedCities,
      tripType: TripTypes.CUSTOM_TOUR,
    };
    return fetchWithDiagnostics(
      '/api/trips/custom',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      },
      'Plan custom tour'
    );
  },

  // Get trip details by ID
  getTripById: async (tripId) => {
    return fetchWithDiagnostics(`/api/trips/${tripId}`, undefined, 'Get trip details');
  },
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
  };
};
