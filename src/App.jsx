import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import SignUpChoice from './pages/SignUpChoice'
import SignUpClient from './pages/SignUpClient'
import SignUpBusiness from './pages/SignUpBusiness'
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
                </Routes>
            </div>
        </Router>
    )
}

export default App
