// TestAdminCRUD.jsx
// for testing admin CRUD operations before implementing to DashboardPage
// this file can be ignored or deleted but keeping for now in case needed later

import { useState } from 'react';
import { adminAPI } from '../apis/adminApi';

const TestAdminCRUD = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Data display
  const [cities, setCities] = useState([]);
  const [foods, setFoods] = useState([]);

  // City operations
  const [newCityName, setNewCityName] = useState('');
  const [updateCityId, setUpdateCityId] = useState('');
  const [updateCityName, setUpdateCityName] = useState('');
  const [deleteCityId, setDeleteCityId] = useState('');

  // Food operations
  const [foodCityId, setFoodCityId] = useState('');
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodPrice, setNewFoodPrice] = useState('');
  const [updateFoodId, setUpdateFoodId] = useState('');
  const [updateFoodName, setUpdateFoodName] = useState('');
  const [updateFoodPrice, setUpdateFoodPrice] = useState('');
  const [deleteFoodId, setDeleteFoodId] = useState('');
  
  // Upload city JSON
  const [uploadFile, setUploadFile] = useState(null);

  const setResultWithLog = (message) => {
    console.log(message);
    setResult(message);
  };

  const testLogin = async () => {
    if (!username || !password) {
      setResultWithLog('❌ Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.login(username, password);
      setResultWithLog(`✅ Login Success: ${JSON.stringify(response, null, 2)}`);
      if (response.success) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      setResultWithLog(`❌ Login Error: ${error.message}`);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.logout();
      setResultWithLog(`✅ Logout Success: ${JSON.stringify(response, null, 2)}`);
      setIsLoggedIn(false);
    } catch (error) {
      setResultWithLog(`❌ Logout Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 1. ADD CITY
  const testAddCity = async () => {
    if (!newCityName.trim()) {
      setResultWithLog('❌ Please enter a city name');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.addCity(newCityName);
      setResultWithLog(`✅ Add City Success: ${JSON.stringify(response, null, 2)}`);
      setNewCityName(''); // Clear input
    } catch (error) {
      setResultWithLog(`❌ Add City Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATE CITY NAME
  const testUpdateCity = async () => {
    if (!updateCityId || !updateCityName.trim()) {
      setResultWithLog('❌ Please enter city ID and new name');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.updateCity(parseInt(updateCityId), updateCityName);
      setResultWithLog(`✅ Update City Success: ${JSON.stringify(response, null, 2)}`);
      setUpdateCityId('');
      setUpdateCityName('');
    } catch (error) {
      setResultWithLog(`❌ Update City Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. DELETE CITY
  const testDeleteCity = async () => {
    if (!deleteCityId) {
      setResultWithLog('❌ Please enter city ID to delete');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.deleteCity(parseInt(deleteCityId));
      setResultWithLog(`✅ Delete City Success: ${JSON.stringify(response, null, 2)}`);
      setDeleteCityId('');
    } catch (error) {
      setResultWithLog(`❌ Delete City Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 5. ADD FOOD TO CITY
  const testAddFood = async () => {
    if (!foodCityId || !newFoodName.trim() || !newFoodPrice) {
      setResultWithLog('❌ Please enter city ID, food name, and price');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.addFood(parseInt(foodCityId), newFoodName, parseFloat(newFoodPrice));
      setResultWithLog(`✅ Add Food Success: ${JSON.stringify(response, null, 2)}`);
      setFoodCityId('');
      setNewFoodName('');
      setNewFoodPrice('');
    } catch (error) {
      setResultWithLog(`❌ Add Food Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 6 & 7. UPDATE FOOD (NAME AND/OR PRICE)
  const testUpdateFood = async () => {
    if (!updateFoodId || (!updateFoodName.trim() && !updateFoodPrice)) {
      setResultWithLog('❌ Please enter food ID and at least one field to update');
      return;
    }

    const updates = {};
    if (updateFoodName.trim()) updates.name = updateFoodName;
    if (updateFoodPrice) updates.price = parseFloat(updateFoodPrice);

    setLoading(true);
    try {
      const response = await adminAPI.updateFood(parseInt(updateFoodId), updates);
      setResultWithLog(`✅ Update Food Success: ${JSON.stringify(response, null, 2)}`);
      setUpdateFoodId('');
      setUpdateFoodName('');
      setUpdateFoodPrice('');
    } catch (error) {
      setResultWithLog(`❌ Update Food Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 8. DELETE FOOD
  const testDeleteFood = async () => {
    if (!deleteFoodId) {
      setResultWithLog('❌ Please enter food ID to delete');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.deleteFood(parseInt(deleteFoodId));
      setResultWithLog(`✅ Delete Food Success: ${JSON.stringify(response, null, 2)}`);
      setDeleteFoodId('');
    } catch (error) {
      setResultWithLog(`❌ Delete Food Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // View data functions
  const viewCities = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getCities();
      setCities(response.cities || response || []);
      setResultWithLog(`🏙️ Cities List: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResultWithLog(`❌ Get Cities Error: ${error.message}`);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const viewFoods = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getFoods();
      setFoods(response.foods || response || []);
      setResultWithLog(`🍕 Foods List: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResultWithLog(`❌ Get Foods Error: ${error.message}`);
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!isLoggedIn) {
      setResultWithLog('❌ Please login first to refresh data');
      return;
    }
    
    setLoading(true);
    try {
      // Get cities
      const citiesResponse = await adminAPI.getCities();
      setCities(citiesResponse.cities || citiesResponse || []);
      
      // Get foods
      const foodsResponse = await adminAPI.getFoods();
      setFoods(foodsResponse.foods || foodsResponse || []);
      
      setResultWithLog('✅ Data refreshed successfully');
    } catch (error) {
      setResultWithLog(`❌ Refresh Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Upload city JSON file -> /api/admin/upload-city (multipart, field: cityData)
  const handleUploadCityFile = async () => {
    if (!isLoggedIn) {
      setResultWithLog('❌ Please login first to upload city data');
      return;
    }
    if (!uploadFile) {
      setResultWithLog('❌ Please choose a .json file first');
      return;
    }
    try {
      setLoading(true);
      const form = new FormData();
      form.append('cityData', uploadFile, uploadFile.name);
      const res = await fetch('/api/admin/upload-city', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      const text = await res.text();
      // Try to parse JSON for nicer display
      try {
        const json = JSON.parse(text);
        const prefix = res.ok ? '✅ Upload Success' : '❌ Upload Failed';
        setResultWithLog(`${prefix} (HTTP ${res.status})\n` + JSON.stringify(json, null, 2));
      } catch {
        const prefix = res.ok ? '✅ Upload Success' : '❌ Upload Failed';
        setResultWithLog(`${prefix} (HTTP ${res.status})\n${text}`);
      }
    } catch (err) {
      setResultWithLog(`❌ Upload Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '900px', 
      margin: '0 auto',
      border: '2px solid #007bff',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2>🛠️ Admin CRUD Operations Tester</h2>
      
      {/* Login Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}>
        <h3>🔐 Admin Authentication</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Admin Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
          <button 
            onClick={testLogin} 
            disabled={loading}
            style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Login
          </button>
          <button 
            onClick={testLogout} 
            disabled={loading}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
        <div>Status: <span style={{ color: isLoggedIn ? 'green' : 'red', fontWeight: 'bold' }}>
          {isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}
        </span></div>
      </div>

      {/* View Data Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}>
        <h3>👀 View Current Data</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={viewCities} 
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            🏙️ View All Cities
          </button>
          <button 
            onClick={viewFoods} 
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
          >
            🍕 View All Foods
          </button>
          <button 
            onClick={refreshData} 
            disabled={loading || !isLoggedIn}
            style={{ padding: '10px 20px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Cities List Display */}
        {cities.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <h4>🏙️ Current Cities:</h4>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #dee2e6',
              maxHeight: '150px',
              overflow: 'auto'
            }}>
              {cities.map((city, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '5px 0',
                  borderBottom: index < cities.length - 1 ? '1px solid #dee2e6' : 'none'
                }}>
                  <span><strong>ID {city.id || city.city_id || index + 1}:</strong> {city.name || city.city_name || `City ${index + 1}`}</span>
                  {city.distance && <span style={{ color: '#6c757d' }}>({city.distance} miles)</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Foods List Display */}
        {foods.length > 0 && (
          <div>
            <h4>🍕 Current Foods:</h4>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '4px', 
              border: '1px solid #dee2e6',
              maxHeight: '150px',
              overflow: 'auto'
            }}>
              {foods.map((food, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '5px 0',
                  borderBottom: index < foods.length - 1 ? '1px solid #dee2e6' : 'none'
                }}>
                  <span>
                    <strong>ID {food.id || food.food_id || index + 1}:</strong> {food.name || food.food_name || `Food ${index + 1}`}
                    {food.city_id && <span style={{ color: '#6c757d' }}> (City ID: {food.city_id})</span>}
                  </span>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                    ${food.price || food.food_price || '0.00'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cities.length === 0 && foods.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#6c757d', 
            fontStyle: 'italic', 
            padding: '20px' 
          }}>
            Click "Refresh Data" or the view buttons above to load current cities and foods with their IDs
          </div>
        )}
      </div>

      {/* City Operations */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}>
        <h3>🏙️ City Operations</h3>
        
        {/* Add City */}
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
          <h4>1. Add New City</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="New city name"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            />
            <button 
              onClick={testAddCity} 
              disabled={loading || !isLoggedIn}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              ➕ Add City
            </button>
          </div>
        </div>

        {/* Update City */}
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff5f0', borderRadius: '4px' }}>
          <h4>2. Change City Name</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="City ID"
              value={updateCityId}
              onChange={(e) => setUpdateCityId(e.target.value)}
              style={{ width: '100px', padding: '8px' }}
            />
            <input
              type="text"
              placeholder="New city name"
              value={updateCityName}
              onChange={(e) => setUpdateCityName(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            />
            <button 
              onClick={testUpdateCity} 
              disabled={loading || !isLoggedIn}
              style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
            >
              ✏️ Update City
            </button>
          </div>
        </div>

        {/* Delete City */}
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          <h4>4. Delete City</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="City ID to delete"
              value={deleteCityId}
              onChange={(e) => setDeleteCityId(e.target.value)}
              style={{ width: '150px', padding: '8px' }}
            />
            <button 
              onClick={testDeleteCity} 
              disabled={loading || !isLoggedIn}
              style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              🗑️ Delete City
            </button>
          </div>
        </div>
      </div>

      {/* Food Operations */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}>
        <h3>🍕 Food Operations</h3>
        
        {/* Add Food */}
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f8f0', borderRadius: '4px' }}>
          <h4>5. Add Food to City</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="City ID"
              value={foodCityId}
              onChange={(e) => setFoodCityId(e.target.value)}
              style={{ width: '100px', padding: '8px' }}
            />
            <input
              type="text"
              placeholder="Food name"
              value={newFoodName}
              onChange={(e) => setNewFoodName(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={newFoodPrice}
              onChange={(e) => setNewFoodPrice(e.target.value)}
              style={{ width: '100px', padding: '8px' }}
            />
            <button 
              onClick={testAddFood} 
              disabled={loading || !isLoggedIn}
              style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              ➕ Add Food
            </button>
          </div>
        </div>

        {/* Update Food */}
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f8ff', borderRadius: '4px' }}>
          <h4>6 & 7. Change Food Name/Price</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Food ID"
              value={updateFoodId}
              onChange={(e) => setUpdateFoodId(e.target.value)}
              style={{ width: '100px', padding: '8px' }}
            />
            <input
              type="text"
              placeholder="New food name (optional)"
              value={updateFoodName}
              onChange={(e) => setUpdateFoodName(e.target.value)}
              style={{ flex: 1, padding: '8px' }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="New price (optional)"
              value={updateFoodPrice}
              onChange={(e) => setUpdateFoodPrice(e.target.value)}
              style={{ width: '120px', padding: '8px' }}
            />
            <button 
              onClick={testUpdateFood} 
              disabled={loading || !isLoggedIn}
              style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
            >
              ✏️ Update Food
            </button>
          </div>
        </div>

        {/* Delete Food */}
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          <h4>8. Delete Food</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Food ID to delete"
              value={deleteFoodId}
              onChange={(e) => setDeleteFoodId(e.target.value)}
              style={{ width: '150px', padding: '8px' }}
            />
            <button 
              onClick={testDeleteFood} 
              disabled={loading || !isLoggedIn}
              style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              🗑️ Delete Food
            </button>
          </div>
        </div>
      </div>

      {/* Import Cities (JSON) */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }}>
        <h3>📦 Import Cities from JSON</h3>
        <p style={{ marginTop: 0, color: '#6c757d' }}>Upload a JSON file with a top-level "cities" array. Field name expected: <code>cityData</code>.</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(e) => setUploadFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
          />
          <button
            onClick={handleUploadCityFile}
            disabled={loading || !isLoggedIn}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            ⬆️ Upload JSON
          </button>
        </div>
        {uploadFile && (
          <div style={{ marginTop: '8px', color: '#6c757d' }}>
            Selected: {uploadFile.name} ({Math.ceil(uploadFile.size / 1024)} KB)
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>📋 Results:</h3>
          <div style={{ 
            background: result.startsWith('✅') ? '#d4edda' : result.startsWith('🏙️') || result.startsWith('🍕') ? '#e7f1ff' : '#f8d7da', 
            padding: '15px', 
            borderRadius: '5px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '400px',
            overflow: 'auto',
            border: `1px solid ${result.startsWith('✅') ? '#c3e6cb' : result.startsWith('🏙️') || result.startsWith('🍕') ? '#b3d7ff' : '#f5c6cb'}`
          }}>
            {result}
          </div>
          <button 
            onClick={() => setResult('')}
            style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Clear Results
          </button>
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
        <h4>📋 Testing Guide:</h4>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Login first</strong> - Enter admin credentials and click Login</li>
          <li><strong>Load current data</strong> - Click "Refresh Data" to see all cities and foods with their IDs</li>
          <li><strong>Use the ID numbers</strong> - Copy the ID numbers from the lists above into the form fields</li>
          <li><strong>Test each operation:</strong>
            <ul style={{ marginTop: '5px' }}>
              <li>Add a new city (note the response for city ID)</li>
              <li>Update a city name (use existing city ID)</li>
              <li>Add food to a city (use city ID)</li>
              <li>Update food name/price (use existing food ID)</li>
              <li>Delete food (use existing food ID)</li>
              <li>Delete city (use existing city ID)</li>
            </ul>
          </li>
          <li><strong>Check results</strong> - Each operation shows success/error response</li>
          <li><strong>Verify changes</strong> - Use "View All" buttons to confirm changes</li>
        </ol>
        <p><strong>Note:</strong> City distance changes (#3) would need a separate backend endpoint.</p>
      </div>
    </div>
  );
};

export default TestAdminCRUD;