import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import SessionTimeout from './components/SessionTimeout';
import LoadingSpinner from './components/LoadingSpinner';
import OnboardingTour from './components/OnboardingTour';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import { lazyLoad } from './utils/lazyLoad';

// Lazy load page components to improve performance
const Dashboard = lazyLoad(() => import('./pages/Dashboard'));
const Login = lazyLoad(() => import('./pages/Login'));
const Register = lazyLoad(() => import('./pages/Register'));
const AssetManagement = lazyLoad(() => import('./pages/AssetManagement'));
const TransactionHistory = lazyLoad(() => import('./pages/TransactionHistory'));
const Payments = lazyLoad(() => import('./pages/Payments'));
const Profile = lazyLoad(() => import('./pages/Profile'));
const Settings = lazyLoad(() => import('./pages/Settings'));
const BlockchainExplorer = lazyLoad(() => import('./pages/BlockchainExplorer'));

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner size="large" text="Loading content..." /></div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/assets" element={
                <ProtectedRoute>
                  <AssetManagement />
                </ProtectedRoute>
              } />
              <Route path="/transactions" element={
                <ProtectedRoute>
                  <TransactionHistory />
                </ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/blockchain" element={
                <ProtectedRoute>
                  <BlockchainExplorer />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <SessionTimeout timeoutMinutes={30} warningMinutes={1} />
        <OnboardingTour />
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme="colored" 
          toastClassName="dark:bg-gray-800 dark:text-white" 
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
