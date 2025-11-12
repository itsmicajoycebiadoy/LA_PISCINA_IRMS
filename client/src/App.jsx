import { useState, useEffect } from 'react'

function App() {
  const [tests, setTests] = useState({
    frontend: { status: 'checking', message: 'Checking...' },
    backend: { status: 'checking', message: 'Checking...' },
    database: { status: 'checking', message: 'Checking...' },
    users: { status: 'checking', message: 'Checking...', data: [] }
  })

  useEffect(() => {
    runAllTests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runAllTests = async () => {
    // Test 1: Frontend
    setTests(prev => ({
      ...prev,
      frontend: { status: 'success', message: 'Frontend is running!' }
    }))

    // Test 2: Backend Connection
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      
      setTests(prev => ({
        ...prev,
        backend: { 
          status: 'success', 
          message: `Backend connected! ${data.message}` 
        }
      }))

      // Test 3: Database Connection
      testDatabase()
    } catch (error) {
      setTests(prev => ({
        ...prev,
        backend: { 
          status: 'error', 
          message: `Backend error: ${error.message}` 
        },
        database: { 
          status: 'error', 
          message: 'Cannot test database (backend not connected)' 
        }
      }))
    }
  }

  const testDatabase = async () => {
    try {
      const response = await fetch('/api/test/database')
      const data = await response.json()
      
      if (data.success) {
        setTests(prev => ({
          ...prev,
          database: { 
            status: 'success', 
            message: `Database connected! Found ${data.tableCount} tables` 
          },
          users: {
            status: 'success',
            message: `Found ${data.users.length} users in database`,
            data: data.users
          }
        }))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        database: { 
          status: 'error', 
          message: `Database error: ${error.message}` 
        }
      }))
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-50 border-green-500'
      case 'error': return 'bg-red-50 border-red-500'
      default: return 'bg-yellow-50 border-yellow-500'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '⏳'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'success': return 'text-green-800'
      case 'error': return 'text-red-800'
      default: return 'text-yellow-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 flex justify-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏊 La Piscina Resort
          </h1>
          <p className="text-xl text-gray-600">
            Integrated Management System - Connection Test
          </p>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {/* Frontend Test */}
          <div className={`border-l-4 p-6 bg-white rounded-lg shadow-md ${getStatusColor(tests.frontend.status)}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getStatusIcon(tests.frontend.status)}</span>
              <div>
                <h3 className={`text-lg font-semibold ${getStatusText(tests.frontend.status)}`}>
                  Frontend (React + Vite + Tailwind)
                </h3>
                <p className={`${getStatusText(tests.frontend.status)}`}>
                  {tests.frontend.message}
                </p>
              </div>
            </div>
          </div>

          {/* Backend Test */}
          <div className={`border-l-4 p-6 bg-white rounded-lg shadow-md ${getStatusColor(tests.backend.status)}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getStatusIcon(tests.backend.status)}</span>
              <div>
                <h3 className={`text-lg font-semibold ${getStatusText(tests.backend.status)}`}>
                  Backend (Node.js + Express)
                </h3>
                <p className={`${getStatusText(tests.backend.status)}`}>
                  {tests.backend.message}
                </p>
              </div>
            </div>
          </div>

          {/* Database Test */}
          <div className={`border-l-4 p-6 bg-white rounded-lg shadow-md ${getStatusColor(tests.database.status)}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getStatusIcon(tests.database.status)}</span>
              <div>
                <h3 className={`text-lg font-semibold ${getStatusText(tests.database.status)}`}>
                  Database (MySQL via XAMPP)
                </h3>
                <p className={`${getStatusText(tests.database.status)}`}>
                  {tests.database.message}
                </p>
              </div>
            </div>
          </div>

          {/* Users Test */}
          <div className={`border-l-4 p-6 bg-white rounded-lg shadow-md ${getStatusColor(tests.users.status)}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getStatusIcon(tests.users.status)}</span>
              <div>
                <h3 className={`text-lg font-semibold ${getStatusText(tests.users.status)}`}>
                  Database Query Test
                </h3>
                <p className={`${getStatusText(tests.users.status)}`}>
                  {tests.users.message}
                </p>
              </div>
            </div>

            {/* User List */}
            {tests.users.data.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Sample Users from Database:</h4>
                <div className="space-y-2">
                  {tests.users.data.map((user, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">Email:</span> {user.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Name:</span> {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Role:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                          user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'receptionist' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 text-center">
          <button 
            onClick={runAllTests}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            🔄 Run Tests Again
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📋 What This Tests:
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span><strong>Frontend:</strong> React app is running with Tailwind CSS</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span><strong>Backend:</strong> Express server is running and responding to API calls</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span><strong>Database:</strong> MySQL connection is active and tables exist</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span><strong>Query:</strong> Can retrieve data from users table</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
