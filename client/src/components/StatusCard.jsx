import React from 'react'
import { motion } from 'framer-motion'
import CircularProgress from './CircularProgress'

const StatusCard = ({ 
  title, 
  subtitle, 
  description, 
  progress, 
  color, 
  buttonText, 
  buttonColor, 
  icon: Icon 
}) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary-500',
          text: 'text-primary-500',
          button: 'btn-primary'
        }
      case 'blue':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-500',
          button: 'btn-secondary'
        }
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-500',
          button: 'btn-warning'
        }
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-500',
          button: 'btn-primary'
        }
    }
  }

  const colors = getColorClasses(color)

  return (
    <div className="card">
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm mb-2">VIEW DETAILS</p>
        <div className="relative inline-block mb-4">
          <CircularProgress 
            progress={progress} 
            size={120} 
            strokeWidth={8}
            color={color}
          />
        </div>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon className={`w-5 h-5 ${colors.text}`} />
          <h3 className="text-white font-medium">{title}</h3>
        </div>
        <p className={`${colors.text} text-sm mb-1`}>{subtitle}</p>
        <p className="text-gray-400 text-xs">{description}</p>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${colors.button} w-full`}
      >
        {buttonText}
      </motion.button>
    </div>
  )
}

export default StatusCard