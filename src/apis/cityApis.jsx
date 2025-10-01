

export const citiesAPI = {
  checkHealth: async () => {
    const response = await fetch('/health');
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  },
  
  getAllCitiesWithFood: async () => {
    const response = await fetch('/api/cities');
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },
  
  // Fetch food list for a city. Tries /foods first, then falls back to /food if 404.
  getCityFood: async (cityId) => {
    let endpointPlural = `/api/cities/${cityId}/foods`;
    let endpointSingular = `/api/cities/${cityId}/food`;

    let response = await fetch(endpointPlural);
    if (response.status === 404) {
      console.warn(`[citiesAPI.getCityFood] '${endpointPlural}' returned 404. Trying singular endpoint '${endpointSingular}'.`);
      response = await fetch(endpointSingular);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch city food: ${response.status} ${response.statusText}`);
    }
    const raw = await response.json();

    // Normalize various possible shapes into an array of food objects/strings
    let foods = [];
    if (Array.isArray(raw)) {
      foods = raw;
    } else if (raw.foods && Array.isArray(raw.foods)) {
      foods = raw.foods;
    } else if (raw.food && Array.isArray(raw.food)) {
      foods = raw.food;
    } else if (raw.data && Array.isArray(raw.data)) {
      foods = raw.data;
    } else if (raw.items && Array.isArray(raw.items)) {
      foods = raw.items;
    }

    console.log(`[citiesAPI.getCityFood] Normalized food list for city ${cityId}:`, foods);
    return foods; // return already-normalized list to simplify caller
  }
};

// Single API function that fetches city data by ID
export const fetchCityData = async (cityId) => {
  try {
    // Reuse the same fallback logic by calling getCityFood; wrap result in object for legacy callers if any
    const foods = await citiesAPI.getCityFood(cityId);
    const data = { cityId, foods };
    console.log(`Fetched data for city ID ${cityId}:`, data);
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

