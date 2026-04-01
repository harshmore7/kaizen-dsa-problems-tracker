import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Problems from './pages/Problems'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/problems" element={<><Navbar /><Problems /></>} />
        <Route path="/analytics" element={<><Navbar /><Analytics /></>} />
        <Route path="/profile" element={<><Navbar /><Profile /></>} />
      </Routes>
    </BrowserRouter>
  )
}