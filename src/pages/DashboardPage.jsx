import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { citiesAPI } from "../apis/cityApis";
import { TripTypes } from "../apis/tripApi";
import "../style/dashboard.css";

function DashboardPage() {
  const location = useLocation();
  const { tripType, tripData, description, numberOfCities, startingCity, selectedCities, algorithmInfo } = location.state || {};
  
  const [tripCities, setTripCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFoodItems, setSelectedFoodItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [cityFoodData, setCityFoodData] = useState({});
  const [expandedCities, setExpandedCities] = useState(new Set()); // Track expanded cities
  const [loadingFood, setLoadingFood] = useState(new Set()); // Track cities loading food

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
      console.log('Trip route from backend:', tripData.route);
      console.log('Trip cities from backend:', tripData.cities);
      console.log('Trip itinerary from backend:', tripData.itinerary);
    }
    console.log('=== END DEBUG INFO ===');
  }, [tripData, tripType, numberOfCities, startingCity, selectedCities]);

  useEffect(() => {
    const fetchTripCities = async () => {
      try {
        setLoading(true);
        
        // Get all cities data first
        const allCitiesData = await citiesAPI.getAllCitiesWithFood();
        console.log('All cities from API:', allCitiesData?.cities?.map(c => ({ 
          id: c.id, 
          name: c.name, 
          hasFood: c.food ? c.food.length : 0 
        })));
        
        if (!allCitiesData || !allCitiesData.cities) {
          setError('No cities data available');
          return;
        }

        let citiesToShow = [];

        // Handle different trip types
        switch (tripType) {
          case TripTypes.PARIS_TOUR:
            if (tripData?.route && Array.isArray(tripData.route)) {
              citiesToShow = tripData.route.map(routeCityName => 
                allCitiesData.cities.find(city => 
                  city.name.toLowerCase() === routeCityName.toLowerCase()
                )
              ).filter(Boolean);
              console.log('Paris tour - using route from backend:', citiesToShow.map(c => c.name));
            } else {
              citiesToShow = allCitiesData.cities;
              console.log('Paris tour - fallback to all cities');
            }
            break;

          case TripTypes.LONDON_TOUR:
            if (tripData?.route && Array.isArray(tripData.route)) {
              citiesToShow = tripData.route.map(routeCityName => 
                allCitiesData.cities.find(city => 
                  city.name.toLowerCase() === routeCityName.toLowerCase()
                )
              ).filter(Boolean);
              console.log('London tour - using route from backend:', citiesToShow.map(c => c.name));
            } else {
              const londonCity = allCitiesData.cities.find(city => 
                city.name.toLowerCase() === 'london'
              );
              const otherCities = allCitiesData.cities.filter(city => 
                city.name.toLowerCase() !== 'london'
              );
              
              citiesToShow = [londonCity, ...otherCities.slice(0, (numberOfCities || 5) - 1)].filter(Boolean);
              console.log(`London tour fallback - showing ${numberOfCities || 5} cities:`, citiesToShow.map(c => c.name));
            }
            break;

          case TripTypes.CUSTOM_TOUR:
            if (tripData?.route && Array.isArray(tripData.route)) {
              citiesToShow = tripData.route.map(routeCityName => 
                allCitiesData.cities.find(city => 
                  city.name.toLowerCase() === routeCityName.toLowerCase()
                )
              ).filter(Boolean);
              console.log('Custom tour - using route from backend:', citiesToShow.map(c => c.name));
            } else if (startingCity && selectedCities) {
              const startCity = allCitiesData.cities.find(city => 
                city.name.toLowerCase() === startingCity.toLowerCase()
              );
              const otherSelectedCities = selectedCities.map(cityName =>
                allCitiesData.cities.find(city => 
                  city.name.toLowerCase() === cityName.toLowerCase()
                )
              ).filter(Boolean);
              
              citiesToShow = [startCity, ...otherSelectedCities].filter(Boolean);
              console.log('Custom tour fallback - manual selection:', citiesToShow.map(c => c.name));
            } else {
              citiesToShow = allCitiesData.cities.slice(0, 5);
              console.log('Custom tour - default fallback');
            }
            break;

          case TripTypes.BERLIN_TOUR:
            if (tripData?.route && Array.isArray(tripData.route)) {
              citiesToShow = tripData.route.map(routeCityName => 
                allCitiesData.cities.find(city => 
                  city.name.toLowerCase() === routeCityName.toLowerCase()
                )
              ).filter(Boolean);
            } else {
              citiesToShow = allCitiesData.cities;
            }
            break;

          default:
            citiesToShow = allCitiesData.cities;
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

  const addFoodItem = (cityName, food) => {
    const newItem = {
      id: Date.now(),
      cityName,
      foodName: food.name || food.title || food.foodName || 'Unknown Food',
      price: parseFloat(food.price || food.cost || food.amount || 0)
    };
    setSelectedFoodItems(prev => [...prev, newItem]);
    setTotalCost(prev => prev + newItem.price);
  };

  const removeFoodItem = (itemId) => {
    const item = selectedFoodItems.find(item => item.id === itemId);
    if (item) {
      setSelectedFoodItems(prev => prev.filter(item => item.id !== itemId));
      setTotalCost(prev => prev - item.price);
    }
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
        <div className="header">Your European Vacation Plan</div>
        
        {/* Trip Summary */}
        <div className="trip-summary">
      
          
          {/* Show trip-specific information */}
          {tripType === TripTypes.LONDON_TOUR && (
            <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
              <strong>🇬🇧 London Tour:</strong> Visiting {numberOfCities || 'selected number of'} cities starting from London
            </div>
          )}
          
          {tripType === TripTypes.CUSTOM_TOUR && startingCity && selectedCities && (
            <div style={{ backgroundColor: '#f3e5f5', padding: '10px', borderRadius: '5px', margin: '10px 0' }}>
              <strong>🎯 Custom Tour:</strong> Starting from {startingCity}, visiting: {selectedCities.join(', ')}
            </div>
          )}
        </div>

        {/* Cities in Your Trip Route with Food - Using HomePage container styling */}
        <div className="header">
          Cities in Your Trip Route 
          <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>
            ({tripCities.length} cities - Click to view food options)
          </span>
        </div>
        
        {/* Apply HomePage container styling to cities section */}
        <div style={{ overflow: 'auto', maxHeight: '600px', width: '100%' }}>
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
                <div key={city.id}>
                  {/* City Button - Using HomePage button styling */}
                  <button 
                    onClick={() => handleCityClick(city)}
                    aria-expanded={expandedCities.has(city.id)}
                    aria-label={`${expandedCities.has(city.id) ? 'Collapse' : 'Expand'} food options for ${city.name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <FaChevronDown 
                      aria-hidden="true"
                      style={{ marginRight: '10px' }}
                    />
                    <span style={{ 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '20px', 
                      height: '20px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginRight: '8px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      {routeIndex + 1}
                    </span>
                    <span style={{ flex: 1 }}>
                      {city.name}
                      <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                        {routeIndex === 0 ? '(Starting City)' : `(Stop ${routeIndex})`}
                      </span>
                    </span>
                  </button>
                  
                  {/* Food Options - Only shown when expanded */}
                  {expandedCities.has(city.id) && (
                    <div style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                      <h4 className="header">Food Options:</h4>
                      {isLoadingFood ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>Loading food...</p>
                      ) : cityFood.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {cityFood.map((food, index) => {
                            const foodName = food.name || food.title || food.foodName || `Food Item ${index + 1}`;
                            const foodPrice = parseFloat(food.price || food.cost || food.amount || 0);
                            
                            return (
                              <li key={index} style={{ padding: '5px 0', borderBottom: '1px solid #ccc' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>
                                    <strong>{foodName}</strong> - ${foodPrice.toFixed(2)}
                                  </span>
                                  <button 
                                    onClick={() => addFoodItem(city.name, { name: foodName, price: foodPrice })}
                                    className="add-food-btn"
                                    style={{
                                      backgroundColor: '#f8f9fa',
                                      color: '#212529',
                                      border: '1px solid #dee2e6',
                                      padding: '1px 4px',
                                      borderRadius: '2px',
                                      cursor: 'pointer',
                                      fontSize: '9px',
                                      fontWeight: 'normal',
                                      width: '20px',
                                      height: '20px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                      e.target.style.backgroundColor = '#e9ecef';
                                      e.target.style.borderColor = '#adb5bd';
                                    }}
                                    onMouseOut={(e) => {
                                      e.target.style.backgroundColor = '#f8f9fa';
                                      e.target.style.borderColor = '#dee2e6';
                                    }}
                                  >
                                   +
                                  </button>
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
        <div className="header">Your Food Selections</div>

        <div id="selected-cities-result" className="container">
          {selectedFoodItems.length === 0 ? (
            <p>No food items selected yet. Click on cities to view and add food options.</p>
          ) : (
            selectedFoodItems.map((item) => (
              <div key={item.id} className="selected-food-item">
                <div>
                  <strong>{item.foodName}</strong><br/>
                  <small>from {item.cityName}</small><br/>
                  <span>${item.price.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => removeFoodItem(item.id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            ))
          )}
          
          {selectedFoodItems.length > 0 && (
            <div className="total-cost">
              <strong>Total Food Cost: ${totalCost.toFixed(2)}</strong>
            </div>
          )}
        </div>

              {/* Trip Summary in Right Panel */}
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Trip Summary</h4>
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
        
        <button 
          id="submit" 
          onClick={() => console.log('Trip finalized!', { 
            tripType,
            tripData, 
            totalDistance,
            selectedFoodItems, 
            totalFoodCost: totalCost.toFixed(2) 
          })}
        >
          Finalize Trip
          <div style={{ fontSize: '12px', marginTop: '5px' }}>
            {totalDistance ? `Distance: ${totalDistance} km` : 'Distance: N/A'} | Food: ${totalCost.toFixed(2)}
          </div>
        </button>
      </div>
      {/* END RIGHT SIDE */}
    </div>
  );
}

export default DashboardPage;