import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

// Wrap any route that should only be reachable by a logged-in citizen.
// Unauthenticated visitors are bounced to /citizen-login, and the page
// they were headed to is remembered so login can send them right back.
export default function ProtectedRoute({ children }) {
  const { session } = useApp()
  const location = useLocation()

  if (!session) {
    return (
      <Navigate
        to="/citizen-login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return children
}
