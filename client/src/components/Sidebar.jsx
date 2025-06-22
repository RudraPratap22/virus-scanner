import React from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  File,
  User,
  LogOut,
  Settings,
  HelpCircle
} from 'lucide-react'

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Scan', icon: Search },
    { id: 'files', label: 'Files', icon: File },
    { id: 'reports', label: 'Reports', icon: FileText },
  ]

  const bottomMenuItems = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <div className="w-64 bg-dark-800 border-r border-dark-700 p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Search className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg">ALFA BOT</h1>
          <p className="text-gray-400 text-xs">ANTIVIRUS</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="space-y-2 flex-1">
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

      {/* Bottom Menu Items */}
      <nav className="space-y-2">
        {bottomMenuItems.map((item) => {
            const Icon = item.icon;
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
                    </div>
                </motion.div>
            );
        })}
      </nav>
    </div>
  )
}

export default Sidebar