import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import SignUpChoice from './pages/SignUpChoice'
import SignUpClient from './pages/SignUpClient'
import SignUpBusiness from './pages/SignUpBusiness'
import ClientLayout from './components/ClientLayout'
import ClientHome from './pages/ClientHome'
import ClientPoints from './pages/ClientPoints'
import ClientMap from './pages/ClientMap'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
    return (
        <Router>
            <div className="App min-h-screen bg-gray-50">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUpChoice />} />
                    <Route path="/signup/client" element={<SignUpClient />} />
                    <Route path="/signup/business" element={<SignUpBusiness />} />

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
                </Routes>
            </div>
        </Router>
    )
}

export default App
