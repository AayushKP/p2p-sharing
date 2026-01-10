import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import P2PApp from "./pages/P2PApp";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<P2PApp />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
