import { createContext, useContext, useState, useCallback } from 'react'
import { initialReports } from '../data/reportStore'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [reports, setReports] = useState(initialReports)
  const [nextId, setNextId] = useState(7)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [activeDept, setActiveDept] = useState(null)

  // --------------------------------------------------
  // AUTHENTICATION STATE
  // --------------------------------------------------

  const [session, setSession] = useState(() => {
    try {
      const storedSession = localStorage.getItem(
        'civicseva_session'
      )

      return storedSession
        ? JSON.parse(storedSession)
        : null
    } catch (error) {
      console.error(
        'Failed to restore frontend session:',
        error
      )

      return null
    }
  })

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const login = useCallback((userData) => {
    const newSession = {
      ...userData,
      loggedIn: true,
    }

    setSession(newSession)

    try {
      localStorage.setItem(
        'civicseva_session',
        JSON.stringify(newSession)
      )
    } catch (error) {
      console.error(
        'Failed to save frontend session:',
        error
      )
    }
  }, [])

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const logout = useCallback(() => {
    setSession(null)

    try {
      localStorage.removeItem(
        'civicseva_session'
      )
    } catch (error) {
      console.error(
        'Failed to clear frontend session:',
        error
      )
    }
  }, [])

  // --------------------------------------------------
  // EXISTING REPORT LOGIC
  // --------------------------------------------------

  const addReport = useCallback(
    ({ description, location, phone, channel, photo }) => {
      const newReport = {
        id: nextId,
        categoryId: selectedCategory.id,
        title: selectedCategory.title,
        icon: selectedCategory.icon,
        department: selectedCategory.department,
        description:
          description ||
          `(Reported via ${channel})`,
        location:
          location ||
          'Location not provided',
        photo: photo || null,
        phone: phone
          ? `+91 ${phone}`
          : '',
        status: 'Pending',
        date: new Date()
          .toISOString()
          .slice(0, 10),
        channel,
      }

      setReports((prev) => [
        ...prev,
        newReport,
      ])

      setNextId((n) => n + 1)

      return newReport
    },
    [nextId, selectedCategory]
  )

  const updateReportStatus = useCallback(
    (id, newStatus) => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: newStatus,
              }
            : r
        )
      )
    },
    []
  )

  // --------------------------------------------------
  // PROVIDER
  // --------------------------------------------------

  return (
    <AppContext.Provider
      value={{
        // Existing application state
        reports,
        selectedCategory,
        setSelectedCategory,
        activeDept,
        setActiveDept,
        addReport,
        updateReportStatus,

        // Authentication state
        session,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}