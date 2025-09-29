import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import "../style/trip.css";

const TripPage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(null);

  const handleCitySelect = (city, cityId) => {
    setSelectedCity(city);
    
    // Navigate to CreateTripPage with selected starting city info
    navigate("/create-trip", { 
      state: { 
        startingCity: city, 
        startingCityId: cityId
      } 
    });
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
      
      {cities.map((city) => (
        <Input
          key={city.name}
          className={city.className}
          type="button"
          value={city.name}
          onClick={() => handleCitySelect(city.name, city.id)}
        />
      ))}
      
      <Input
        className="custom-button"
        type="button"
        value="Custom"
        onClick={handleCustomCity}
      />
    </div>
  );
};

export default TripPage;