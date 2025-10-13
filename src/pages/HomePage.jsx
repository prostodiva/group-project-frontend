// HomePage.jsx
// Main page showing list of cities, admin functions

import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlus, FaTrash, FaEdit, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { citiesAPI } from "../apis/cityApis";
import { cityManagementAPI } from "../apis/tripApi";
import { adminAPI } from "../apis/adminApi";
import "../style/home.css";
import { w } from "happy-dom/lib/PropertySymbol";

const HomePage = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCities, setExpandedCities] = useState(new Set());
  const [cityFoods, setCityFoods] = useState({});
  const [loadingFood, setLoadingFood] = useState(new Set());

  // Admin functionality
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  
  // Admin operations
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [showEditCity, setShowEditCity] = useState(false);
  const [editingCityId, setEditingCityId] = useState('');
  const [editingCityName, setEditingCityName] = useState('');
  const [showDeleteCity, setShowDeleteCity] = useState(false);
  const [deleteCityId, setDeleteCityId] = useState('');

  // Food operations
  const [showAddFood, setShowAddFood] = useState(false);
  const [foodCityId, setFoodCityId] = useState('');
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodPrice, setNewFoodPrice] = useState('');
  const [showEditFood, setShowEditFood] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState('');
  const [editingFoodName, setEditingFoodName] = useState('');
  const [editingFoodPrice, setEditingFoodPrice] = useState('');
  const [showDeleteFood, setShowDeleteFood] = useState(false);
  const [deleteFoodId, setDeleteFoodId] = useState('');
  const [allFoods, setAllFoods] = useState([]);

  useEffect(() => {
    const loadCitiesWithDistances = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all cities data
        const citiesData = await citiesAPI.getAllCitiesWithFood();
        console.log('Cities data:', citiesData);
        
        let allCities = [];
        if (citiesData && citiesData.cities) {
          allCities = citiesData.cities;
        } else if (citiesData && Array.isArray(citiesData)) {
          allCities = citiesData;
        }
        
        // Get distances from Berlin
        let distancesFromBerlin = {};
        try {
          const distanceData = await cityManagementAPI.getAllCitiesWithDistances();
          console.log('Distance data from API:', distanceData);
          
          if (distanceData && distanceData.distances && Array.isArray(distanceData.distances)) {
            // Berlin has city_id 2, so we need distances where from_city_id = 2
            const berlinDistances = distanceData.distances.filter(d => d.from_city_id === 2);
            console.log('Distances from Berlin:', berlinDistances);
            
            // Create a map of to_city_id to distance
            berlinDistances.forEach(d => {
              distancesFromBerlin[d.to_city_id] = d.distance;
            });
            
            // Berlin to itself is 0
            distancesFromBerlin[2] = 0;
            
            console.log('Distance map created:', distancesFromBerlin);
            
            // Debug Stockholm specifically
            const stockholmCity = allCities.find(city => city.name.toLowerCase() === 'stockholm');
            if (stockholmCity) {
              console.log('Stockholm city data:', stockholmCity);
              console.log('Stockholm city ID:', stockholmCity.id);
              console.log('Stockholm distance from map:', distancesFromBerlin[stockholmCity.id]);
            }
            
            // Check all distances from Berlin to see what we have
            console.log('All distances from Berlin (from_city_id=2):');
            berlinDistances.forEach(d => {
              const city = allCities.find(c => c.id === d.to_city_id);
              console.log(`City ID ${d.to_city_id} (${city?.name || 'Unknown'}): ${d.distance} km`);
            });
          }
        } catch (distanceError) {
          console.log('Distance API failed:', distanceError);
        }
        
        // Add distances to all cities and sort by distance from Berlin
        const citiesWithDistances = allCities.map(city => ({
          ...city,
          distance_from_berlin: distancesFromBerlin[city.id] || null
        }));

        // Separate Berlin from other cities
        const berlinCity = citiesWithDistances.find(city => 
          city.name.toLowerCase() === 'berlin'
        );
        const otherCities = citiesWithDistances.filter(city => 
          city.name.toLowerCase() !== 'berlin'
        );

        // Sort other cities by distance from Berlin
        otherCities.sort((a, b) => {
          const distanceA = a.distance_from_berlin || Infinity;
          const distanceB = b.distance_from_berlin || Infinity;
          return distanceA - distanceB;
        });

        // Put Berlin first, then other cities
        const finalCities = berlinCity ? [berlinCity, ...otherCities] : otherCities;

        console.log('All cities with distances:', citiesWithDistances);
        console.log('Other cities sorted by distance:', otherCities);
        console.log('Final cities with Berlin first:', finalCities);
        console.log('Stockholm distance:', otherCities.find(c => c.name.toLowerCase() === 'stockholm')?.distance_from_berlin);

        setCities(finalCities);
        
      } catch (err) {
        console.error('Failed to load cities with distances:', err);
        setError(`Cannot load cities: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadCitiesWithDistances();
  }, []);

  // Admin login function
  const handleAdminLogin = async () => {
    if (!adminUsername || !adminPassword) return;
    
    setAdminLoading(true);
    try {
      const response = await adminAPI.login(adminUsername, adminPassword);
      if (response.success) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setShowAdminMenu(true);
        setAdminUsername('');
        setAdminPassword('');
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      alert('Login failed: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin logout function
  const handleAdminLogout = async () => {
    try {
      await adminAPI.logout();
      setIsAdmin(false);
      setShowAdminMenu(false);
      setShowAdminLogin(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  // END handAdminLogout - admin functions


   // Function to refresh cities data without page reload
  const refreshCitiesData = async () => {
    try {
      setLoading(true);
      
      // Get all cities data
      const citiesData = await citiesAPI.getAllCitiesWithFood();
      console.log('Cities data:', citiesData);
      
      let allCities = [];
      if (citiesData && citiesData.cities) {
        allCities = citiesData.cities;
      } else if (citiesData && Array.isArray(citiesData)) {
        allCities = citiesData;
      }
      
      // Get distances from Berlin
      let distancesFromBerlin = {};
      try {
        const distanceData = await cityManagementAPI.getAllCitiesWithDistances();
        console.log('Distance data from API:', distanceData);
        
        if (distanceData && distanceData.distances && Array.isArray(distanceData.distances)) {
          const berlinDistances = distanceData.distances.filter(d => d.from_city_id === 2);
          console.log('Distances from Berlin:', berlinDistances);
          
          berlinDistances.forEach(d => {
            distancesFromBerlin[d.to_city_id] = d.distance;
          });
          
          distancesFromBerlin[2] = 0;
        }
      } catch (distanceError) {
        console.log('Distance API failed:', distanceError);
      }
      
      // Add distances to all cities and sort by distance from Berlin
      const citiesWithDistances = allCities.map(city => ({
        ...city,
        distance_from_berlin: distancesFromBerlin[city.id] || null
      }));

      const berlinCity = citiesWithDistances.find(city => 
        city.name.toLowerCase() === 'berlin'
      );
      const otherCities = citiesWithDistances.filter(city => 
        city.name.toLowerCase() !== 'berlin'
      );

      otherCities.sort((a, b) => {
        const distanceA = a.distance_from_berlin || Infinity;
        const distanceB = b.distance_from_berlin || Infinity;
        return distanceA - distanceB;
      });

      const finalCities = berlinCity ? [berlinCity, ...otherCities] : otherCities;
      setCities(finalCities);
      
    } catch (err) {
      console.error('Failed to refresh cities:', err);
      setError(`Cannot load cities: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  // END refreshCitiesData - refresh cities function


  // Add new city
  const handleAddCity = async () => {
    if (!newCityName.trim()) return;
    
    setAdminLoading(true);
    try {
      await adminAPI.addCity(newCityName);
      setNewCityName('');
      setShowAddCity(false);
      // Refresh cities data without page reload
      await refreshCitiesData();
    } catch (error) {
      console.error('Add city failed:', error);
      alert('Failed to add city: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Edit city name
  const handleEditCity = async () => {
    if (!editingCityId || !editingCityName.trim()) return;
    
    setAdminLoading(true);
    try {
      await adminAPI.updateCity(parseInt(editingCityId), editingCityName);
      setEditingCityId('');
      setEditingCityName('');
      setShowEditCity(false);
      // Refresh cities data without page reload
      await refreshCitiesData();
    } catch (error) {
      console.error('Edit city failed:', error);
      alert('Failed to edit city: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Delete city
  const handleDeleteCity = async () => {
    if (!deleteCityId) return;
    
    if (!confirm('Are you sure you want to delete this city? This will also delete all its food items.')) {
      return;
    }
    
    setAdminLoading(true);
    try {
      await adminAPI.deleteCity(parseInt(deleteCityId));
      setDeleteCityId('');
      setShowDeleteCity(false);
      // Refresh cities data without page reload
      await refreshCitiesData();
    } catch (error) {
      console.error('Delete city failed:', error);
      alert('Failed to delete city: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Add new food item
  const handleAddFood = async () => {
    if (!foodCityId || !newFoodName.trim() || !newFoodPrice) return;
    
    setAdminLoading(true);
    try {
      await adminAPI.addFood(parseInt(foodCityId), newFoodName, parseFloat(newFoodPrice));
      setFoodCityId('');
      setNewFoodName('');
      setNewFoodPrice('');
      setShowAddFood(false);
      await refreshCitiesData();
    } catch (error) {
      console.error('Add food failed:', error);
      alert('Failed to add food: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Edit food
  const handleEditFood = async () => {
    if (!editingFoodId) return;
    
    setAdminLoading(true);
    try {
      const updateData = {};
      if (editingFoodName.trim()) updateData.name = editingFoodName;
      if (editingFoodPrice) updateData.price = parseFloat(editingFoodPrice);
      
      await adminAPI.updateFood(parseInt(editingFoodId), updateData);
      setEditingFoodId('');
      setEditingFoodName('');
      setEditingFoodPrice('');
      setShowEditFood(false);
      await refreshCitiesData();
    } catch (error) {
      console.error('Edit food failed:', error);
      alert('Failed to edit food: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Delete food
  const handleDeleteFood = async () => {
    if (!deleteFoodId) return;
    
    if (!confirm('Are you sure you want to delete this food item?')) {
      return;
    }
    
    setAdminLoading(true);
    try {
      await adminAPI.deleteFood(parseInt(deleteFoodId));
      setDeleteFoodId('');
      setShowDeleteFood(false);
      await refreshCitiesData();
    } catch (error) {
      console.error('Delete food failed:', error);
      alert('Failed to delete food: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  // Load all foods for editing/deleting
  const loadAllFoods = async () => {
    try {
      const foodsData = await adminAPI.getFoods();
      setAllFoods(foodsData.foods || foodsData || []);
    } catch (error) {
      console.error('Failed to load foods:', error);
    }
  };

  const handleCityClick = async (city) => {
    try {
      // Toggle expanded state
      const newExpandedCities = new Set(expandedCities);
      if (newExpandedCities.has(city.id)) {
        newExpandedCities.delete(city.id);
      } else {
        newExpandedCities.add(city.id);
        
        // Fetch food data if not already loaded
        if (!cityFoods[city.id]) {
          setLoadingFood(prev => new Set(prev).add(city.id));
          console.log(`Fetching food for city ${city.id}...`);
          
          const foodData = await citiesAPI.getCityFood(city.id);
          console.log(`Food data for city ${city.id}:`, foodData);
          
          // Handle different possible data structures
          let foods = [];
          if (Array.isArray(foodData)) {
            foods = foodData;
          } else if (foodData.foods && Array.isArray(foodData.foods)) {
            foods = foodData.foods;
          } else if (foodData.food && Array.isArray(foodData.food)) {
            foods = foodData.food;
          } else if (foodData.data && Array.isArray(foodData.data)) {
            foods = foodData.data;
          }
          
          setCityFoods(prev => ({
            ...prev,
            [city.id]: foods
          }));
        }
      }
      setExpandedCities(newExpandedCities);
    } catch (err) {
      console.error('Failed to fetch city food:', err);
      setError(`Failed to load food for ${city.name}: ${err.message}`);
    } finally {
      setLoadingFood(prev => {
        const newSet = new Set(prev);
        newSet.delete(city.id);
        return newSet;
      });
    }
  };

  // Helper function to get distance from Berlin
  const getDistanceFromBerlin = (city) => {
    // Berlin should always show 0
    if (city.name.toLowerCase() === 'berlin') {
      return 0;
    }
    return city.distance_from_berlin !== undefined ? city.distance_from_berlin : null;
  };

  // Helper function to format distance
  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return 'N/A';
    return `${distance} km`;
  };

  if (loading) {
    return (
      <div id="container">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading cities...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="container">
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Main content */}
      <div className="city-container" style={{ flex: 1, marginRight: isAdmin ? '320px' : '0' }}>
        
        { /* Top buttons - create trip + login */ }
        <div style={{ marginTop: '-35px', display: 'flex', justifyContent: 'end', alignItems: 'flex-end', gap: '10px', width: '100%' }}>
            <Link className="button" to="/trip" style={{ width: 'auto' }}>create trip</Link>
            
            { /* Admin login */ }
            {!isAdmin && (
              <button 
                onClick={() => setShowAdminLogin(!showAdminLogin)}
                className="button"  style={{ width: 'auto' }}>
                <FaUser /> Login
              </button>
            )}
          </div>

        { /* Header */ }
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="header" style={{ margin: '15px 0px -5px', fontSize: '30px' }}>European Cities and Distances from Berlin</div>
          
        </div>

        {/* Admin login popup */}
        {showAdminLogin && !isAdmin && (
          <div className="container" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
          }}>
            <h3 className="title" style={{ margin: '0 0 5px 0' }}>Admin Login</h3>
            <div id="subtext">Sign in to modify data</div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Username"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  style={{ width: '100%', padding: '8px', paddingRight: '36px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    height: '100%',
                    width: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    outline: 'none',
                    color: '#888',
                    fontSize: '18px',
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowAdminLogin(false)}
              >
                Cancel
              </button>
              <button 
                onClick={handleAdminLogin}
                disabled={adminLoading}
              >
                {adminLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </div>
        )}

        {/* Backdrop for login popup */}
        {showAdminLogin && !isAdmin && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999
            }}
            onClick={() => setShowAdminLogin(false)}
          />
        )}
      
      {/* Cities list */}
      <div className="cities-result">
        {cities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No cities available
          </div>
        ) : (
          cities.map((city) => {
            const distanceFromBerlin = getDistanceFromBerlin(city);
            return (
              <div key={city.id}>

                {/* City button */}
                <button 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => handleCityClick(city)}
                  aria-expanded={expandedCities.has(city.id)}
                  aria-label={`${expandedCities.has(city.id) ? 'Collapse' : 'Expand'} food options for ${city.name}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {expandedCities.has(city.id) ? (
                      <FaChevronUp 
                        aria-hidden="true"
                      />
                    ) : (
                      <FaChevronDown 
                        aria-hidden="true"
                      />
                    )}
                    <span className="city-name">{city.name}</span>
                  </div>
                  <span>
                    {formatDistance(distanceFromBerlin)}
                  </span>
                </button>
                {/* END City button */}

                {/* Expanded food options */}
                {expandedCities.has(city.id) && (
                  <div className="food-container">
                    {loadingFood.has(city.id) ? (
                      <p style={{ color: '#666', fontStyle: 'italic' }}>Loading food...</p>
                    ) : cityFoods[city.id] && cityFoods[city.id].length > 0 ? (
                      
                      // List food items
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {cityFoods[city.id].map((food, index) => (
                          <li key={index} className="food-name">
                            {typeof food === 'string' ? (
                              food
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{food.name || food.title || food.foodName || 'Unknown Food'}</span>
                                <span className="food-price">
                                  ${food.price || food.cost || food.amount || 'N/A'}
                                </span>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      // END List food items
                      
                    ) : (
                      <p style={{ color: '#666', fontStyle: 'italic' }}>No food options available</p>
                    )}
                  </div>
                )}
                {/* END Expanded food options */}

              </div>
            );
          })
        )}
      </div>
      {/* END Cities list */}

      </div>
      {/* END Main content */}

      {/* Admin Menu - Right Side Panel */}
      {isAdmin && (
        <div className="admin-panel">
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <h3 className="header" style={{ width: '100%', marginLeft: '25px', fontSize: '35px', fontWeight: 'bold' }}>Admin Panel</h3>
            <button 
              onClick={handleAdminLogout}
              className="button"
              style={{ width: 'auto' }}>
              Logout
            </button>
          </div>

          {/* Admin Controls */}
          <div className="control-container" style={{ marginBottom: '25px' }}>

            {/* Add City */}
            <div>
              <button 
                onClick={() => setShowAddCity(!showAddCity)}
                >
                <FaPlus /> Add New City
              </button>
              
              {showAddCity && (
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                  <input
                    type="text"
                    placeholder="City name"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleAddCity}
                      disabled={adminLoading}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Add
                    </button>
                    <button 
                      onClick={() => setShowAddCity(false)}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit City */}
            <div>
              <button 
                onClick={() => setShowEditCity(!showEditCity)}
              >
                <FaEdit /> Edit City
              </button>
              
              {showEditCity && (
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                  <select
                    value={editingCityId}
                    onChange={(e) => setEditingCityId(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  >
                    <option value="">Select city to edit</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        ID {city.id}: {city.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="New city name"
                    value={editingCityName}
                    onChange={(e) => setEditingCityName(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleEditCity}
                      disabled={adminLoading}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Update
                    </button>
                    <button 
                      onClick={() => setShowEditCity(false)}
                      className="button" style={{ margin: 0, flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete City */}
            <div>
              <button 
                onClick={() => setShowDeleteCity(!showDeleteCity)}
              >
                <FaTrash /> Delete City
              </button>
              
              {showDeleteCity && (
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                  <select
                    value={deleteCityId}
                    onChange={(e) => setDeleteCityId(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  >
                    <option value="">Select city to delete</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        ID {city.id}: {city.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleDeleteCity}
                      disabled={adminLoading}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Delete
                    </button>
                    <button 
                      onClick={() => setShowDeleteCity(false)}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Food Item */}
            <div>
              <button 
                onClick={() => {
                  setShowAddFood(!showAddFood);
                  if (!showAddFood) loadAllFoods();
                }}
              >
                <FaPlus /> Add Food Item
              </button>
              
              {showAddFood && (
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                  <select
                    value={foodCityId}
                    onChange={(e) => setFoodCityId(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  >
                    <option value="">Select city</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        ID {city.id}: {city.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Food name"
                    value={newFoodName}
                    onChange={(e) => setNewFoodName(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newFoodPrice}
                    onChange={(e) => setNewFoodPrice(e.target.value)}
                    step="0.01"
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleAddFood}
                      disabled={adminLoading}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Add
                    </button>
                    <button 
                      onClick={() => setShowAddFood(false)}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Food */}
            <div>
              <button 
                onClick={() => {
                  setShowEditFood(!showEditFood);
                  if (!showEditFood) loadAllFoods();
                }}
              >
                <FaEdit /> Edit Food
              </button>
              
              {showEditFood && (
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                  <select
                    value={editingFoodId}
                    onChange={(e) => setEditingFoodId(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  >
                    <option value="">Select food to edit</option>
                    {allFoods.map(food => (
                      <option key={food.id} value={food.id}>
                        ID {food.id}: {food.name} (${food.price})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="New food name (optional)"
                    value={editingFoodName}
                    onChange={(e) => setEditingFoodName(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  />
                  <input
                    type="number"
                    placeholder="New price (optional)"
                    value={editingFoodPrice}
                    onChange={(e) => setEditingFoodPrice(e.target.value)}
                    step="0.01"
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleEditFood}
                      disabled={adminLoading}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Update
                    </button>
                    <button 
                      onClick={() => setShowEditFood(false)}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Food */}
            <div>
              <button 
                onClick={() => {
                  setShowDeleteFood(!showDeleteFood);
                  if (!showDeleteFood) loadAllFoods();
                }}
              >
                <FaTrash /> Delete Food
              </button>
              
              {showDeleteFood && (
                <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                  <select
                    value={deleteFoodId}
                    onChange={(e) => setDeleteFoodId(e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                  >
                    <option value="">Select food to delete</option>
                    {allFoods.map(food => (
                      <option key={food.id} value={food.id}>
                        ID {food.id}: {food.name} (${food.price})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={handleDeleteFood}
                      disabled={adminLoading}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Delete
                    </button>
                    <button 
                      onClick={() => setShowDeleteFood(false)}
                      className="button" style={{ margin: 0, flex: 1 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            
          </div>

        </div>
      )}

    </div>
  );
};

export default HomePage;