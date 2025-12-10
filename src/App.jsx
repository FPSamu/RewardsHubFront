import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUpChoice from './pages/SignUpChoice'
import SignUpClient from './pages/SignUpClient'
import SignUpBusiness from './pages/SignUpBusiness'
// 1. IMPORTAR EL COMPONENTE DE VERIFICACIÓN
import VerifyEmail from './pages/VerifyEmail' 

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
import './App.css'

function App() {
    return (
        <Router>
            <div className="App min-h-screen bg-gray-50">
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUpChoice />} />
                    <Route path="/signup/client" element={<SignUpClient />} />
                    <Route path="/signup/business" element={<SignUpBusiness />} />

                    {/* 2. AGREGAR RUTAS DE VERIFICACIÓN (Públicas) */}
                    <Route path="/user/verify-email" element={<VerifyEmail />} />
                    <Route path="/business/verify-email" element={<VerifyEmail />} />

                    {/* Client Dashboard Routes */}
                    <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />
                    <Route
                        path="/client/dashboard"
                        element={
                            <ProtectedRoute>
                                <ClientLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<ClientHome />} />
                        <Route path="points" element={<ClientPoints />} />
                        <Route path="map" element={<ClientMap />} />
                    </Route>

                    {/* Business Dashboard Routes */}
                    <Route path="/business" element={<Navigate to="/business/dashboard" replace />} />

                    {/* Business Subscription Route */}
                    <Route
                        path="/business/subscription"
                        element={
                            <BusinessProtectedRoute>
                                <BusinessSubscription />
                            </BusinessProtectedRoute>
                        }
                    />

                    {/* Business Location Setup - No subscription required */}
                    <Route
                        path="/business/location-setup"
                        element={
                            <BusinessProtectedRoute>
                                <BusinessLocationSetup />
                            </BusinessProtectedRoute>
                        }
                    />

                    {/* Business Dashboard - Protected by subscription */}
                    <Route
                        path="/business/dashboard"
                        element={
                            <BusinessProtectedRoute>
                                <BusinessLayout />
                            </BusinessProtectedRoute>
                        }
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