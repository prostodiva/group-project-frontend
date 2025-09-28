import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tripAPI, TripTypes } from "../apis/tripApi";
import Input from "../components/Input";
import "../style/trip.css";

const TripPage = () => {
  const navigate = useNavigate();
  const [selectedTripType, setSelectedTripType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfCities, setNumberOfCities] = useState('');
  const [customStartCity, setCustomStartCity] = useState('');
  const [selectedCities, setSelectedCities] = useState([]);
  const [availableCities] = useState([
    'Paris', 'London', 'Berlin', 'Rome', 'Madrid', 'Amsterdam', 
    'Vienna', 'Prague', 'Budapest', 'Warsaw', 'Stockholm'
  ]);

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
          description: `Custom Tour - Starting from ${customStartCity}, visiting ${selectedCities.length} cities`,
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
            <label>Starting City:</label>
            <select 
              value={customStartCity} 
              onChange={(e) => setCustomStartCity(e.target.value)}
            >
              <option value="">Select starting city</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          <div className="input-group">
            <label>Cities to Visit:</label>
            <div className="city-selection">
              {availableCities
                .filter(city => city !== customStartCity)
                .map(city => (
                <label key={city} className="city-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city)}
                    onChange={() => toggleCitySelection(city)}
                  />
                  {city}
                </label>
              ))}
            </div>
          </div>
          
          <div className="button-group">
            <Input
              type="button"
              value="Start Custom Tour"
              onClick={handleCustomTour}
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
    </div>
  );
};

export default TripPage;