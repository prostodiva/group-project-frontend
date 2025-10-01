import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tripAPI, TripTypes } from "../apis/tripApi";
import Input from "../components/Input";
import "../style/trip.css";

// Custom Tour City List
const TripPage = () => {
  const navigate = useNavigate();
  const [selectedTripType, setSelectedTripType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfCities, setNumberOfCities] = useState("");
  const [customStartCity, setCustomStartCity] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  // Custom Tour City List
  const availableCities = [
    "Paris",
    "London",
    "Berlin",
    "Rome",
    "Madrid",
    "Amsterdam",
    "Vienna",
    "Prague",
    "Budapest",
    "Warsaw",
    "Stockholm",
  ]; // END availableCities

  const handleTripTypeSelect = (tripType) => setSelectedTripType(tripType);

  // Paris Tour Section
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
  }; // END handleParisTour


  // London Tour Section
  const handleLondonTour = async () => {
    const count = parseInt(numberOfCities, 10);
    if (!count || count < 1 || count > 11) {
      alert("Please enter a valid number of cities (1-11)");
      return;
    }
    setIsLoading(true);
    try {
      const tripData = await tripAPI.planLondonTour(count);
      navigate("/dashboard", {
        state: {
          tripType: TripTypes.LONDON_TOUR,
          tripData,
          numberOfCities: count,
          description: `London Tour - Visit ${count} cities starting from London`,
        },
      });
    } catch (error) {
      console.error("Error planning London tour:", error);
      alert("Failed to plan London tour. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }; // END handleLondonTour


  // Berlin Tour Section
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
  }; // END handleBerlinTour

  
  // Custom Tour Section
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
  }; // END handleCustomTour

  const toggleCitySelection = (city) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  // DISPLAY 
  return (
    <div className="container">
      <div className="title" style={{ fontSize: '35px' }}>Choose a Vacation Plan</div>
      {isLoading && <div className="loading">Planning your trip...</div>}

      { /* Trip Options */ }
      {!selectedTripType && (
        <div className="trip-options">
          <Input
            className="default-button"
            type="button"
            value="Paris Tour"
            onClick={() => handleTripTypeSelect(TripTypes.PARIS_TOUR)}
            disabled={isLoading}
          />
          <Input
            className="default-button"
            type="button"
            value="London Tour"
            onClick={() => handleTripTypeSelect(TripTypes.LONDON_TOUR)}
            disabled={isLoading}
          />
          <Input
            className="default-button"
            type="button"
            value="Berlin Tour"
            onClick={() => handleTripTypeSelect(TripTypes.BERLIN_TOUR)}
            disabled={isLoading}
          />
          <Input
            className="default-button"
            type="button"
            value="Custom Tour"
            onClick={() => handleTripTypeSelect(TripTypes.CUSTOM_TOUR)}
            disabled={isLoading}
          />
        </div>
      )} 
      { /* END Trip Options */ }


      { /* Paris Options */ }
      {selectedTripType === TripTypes.PARIS_TOUR && (
        <div className="trip-config">
          <h3 className="sub-header">Paris Tour Description</h3>
          <div className="trip-description">
            <ul className="trip-ul">
                <li>Starting Point: <span className="import-text">Paris</span> </li>
                <li>Cities to Visit: <span className="import-text">All 11 European cities</span></li>
            </ul>
          </div>
          <div className="button-group">
            <Input
              className="second-button"
              type="button"
              value="Start Paris Tour"
              onClick={handleParisTour}
              disabled={isLoading} />
            <Input
              type="button"
              className="second-button back-button"
              value="Back"
              onClick={() => setSelectedTripType(null)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
      { /* END Paris Options */ }


      { /* London Options */ }
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
      { /* END London Options */ }

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
  ); // END display

};

export default TripPage;
