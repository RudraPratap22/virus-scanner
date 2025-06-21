import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, HardDrive, AlertTriangle, Wifi, CheckCircle } from 'lucide-react'
import CircularProgress from './CircularProgress'
import StatusCard from './StatusCard'

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">You are fully protected</h1>
          <p className="text-gray-400">Smart scan recommended</p>
        </div>
        <div className="flex space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center cursor-pointer"
          >
            <Shield className="w-5 h-5 text-primary-500" />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatusCard
            title="Smart Scan"
            subtitle="Real-time enabled"
            description="Looking for system junk..."
            progress={45}
            color="primary"
            buttonText="STOP SCAN"
            buttonColor="primary"
            icon={Shield}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatusCard
            title="Speed Boost"
            subtitle="30% Used"
            description="15.5 GB / Optimize 2 apps"
            progress={30}
            color="blue"
            buttonText="BOOST"
            buttonColor="secondary"
            icon={Zap}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatusCard
            title="File Cleaner"
            subtitle="6.5 GB"
            description="Cache, free up memory"
            progress={65}
            color="yellow"
            buttonText="CLEAN"
            buttonColor="warning"
            icon={HardDrive}
          />
        </motion.div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">3 Problems found</h3>
              </div>
            </div>
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
          <button className="btn-primary w-full">FIX PROBLEMS</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">Virus, threat protection</h3>
              <p className="text-gray-400 text-sm">No action needed</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium">Firewall & network Protection</h3>
              <p className="text-gray-400 text-sm">No action needed</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard