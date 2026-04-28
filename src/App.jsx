import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import AuthPage from './pages/AuthPage'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyPending from './pages/VerifyPending'

import ClientLayout from './components/ClientLayout'
import ClientHome from './pages/ClientHome'
import ClientPoints from './pages/ClientPoints'
import ClientMap from './pages/ClientMap'

import BusinessLayout from './components/BusinessLayout'
import BusinessHome from './pages/BusinessHome'
import BusinessClients from './pages/BusinessClients'
import BusinessRewards from './pages/BusinessRewards'
import BusinessScan from './pages/BusinessScan'
import BusinessLocationSetup from './pages/BusinessLocationSetup'
import BusinessSubscription from './pages/BusinessSubscription'

import ProtectedRoute from './components/ProtectedRoute'
import BusinessProtectedRoute from './components/BusinessProtectedRoute'
import TermsPage from './pages/TermsPage'
import './App.css'

function App() {
    return (
        <Router>
            <div className="App min-h-screen bg-gray-50">
                <Routes>
                    <Route path="/" element={<Landing />} />

                    {/* Auth — single animated page handles both login and signup */}
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/signup" element={<AuthPage />} />
                    <Route path="/terminos" element={<TermsPage />} />

                    <Route path="/verify-pending" element={<VerifyPending />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/user/reset-password" element={<ResetPassword />} />
                    <Route path="/business/reset-password" element={<ResetPassword />} />
                    <Route path="/user/verify-email" element={<VerifyEmail />} />
                    <Route path="/business/verify-email" element={<VerifyEmail />} />

                    {/* Client Dashboard */}
                    <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />
                    <Route
                        path="/client/dashboard"
                        element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}
                    >
                        <Route index element={<ClientHome />} />
                        <Route path="points" element={<ClientPoints />} />
                        <Route path="map" element={<ClientMap />} />
                    </Route>

                    {/* Business Dashboard */}
                    <Route path="/business" element={<Navigate to="/business/dashboard" replace />} />
                    <Route
                        path="/business/subscription"
                        element={<BusinessProtectedRoute><BusinessSubscription /></BusinessProtectedRoute>}
                    />
                    <Route
                        path="/business/location-setup"
                        element={<BusinessProtectedRoute><BusinessLocationSetup /></BusinessProtectedRoute>}
                    />
                    <Route
                        path="/business/dashboard"
                        element={<BusinessProtectedRoute><BusinessLayout /></BusinessProtectedRoute>}
                    >
                        <Route index element={<Navigate to="/business/dashboard/home" replace />} />
                        <Route path="home" element={<BusinessHome />} />
                        <Route path="clients" element={<BusinessClients />} />
                        <Route path="rewards" element={<BusinessRewards />} />
                        <Route path="scan" element={<BusinessScan />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    )
}

export default App
