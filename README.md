# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

- - -

9/27/2005 - Aspen

Using codespace to run instead of my local computer. I made the following changes in order for the program to work for me

Updated vite.config.js
- changes proxy target since I am using codespace
// Before (if downloaded on computer)
target: 'http://localhost:3001',

// After (using my codespace)
target: 'https://probable-goldfish-r44rj44rp596hq4j-3001.app.github.dev',

- - -

- Fixed API Endpoints in cityApis.jsx
// Before:
getAllCitiesWithFood: async () => {
  const response = await fetch('/api/cities/food'); // ❌ This endpoint doesn't exist
}

getCityFood: async (cityId) => {
  const response = await fetch(`/api/cities/${cityId}/food`); // ❌ Missing 's' in 'foods'
}

fetchCityData = async (cityId) => {
  const response = await fetch(`/api/cities/${cityId}/food`); // ❌ Missing 's' in 'foods'
}

// After:
getAllCitiesWithFood: async () => {
  const response = await fetch('/api/cities'); // ✅ Correct endpoint
}

getCityFood: async (cityId) => {
  const response = await fetch(`/api/cities/${cityId}/foods`); // ✅ Fixed to 'foods'
}

fetchCityData = async (cityId) => {
  const response = await fetch(`/api/cities/${cityId}/foods`); // ✅ Fixed to 'foods'
}

- - -

Data Handling in HomePage.jsx

// Before:
if (data && data.cities) {
  setCities(data.cities); // ❌ Expected wrapped format
} else {
  setError('No cities data received from server');
}

// After:
if (data && Array.isArray(data) && data.length > 0) {
  setCities(data); // ✅ Handle direct array from backend
} else if (data && data.cities && Array.isArray(data.cities)) {
  setCities(data.cities); // ✅ Also handle wrapped format (for compatibility)
} else {
  setError('No cities data received from server');
}
