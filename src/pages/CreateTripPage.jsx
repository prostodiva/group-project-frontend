import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { citiesAPI } from '../apis/cityApis';
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
  const saveListAndSubmit = () => {
    if (selectedCities.length === 0) {
      alert('Please select at least one city before submitting!');
      return;
    }
    
    // Extract city names for dashboard compatibility
    const cityNames = selectedCities.map(city => city.name);
    const startingCityName = selectedStartingCity || selectedCities[0]?.name || 'Custom Starting Point';
    
    // Validate starting city selection
    if (selectedCities.length > 0 && !selectedStartingCity) {
      alert('Please select a starting city from the dropdown!');
      return;
    }
    
    // For debugging - webbrowser console
    console.log('=== CREATETRIP DEBUG ===');
    console.log('selectedCities (objects):', selectedCities);
    console.log('cityNames (extracted):', cityNames);
    console.log('startingCityName:', startingCityName);
    console.log('======================');
    

    // Prepare trip data for dashboard
    const tripData = {
      tripType: 'custom',
      cities: selectedCities, // full city objects
      route: cityNames, // just names for dashboard route
      startingCity: startingCityName,
      createdAt: new Date().toISOString(),
      description: `Custom Trip - ${selectedCities.length} cities selected`
    }; // END tripData

    
    // Save to localStorage (backup)
    localStorage.setItem('selectedCities', JSON.stringify(selectedCities));
    localStorage.setItem('customTripData', JSON.stringify(tripData));
    console.log('Final tripData being sent:', tripData);
    console.log('Final state being sent to dashboard:', {
      tripType: 'custom_tour', // Match TripTypes.CUSTOM_TOUR
      tripData: tripData,
      selectedCities: cityNames,
      startingCity: startingCityName,
      description: tripData.description
    }); // END console.log

    
    // Navigate to dashboard with trip data
    navigate('/dashboard', { 
      state: { 
        tripType: 'custom_tour',
        tripData: tripData,
        selectedCities: cityNames, // pass city names, not objects
        startingCity: startingCityName,
        description: tripData.description
      } 
    }); // END navigate
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
        <div className="header">List of Cities</div>
        
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
        <div className="header">My List</div>
        
        <div id="selected-cities-result" className="create-trip-container">
          
            {/* Starting City Dropdown - only show when cities are selected */}
          <div style={{ marginBottom: '15px' }}>
            <label>Choose Starting City:</label>
            <select 
              value={selectedStartingCity} 
              onChange={(e) => setSelectedStartingCity(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '2px solid var(--primary-brown)',
                borderRadius: '5px',
                backgroundColor: 'var(--background)',
                color: 'var(--default-text-color)',
                fontFamily: 'var(--body-font)',
                fontSize: '14px'
              }}
            >
              <option value="">Select starting city...</option>
              {selectedCities.map(city => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          {/* END starting city dropdown */}
          
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