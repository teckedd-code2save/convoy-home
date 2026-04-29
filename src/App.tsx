import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Docs from './pages/Docs'

function App() {
  return (
    <div className="min-h-screen bg-void text-text-primary font-[Geist,sans-serif]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
