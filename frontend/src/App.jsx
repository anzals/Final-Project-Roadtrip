import react, { useState } from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import PlanTrip from "./pages/PlanTrip";
import TripDetails from "./pages/TripDetails";
import MapRoute from "./pages/MapRoute"; 
import AddPitstop from "./pages/AddPitstop";
import UpdateRoute from "./pages/UpdateRoute";
import ReorderPitstops from "./pages/ReorderPitstops"; 
import PetrolCalculator from "./pages/PetrolCalculator";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "./api";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {

  const [trips, setTrips] = useState([]);

  const getTrips = () => {
    api.get("/api/trips/")
      .then((res) => setTrips(res.data))
      .catch((err) => alert(err));
  };

  const addTrip = (trip) => {
    setTrips([...trips, trip]); 
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home trips={trips} getTrips={getTrips} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan-trip"
          element={
            <ProtectedRoute>
              <PlanTrip addTrip={addTrip} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:id" 
          element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/route/:id"
          element={
            <ProtectedRoute>
              <MapRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/route/:id/add-pitstop"  
          element={
            <ProtectedRoute>
              <AddPitstop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/route/:id/update-route"  
          element={
            <ProtectedRoute>
              <UpdateRoute />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/route/:id/reorder-pitstops" 
          element={
            <ProtectedRoute>
              <ReorderPitstops />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/route/:id/petrol-calculator" 
          element={
            <ProtectedRoute>
              <PetrolCalculator />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App