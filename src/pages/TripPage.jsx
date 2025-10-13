// src/pages/TripPage.jsx
// User selects trip type and configures trip options

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaMinus } from 'react-icons/fa';
import { citiesAPI } from "../apis/cityApis";
import { tripAPI, TripTypes } from "../apis/tripApi";
import Input from "../components/Input";
import "../style/trip.css";
import "/src/index.css";

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
  // END useEffect


  // Handle trip type selection
  const handleTripTypeSelect = (tripType) => {
    setSelectedTripType(tripType);
  };

  // Paris Handler
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


  // London Handler
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


  // Berlin Handler
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

  // Custom Handler 
  // const handleCustomTour = async () => {
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


  // Get cities based on selected mode
  const getAvailableCitiesForMode = () => {
    // Start with the appropriate city set based on mode
    const baseList = customTripMode === '11cities'
      ? availableCities.filter(city => city.id !== 12 && city.id !== 13) // Exclude Vienna (13) and Stockholm (12)
      : availableCities;

    // Exclude any cities already selected to avoid duplicates across lists
    return baseList.filter(city => !selectedCities.includes(city.name));
  };


  // Reset selections when mode changes
  const handleModeChange = (mode) => {
    setCustomTripMode(mode);
    setCustomStartCity('');
    setSelectedCities([]);
  };

  // Toggle city selection for custom tour
  const toggleCitySelection = (cityName) => {
    setSelectedCities(prev => {
      if (prev.includes(cityName)) {
        const next = prev.filter(c => c !== cityName);
        // If the removed city was the starting city, clear the selection
        if (customStartCity === cityName) {
          setCustomStartCity('');
        }
        return next;
      }
      return [...prev, cityName];
    });
  };


  // DISPLAY 
  return (
    <>
      
      <div className={selectedTripType === TripTypes.CUSTOM_TOUR ? "" : "container"}>
      {selectedTripType !== TripTypes.CUSTOM_TOUR && (
        <div className="header" style={{ textAlign: 'center', fontSize: '35px', marginBottom: '20px' }}>Choose Your European Vacation Plan</div>
      )}
      
      {isLoading && <div className="loading">Planning your trip...</div>}
      
      { /* Start - Select Trip Type */}
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
      { /* End - Select Trip Type */}

      { /* Paris Tour - Description - When clicked on */}
      {selectedTripType === TripTypes.PARIS_TOUR && (
        <div className="trip-config">
          <h3>Paris Tour Description</h3>
           <ul className="trip-des"style={{ lineHeight: '1.6' }}>
              <li><strong>Starting Point:</strong> Paris</li>
              <li><strong>Cities to Visit:</strong> All 11 European cities</li>
            </ul>
          <div className="button-group">
            <Input
              type="button"
              value="Start Paris Tour (All 11 Cities)"
              onClick={handleParisTour}
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

      { /* London Tour - Description - When clicked on */}
      {selectedTripType === TripTypes.LONDON_TOUR && (
        <div className="trip-config">
          <h3>London Tour Description</h3>
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


      { /* Berlin Tour - Description - When clicked on */}
      {selectedTripType === TripTypes.BERLIN_TOUR && (
        <div className="trip-config">
          <h3>Berlin Tour Description</h3>
          <ul className="trip-des">
              <li><strong>Starting Point:</strong> Berlin</li>
              <li><strong>Cities to Visit:</strong> All 13 European cities</li>
          </ul>
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

      { /* Custom Tour - Description - When clicked on */}
      {selectedTripType === TripTypes.CUSTOM_TOUR && (
        <div style={{ display: 'flex', height: '100vh' }}>
          {/* LEFT SIDE - LIST OF CITIES */}
          <div id="leftBG">
            <div className="header">List of Cities</div>
            
            {/* City Mode Selection */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label className="sub-header">Choose City Set:</label>
              </div>

              { /* City Set Buttons - 11 or 13 */ }
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn-city-list"
                  onClick={() => handleModeChange('11cities')}
                  style={{ backgroundColor: customTripMode === '11cities' ? '#9c7e70' : '#c3b1a5' }}
                >
                  11 Cities
                </button>
                <button 
                  className="btn-city-list"
                  onClick={() => handleModeChange('13cities')}
                  style={{ backgroundColor: customTripMode === '13cities' ? '#9c7e70' : '#c3b1a5' }}
                >
                  13 Cities
                </button>
              </div>
              { /* END City Set Buttons - 11 or 13 */ }

            </div>
            
            <div className="cities-list">
              {getAvailableCitiesForMode().map(city => (
                <div key={city.id} className="city-row">
                  <span>{city.name}</span>
                  <button className="food-button" onClick={() => toggleCitySelection(city.name)}>
                    <FaPlus />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE - CHOSEN CITIES */}
          <div id="rightContainer">
            <div className="header">My List ({selectedCities.length} cities)</div>
            
            {/* Starting City Dropdown */}
            <div className="trip-summary">
              <label className="sub-header">Choose Starting City:</label>
              <select 
                value={customStartCity} 
                onChange={(e) => setCustomStartCity(e.target.value)}
              >
                <option value="">Select starting city...</option>
                {selectedCities.map(cityName => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Selected Cities List */}
            <div className="selected-cities-scroll-container">
              {selectedCities.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px', 
                  color: '#666',
                  fontStyle: 'italic' 
                }}>
                  No cities selected yet. Add cities from the left panel.
                </div>
              ) : (
                selectedCities.map((cityName, index) => (
                  <div key={cityName} className="selected-city-row">
                    <span className="number">{index + 1}.</span>
                    <span className="city-name">{cityName}</span>
                    <button 
                      className="food-button minus-btn"
                      onClick={() => toggleCitySelection(cityName)}
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))
              )}
            </div>
            { /* END Selected Cities List */ }

            { /* Buttons - submit and back */ }
            <div className="button-group">
              <Input
                type="button"
                className="default-button"
                value="Back"
                onClick={() => setSelectedTripType(null)}
              />
              <Input
                type="button"
                className="default-button"
                style={{ marginLeft: 'auto' }}
                value="Start Custom Tour"
                onClick={handleCustomTour}
                disabled={isLoading || selectedCities.length === 0 || !customStartCity}
              />
            </div>
            { /* END Buttons - submit and back  */}

          </div>
        </div>
      )}
      
    </div>

    {!selectedTripType && (
        <div>
          <Input
            type="button"
            className="second-button"
            style={{ float: 'right', marginTop: '5px' }}
            value="Back"
            onClick={() => navigate('/home')}
          />
        </div>
      )}
    </>
  );
};

export default TripPage;