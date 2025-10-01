// Mock data with coordinates for immediate testing
// Add this to your frontend for testing while backend is being developed

export const mockCitiesWithCoordinates = [
  {
    id: 1,
    name: "Amsterdam",
    latitude: 52.3676,
    longitude: 4.9041,
    food: [
      { name: "Stroopwafel", price: 5.76 },
      { name: "Thick Dutch fries", price: 3.21 },
      { name: "Kibbeling", price: 8.65 }
    ]
  },
  {
    id: 2,
    name: "Berlin",
    latitude: 52.5200,
    longitude: 13.4050,
    food: [
      { name: "Pretzels", price: 4.00 },
      { name: "Apfelstrudel", price: 6.25 },
      { name: "Berliner Pfannkuche", price: 8.23 },
      { name: "Schnitzel", price: 9.79 }
    ]
  },
  {
    id: 3,
    name: "Brussels",
    latitude: 50.8503,
    longitude: 4.3517,
    food: [
      { name: "Waterzooi", price: 6.45 },
      { name: "Luikse Siroop", price: 4.98 },
      { name: "Mosselen-friet", price: 4.45 },
      { name: "Speculoos", price: 2.79 }
    ]
  },
  {
    id: 4,
    name: "Budapest",
    latitude: 47.4979,
    longitude: 19.0402,
    food: [
      { name: "goulash", price: 8.43 },
      { name: "Stuffed cabbage", price: 6.99 },
      { name: "Smoked meat", price: 12.99 },
      { name: "Dobos torta", price: 2.79 }
    ]
  },
  {
    id: 5,
    name: "Hamburg",
    latitude: 53.5511,
    longitude: 9.9937,
    food: [
      { name: "Hamburger Hummersuppe", price: 6.46 },
      { name: "Knackwurst", price: 9.99 },
      { name: "Krabbentoast", price: 6.92 },
      { name: "Franzbrötchen", price: 12.74 }
    ]
  },
  {
    id: 6,
    name: "Lisbon",
    latitude: 38.7223,
    longitude: -9.1393,
    food: [
      { name: "Bacalhau", price: 5.49 },
      { name: "Caldeirada", price: 7.63 },
      { name: "Alcatra", price: 18.66 }
    ]
  },
  {
    id: 7,
    name: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    food: [
      { name: "Yorkshire Pudding", price: 3.49 },
      { name: "Bangers and Mash", price: 6.63 },
      { name: "Sticky Toffee Pudding", price: 5.66 }
    ]
  },
  {
    id: 8,
    name: "Madrid",
    latitude: 40.4168,
    longitude: -3.7038,
    food: [
      { name: "Bocata de calamares", price: 6.96 },
      { name: "Oreja a la plancha", price: 11.85 },
      { name: "Caracoles a la madrileña", price: 6.94 }
    ]
  },
  {
    id: 9,
    name: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
    food: [
      { name: "Caramels", price: 4.76 },
      { name: "Bordier Butter", price: 5.65 },
      { name: "Baguette", price: 4.99 },
      { name: "Pain au Chocolat", price: 4.69 }
    ]
  },
  {
    id: 10,
    name: "Prague",
    latitude: 50.0755,
    longitude: 14.4378,
    food: [
      { name: "Beef steak tartare", price: 18.76 },
      { name: "Kulajda", price: 6.87 },
      { name: "Svickova", price: 5.98 },
      { name: "Roast duck", price: 14.69 }
    ]
  },
  {
    id: 11,
    name: "Rome",
    latitude: 41.9028,
    longitude: 12.4964,
    food: [
      { name: "Spaghetti alla Carbonara", price: 6.73 },
      { name: "Bruschetta", price: 4.85 },
      { name: "Scaloppine", price: 12.99 },
      { name: "Rigatoni con la Pajata", price: 8.79 },
      { name: "Carciofi alla giudia", price: 15.99 }
    ]
  },
  {
    id: 12,
    name: "Stockholm",
    latitude: 59.3293,
    longitude: 18.0686,
    food: [
      { name: "Raggmunk", price: 6.75 },
      { name: "Gravad lax", price: 13.76 },
      { name: "husmanskost", price: 7.98 }
    ]
  },
  {
    id: 13,
    name: "Vienna",
    latitude: 48.2082,
    longitude: 16.3738,
    food: [
      { name: "Wiener Schnitzel", price: 4.94 },
      { name: "Kaiserschmarrn", price: 7.53 },
      { name: "Sachertorte", price: 5.85 }
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