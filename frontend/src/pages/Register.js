import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './register.css';

const Register = () => {
  const app_name = "databasewebsite-8b9b09671d65";
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [universities, setUniversities] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const response = await fetch(buildPath('api/universities'));
        if (response.ok) {
          const data = await response.json();
          setUniversities(data); // Assuming data is an array of objects with 'id' and 'name' properties
        } else {
          throw new Error('Failed to fetch universities');
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
        setMessage('Failed to fetch universities. Please try again later.');
      }
    }
    fetchUniversities();
  }, []);

  function buildPath(route) {
    return process.env.NODE_ENV === "production" ?
      `https://${app_name}.herokuapp.com/${route.startsWith('/') ? route.slice(1) : route}` :
      `http://localhost:5000/${route.startsWith('/') ? route.slice(1) : route}`;
}


  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(buildPath('api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, user_type: userType, university_id: universityId }),
      });
      if (response.ok) {
        setMessage('Successfully registered! You can now login.');
      } else {
        const data = await response.json();
        setMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setMessage('Error during registration. Please try again later.');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <form className="register-form" onSubmit={handleRegister}>
        <input type="text" className="register-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" className="register-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" className="register-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select className="register-input" value={userType} onChange={(e) => setUserType(e.target.value)} required>
          <option value="" disabled>Select User Type</option>
          <option value="super admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
        </select>
        <select className="register-input" value={universityId} onChange={(e) => setUniversityId(e.target.value)} required>
          <option value="" disabled>Select University</option>
          {userType !== "super admin" && universities.map(university => (
            <option key={university.university_id} value={university.university_id}>{university.name}</option>
          ))}
          {userType === "super admin" && <option value="other">Other</option>}
        </select>
        <button type="submit" className="register-button">Register</button>
        <button type="button" className="register-button" onClick={() => navigate('/login')}>Already registered? Log in</button>
        {message && <p className="register-error">{message}</p>}
      </form>
    </div>
  );
};

export default Register;
