import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { citiesAPI } from '../apis/cityApis';
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
  }, []);

  // Add city to selected list
  const addCityToSelected = (city) => {
    setAvailableCities(prev => prev.filter(c => c.id !== city.id));
    setSelectedCities(prev => [...prev, city]);
  };

  // Remove city from selected list
  const removeCityFromSelected = (city) => {
    setSelectedCities(prev => prev.filter(c => c.id !== city.id));
    setAvailableCities(prev => [...prev, city]);
  };

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
    
    // Save to localStorage
    localStorage.setItem('selectedCities', JSON.stringify(selectedCities));
    console.log('Saved cities:', selectedCities);
    
    // Navigate to summary page (you can change this route as needed)
    navigate('/trip-summary', { state: { selectedCities } });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        Loading cities...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* LEFT SIDE - LIST OF CITIES */}
      <div id="leftBG">
        <div className="header">List of Cities</div>
        {startingCity && (
          <div style={{ 
            backgroundColor: 'var(--primary-brown)', 
            color: 'var(--default-text-color)', 
            padding: '10px', 
            marginBottom: '15px', 
            borderRadius: 'var(--border-radius)',
            textAlign: 'center'
          }}>
            Starting from: <strong>{startingCity}</strong>
          </div>
        )}
        
        <div id="cities-result">
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
        
        <div id="selected-cities-result" className="container">
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
        
        <button id="submit" onClick={saveListAndSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default CreateTripPage;