import React from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Shield, 
  Zap, 
  Trash2, 
  Globe, 
  Download,
  Settings,
  HelpCircle
} from 'lucide-react'

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'antivirus', label: 'Antivirus', icon: Shield },
    { id: 'boost', label: 'Boost', icon: Zap },
    { id: 'cleaner', label: 'Cleaner', icon: Trash2 },
    { id: 'web-security', label: 'Web Security', icon: Globe },
    { id: 'updates', label: 'Updates', icon: Download, badge: 2 },
  ]

  return (
    <div className="w-64 bg-dark-800 border-r border-dark-700 p-6">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">ALFA BOT</h1>
          <p className="text-gray-400 text-xs">ANTIVIRUS</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </nav>

      {/* Bottom Icons */}
      <div className="absolute bottom-6 left-6 flex space-x-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-8 h-8 bg-dark-600 rounded-lg flex items-center justify-center cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-8 h-8 bg-dark-600 rounded-lg flex items-center justify-center cursor-pointer"
        >
          <Settings className="w-4 h-4 text-gray-400" />
        </motion.div>
      </div>
    </div>
  )
}

export default Sidebar