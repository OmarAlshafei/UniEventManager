// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './pages/UserContext'; // Adjust the import path as needed
import Home from './pages/Home';
import Login from './pages/LoginRegister/Login';
import Register from './pages/LoginRegister/Register';
import Dashboard from './pages/Dashboard';
import UniCreate from './pages/Universities/UniCreate';
import UniList from './pages/Universities/UniList';
import EventCreate from './pages/Events/EventCreate';
import EventList from './pages/Events/EventList';
import RSOCreate from './pages/RSOs/RSOCreate';
import RSOList from './pages/RSOs/RSOList';

function App() {
  return (
    <UserProvider> {/* Wrap Routes with UserProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/UniCreate" element={<UniCreate />} />
          <Route path="/UniList" element={<UniList />} />
          <Route path="/EventCreate" element={<EventCreate />} />
          <Route path="/EventList" element={<EventList />} />
          <Route path="/RSOCreate" element={<RSOCreate />} />
          <Route path="/RSOList" element={<RSOList />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
