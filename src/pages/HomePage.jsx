import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import { citiesAPI } from "../apis/cityApis";
import "../style/home.css";

const HomePage = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCities, setExpandedCities] = useState(new Set());
  const [cityFoods, setCityFoods] = useState({});
  const [loadingFood, setLoadingFood] = useState(new Set());

  useEffect(() => {
    // RETRIVING DATA
    const loadCities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await citiesAPI.checkHealth();
        const data = await citiesAPI.getAllCitiesWithFood();
        
        if (data && Array.isArray(data) && data.length > 0) {
          setCities(data);
        } else if (data && data.cities && Array.isArray(data.cities)) {
          setCities(data.cities);
        } else {
          setError('No cities data received from server');
        }
      } catch (err) {
        console.error('API connection failed:', err);
        setError(`Cannot connect to API: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }; // END loadCities

    loadCities();
  }, []); // END useEffect


  // City Button
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

          const foods = await citiesAPI.getCityFood(city.id); // already normalized array
          console.log(`Food data (normalized) for city ${city.id}:`, foods);

          setCityFoods(prev => ({
            ...prev,
            [city.id]: foods
          }));
        }
      } // END else
      setExpandedCities(newExpandedCities);
    } // END try
    
    catch (err) {
      console.error('Failed to fetch city food:', err);
      setError(`Failed to load food for ${city.name}: ${err.message}`);
    } finally {
      setLoadingFood(prev => {
        const newSet = new Set(prev);
        newSet.delete(city.id);
        return newSet;
      });
    }
  }; // END handleCityClick

  // LOADING MESSAGE
  if (loading) {
    return (
      <div id="container">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading cities...
        </div>
      </div>
    );
  } // END loading


  // ERROR MESSAGE
  if (error) {
    return (
      <div id="container">
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          Error: {error}
        </div>
      </div>
    );
  } // END error


  // DISPLAY CODE
  return (
    <div id="container">

      {/* Header and Create Trip Link */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div className="title" style={{ fontSize: '35px' }}>List of Cities</div>
        <Link id="trip" to="/trip">create my trip</Link>
      </div>
      
  <div id="home-cities-list">
        {/* No Cities Message */}
        {cities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No cities available
          </div>
        ) : (
          cities.map((city) => (

            //<City key={city.id} city={city} />
            <div key={city.id}>
              { /* Button functionality */ }
              <button 
                style={{ display: 'flex' }}
                onClick={() => handleCityClick(city)}
                aria-expanded={expandedCities.has(city.id)}
                aria-label={`${expandedCities.has(city.id) ? 'Collapse' : 'Expand'} food options for ${city.name}`}
              >
                <FaChevronDown aria-hidden="true" />
                <span style={{ display: 'block', flex: '1', marginLeft: '5px' }}>{city.name}</span>
              </button>
              { /* END Button functionality */ }

              { /* Display food options if expanded */ }
              {expandedCities.has(city.id) && (
                <div className="food-container">
                  {loadingFood.has(city.id) ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>Loading food...</p>
                  ) : cityFoods[city.id] && cityFoods[city.id].length > 0 ? (

                    // FOOD LIST
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {cityFoods[city.id].map((food, index) => (
                        <li key={index} className="food-name">
                          {typeof food === 'string' ? (
                            food
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>{food.name || food.title || food.foodName || 'Unknown Food'}</span>
                              <span className="food-price">${food.price || food.cost || food.amount || 'N/A'}</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                    // END FOOD LIST

                  ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No food options available</p>
                  )}
                </div>
              )}
              { /* END Display food options if expanded */ }

            </div> // END key={city.id}

          )) // END cities.map
        )}
  </div> {/* END home-cities-list */}
    </div> /* END container */
  );
};

export default HomePage;