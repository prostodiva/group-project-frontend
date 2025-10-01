

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

// Mock cities data with coordinates for testing
const mockCitiesData = {
  cities: [
    {
      id: 1,
      name: "Paris",
      latitude: 48.8566,
      longitude: 2.3522,
      food: [
        { name: "Croissant", price: 3.50 },
        { name: "Baguette", price: 2.00 },
        { name: "Macaron", price: 2.50 }
      ]
    },
    {
      id: 2,
      name: "London",
      latitude: 51.5074,
      longitude: -0.1278,
      food: [
        { name: "Fish and Chips", price: 8.50 },
        { name: "Bangers and Mash", price: 7.00 },
        { name: "Shepherd's Pie", price: 9.00 }
      ]
    },
    {
      id: 3,
      name: "Berlin",
      latitude: 52.5200,
      longitude: 13.4050,
      food: [
        { name: "Bratwurst", price: 4.50 },
        { name: "Sauerkraut", price: 3.00 },
        { name: "Pretzel", price: 2.50 }
      ]
    },
    {
      id: 4,
      name: "Rome",
      latitude: 41.9028,
      longitude: 12.4964,
      food: [
        { name: "Pizza Margherita", price: 12.00 },
        { name: "Pasta Carbonara", price: 14.00 },
        { name: "Gelato", price: 4.50 }
      ]
    },
    {
      id: 5,
      name: "Madrid",
      latitude: 40.4168,
      longitude: -3.7038,
      food: [
        { name: "Paella", price: 16.00 },
        { name: "Tapas", price: 6.00 },
        { name: "Churros", price: 3.50 }
      ]
    },
    {
      id: 6,
      name: "Amsterdam",
      latitude: 52.3676,
      longitude: 4.9041,
      food: [
        { name: "Stroopwafel", price: 2.50 },
        { name: "Dutch Cheese", price: 8.00 },
        { name: "Herring", price: 5.50 }
      ]
    },
    {
      id: 7,
      name: "Brussels",
      latitude: 50.8503,
      longitude: 4.3517,
      food: [
        { name: "Belgian Waffle", price: 4.00 },
        { name: "Chocolate", price: 6.00 },
        { name: "Frites", price: 3.50 }
      ]
    },
    {
      id: 8,
      name: "Vienna",
      latitude: 48.2082,
      longitude: 16.3738,
      food: [
        { name: "Schnitzel", price: 12.00 },
        { name: "Sachertorte", price: 5.50 },
        { name: "Apfelstrudel", price: 4.50 }
      ]
    }
  ]
};

export const citiesAPI = {
  checkHealth: async () => {
    // Mock health check - always returns OK for now
    console.log('Mock health check - backend not connected');
    return 'OK';
  },

  // Get optimized route from backend (mock implementation)
  getOptimizedRoute: async (tripParams) => {
    console.log('Mock route optimization request:', tripParams);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { cities, startingCity } = tripParams;
    
    // Simple mock optimization using nearest neighbor
    const optimizedRoute = [startingCity.name];
    const distances = [];
    let totalDistance = 0;
    
    let currentCity = startingCity;
    const remainingCities = cities.filter(city => city.id !== startingCity.id);
    
    while (remainingCities.length > 0) {
      let nearestCity = remainingCities[0];
      let minDistance = calculateDistance(
        currentCity.latitude || currentCity.lat,
        currentCity.longitude || currentCity.lng || currentCity.lon,
        nearestCity.latitude || nearestCity.lat,
        nearestCity.longitude || nearestCity.lng || nearestCity.lon
      );
      
      for (let i = 1; i < remainingCities.length; i++) {
        const distance = calculateDistance(
          currentCity.latitude || currentCity.lat,
          currentCity.longitude || currentCity.lng || currentCity.lon,
          remainingCities[i].latitude || remainingCities[i].lat,
          remainingCities[i].longitude || remainingCities[i].lng || remainingCities[i].lon
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = remainingCities[i];
        }
      }
      
      optimizedRoute.push(nearestCity.name);
      distances.push(Math.round(minDistance * 100) / 100);
      totalDistance += minDistance;
      
      currentCity = nearestCity;
      remainingCities.splice(remainingCities.indexOf(nearestCity), 1);
    }
    
    const result = {
      route: optimizedRoute,
      cities: [startingCity, ...cities.filter(c => c.id !== startingCity.id)],
      distances: distances,
      totalDistance: Math.round(totalDistance * 100) / 100,
      optimized: true,
      optimizationSource: 'mock-backend',
      method: "mock-nearest-neighbor"
    };
    
    console.log('Mock optimization result:', result);
    return result;
  },
  
  getAllCitiesWithFood: async () => {
    console.log('Using mock cities data');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCitiesData;
  },
  
  // Fetch food list for a city from mock data
  getCityFood: async (cityId) => {
    console.log(`Getting food for city ID: ${cityId} from mock data`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Find city in mock data
    const city = mockCitiesData.cities.find(c => c.id === parseInt(cityId));
    if (city) {
      console.log(`[citiesAPI.getCityFood] Found mock food for ${city.name}:`, city.food);
      return city.food; // Return array directly for consistency
    }
    throw new Error(`City with ID ${cityId} not found in mock data`);
  }
};

// Single API function that fetches city data by ID from mock data
export const fetchCityData = async (cityId) => {
  try {
    // Use mock data version of getCityFood
    const foods = await citiesAPI.getCityFood(cityId);
    const data = { cityId, foods };
    console.log(`Fetched mock data for city ID ${cityId}:`, data);
    return data;
  } catch (error) {
    console.error('Mock API call failed:', error);
    throw error;
  }
};

// Export distance calculation utilities
export { calculateDistance, calculateRouteDistances };

