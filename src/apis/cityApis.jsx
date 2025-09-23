

export const citiesAPI = {
  checkHealth: async () => {
    const response = await fetch('/health');
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  },
  
  getAllCitiesWithFood: async () => {
    const response = await fetch('/api/cities/food');
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },
  
  getCityFood: async (cityId) => {
    const response = await fetch(`/api/cities/${cityId}/food`);
    if (!response.ok) {
      throw new Error(`Failed to fetch city food: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
};

// Single API function that fetches city data by ID
  export const fetchCityData = async (cityId) => {
    try {
      const response = await fetch(`/api/cities/${cityId}/food`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Fetched data for city ID ${cityId}:`, data);
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

