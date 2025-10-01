// Example Crow server implementation for your backend
// Add this to your C++ backend project

#include "crow.h"
#include "json/json.h"
#include <cmath>
#include <vector>

// Haversine distance calculation (same as your frontend)
double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double R = 6371; // Earth's radius in kilometers
    double dLat = (lat2 - lat1) * M_PI / 180.0;
    double dLon = (lon2 - lon1) * M_PI / 180.0;
    double a = std::sin(dLat/2) * std::sin(dLat/2) +
               std::cos(lat1 * M_PI / 180.0) * std::cos(lat2 * M_PI / 180.0) *
               std::sin(dLon/2) * std::sin(dLon/2);
    double c = 2 * std::atan2(std::sqrt(a), std::sqrt(1-a));
    return R * c;
}

int main() {
    crow::SimpleApp app;

    // Enable CORS for your React frontend
    app.loglevel(crow::LogLevel::Info);

    // Health check endpoint
    CROW_ROUTE(app, "/health")
    ([]{
        return "OK";
    });

    // Get all cities with coordinates
    CROW_ROUTE(app, "/api/cities").methods("GET"_method)
    ([&](const crow::request& req) {
        // Your existing database query logic here
        // Return cities with latitude, longitude, and food data
        
        Json::Value response;
        Json::Value cities(Json::arrayValue);
        
        // Example city data - replace with your database query
        Json::Value city1;
        city1["id"] = 1;
        city1["name"] = "Paris";
        city1["latitude"] = 48.8566;
        city1["longitude"] = 2.3522;
        city1["food"] = Json::Value(Json::arrayValue);
        cities.append(city1);
        
        Json::Value city2;
        city2["id"] = 2;
        city2["name"] = "London";
        city2["latitude"] = 51.5074;
        city2["longitude"] = -0.1278;
        city2["food"] = Json::Value(Json::arrayValue);
        cities.append(city2);
        
        response["cities"] = cities;
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        res.write(response.toStyledString());
        return res;
    });

    // Route optimization endpoint
    CROW_ROUTE(app, "/api/routes/optimize").methods("POST"_method)
    ([&](const crow::request& req) {
        Json::Value requestJson;
        Json::Reader reader;
        
        if (!reader.parse(req.body, requestJson)) {
            return crow::response(400, "Invalid JSON");
        }
        
        // Extract cities from request
        Json::Value cities = requestJson["cities"];
        Json::Value startingCity = requestJson["startingCity"];
        
        // Implement your route optimization algorithm here
        // Using the same logic as your TripCityService
        
        Json::Value response;
        Json::Value optimizedRoute(Json::arrayValue);
        Json::Value distances(Json::arrayValue);
        double totalDistance = 0.0;
        
        // Simple nearest neighbor algorithm (replace with your logic)
        std::vector<Json::Value> cityList;
        for (const auto& city : cities) {
            cityList.push_back(city);
        }
        
        // Start with starting city
        Json::Value currentCity = startingCity;
        optimizedRoute.append(currentCity["name"]);
        
        // Remove starting city from available cities
        auto it = std::find_if(cityList.begin(), cityList.end(), 
            [&](const Json::Value& city) {
                return city["id"] == currentCity["id"];
            });
        if (it != cityList.end()) {
            cityList.erase(it);
        }
        
        // Add remaining cities by nearest neighbor
        while (!cityList.empty()) {
            double minDistance = std::numeric_limits<double>::max();
            int nearestIndex = 0;
            
            for (size_t i = 0; i < cityList.size(); i++) {
                double dist = calculateDistance(
                    currentCity["latitude"].asDouble(),
                    currentCity["longitude"].asDouble(),
                    cityList[i]["latitude"].asDouble(),
                    cityList[i]["longitude"].asDouble()
                );
                
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestIndex = i;
                }
            }
            
            distances.append(minDistance);
            totalDistance += minDistance;
            optimizedRoute.append(cityList[nearestIndex]["name"]);
            currentCity = cityList[nearestIndex];
            cityList.erase(cityList.begin() + nearestIndex);
        }
        
        response["route"] = optimizedRoute;
        response["distances"] = distances;
        response["totalDistance"] = totalDistance;
        response["optimized"] = true;
        response["method"] = "backend-nearest-neighbor";
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        res.write(response.toStyledString());
        return res;
    });

    // Get food for a specific city
    CROW_ROUTE(app, "/api/cities/<int>/foods").methods("GET"_method)
    ([&](const crow::request& req, int cityId) {
        // Your existing food query logic here
        
        Json::Value foods(Json::arrayValue);
        
        // Example food data - replace with your database query
        Json::Value food1;
        food1["name"] = "Croissant";
        food1["price"] = 3.50;
        foods.append(food1);
        
        Json::Value food2;
        food2["name"] = "Baguette";
        food2["price"] = 2.00;
        foods.append(food2);
        
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Content-Type", "application/json");
        res.write(foods.toStyledString());
        return res;
    });

    // CORS preflight handler
    CROW_ROUTE(app, "/api/<path>").methods("OPTIONS"_method)
    ([](const crow::request& req, std::string path) {
        crow::response res;
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res;
    });

    app.port(3001).multithreaded().run();
}