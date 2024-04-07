// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './pages/UserContext'; // Adjust the import path as needed
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UniCreate from './pages/UniCreate';
import UniList from './pages/UniList';
import EventCreate from './pages/EventCreate';
import EventList from './pages/EventList';
import RSOCreate from './pages/RSOCreate';
import RSOList from './pages/RSOList';

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
