import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { citiesAPI } from "../apis/cityApis";
import "../style/dashboard.css";

function DashboardPage() {
  const location = useLocation();
  const { selectedCity, cityId, cityData } = location.state || {};
  const [allCities, setAllCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllCities = async () => {
      try {
        setLoading(true);
        const data = await citiesAPI.getAllCitiesWithFood();
        if (data && data.cities) {
          setAllCities(data.cities);
        }
      } catch (err) {
        console.error('Failed to fetch cities:', err);
        setError('Failed to load cities');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCities();
  }, []);

  if (!selectedCity || !cityData) {
    return (
      <div>
        <h1>Dashboard</h1>
        <p>No city selected. Please go back to the trip page to select a city.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* LEFT SIDE - LIST OF CITIES */}
      <div id="leftBG" style={{ flex: '2' }}>
        <div className="header">List of Cities</div>
        <div id="cities-result">
          {loading ? (
            <div>Loading cities...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            allCities.map((city) => (
              <div key={city.id} className="city-row">
                <span>{city.name}</span>
                <button>+</button>
              </div>
            ))
          )}
        </div>
      </div>
      {/* END LEFT SIDE */}

      {/* RIGHT SIDE - CHOSEN CITIES */}
      <div id="rightContainer" style={{ flex: '1' }}>
        <div className="header">My List</div>
        <div id="selected-cities-result" className="container">
          {/* Show only the selected city */}
          <div className="selected-city-row">
            <span className="number">1</span>
            <span className="city-name">{selectedCity}</span>
            <button className="minus-btn">-</button>
          </div>
        </div>
        <button id="submit" onClick={() => console.log('Trip submitted!')}>
          Submit
        </button>
      </div>
      {/* END RIGHT SIDE */}
    </div>
  );
}

export default DashboardPage;