// Mock data with coordinates for immediate testing
// Add this to your frontend for testing while backend is being developed

export const mockCitiesWithCoordinates = [
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
  }
];

// Mock function to simulate backend optimization
export const mockOptimizeRoute = async (tripParams) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { cities, startingCity } = tripParams;
  
  // Simple mock optimization logic
  const optimizedRoute = [startingCity.name];
  const distances = [];
  let totalDistance = 0;
  
  let currentCity = startingCity;
  const remainingCities = cities.filter(city => city.id !== startingCity.id);
  
  while (remainingCities.length > 0) {
    // Find nearest city (simplified)
    let nearestCity = remainingCities[0];
    let minDistance = calculateDistance(
      currentCity.latitude, currentCity.longitude,
      nearestCity.latitude, nearestCity.longitude
    );
    
    for (let i = 1; i < remainingCities.length; i++) {
      const distance = calculateDistance(
        currentCity.latitude, currentCity.longitude,
        remainingCities[i].latitude, remainingCities[i].longitude
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
  
  return {
    route: optimizedRoute,
    distances: distances,
    totalDistance: Math.round(totalDistance * 100) / 100,
    optimized: true,
    method: "mock-backend"
  };
};

// Helper function (same as your frontend implementation)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};