import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { File, Search, Filter, Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import axios from 'axios'

const FileManager = () => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await axios.get('/api/files')
      setFiles(response.data.files || [])
    } catch (error) {
      console.error('Failed to fetch files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId, filename) => {
    try {
        const response = await axios.get(`/api/download/${fileId}`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
        console.error('Failed to download file:', error);
    }
  };

  const handleDelete = async (fileId) => {
      try {
          await axios.delete(`/api/delete/${fileId}`);
          fetchFiles(); // Refresh the file list
      } catch (error) {
          console.error('Failed to delete file:', error);
      }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'clean' && file.scan_status === 'clean') ||
      (filterStatus === 'infected' && file.scan_status === 'infected') ||
      (filterStatus === 'unscanned' && !file.scan_status)
    
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'clean':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'infected':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <File className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'clean':
        return 'bg-green-500/20 text-green-400'
      case 'infected':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <File className="w-8 h-8 text-primary-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">File Manager</h1>
            <p className="text-gray-400">Manage and view scanned files</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchFiles}
          className="btn-primary"
        >
          Refresh
        </motion.button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-dark-600 border border-dark-500 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-primary-500"
            >
              <option value="all">All Files</option>
              <option value="clean">Clean</option>
              <option value="infected">Infected</option>
              <option value="unscanned">Unscanned</option>
            </select>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">File</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Size</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Uploaded</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Threat</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file, index) => (
                <motion.tr
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-dark-700 hover:bg-dark-600/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.scan_status)}
                      <span className="text-white font-medium">{file.filename}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {formatFileSize(file.file_size)}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(file.scan_status)}`}>
                      {file.scan_status ? file.scan_status.toUpperCase() : 'UNSCANNED'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {formatDate(file.uploaded_at)}
                  </td>
                  <td className="py-4 px-4">
                    {file.virus_name ? (
                      <span className="text-red-400 font-medium">{file.virus_name}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Download"
                        onClick={() => handleDownload(file.id, file.filename)}
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <File className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No files found</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-white">{files.length}</h3>
          <p className="text-gray-400">Total Files</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-green-400">
            {files.filter(f => f.scan_status === 'clean').length}
          </h3>
          <p className="text-gray-400">Clean</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-red-400">
            {files.filter(f => f.scan_status === 'infected').length}
          </h3>
          <p className="text-gray-400">Infected</p>
        </div>
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-gray-400">
            {files.filter(f => !f.scan_status).length}
          </h3>
          <p className="text-gray-400">Unscanned</p>
        </div>
      </div>
    </div>
  )
}

export default FileManager