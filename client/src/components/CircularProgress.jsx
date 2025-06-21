import React from 'react'
import { motion } from 'framer-motion'

const CircularProgress = ({ progress, size = 120, strokeWidth = 8, color = 'primary' }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getStrokeColor = (color) => {
    switch (color) {
      case 'primary':
        return '#14b8a6'
      case 'blue':
        return '#3b82f6'
      case 'yellow':
        return '#eab308'
      default:
        return '#14b8a6'
    }
  }

  return (
    <div className="relative">
      <svg
        className="progress-ring"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="progress-ring__circle"
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className="progress-ring__circle"
          stroke={getStrokeColor(color)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray,
            strokeDashoffset
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      {/* Progress text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  )
}

export default CircularProgress