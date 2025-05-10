// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import PlantingPlanExplorer from "./pages/PlantingPlanExplorer";
import PlantingPlanDetail from "./pages/PlantingPlanDetail";
import PlantProgressDetailPage from "./pages/PlantProgressDetailPage";
import PostsPage from "./pages/PostsPage";
import PostDetailPage from "./pages/PostDetailPage";
import CreatePostPage from "./pages/CreatePostPage";
import "bootstrap/dist/css/bootstrap.min.css";
import PlantingForm from "./pages/PlantingForm";
import ProfileEditPage from "./pages/ProfileEditPage";
import PlantingPlanEditPage from "./pages/PlantingPlanEditPage";
import WeatherPage from "./pages/WeatherPage";
import CropDiseaseDetector from "./pages/CropDiseaseDetector";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route
                path="/planting-plans"
                element={<PlantingPlanExplorer />}
              />
              <Route
                path="/planting-plans/:planId"
                element={<PlantingPlanDetail />}
              />
              <Route
                path="/plant-progress/:progressId"
                element={<PlantProgressDetailPage />}
              />
              <Route path="/planting-plans" element={<PlantingPlanExplorer />} />
              <Route path="/planting-plans/:planId" element={<PlantingPlanDetail />} />
              <Route path="/planting-plans/:planId/edit" element={<PlantingPlanEditPage />} />
              <Route path="/plant-progress/:progressId" element={<PlantProgressDetailPage />} />
              <Route path="/plant-progress/:progressId/edit" element={<PlantProgressDetailPage editMode={true} />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/posts/new" element={<CreatePostPage />} />
              <Route path="/posts/:postId" element={<PostDetailPage />} />
              <Route path="/plantingfoam" element={<PlantingForm />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/crop-disease-detector" element={<CropDiseaseDetector />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
