// Admin API functions
// Handles admin login, logout, and admin operations

export const adminAPI = {
  // Admin login
  login: async (username, password) => {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // Include session cookies
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      throw new Error(`Admin login failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Admin logout
  logout: async () => {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'  // Include session cookies
    });
    
    if (!response.ok) {
      throw new Error(`Admin logout failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Get admin info
  getInfo: async () => {
    const response = await fetch('/api/admin/info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'  // Include session cookies
    });
    
    if (!response.ok) {
      throw new Error(`Get admin info failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Get all cities (admin only)
  getCities: async () => {
    const response = await fetch('/api/admin/cities', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'  // Include session cookies
    });
    
    if (!response.ok) {
      throw new Error(`Get cities failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Add new city (admin only)
  addCity: async (cityName) => {
    const response = await fetch('/api/admin/cities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: cityName })
    });
    
    if (!response.ok) {
      throw new Error(`Add city failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Update city name (admin only)
  updateCity: async (cityId, newName) => {
    const response = await fetch(`/api/admin/cities/${cityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName })
    });
    
    if (!response.ok) {
      throw new Error(`Update city failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Delete city (admin only)
  deleteCity: async (cityId) => {
    const response = await fetch(`/api/admin/cities/${cityId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Delete city failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Get all foods (admin only)
  getFoods: async () => {
    const response = await fetch('/api/admin/foods', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'  // Include session cookies
    });
    
    if (!response.ok) {
      throw new Error(`Get foods failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Add food to city (admin only)
  addFood: async (cityId, foodName, price) => {
    const response = await fetch(`/api/admin/cities/${cityId}/foods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: foodName, price: price })
    });
    
    if (!response.ok) {
      throw new Error(`Add food failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Update food (admin only)
  updateFood: async (foodId, updates) => {
    const response = await fetch(`/api/admin/foods/${foodId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`Update food failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Delete food (admin only)
  deleteFood: async (foodId) => {
    const response = await fetch(`/api/admin/foods/${foodId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Delete food failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
};