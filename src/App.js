import './App.css';
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; 
import { DataProvider } from './context/DataContext';
import Sign_in from './pages/Sign_in';
import Sign_up from './pages/Sign_up';
import ForgotPassword from './pages/Forgot_password';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import Tests from './pages/Tests';

function App() {

  const loggedIn = localStorage.getItem('loggedIn') || 'false';

  return (
    <AuthProvider>
      <DataProvider>
        <div className="App">
          <header className="App-header">
            <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path='/Sign_in' element={<Sign_in />} />
                <Route path='/Sign_up' element={<Sign_up />} />
                <Route path='/Forgot_password' element={<ForgotPassword />} />

                {/* Protected Routes */}
                {loggedIn === 'true' ? (
                  <>
                    <Route path='/' element={<Home />} />
                    <Route path='/Home' element={<Home />} />
                    <Route path='/Tests' element={<Tests />} />
                    <Route path='/NoPage' element={<NoPage />} />
                    <Route path = '*' element = {<NoPage />} />
                  </>
                ) : null}

                

                {/* Redirect to Sign_in if not logged in */}
                {loggedIn === 'false' ? (
                  <Route
                    path="*"
                    element={<Navigate to="/Sign_in" />}
                  />
                ) : null}
              </Routes>
            </BrowserRouter>
          </header>
        </div>
      </DataProvider>
    </AuthProvider>
  );
}


export default App;
