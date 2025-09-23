import { useEffect, useState } from "react";
import { citiesAPI } from "../apis/cityApis";
import "../style/home.css";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";

const HomePage = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCities, setExpandedCities] = useState(new Set());
  const [cityFoods, setCityFoods] = useState({});
  const [loadingFood, setLoadingFood] = useState(new Set());

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await citiesAPI.checkHealth();
        const data = await citiesAPI.getAllCitiesWithFood();
        
        if (data && data.cities) {
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
    };

    loadCities();
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
        <div id="title">List of Cities</div>
        <Link id="trip" to="/trip">create my trip</Link>
      </div>
      
      <div id="cities-result" style={{ overflow: 'auto', maxHeight: '600px', width: '100%' }}>
        {cities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No cities available
          </div>
        ) : (
          cities.map((city) => (
            <div key={city.id}>
              <button 
                style={{ display: 'flex' }}
                onClick={() => handleCityClick(city)}
                aria-expanded={expandedCities.has(city.id)}
                aria-label={`${expandedCities.has(city.id) ? 'Collapse' : 'Expand'} food options for ${city.name}`}
              >
                <FaChevronDown 
                  aria-hidden="true"
                />
                <span style={{ display: 'block', flex: '1' }}>{city.name}</span>
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
                          {typeof food === 'string' ? food : (food.name || food.title || JSON.stringify(food))}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No food options available</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;