import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Registration from './components/Registration';
import Login from './components/Login';
import AdminDashboard from '../src/components/AdminDashboard';
import GenerateQRCode  from './components/GenerateQRCode';


class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Routes>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/register" element={<Registration />} />
             <Route path="/" element={<Login />} />
             <Route path="/admindashboard" element={<AdminDashboard />} />
             <Route path="/generateQR" element={<GenerateQRCode />} />

          </Routes>
        </div>
      </Router>
    );
  }
}

export default App;
