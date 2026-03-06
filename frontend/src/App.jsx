import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import NewPost from "./pages/NewPost";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-post" element={<NewPost />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;