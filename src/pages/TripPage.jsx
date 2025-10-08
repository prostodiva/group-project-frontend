import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { citiesAPI } from "../apis/cityApis";
import { tripAPI, TripTypes } from "../apis/tripApi";
import Input from "../components/Input";
import "../style/trip.css";

const TripPage = () => {
  const navigate = useNavigate();
  const [selectedTripType, setSelectedTripType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [customStartCity, setCustomStartCity] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [customTripMode, setCustomTripMode] = useState('11cities');
  const [numberOfCities, setNumberOfCities] = useState('');

  // Load cities when component mounts
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await citiesAPI.getAllCitiesWithFood();
        console.log('Cities data loaded:', citiesData);
        
        if (citiesData && citiesData.cities) {
          setAvailableCities(citiesData.cities);
        } else if (citiesData && Array.isArray(citiesData)) {
          setAvailableCities(citiesData);
        }
      } catch (error) {
        console.error('Failed to load cities:', error);
        // Set a fallback list of cities if API fails
        setAvailableCities([
          { id: 1, name: 'Amsterdam' },
          { id: 2, name: 'Berlin' },
          { id: 3, name: 'Brussels' },
          { id: 4, name: 'Budapest' },
          { id: 5, name: 'Hamburg' },
          { id: 6, name: 'Lisbon' },
          { id: 7, name: 'London' },
          { id: 8, name: 'Madrid' },
          { id: 9, name: 'Paris' },
          { id: 10, name: 'Prague' },
          { id: 11, name: 'Rome' },
          { id: 12, name: 'Stockholm' },
          { id: 13, name: 'Vienna' }
        ]);
      }
    };

    loadCities();
  }, []);

  const handleTripTypeSelect = (tripType) => {
    setSelectedTripType(tripType);
  };

  const handleParisTour = async () => {
    setIsLoading(true);
    try {
      const tripData = await tripAPI.planParisTour();
      navigate("/dashboard", { 
        state: { 
          tripType: TripTypes.PARIS_TOUR,
          tripData: tripData,
          description: 'Paris Tour'
        } 
      });
    } catch (error) {
      console.error('Error planning Paris tour:', error);
      alert('Failed to plan Paris tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLondonTour = async () => {
    if (!numberOfCities || numberOfCities < 1 || numberOfCities > 11) {
      alert('Please enter a valid number of cities (1-11)');
      return;
    }
    
    setIsLoading(true);
    try {
      const tripData = await tripAPI.planLondonTour(parseInt(numberOfCities));
      navigate("/dashboard", { 
        state: { 
          tripType: TripTypes.LONDON_TOUR,
          tripData: tripData,
          numberOfCities: numberOfCities,
          description: `London Tour - Visit ${numberOfCities} cities starting from London`,
        } 
      });
    } catch (error) {
      console.error('Error planning London tour:', error);
      alert('Failed to plan London tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBerlinTour = async () => {
    setIsLoading(true);
    try {
      const tripData = await tripAPI.planBerlinTour();
      navigate("/dashboard", { 
        state: { 
          tripType: TripTypes.BERLIN_TOUR,
          tripData: tripData,
          description: 'Berlin Tour'
        } 
      });
    } catch (error) {
      console.error('Error planning Berlin tour:', error);
      alert('Failed to plan Berlin tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomTour = async () => {
    if (!customStartCity) {
      alert('Please select a starting city');
      return;
    }
    if (selectedCities.length === 0) {
      alert('Please select at least one city to visit');
      return;
    }
    
    setIsLoading(true);
    try {
      const tripData = await tripAPI.planCustomTour(customStartCity, selectedCities);
      navigate("/dashboard", { 
        state: { 
          tripType: TripTypes.CUSTOM_TOUR,
          tripData: tripData,
          startingCity: customStartCity,
          selectedCities: selectedCities,
          description: `Custom Tour (${customTripMode}) - Starting from ${customStartCity}, visiting ${selectedCities.length} cities`,
        } 
      });
    } catch (error) {
      console.error('Error planning custom tour:', error);
      alert('Failed to plan custom tour. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCitySelection = (city) => {
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  // Get cities based on selected mode
  const getAvailableCitiesForMode = () => {
    if (customTripMode === '11cities') {
      // Exclude Vienna (id: 13) and Stockholm (id: 12)
      return availableCities.filter(city => city.id !== 12 && city.id !== 13);
    } else {
      // Include all 13 cities
      return availableCities;
    }
  };

  // Reset selections when mode changes
  const handleModeChange = (mode) => {
    setCustomTripMode(mode);
    setCustomStartCity('');
    setSelectedCities([]);
  };

  return (
    <div className="container">
      <div id="text">Choose Your European Vacation Plan</div>
      
      {isLoading && <div className="loading">Planning your trip...</div>}
      
      {!selectedTripType && (
        <div className="trip-options">
          <Input
            className="paris-button"
            type="button"
            value="Paris"
            onClick={() => handleTripTypeSelect(TripTypes.PARIS_TOUR)}
            disabled={isLoading}
          />
          
          <Input
            className="london-button"
            type="button"
            value="London"
            onClick={() => handleTripTypeSelect(TripTypes.LONDON_TOUR)}
            disabled={isLoading}
          />

          <Input
            className="berlin-button"
            type="button"
            value="Berlin"
            onClick={() => handleTripTypeSelect(TripTypes.BERLIN_TOUR)}
            disabled={isLoading}
          />
          
          <Input
            className="custom-button"
            type="button"
            value="Custom"
            onClick={() => handleTripTypeSelect(TripTypes.CUSTOM_TOUR)}
            disabled={isLoading}
          />
        </div>
      )}

      {selectedTripType === TripTypes.PARIS_TOUR && (
        <div className="trip-config">
          <h3>Paris Tour Configuration</h3>
          <div style={{ 
            backgroundColor: '#fff3e0', 
            padding: '15px', 
            borderRadius: '8px', 
            border: '2px solid #ff9800',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#e65100', marginTop: '0' }}>🇫🇷 Complete European Tour</h4>
            <ul style={{ marginBottom: '0', lineHeight: '1.6' }}>
              <li><strong>Starting Point:</strong> Paris</li>
              <li><strong>Cities to Visit:</strong> All 11 European cities</li>
            </ul>
          </div>
          <div className="button-group">
            <Input
              type="button"
              value="Start Paris Tour (All 11 Cities)"
              onClick={handleParisTour}
              disabled={isLoading}
              style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            />
            <Input
              type="button"
              value="Back"
              onClick={() => setSelectedTripType(null)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {selectedTripType === TripTypes.LONDON_TOUR && (
        <div className="trip-config">
          <h3>London Tour Configuration</h3>
          <div className="input-group">
            <label>Number of cities to visit (including London):</label>
            <input
              type="number"
              min="1"
              max="11"
              value={numberOfCities}
              onChange={(e) => setNumberOfCities(e.target.value)}
              placeholder="Enter number (1-11)"
            />
          </div>
          <div className="button-group">
            <Input
              type="button"
              value="Start London Tour"
              onClick={handleLondonTour}
              disabled={isLoading}
            />
            <Input
              type="button"
              value="Back"
              onClick={() => setSelectedTripType(null)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {selectedTripType === TripTypes.BERLIN_TOUR && (
        <div className="trip-config">
          <h3>Berlin Tour Configuration</h3>
          <div className="button-group">
            <Input
              type="button"
              value="Start Berlin Tour"
              onClick={handleBerlinTour}
              disabled={isLoading}
            />
            <Input
              type="button"
              value="Back"
              onClick={() => setSelectedTripType(null)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {selectedTripType === TripTypes.CUSTOM_TOUR && (
        <div className="trip-config">
          <h3>Custom Tour Configuration</h3>
          
          <div className="input-group">
            <label>Trip Mode:</label>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="radio"
                  name="customMode"
                  value="11cities"
                  checked={customTripMode === '11cities'}
                  onChange={(e) => handleModeChange(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Option 1: Choose from 11 cities (excluding Vienna and Stockholm)
              </label>
              <label style={{ display: 'block' }}>
                <input
                  type="radio"
                  name="customMode"
                  value="13cities"
                  checked={customTripMode === '13cities'}
                  onChange={(e) => handleModeChange(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                Option 2: Choose from all 13 cities (including Vienna and Stockholm)
              </label>
            </div>
          </div>

          <div className="input-group">
            <label>Starting City:</label>
            <select 
              value={customStartCity} 
              onChange={(e) => setCustomStartCity(e.target.value)}
            >
              <option value="">Select starting city</option>
              {getAvailableCitiesForMode().map(city => (
                <option key={city.id} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>
          
          <div className="input-group">
            <label>Cities to Visit (Select from {customTripMode === '11cities' ? '11' : '13'} cities):</label>
            <div className="city-selection" style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              border: '1px solid #ddd', 
              padding: '10px',
              borderRadius: '5px'
            }}>
              {getAvailableCitiesForMode()
                .filter(city => city.name !== customStartCity)
                .map(city => (
                <label key={city.id} className="city-checkbox" style={{ 
                  display: 'block', 
                  marginBottom: '5px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city.name)}
                    onChange={() => toggleCitySelection(city.name)}
                    style={{ marginRight: '8px' }}
                  />
                  {city.name}
                </label>
              ))}
            </div>
            <div style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#666' 
            }}>
              Selected: {selectedCities.length} cities
            </div>
          </div>
          
          <div className="button-group">
            <Input
              type="button"
              value={`Start Custom Tour`}
              onClick={handleCustomTour}
              disabled={isLoading || !customStartCity || selectedCities.length === 0}
            />
            <Input
              type="button"
              value="Back"
              onClick={() => setSelectedTripType(null)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPage;