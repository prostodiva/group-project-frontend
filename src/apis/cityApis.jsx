

// Distance calculation utility using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Calculate distances between consecutive cities in a route
const calculateRouteDistances = (cities) => {
  if (!cities || cities.length < 2) return { distances: [], totalDistance: 0 };
  
  console.log('Calculating distances for cities:', cities.map(c => ({
    name: c.name,
    lat: c.latitude || c.lat,
    lng: c.longitude || c.lng || c.lon
  })));
  
  const distances = [];
  let totalDistance = 0;
  
  for (let i = 1; i < cities.length; i++) {
    const prevCity = cities[i - 1];
    const currentCity = cities[i];
    
    const lat1 = prevCity.latitude || prevCity.lat;
    const lon1 = prevCity.longitude || prevCity.lng || prevCity.lon;
    const lat2 = currentCity.latitude || currentCity.lat;
    const lon2 = currentCity.longitude || currentCity.lng || currentCity.lon;
    
    if (lat1 && lon1 && lat2 && lon2) {
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      distances.push(distance);
      totalDistance += distance;
      console.log(`Distance from ${prevCity.name} to ${currentCity.name}: ${distance} km`);
    } else {
      console.warn(`Missing coordinates for distance calculation between ${prevCity.name} and ${currentCity.name}:`);
      console.warn(`${prevCity.name}:`, { lat: lat1, lng: lon1 });
      console.warn(`${currentCity.name}:`, { lat: lat2, lng: lon2 });
      distances.push(0);
    }
  }
  
  const result = {
    distances,
    totalDistance: Math.round(totalDistance * 100) / 100
  };
  
  console.log('Final distance calculation result:', result);
  return result;
};

export const citiesAPI = {
  checkHealth: async () => {
    const response = await fetch('/health');
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  },

  // Get optimized route from backend
  getOptimizedRoute: async (tripParams) => {
    const response = await fetch('/api/routes/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripParams)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get optimized route: ${response.status} ${response.statusText}`);
    }
    
    const routeData = await response.json();
    console.log('[citiesAPI.getOptimizedRoute] Received optimized route:', routeData);
    return routeData;
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

// Export distance calculation utilities
export { calculateDistance, calculateRouteDistances };

