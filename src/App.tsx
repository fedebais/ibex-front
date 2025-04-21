import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import PilotDashboard from "./pages/pilot/PilotDashboard"
import AdminDashboard from "./pages/admin/AdminDashboard"
import { UserProvider } from "./context/UserContext"
import { ThemeProvider } from "./context/ThemeContext"
import ProtectedRoute from "./components/ProtectedRoute"
import "./App.css"
import "./index.css"

function App() {
  console.log("App: Renderizando App component")

  // Asegurarse de que no haya clase dark al inicio
  if (typeof document !== "undefined") {
    console.log("App: Removiendo clase 'dark' del documento al inicio")
    document.documentElement.classList.remove("dark")
  }

  return (
    <UserProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/pilot/*"
              element={
                <ProtectedRoute allowedRoles={["pilot"]}>
                  <PilotDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin", "operator"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </UserProvider>
  )
}

export default App
