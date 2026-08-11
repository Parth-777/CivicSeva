import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import CustomCursor from './components/ui/CustomCursor'

import Home from './pages/Home'
import Login from './pages/Login'
import Categories from './pages/Categories'
import Channel from './pages/Channel'
import ReportForm from './pages/ReportForm'
import Success from './pages/Success'
import TrackComplaint from './pages/TrackComplaint'
import GovLogin from './pages/GovLogin'
import Dashboard from './pages/Dashboard'
import IssueDetail from './pages/IssueDetail'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/channel" element={<Channel />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/success" element={<Success />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/gov-login" element={<GovLogin />} />
          <Route path="/dashboard/:dept" element={<Dashboard />} />
          <Route path="/issue/:id" element={<IssueDetail />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}