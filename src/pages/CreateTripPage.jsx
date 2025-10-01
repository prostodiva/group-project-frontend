import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { citiesAPI, calculateRouteDistances } from '../apis/cityApis';
import Input from '../components/Input';
import '../style/createTrip.css';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get starting city info from TripPage navigation
  const startingCity = location.state?.startingCity;
  const startingCityId = location.state?.startingCityId;
  
  // State for managing cities
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedStartingCity, setSelectedStartingCity] = useState(''); // New state for dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        await citiesAPI.checkHealth();
        console.log('API is running');

        // Fetch all cities
        const data = await citiesAPI.getAllCitiesWithFood();
        
        // Handle the response format (array or wrapped object)
        let cities = [];
        if (Array.isArray(data)) {
          cities = data;
        } else if (data && data.cities) {
          cities = data.cities;
        }
        
        setAvailableCities([...cities]);
        setError(null);
      } catch (error) {
        console.error('API connection failed:', error);
        setError('Cannot connect to API. Make sure the server is running.');
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []); // END useEffect


  // Add city to selected list
  const addCityToSelected = (city) => {
    setAvailableCities(prev => prev.filter(c => c.id !== city.id));
    setSelectedCities(prev => [...prev, city]);
  }; // END addCityToSelected


  // Remove city from selected list
  const removeCityFromSelected = (city) => {
    setSelectedCities(prev => prev.filter(c => c.id !== city.id));
    setAvailableCities(prev => [...prev, city]);
  }; // END removeCityFromSelected


  // Handle drag start
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const newSelectedCities = [...selectedCities];
      const draggedCity = newSelectedCities.splice(draggedIndex, 1)[0];
      newSelectedCities.splice(targetIndex, 0, draggedCity);
      setSelectedCities(newSelectedCities);
    }
    setDraggedIndex(null);
  };

  // Save and submit the trip
  const saveListAndSubmit = async () => {
    if (selectedCities.length === 0) {
      alert('Please select at least one city before submitting!');
      return;
    }
    
    // Validate starting city selection
    if (selectedCities.length > 0 && !selectedStartingCity) {
      alert('Please select a starting city from the dropdown!');
      return;
    }

    const startingCityName = selectedStartingCity || selectedCities[0]?.name || 'Custom Starting Point';
    const startingCityObj = selectedCities.find(city => city.name === startingCityName);

    try {
      // Prepare parameters for backend route optimization
      const tripParams = {
        cities: selectedCities.map(city => ({
          id: city.id,
          name: city.name,
          latitude: city.latitude || city.lat,
          longitude: city.longitude || city.lng || city.lon
        })),
        startingCity: {
          id: startingCityObj.id,
          name: startingCityObj.name,
          latitude: startingCityObj.latitude || startingCityObj.lat,
          longitude: startingCityObj.longitude || startingCityObj.lng || startingCityObj.lon
        },
        tripType: 'custom',
        preferences: {
          optimize: 'distance', // or 'time', depending on your backend options
          returnToStart: false
        }
      };

      console.log('Requesting route optimization with params:', tripParams);
      
      // Get optimized route from backend
      const optimizedRouteData = await citiesAPI.getOptimizedRoute(tripParams);
      
      // Calculate distances if not provided by backend
      let distances = optimizedRouteData.distances;
      let totalDistance = optimizedRouteData.totalDistance;
      
      if (!distances || !totalDistance) {
        console.log('Backend did not provide distance data, calculating locally...');
        const citiesForCalculation = optimizedRouteData.cities || selectedCities;
        const distanceData = calculateRouteDistances(citiesForCalculation);
        distances = distanceData.distances;
        totalDistance = distanceData.totalDistance;
        console.log('Calculated distances for backend route:', distanceData);
      }
      
      // Use backend-optimized route data
      const tripData = {
        tripType: 'custom',
        cities: optimizedRouteData.cities || selectedCities, // Backend provides ordered cities
        route: optimizedRouteData.route || optimizedRouteData.cityNames, // Backend provides ordered route
        distances: distances, // Individual segment distances
        totalDistance: totalDistance,
        startingCity: startingCityName,
        optimized: true, // Flag to indicate this came from backend optimization
        optimizationSource: 'backend',
        createdAt: new Date().toISOString(),
        description: `Optimized Custom Trip starting from ${startingCityName} - ${selectedCities.length} cities`
      };

      console.log('Received optimized trip data from backend:', tripData);
      
      // Save to localStorage (backup)
      localStorage.setItem('selectedCities', JSON.stringify(selectedCities));
      localStorage.setItem('customTripData', JSON.stringify(tripData));
      
      // Navigate to dashboard with optimized trip data
      navigate('/dashboard', { 
        state: { 
          tripType: 'custom_tour',
          tripData: tripData,
          selectedCities: tripData.route, // Use backend-optimized route
          startingCity: startingCityName,
          description: tripData.description
        } 
      });

    } catch (error) {
      console.error('Route optimization failed, falling back to simple ordering:', error);
      
      // Fallback to current frontend logic if backend fails
      // Create ordered route with starting city first
      const orderedRoute = [];
      const orderedCities = [];
      
      // Find the starting city object
      if (startingCityObj) {
        orderedRoute.push(startingCityName);
        orderedCities.push(startingCityObj);
      }
      
      // Add remaining cities (excluding the starting city)
      selectedCities.forEach(city => {
        if (city.name !== startingCityName) {
          orderedRoute.push(city.name);
          orderedCities.push(city);
        }
      });

      // Calculate distances for the fallback route
      const distanceData = calculateRouteDistances(orderedCities);
      console.log('Calculated fallback route distances:', distanceData);

      const tripData = {
        tripType: 'custom',
        cities: orderedCities,
        route: orderedRoute,
        distances: distanceData.distances,
        totalDistance: distanceData.totalDistance,
        startingCity: startingCityName,
        optimized: false, // Flag to indicate fallback was used
        optimizationSource: 'none',
        createdAt: new Date().toISOString(),
        description: `Custom Trip starting from ${startingCityName} - ${selectedCities.length} cities selected`
      };

      localStorage.setItem('selectedCities', JSON.stringify(selectedCities));
      localStorage.setItem('customTripData', JSON.stringify(tripData));
      
      navigate('/dashboard', { 
        state: { 
          tripType: 'custom_tour',
          tripData: tripData,
          selectedCities: orderedRoute,
          startingCity: startingCityName,
          description: tripData.description
        } 
      });
    }
  };

  // LOADING SERVER STATES
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        Loading cities...
      </div>
    );
  }

  // ERROR MESSAGE
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  // DISPLAY
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* LEFT SIDE - LIST OF CITIES */}
      <div id="leftBG">
        <div className="create-header">List of Cities</div>
        
        <div className="cities-list">
          {availableCities.map(city => (
            <div key={city.id} className="city-row">
              <span>{city.name}</span>
              <button onClick={() => addCityToSelected(city)}>
                <FaPlus />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - CHOSEN CITIES */}
      <div id="rightContainer">
        <div className="create-header">My List</div>
        
        {/* Starting City Dropdown - Fixed at top */}
        <div className="starting-city-dropdown">
          <label>Choose Starting City:</label>
          <select 
            value={selectedStartingCity} 
            onChange={(e) => setSelectedStartingCity(e.target.value)}
          >
            <option value="">Select starting city...</option>
            {selectedCities.map(city => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Scrollable Selected Cities List */}
        <div className="selected-cities-scroll-container">
          {selectedCities.map((city, index) => (
            <div
              key={city.id}
              className="selected-city-row"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <span className="number">{index + 1}.</span>
              <span className="city-name">{city.name}</span>
              <button 
                className="minus-btn"
                onClick={() => removeCityFromSelected(city)}
              >
                <FaMinus />
              </button>
            </div>
          ))}
        </div>
        
        <div className="button-group">
          <Input
            type="button"
            className="default-button"
            value="Back"
            onClick={() => navigate('/trip')}
          />
          <Input
            type="button"
            className="default-button"
            style={{ marginLeft: 'auto' }}
            value="Submit"
            onClick={saveListAndSubmit}
          />
        </div>
      </div>
    </div>
  );
  // END return

};

export default CreateTripPage;