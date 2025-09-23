import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/login.css";
import Input from "../components/Input";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

    
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple validation - just check if fields are filled
    if (formData.name.trim() && formData.password.trim()) {
      // Navigate to HomePage immediately
      navigate("/home");
    } else {
      alert("Please fill in both name and password");
    }
  };

  return (
    <div id="container">
      {/* TITLE */}
      <div id="title">European Vacation</div>

      <div id="subtext">Sign in to your account</div>

      <form onSubmit={handleLogin}>
        {/* LOGIN NAME */}
        <div className="login-title">Name</div>
        <Input 
          type="text" 
          id="name" 
          name="name" 
          placeholder="Enter Name"
          value={formData.name}
          onChange={handleInputChange}
        />
        {errors.name && <div className="error">{errors.name}</div>}

        {/* LOGIN PASSWORD */}
        <div className="login-title">Password</div>
        <Input 
          type="password" 
          id="password" 
          name="password" 
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleInputChange}
        />
        {errors.password && <div className="error">{errors.password}</div>}

        {/* BUTTON - LOGIN */}
        <button type="submit" >Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;