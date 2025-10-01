import { useLocation } from "react-router-dom";
import { TripTypes } from "../apis/tripApi";

function SummaryPage() {
  const location = useLocation();
  const { tripType, tripData, totalDistance, selectedFoodItems, totalFoodCost } = location.state || {};

  const getTripTypeDisplay = () => {
    switch(tripType) {
      case TripTypes.PARIS_TOUR:
        return "Paris Tour";
      case TripTypes.LONDON_TOUR:
        return "London Tour";
      case TripTypes.BERLIN_TOUR:
        return "Berlin Tour";
      case TripTypes.CUSTOM_TOUR:
        return "Custom Tour";
      default:
        return "European Tour";
    }
  };

  const getCitySpendingBreakdown = () => {
    if (!selectedFoodItems) return {};
    const cityTotals = {};
    selectedFoodItems.forEach(item => {
      if (cityTotals[item.cityName]) {
        cityTotals[item.cityName] += item.price;
      } else {
        cityTotals[item.cityName] = item.price;
      }
    });
    return cityTotals;
  };

  const totalCost = totalFoodCost ? parseFloat(totalFoodCost) : 0;
  const tripCities = tripData?.cities || tripData?.route || [];

  if (!tripData) {
    return (
      <div>
        <h1>Summary Page</h1>
        <p>No trip data available. Please go back to plan your trip.</p>
        <p>Debug info: {JSON.stringify(location.state, null, 2)}</p>
      </div>
    );
  }
    
  return (
    <div>
      <h1>Summary Page</h1>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Trip Summary</h4>
          <p style={{ margin: '5px 0' }}><strong>Type:</strong> {getTripTypeDisplay()}</p>
          {totalDistance ? (
            <p style={{ margin: '5px 0'}}>
              <strong>Total Distance:</strong> {totalDistance} km
            </p>
          ) : (
            <p style={{ margin: '5px 0' }}>
              <strong>Distance:</strong> Not available from backend
            </p>
          )}
          <p style={{ margin: '5px 0' }}>
            <strong>Food Cost:</strong> ${totalCost.toFixed(2)}
          </p>
          <p style={{ margin: '5px 0'}}>
            <strong>Cities in Route:</strong> {tripCities.length}
          </p>
          {/* City Spending Breakdown */}
          {selectedFoodItems && selectedFoodItems.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ margin: '5px 0', fontWeight: 'bold' }}>Spending by City:</p>
              {Object.entries(getCitySpendingBreakdown()).map(([cityName, amount]) => (
                <p key={cityName} style={{ 
                  margin: '3px 0', 
                  fontSize: '14px',
                  paddingLeft: '10px'
                }}>
                  <strong>{cityName}:</strong> ${amount.toFixed(2)}
                </p>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}

export default SummaryPage;