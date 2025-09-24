import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCityData } from "../apis/cityApis";
import Input from "../components/Input";
import "../style/trip.css";

const TripPage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cityData, setCityData] = useState(null);

  const handleCitySelect = async (city, cityId) => {
    setSelectedCity(city);
    setIsLoading(true);
    
    try {
      const data = await fetchCityData(cityId);
       setCityData(data);
       navigate("/dashboard", { 
        state: { 
          selectedCity: city, 
          cityId: cityId, 
          cityData: data 
        } 
      });
    } catch (error) {
      console.error(`Error fetching ${city} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomCity = () => {
    const customCityId = prompt("Enter city ID:");
    if (customCityId) {
      handleCitySelect('Custom', parseInt(customCityId));
    }
  };

    const cities = [
    { name: 'London', id: 6, className: 'london-button' },
    { name: 'Berlin', id: 1, className: 'berlin-button' },
    { name: 'Paris', id: 8, className: 'paris-button' }
    ];

  return (
    <div className="container">
      <div id="text">Choose a starting location</div>
      
      {isLoading && <div>Loading...</div>}
      
      
      {cities.map((city) => (
        <Input
          key={city.name}
          className={city.className}
          type="button"
          value={city.name}
          onClick={() => handleCitySelect(city.name, city.id)}
          disabled={isLoading}
        />
      ))}
      
      <Input
        className="custom-button"
        type="button"
        value="Custom"
        onClick={handleCustomCity}
        disabled={isLoading}
      />

      {selectedCity && cityData && (
        <div>
          <h3>Selected: {selectedCity}</h3>
          <div>
            <strong>City:</strong> {cityData.city}
          </div>
          <div>
            <strong>Foods available:</strong>
            {cityData.food && cityData.food.length > 0 ? (
              <ul>
                {cityData.food.map((food, index) => (
                  <li key={index}>
                    {food.name} - ${food.price}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No foods found for this city</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPage;