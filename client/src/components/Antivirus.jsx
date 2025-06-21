import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, Shield, AlertTriangle, CheckCircle, X, Loader } from 'lucide-react'
import axios from 'axios'

const Antivirus = () => {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'pending',
      scanResult: null
    }))
    
    setFiles(prev => [...prev, ...newFiles])
    
    // Upload and scan each file
    for (const fileObj of newFiles) {
      await uploadAndScanFile(fileObj)
    }
  }

  const uploadAndScanFile = async (fileObj) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'uploading' } : f
      ))

      const formData = new FormData()
      formData.append('file', fileObj.file)

      const response = await axios.post('/api/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const { file, scan } = response.data
      
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { 
          ...f, 
          status: scan.status === 'infected' ? 'infected' : 'clean',
          scanResult: scan
        } : f
      ))
    } catch (error) {
      console.error('Upload failed:', error)
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'error' } : f
      ))
    }
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <File className="w-5 h-5 text-gray-400" />
      case 'uploading':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      case 'clean':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'infected':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'error':
        return <X className="w-5 h-5 text-red-500" />
      default:
        return <File className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'clean':
        return 'border-green-500 bg-green-500/10'
      case 'infected':
        return 'border-red-500 bg-red-500/10'
      case 'uploading':
        return 'border-blue-500 bg-blue-500/10'
      case 'error':
        return 'border-red-500 bg-red-500/10'
      default:
        return 'border-gray-600 bg-gray-600/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Antivirus Scanner</h1>
          <p className="text-gray-400">Upload files to scan for viruses and malware</p>
        </div>
      </div>

      {/* Upload Area */}
      <motion.div
        className={`card border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? 'border-primary-500 bg-primary-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
      >
        <div className="text-center py-12">
          <motion.div
            animate={{ 
              scale: dragActive ? 1.1 : 1,
              rotate: dragActive ? 5 : 0 
            }}
            className="mx-auto w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-4"
          >
            <Upload className="w-8 h-8 text-primary-500" />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {dragActive ? 'Drop files here' : 'Upload files to scan'}
          </h3>
          <p className="text-gray-400 mb-6">
            Drag and drop files here, or click to select files
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </motion.button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleChange}
            className="hidden"
          />
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Scan Results</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 rounded-lg border ${getStatusColor(file.status)} flex items-center justify-between`}
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(file.status)}
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {file.scanResult && file.scanResult.virus_name && (
                        <p className="text-red-400 text-sm font-medium">
                          Threat: {file.scanResult.virus_name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      file.status === 'clean' ? 'bg-green-500/20 text-green-400' :
                      file.status === 'infected' ? 'bg-red-500/20 text-red-400' :
                      file.status === 'uploading' ? 'bg-blue-500/20 text-blue-400' :
                      file.status === 'error' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {file.status.toUpperCase()}
                    </span>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {files.filter(f => f.status === 'clean').length}
          </h3>
          <p className="text-gray-400">Clean Files</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {files.filter(f => f.status === 'infected').length}
          </h3>
          <p className="text-gray-400">Threats Found</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <File className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-white">{files.length}</h3>
          <p className="text-gray-400">Total Scanned</p>
        </motion.div>
      </div>
    </div>
  )
}

export default Antivirus