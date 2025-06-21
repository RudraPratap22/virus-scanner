import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Antivirus from './components/Antivirus'
import FileManager from './components/FileManager'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'antivirus':
        return <Antivirus />
      case 'files':
        return <FileManager />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-dark-800 to-dark-900 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  )
}

export default App