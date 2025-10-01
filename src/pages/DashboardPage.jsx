import { useEffect, useState } from "react";
import { FaChevronDown, FaPlus, FaMinus } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { citiesAPI, calculateRouteDistances } from "../apis/cityApis";
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

  // State for managing distance data
  const [calculatedDistances, setCalculatedDistances] = useState(null);
  const [calculatedTotalDistance, setCalculatedTotalDistance] = useState(null);

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
              // Fallback: Ensure Paris is first, then add other cities
              const parisCity = allCitiesData.cities.find(city => 
                city.name.toLowerCase() === 'paris'
              );
              const otherCities = allCitiesData.cities.filter(city => 
                city.name.toLowerCase() !== 'paris'
              );
              
              citiesToShow = [parisCity, ...otherCities].filter(Boolean);
              console.log('Paris tour - fallback with Paris first:', citiesToShow.map(c => c.name));
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
            console.log('=== CUSTOM TOUR DEBUG ===');
            console.log('tripData:', tripData);
            console.log('tripData.route:', tripData?.route);
            console.log('startingCity:', startingCity);
            console.log('selectedCities:', selectedCities);
            console.log('========================');
            
            if (tripData?.route && Array.isArray(tripData.route)) {
              citiesToShow = tripData.route.map(routeCityName => 
                allCitiesData.cities.find(city => 
                  city.name.toLowerCase() === routeCityName.toLowerCase()
                )
              ).filter(Boolean);
              console.log('Custom tour - using route from tripData:', citiesToShow.map(c => c?.name));
            } else if (selectedCities && Array.isArray(selectedCities)) {
              // Use selectedCities directly (should be city names from CreateTripPage)
              citiesToShow = selectedCities.map(cityName =>
                allCitiesData.cities.find(city => 
                  city.name.toLowerCase() === cityName.toLowerCase()
                )
              ).filter(Boolean);
              console.log('Custom tour - using selectedCities:', citiesToShow.map(c => c?.name));
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
              console.log('Custom tour fallback - manual selection:', citiesToShow.map(c => c?.name));
            } else {
              console.log('Custom tour - NO DATA FOUND, using default fallback');
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
              console.log('Berlin tour - using route from backend:', citiesToShow.map(c => c.name));
            } else {
              // Fallback: Ensure Berlin is first, then add other cities
              const berlinCity = allCitiesData.cities.find(city => 
                city.name.toLowerCase() === 'berlin'
              );
              const otherCities = allCitiesData.cities.filter(city => 
                city.name.toLowerCase() !== 'berlin'
              );
              
              citiesToShow = [berlinCity, ...otherCities].filter(Boolean);
              console.log('Berlin tour - fallback with Berlin first:', citiesToShow.map(c => c.name));
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

        // Always calculate distances for accurate display
        if (citiesToShow.length > 1) {
          console.log('Calculating distances for dashboard display...');
          const distanceData = calculateRouteDistances(citiesToShow);
          console.log('Calculated dashboard distances:', distanceData);
          
          // Store calculated distances in state
          setCalculatedDistances(distanceData.distances);
          setCalculatedTotalDistance(distanceData.totalDistance);
          
          // Update the tripData with calculated distances if it exists
          if (tripData) {
            const updatedTripData = {
              ...tripData,
              distances: distanceData.distances,
              totalDistance: distanceData.totalDistance
            };
            
            // Update the location state to include distance data
            window.history.replaceState(
              { 
                ...location.state, 
                tripData: updatedTripData 
              }, 
              ''
            );
          }
        }

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
    const foodKey = `${cityName}-${food.name}`;
    const existingItem = selectedFoodItems.find(item => 
      item.cityName === cityName && item.foodName === (food.name || food.title || food.foodName || 'Unknown Food')
    );
    
    if (existingItem) {
      // Increase quantity of existing item
      setSelectedFoodItems(prev => prev.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      setTotalCost(prev => prev + parseFloat(food.price || food.cost || food.amount || 0));
    } else {
      // Add new item with quantity 1
      const newItem = {
        id: Date.now(),
        cityName,
        foodName: food.name || food.title || food.foodName || 'Unknown Food',
        price: parseFloat(food.price || food.cost || food.amount || 0),
        quantity: 1
      };
      setSelectedFoodItems(prev => [...prev, newItem]);
      setTotalCost(prev => prev + newItem.price);
    }
  };

  const subtractFoodItem = (cityName, food) => {
    const existingItem = selectedFoodItems.find(item => 
      item.cityName === cityName && item.foodName === (food.name || food.title || food.foodName || 'Unknown Food')
    );
    
    if (existingItem && existingItem.quantity > 0) {
      if (existingItem.quantity === 1) {
        // Remove item if quantity would become 0
        setSelectedFoodItems(prev => prev.filter(item => item.id !== existingItem.id));
      } else {
        // Decrease quantity
        setSelectedFoodItems(prev => prev.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ));
      }
      setTotalCost(prev => prev - parseFloat(food.price || food.cost || food.amount || 0));
    }
  };

  const getFoodQuantity = (cityName, foodName) => {
    const item = selectedFoodItems.find(item => 
      item.cityName === cityName && item.foodName === foodName
    );
    return item ? item.quantity : 0;
  };

  // Calculate total cost based on quantities
  const calculateTotalCost = () => {
    return selectedFoodItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Calculate total spent in a specific city
  const getCityTotal = (cityName) => {
    return selectedFoodItems
      .filter(item => item.cityName === cityName)
      .reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
  };

  // Get distance from previous city
  const getDistanceFromPrevious = (currentIndex) => {
    if (currentIndex === 0) return null; // No distance for starting city
    
    // Use calculated distances from state first (most accurate)
    if (calculatedDistances && Array.isArray(calculatedDistances)) {
      return calculatedDistances[currentIndex - 1];
    }
    
    // Check if tripData has individual distances (from backend optimization)
    if (tripData?.distances && Array.isArray(tripData.distances)) {
      return tripData.distances[currentIndex - 1];
    }
    
    // Check if tripData has itinerary with distances
    if (tripData?.itinerary && Array.isArray(tripData.itinerary)) {
      const segment = tripData.itinerary[currentIndex - 1];
      return segment?.distance || segment?.distanceKm || segment?.km;
    }
    
    // Check if cities have distance property
    const currentCity = tripCities[currentIndex];
    if (currentCity?.distanceFromPrevious || currentCity?.distance) {
      return currentCity.distanceFromPrevious || currentCity.distance;
    }
    
    return null; // No distance data available
  };

  // Check if trip was optimized by backend
  const isOptimizedTrip = () => {
    return tripData?.optimized === true;
  };

  // Get optimization source info
  const getOptimizationInfo = () => {
    if (!tripData?.optimized) return null;
    
    const source = tripData.optimizationSource || 'unknown';
    const sourceLabels = {
      'backend': 'Backend Algorithm',
      'local': 'Local Algorithm', 
      'none': 'No Optimization',
      'unknown': 'Optimized'
    };
    
    return sourceLabels[source] || 'Optimized';
  };

  // OLD REMOVE FUNCTION - BELONGS TO RITA'S OLD FOOD LIST
  // const removeFoodItem = (itemId) => {
  //   const item = selectedFoodItems.find(item => item.id === itemId);
  //   if (item) {
  //     setSelectedFoodItems(prev => prev.filter(item => item.id !== itemId));
  //     setTotalCost(prev => prev - item.price);
  //   }
  // };

  // FUNCTION TO GET TRIP TYPE DISPLAY NAME
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

  // Enhanced helper function to get total distance - prioritize calculated values
  const getTotalDistance = () => {
    // Use calculated total distance from state first (most accurate)
    if (calculatedTotalDistance !== null) {
      console.log('Using calculated total distance:', calculatedTotalDistance);
      return calculatedTotalDistance;
    }
    
    // Fallback to tripData if no calculated distance available
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
    
    console.log('Using tripData distance:', distance);
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
        <div className="create-header">{getTripTypeDisplay()} Plan</div>
        
        {/* Apply CreateTrip container styling to cities section */}
        <div className="cities-route-container">
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
                      alignItems: 'center',
                      width: '100%'
                    }}
                  >
                    <FaChevronDown 
                      aria-hidden="true"
                      style={{ marginRight: '10px' }}
                    />
                    { /* Number in route */ }
                    <span> {routeIndex + 1}.</span>
                    
                    { /* City name and total spent */ }
                    <span style={{ marginLeft: '5px', flex: '1' }}>
                      {city.name}

                      { /* Show total spent in city */}
                      {getCityTotal(city.name) > 0 && (
                        <span className="city-summary">
                          (${getCityTotal(city.name).toFixed(2)})
                        </span>
                      )}

                      <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                        {routeIndex === 0 ? '(Starting City)' : `(Stop ${routeIndex})`}
                      </span>
                    </span>
                    { /* END City name and total spent */ }

                    { /* Distance from previous city - far right */ }
                    {getDistanceFromPrevious(routeIndex) && (
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--secondary-brown)',
                        fontWeight: 'bold',
                        marginLeft: 'auto',
                        marginRight: '10px',
                        flexShrink: 0
                      }}>
                        {getDistanceFromPrevious(routeIndex)} km
                      </span>
                    )}
                    { /* END Distance display */ }

                  </button>
                  

                  {/* Food Options - Only shown when expanded */}
                  {expandedCities.has(city.id) && (
                    <div style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                      {isLoadingFood ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>Loading food...</p>
                      ) : cityFood.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {cityFood.map((food, index) => {
                            const foodName = food.name || food.title || food.foodName || `Food Item ${index + 1}`;
                            const foodPrice = parseFloat(food.price || food.cost || food.amount || 0);
                            
                            return (
                              <li key={index} className="food-name">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                                    <span>{foodName}</span>
                                    <span className="food-price">${foodPrice.toFixed(2)}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Plus button on the left */}
                                    <button 
                                      onClick={() => addFoodItem(city.name, { name: foodName, price: foodPrice })}
                                      className="food-button"
                                      title="Add one"
                                    >
                                      <FaPlus />
                                    </button>
                                    {/* Quantity display and minus button - only show when quantity > 0 */}
                                    {getFoodQuantity(city.name, foodName) > 0 && (
                                      <>
                                        <span style={{ 
                                          minWidth: '20px', 
                                          textAlign: 'center', 
                                          fontWeight: 'bold',
                                          color: 'var(--primary-brown)'
                                        }}>
                                          {getFoodQuantity(city.name, foodName)}
                                        </span>
                                        <button 
                                          onClick={() => subtractFoodItem(city.name, { name: foodName, price: foodPrice })}
                                          className="food-button food-minus-button"
                                          title="Remove one"
                                        >
                                          <FaMinus />
                                        </button>
                                      </>
                                    )}
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
                  {/* END Food Options */}

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
        <div className="create-header">Trip summary</div>

        { /* FOOD ITEMS SELECTED  */ }
        {/* <div className="selected-cities-scroll-container">
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
        </div> */}

        {/* Trip Summary in Right Panel */}
        <div className="trip-summary">
          <p style={{ margin: '5px 0' }}><strong>Type:</strong> {getTripTypeDisplay()}</p>
          {isOptimizedTrip() && (
            <p style={{ 
              margin: '5px 0', 
              color: 'var(--secondary-brown)', 
              fontWeight: 'bold',
              fontSize: '0.9em'
            }}>
              ✓ Route Optimized by Backend
            </p>
          )}
            <p style={{ margin: '5px 0'}}>
              <strong>Total Distance:</strong> {totalDistance} km
            </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Food Cost:</strong> ${totalCost.toFixed(2)}
          </p>
          <p style={{ margin: '5px 0'}}>
            <strong>Cities in Route:</strong> {tripCities.length}
          </p>
        </div>
      </div>
      {/* END RIGHT SIDE */}
    </div>
  );
}

export default DashboardPage;