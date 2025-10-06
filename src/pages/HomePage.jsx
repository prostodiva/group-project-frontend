import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import { citiesAPI } from "../apis/cityApis";
import { cityManagementAPI } from "../apis/tripApi";
import "../style/home.css";

const HomePage = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCities, setExpandedCities] = useState(new Set());
  const [cityFoods, setCityFoods] = useState({});
  const [loadingFood, setLoadingFood] = useState(new Set());

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
    <div id="container">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div id="title">European Cities and Distances from Berlin</div>
        <Link id="trip" to="/trip">create my trip</Link>
      </div>
      
      <div id="cities-result" style={{ overflow: 'auto', maxHeight: '600px', width: '100%' }}>
        {cities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No cities available
          </div>
        ) : (
          cities.map((city) => {
            const distanceFromBerlin = getDistanceFromBerlin(city);
            return (
              <div key={city.id}>
                <button 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => handleCityClick(city)}
                  aria-expanded={expandedCities.has(city.id)}
                  aria-label={`${expandedCities.has(city.id) ? 'Collapse' : 'Expand'} food options for ${city.name}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FaChevronDown 
                      aria-hidden="true"
                    />
                    <span style={{ display: 'block', flex: '1', marginLeft: '10px' }}>{city.name}</span>
                  </div>
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#2E7D32', 
                    fontWeight: 'bold',
                    marginRight: '10px'
                  }}>
                    {formatDistance(distanceFromBerlin)}
                  </span>
                </button>
                
                {expandedCities.has(city.id) && (
                  <div style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                    <h4 className="header">Food Options:</h4>
                    {loadingFood.has(city.id) ? (
                      <p style={{ color: '#666', fontStyle: 'italic' }}>Loading food...</p>
                    ) : cityFoods[city.id] && cityFoods[city.id].length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {cityFoods[city.id].map((food, index) => (
                          <li key={index} style={{ padding: '5px 0', borderBottom: '1px solid #ccc' }}>
                            {typeof food === 'string' ? (
                              food
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{food.name || food.title || food.foodName || 'Unknown Food'}</span>
                                <span style={{ fontWeight: 'bold', color: '#2E7D32' }}>
                                  ${food.price || food.cost || food.amount || 'N/A'}
                                </span>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#666', fontStyle: 'italic' }}>No food options available</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HomePage;