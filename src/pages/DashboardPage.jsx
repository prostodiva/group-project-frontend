// DashboardPage.jsx
// User selected trip summary, food selection, cost breakdown

import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp, FaPlus, FaMinus } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { citiesAPI } from "../apis/cityApis";
import { TripTypes } from "../apis/tripApi";
import "../style/dashboard.css";

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripType, tripData, description, numberOfCities, startingCity, selectedCities } = location.state || {};
  
  const [tripCities, setTripCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFoodItems, setSelectedFoodItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [cityFoodData, setCityFoodData] = useState({});
  const [expandedCities, setExpandedCities] = useState(new Set()); // Track expanded cities
  const [loadingFood, setLoadingFood] = useState(new Set()); // Track cities loading food
  const [cityDistances, setCityDistances] = useState({}); // Store city distances
  const [searchTerm, setSearchTerm] = useState(''); // Search functionality
  // Local input state for per-food quantity edits
  const [quantityInputs, setQuantityInputs] = useState({});

  // Debug: Log the trip data when component mounts
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG INFO ===');
    console.log('Trip Type:', tripType);
    console.log('Trip Data:', tripData);
    console.log('Number of Cities (London):', numberOfCities);
    console.log('Starting City (Custom):', startingCity);
    console.log('Selected Cities (Custom):', selectedCities);
    console.log('Description:', description);
    
    if (tripData) {
      console.log('Available properties in tripData:', Object.keys(tripData));
      console.log('Trip route from backend:', tripData.trip?.cities);
      console.log('Trip cities from backend:', tripData.trip?.cities);
      console.log('Trip itinerary from backend:', tripData.itinerary);
      
      // Add this detailed route logging
      if (tripData.trip?.cities && Array.isArray(tripData.trip.cities)) {
        console.log('=== ROUTE DETAILS ===');
        console.log('Route length:', tripData.trip.cities.length);
        console.log('Route cities:', tripData.trip.cities.map(c => c.city_name));
        console.log('Expected Paris route: Paris, Brussels, Amsterdam, Hamburg, Berlin, Prague, Budapest, Rome, London, Madrid, Lisbon');
      }
    }
    console.log('=== END DEBUG INFO ===');
  }, [tripData, tripType, numberOfCities, startingCity, selectedCities]);


  // Getting cities in the trip based on trip type
  useEffect(() => {
    const fetchTripCities = async () => {
      try {
        setLoading(true);
        
        // Get all cities data first
        const allCitiesData = await citiesAPI.getAllCitiesWithFood();
        console.log('All cities from API:', allCitiesData);
        
        // Handle both possible response structures: direct array or object with cities property
        const cities = Array.isArray(allCitiesData) ? allCitiesData : allCitiesData?.cities;
        console.log('Processed cities:', cities?.map(c => ({ 
          id: c.id, 
          name: c.name, 
          hasFood: c.food ? c.food.length : 0 
        })));
        
        if (!cities || !Array.isArray(cities)) {
          setError('No cities data available');
          return;
        }

        let citiesToShow = [];

        // Handle different trip types
        switch (tripType) {
                  case TripTypes.PARIS_TOUR:
          if (tripData?.trip?.cities && Array.isArray(tripData.trip.cities)) {
            citiesToShow = tripData.trip.cities.map(tripCity => 
              cities.find(city => 
                city.name.toLowerCase() === tripCity.city_name.toLowerCase()
              )
            ).filter(Boolean);
            console.log('Paris tour - using route from backend:', citiesToShow.map(c => c.name));
          } else {
            // Fallback: Ensure Paris is first, then add other cities
            const parisCity = cities.find(city => 
              city.name.toLowerCase() === 'paris'
            );
            const otherCities = cities.filter(city => 
              city.name.toLowerCase() !== 'paris'
            );
            
            citiesToShow = [parisCity, ...otherCities].filter(Boolean);
            console.log('Paris tour - fallback with Paris first:', citiesToShow.map(c => c.name));
          }
          break;

          case TripTypes.LONDON_TOUR:
            if (tripData?.trip?.cities && Array.isArray(tripData.trip.cities)) {
              citiesToShow = tripData.trip.cities.map(tripCity => 
                cities.find(city => 
                  city.name.toLowerCase() === tripCity.city_name.toLowerCase()
                )
              ).filter(Boolean);
              console.log('London tour - using route from backend:', citiesToShow.map(c => c.name));
            } else {
              const londonCity = cities.find(city => 
                city.name.toLowerCase() === 'london'
              );
              const otherCities = cities.filter(city => 
                city.name.toLowerCase() !== 'london'
              );
              
              citiesToShow = [londonCity, ...otherCities.slice(0, (numberOfCities || 5) - 1)].filter(Boolean);
              console.log(`London tour fallback - showing ${numberOfCities || 5} cities:`, citiesToShow.map(c => c.name));
            }
            break;

          case TripTypes.CUSTOM_TOUR:
            if (tripData?.trip?.cities && Array.isArray(tripData.trip.cities)) {
              citiesToShow = tripData.trip.cities.map(tripCity => 
                cities.find(city => 
                  city.name.toLowerCase() === tripCity.city_name.toLowerCase()
                )
              ).filter(Boolean);
              console.log('Custom tour - using route from backend:', citiesToShow.map(c => c.name));
            } else if (startingCity && selectedCities) {
              const startCity = cities.find(city => 
                city.name.toLowerCase() === startingCity.toLowerCase()
              );
              const otherSelectedCities = selectedCities.map(cityName =>
                cities.find(city => 
                  city.name.toLowerCase() === cityName.toLowerCase()
                )
              ).filter(Boolean);
              
              citiesToShow = [startCity, ...otherSelectedCities].filter(Boolean);
              console.log('Custom tour fallback - manual selection:', citiesToShow.map(c => c.name));
            } else {
              citiesToShow = cities.slice(0, 5);
              console.log('Custom tour - default fallback');
            }
            break;

                  case TripTypes.BERLIN_TOUR:
          if (tripData?.trip?.cities && Array.isArray(tripData.trip.cities)) {
            citiesToShow = tripData.trip.cities.map(tripCity => 
              cities.find(city => 
                city.name.toLowerCase() === tripCity.city_name.toLowerCase()
              )
            ).filter(Boolean);
            console.log('Berlin tour - using route from backend:', citiesToShow.map(c => c.name));
          } else {
            // Fallback: Ensure Berlin is first, then add other cities
            const berlinCity = cities.find(city => 
              city.name.toLowerCase() === 'berlin'
            );
            const otherCities = cities.filter(city => 
              city.name.toLowerCase() !== 'berlin'
            );
            
            citiesToShow = [berlinCity, ...otherCities].filter(Boolean);
            console.log('Berlin tour - fallback with Berlin first:', citiesToShow.map(c => c.name));
          }
          break;

          default:
            citiesToShow = cities;
        }

        console.log('Final cities to show:', citiesToShow.map(c => ({ 
          name: c?.name, 
          id: c?.id, 
          hasFood: c?.food ? c.food.length : 0,
          foodItems: c?.food 
        })));
        
        setTripCities(citiesToShow);

      } catch (err) {
        console.error('Failed to fetch cities:', err);
        setError('Failed to load cities');
      } finally {
        setLoading(false);
      }
    };

    fetchTripCities();
  }, [tripData, tripType, numberOfCities, startingCity, selectedCities]);


  // Fetch city distances when tripCities changes
  useEffect(() => {
    const fetchCityDistances = async () => {
      if (!tripCities || tripCities.length < 2) {
        setCityDistances({});
        return;
      }

      try {
        const response = await fetch('/api/cities/distances');
        if (!response.ok) {
          throw new Error(`Failed to fetch distances: ${response.status}`);
        }
        const data = await response.json();
        
        // Convert array of distances to a lookup map
        const distanceMap = {};
        if (data.distances && Array.isArray(data.distances)) {
          data.distances.forEach(dist => {
            const key = `${dist.from_city_id}-${dist.to_city_id}`;
            distanceMap[key] = dist.distance;
          });
        }
        
        setCityDistances(distanceMap);
        console.log('Loaded city distances:', distanceMap);
      } catch (err) {
        console.error('Failed to fetch city distances:', err);
        setCityDistances({});
      }
    };

    fetchCityDistances();
  }, [tripCities]);

  const handleSubmit = () => {
  navigate("/summary", {
    state: {
      tripType,
      tripData, 
      totalDistance,
      selectedFoodItems,
      tripCities, 
      totalFoodCost: totalCost.toFixed(2)
    }
  });
}

  // Add this debug function to test the food API
  const testFoodAPI = async (cityId) => {
    try {
      console.log(`Testing food API for city ID: ${cityId}`);
      const response = await fetch(`/api/cities/${cityId}/foods`);
      console.log('Food API response status:', response.status);
      console.log('Food API response headers:', response.headers);
      
      if (!response.ok) {
        console.error('Food API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Food API error body:', errorText);
        return;
      }
      
      const data = await response.json();
      console.log('Food API response data:', data);
    } catch (error) {
      console.error('Food API fetch error:', error);
    }
  };

  // Handle city click to expand/collapse and fetch food data
  const handleCityClick = async (city) => {
    try {
      const newExpandedCities = new Set(expandedCities);
      
      if (newExpandedCities.has(city.id)) {
        // Collapse the city
        newExpandedCities.delete(city.id);
      } else {
        // Expand the city
        newExpandedCities.add(city.id);
        
        // Test the food API first
        await testFoodAPI(city.id);
        
        // Fetch food data if not already loaded
        if (!cityFoodData[city.id] && (!city.food || city.food.length === 0)) {
          setLoadingFood(prev => new Set(prev).add(city.id));
          console.log(`Fetching food data for ${city.name} (ID: ${city.id})`);
          
          try {
            const foodData = await citiesAPI.getCityFood(city.id);
            console.log(`Food data for ${city.name}:`, foodData);
            
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
            
            setCityFoodData(prev => ({
              ...prev,
              [city.id]: foods
            }));
          } catch (err) {
            console.error(`Failed to fetch food for ${city.name}:`, err);
            setCityFoodData(prev => ({
              ...prev,
              [city.id]: []
            }));
          }
        }
      }
      
      setExpandedCities(newExpandedCities);
    } catch (err) {
      console.error('Failed to handle city click:', err);
    } finally {
      setLoadingFood(prev => {
        const newSet = new Set(prev);
        newSet.delete(city.id);
        return newSet;
      });
    }
  };

// Incrementing Food Item
const addFoodItem = (cityName, food) => {
  const foodName = food.name || food.title || food.foodName || 'Unknown Food';
  const foodPrice = parseFloat(food.price || food.cost || food.amount || 0);
  
  const existingItem = selectedFoodItems.find(item => 
    item.cityName === cityName && item.foodName === foodName
  );
  
  if (existingItem) {
    // Increase quantity of existing item
    setSelectedFoodItems(prev => prev.map(item => 
      item.id === existingItem.id 
        ? { ...item, quantity: (item.quantity || 1) + 1 }
        : item
    ));
    setTotalCost(prev => prev + foodPrice);
    // Clear any stale manual input so UI reflects updated quantity
    const key = `${cityName}::${foodName}`;
    setQuantityInputs(prev => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  } else {
    // Add new item with quantity 1
    const newItem = {
      id: Date.now(),
      cityName,
      foodName,
      price: foodPrice,
      quantity: 1
    };
    setSelectedFoodItems(prev => [...prev, newItem]);
    setTotalCost(prev => prev + foodPrice);
    const key = `${cityName}::${foodName}`;
    setQuantityInputs(prev => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }
};
  const getFoodQuantity = (cityName, foodName) => {
  const item = selectedFoodItems.find(item => 
    item.cityName === cityName && item.foodName === foodName
  );
  return item ? (item.quantity || 1) : 0;
};

// Decrementing Food Item
const subtractFoodItem = (cityName, food) => {
  const foodName = food.name || food.title || food.foodName || 'Unknown Food';
  const foodPrice = parseFloat(food.price || food.cost || food.amount || 0);
  
  const existingItem = selectedFoodItems.find(item => 
    item.cityName === cityName && item.foodName === foodName
  );
  
  if (existingItem && (existingItem.quantity || 1) > 0) {
    if ((existingItem.quantity || 1) === 1) {
      // Remove item if quantity would become 0
      setSelectedFoodItems(prev => prev.filter(item => item.id !== existingItem.id));
    } else {
      // Decrease quantity
      setSelectedFoodItems(prev => prev.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: (item.quantity || 1) - 1 }
          : item
      ));
    }
    setTotalCost(prev => prev - foodPrice);
    const key = `${cityName}::${foodName}`;
    setQuantityInputs(prev => {
      if (prev[key] === undefined) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }
};

// Directly set a food quantity (used by input Enter key)
const setFoodQuantity = (cityName, food, newQtyRaw) => {
  // Allow blank/undefined to mean 0
  let newQty = parseInt(newQtyRaw, 10);
  if (isNaN(newQty) || newQty < 0) newQty = 0;

  const foodName = food.name || food.title || food.foodName || 'Unknown Food';
  const foodPrice = parseFloat(food.price || food.cost || food.amount || 0);

  const existingItem = selectedFoodItems.find(item => 
    item.cityName === cityName && item.foodName === foodName
  );

  if (existingItem) {
    const oldQty = existingItem.quantity || 1;
    if (newQty === 0) {
      // Remove item and adjust cost
      setSelectedFoodItems(prev => prev.filter(item => item.id !== existingItem.id));
      setTotalCost(prev => prev - oldQty * foodPrice);
    } else if (newQty !== oldQty) {
      setSelectedFoodItems(prev => prev.map(item => 
        item.id === existingItem.id ? { ...item, quantity: newQty } : item
      ));
      const delta = (newQty - oldQty) * foodPrice;
      setTotalCost(prev => prev + delta);
    }
  } else {
    if (newQty > 0) {
      // Add new item with specified quantity
      const newItem = {
        id: Date.now(),
        cityName,
        foodName,
        price: foodPrice,
        quantity: newQty
      };
      setSelectedFoodItems(prev => [...prev, newItem]);
      setTotalCost(prev => prev + newQty * foodPrice);
    }
  }
  // Clear manual input cache after saving so display syncs with state
  const key = `${cityName}::${foodName}`;
  setQuantityInputs(prev => {
    if (prev[key] === undefined) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });
};

  const getTripTypeDisplay = () => {
    switch(tripType) {
      case TripTypes.PARIS_TOUR:
        return "Paris Tour";
      case TripTypes.LONDON_TOUR:
        return "London Tour";
      case TripTypes.BERLIN_TOUR:
        return "Berlin Tour";
      case TripTypes.CUSTOM_TOUR:
        return "Custom Tour";
      default:
        return "European Tour";
    }
  };

   const getCitySpendingBreakdown = () => {
  const cityTotals = {};
  selectedFoodItems.forEach(item => {
    const itemTotal = item.price * (item.quantity || 1);
    if (cityTotals[item.cityName]) {
      cityTotals[item.cityName] += itemTotal;
    } else {
      cityTotals[item.cityName] = itemTotal;
    }
  });
  return cityTotals;
};

  // Enhanced helper function to get total distance from different possible data structures
  const getTotalDistance = () => {
    if (!tripData) return null;
    
    const distance = tripData.totalDistance || 
                    tripData.total_distance || 
                    tripData.distance || 
                    tripData.totalKm ||
                    tripData.total_km ||
                    tripData.distanceKm ||
                    tripData.distance_km ||
                    tripData.totalDistanceKm ||
                    tripData.total_distance_km ||
                    null;
    
    console.log('Found distance:', distance);
    return distance;
  };

  // Helper function to get food for a city
  const getCityFood = (city) => {
    // First try the food from the main city data
    if (city.food && Array.isArray(city.food) && city.food.length > 0) {
      return city.food;
    }
    
    // Then try the individually fetched food data
    if (cityFoodData[city.id] && cityFoodData[city.id].length > 0) {
      return cityFoodData[city.id];
    }
    
    return [];
  };

  // Helper function to get distance between two cities
  const getDistanceBetweenCities = (fromCityId, toCityId) => {
    const key = `${fromCityId}-${toCityId}`;
    return cityDistances[key] || null;
  };

  // Search function to scroll to city
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const foundCityIndex = tripCities.findIndex(city => 
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (foundCityIndex !== -1) {
      const cityElement = document.getElementById(`city-${tripCities[foundCityIndex].id}`);
      if (cityElement) {
        cityElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    } else {
      alert(`City "${searchTerm}" not found in your route.`);
    }
  };

  if (!tripData) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>No trip planned. Please go back to the trip page to plan your vacation.</p>
      </div>
    );
  }

  const totalDistance = getTotalDistance();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* LEFT SIDE - TRIP DETAILS AND CITIES IN YOUR ROUTE */}
      <div id="leftBG" style={{ flex: '2' }}>
        <div className="title">{getTripTypeDisplay()}</div>
        
        {/* Search Feature */}
        <div style={{ padding: '5px 20px', borderBottom: '1px solid var(--dark-brown)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="sub-header" 
              style={{ marginRight: '10px',
                       fontSize: '14px',
                       whiteSpace: 'nowrap' }}
            >Search City:</div>
            <input
              type="text"
              placeholder="Search for a city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              />
            <button
              type="submit"
              style={{
                width: 'auto',
                borderRadius: '5px',
              }}
            >
              Find
            </button>
          </form>
        </div>
        
        {/* Apply HomePage container styling to cities section */}
        <div className="cities-list" style={{ width: '70vh' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading cities in your route...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
              Error: {error}
            </div>
          ) : tripCities.length > 0 ? (
            tripCities.map((city, routeIndex) => {
              const cityFood = getCityFood(city);
              const isExpanded = expandedCities.has(city.id);
              const isLoadingFood = loadingFood.has(city.id);
              
              return (
                <div key={city.id} id={`city-${city.id}`} style={{ justifyContent: 'space-between' }}>
                  {/* City Button - Using HomePage button styling */}
                  <button 
                    onClick={() => handleCityClick(city)}
                    aria-expanded={expandedCities.has(city.id)}
                    aria-label={`${expandedCities.has(city.id) ? 'Collapse' : 'Expand'} food options for ${city.name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%'
                    }}
                  >
                    {/* Left section: Icon + Route Index + City Name */}
                    <div style={{ display: 'flex', alignItems: 'center', flex: '1' }}>
                      {isExpanded ? (
                        <FaChevronUp 
                          aria-hidden="true"
                          style={{ marginRight: '10px' }}
                        />
                      ) : (
                        <FaChevronDown 
                          aria-hidden="true"
                          style={{ marginRight: '10px' }}
                        />
                      )}
                      <span style={{ marginRight: '5px' }}>
                        {routeIndex + 1}.
                      </span>
                      <span>
                        {city.name}
                      </span>
                    </div>

                    {/* Center section: Distance from Previous City */}
                    <div style={{ flex: '1', textAlign: 'center' }}>
                      {routeIndex > 0 && (
                        <span>
                          {(() => {
                            const prevCity = tripCities[routeIndex - 1];
                            const distance = getDistanceBetweenCities(prevCity.id, city.id);
                            return distance ? `${distance} km` : 'calculating...';
                          })()}
                        </span>
                      )}
                    </div>

                    {/* Right section: Food Spent Total */}
                    <div style={{ flex: '1', textAlign: 'right' }}>
                      <span>
                        ${(getCitySpendingBreakdown()[city.name] || 0).toFixed(2)}
                      </span>
                    </div>
                  </button>
                  
                  {/* Food Options - Only shown when expanded */}
                  {expandedCities.has(city.id) && (
                    <div className="food-container">
                      {isLoadingFood ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>Loading food...</p>
                      ) : cityFood.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                    {cityFood.map((food, index) => {
                      const foodName = food.name || food.title || food.foodName || `Food Item ${index + 1}`;
                      const foodPrice = parseFloat(food.price || food.cost || food.amount || 0);
                      const quantity = getFoodQuantity(city.name, foodName);
                      
                      return (
                        <li key={index} style={{ padding: '5px 0', borderBottom: '1px solid #ccc' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div  className="food-name" style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                              <span style={{ borderBottom: 'none' }}>
                                <strong>{foodName}</strong> - ${foodPrice.toFixed(2)}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {/* Minus button - keep behavior */}
                              <button 
                                onClick={() => subtractFoodItem(city.name, { name: foodName, price: foodPrice })}
                                className="food-button food-minus-button"
                                title="Remove one"
                                disabled={quantity <= 0}
                              >
                                <FaMinus />
                              </button>

                              {/* Quantity input - always visible, Enter to save */}
                              <input
                                type="text" // use text to avoid native number spinners
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={
                                  quantityInputs[`${city.name}::${foodName}`] ?? quantity
                                }
                                onChange={(e) => {
                                  const key = `${city.name}::${foodName}`;
                                  setQuantityInputs(prev => ({ ...prev, [key]: e.target.value }));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const key = `${city.name}::${foodName}`;
                                    const value = quantityInputs[key] ?? quantity;
                                    setFoodQuantity(city.name, { name: foodName, price: foodPrice }, value);
                                  }
                                }}
                                style={{ width: '60px', textAlign: 'center' }}
                                aria-label={`Set quantity for ${foodName}`}
                              />

                              {/* Plus button */}
                              <button 
                                onClick={() => addFoodItem(city.name, { name: foodName, price: foodPrice })}
                                className="food-button"
                                title="Add one"
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
           
                        </ul>
                      ) : (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No food options available</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              No cities available
            </div>
          )}
        </div>
      </div>
      {/* END LEFT SIDE */}

      {/* RIGHT SIDE - SELECTED FOOD ITEMS */}
      <div id="rightContainer" style={{ flex: '1' }}>
              {/* Trip Summary in Right Panel */}
        <h4 className="header" style={{ margin: '0 0 10px 0' }}>Trip Summary</h4>
        <div className="trip-des" style={{ backgroundColor: 'var(--background)'}}>
          
          <p style={{ margin: '5px 0' }}><strong>Type:</strong> {getTripTypeDisplay()}</p>
          {totalDistance ? (
            <p style={{ margin: '5px 0'}}>
              <strong>Total Distance:</strong> {totalDistance} km
            </p>
          ) : (
            <p style={{ margin: '5px 0' }}>
              <strong>Distance:</strong> Not available from backend
            </p>
          )}
          <p style={{ margin: '5px 0' }}>
            <strong>Food Cost:</strong> ${totalCost.toFixed(2)}
          </p>
          <p style={{ margin: '5px 0'}}>
            <strong>Cities in Route:</strong> {tripCities.length}
          </p>
        </div>
        
        {/* Back Button */}
        <button 
          className="second-button"
          onClick={() => navigate('/trip')}>
          ← Back to Trip Selection
        </button>
      </div>
      {/* END RIGHT SIDE */}
    </div>
  );
}

export default DashboardPage;