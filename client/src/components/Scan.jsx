import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, Shield, AlertTriangle, CheckCircle, X, Loader, Info } from 'lucide-react'
import axios from 'axios'

const ScanProgressBar = ({ status }) => {
  if (status !== 'uploading') return null;

  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
      <motion.div
        className="bg-blue-500 h-1.5 rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </div>
  );
};

const Scan = () => {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const [stats, setStats] = useState({ clean: 0, infected: 0, total: 0 });

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
    
    setFiles(newFiles);
    
    // Upload and scan each file
    for (const fileObj of newFiles) {
      await uploadAndScanFile(fileObj);
      await fetchStats();
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

      const scanResult = response.data
      
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { 
          ...f, 
          id: scanResult.id, // Use the permanent ID from the server
          status: scanResult.status === 'infected' ? 'infected' : 'clean',
          scanResult: scanResult
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
    setFiles(prev => prev.filter(f => f.id !== id));
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
        return 'border-gray-600 bg-gray-700'
    }
  }

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'clean':
        return 'text-green-400'
      case 'infected':
        return 'text-red-400'
      case 'uploading':
        return 'text-blue-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
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
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`p-4 rounded-lg border ${getStatusColor(file.status)} flex flex-col`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="text-white font-semibold">{file.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`font-bold text-sm ${getStatusTextColor(file.status)}`}>
                        {file.status.toUpperCase()}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFile(file.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                  
                  {file.status === 'uploading' && <ScanProgressBar status={file.status} />}

                  {file.scanResult && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400 space-y-1"
                    >
                      {file.scanResult.virus_name && (
                        <div className="flex items-center space-x-2 text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <p><strong>Threat Found:</strong> {file.scanResult.virus_name}</p>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4" />
                        <p><strong>Scanner:</strong> {file.scanResult.scan_version}</p>
                      </div>
                       <div className="flex items-center space-x-2">
                        <Info className="w-4 h-4" />
                        <p><strong>Scan Log:</strong> {file.scanResult.scan_log.substring(0, 70)}...</p>
                      </div>
                    </motion.div>
                  )}
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
            {stats.clean}
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
            {stats.infected}
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
          <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
          <p className="text-gray-400">Total Scanned</p>
        </motion.div>
      </div>
    </div>
  )
}

export default Scan