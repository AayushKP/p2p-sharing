import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import P2PApp from "./pages/P2PApp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<P2PApp />} />
      </Routes>
    </BrowserRouter>
  );
}
