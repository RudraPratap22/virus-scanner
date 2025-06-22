import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Filter, ChevronLeft, ChevronRight, File, AlertTriangle, CheckCircle, Download, Trash2 } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }
    return (
        <div className="flex items-center justify-center space-x-2 mt-6">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
            {pageNumbers.map(number => (
                <button key={number} onClick={() => onPageChange(number)} className={`px-4 py-2 rounded-md ${currentPage === number ? 'bg-primary-500 text-white' : 'bg-dark-600'}`}>{number}</button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
        </div>
    );
};

const Reports = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMime, setFilterMime] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const recordsPerPage = 10;
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchFiles = useCallback(async (page) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/files', {
                params: {
                    page,
                    limit: recordsPerPage,
                    filename: debouncedSearchTerm,
                    status: filterStatus,
                    mimeType: filterMime,
                    date: filterDate,
                },
            });
            setFiles(response.data.files || []);
            setTotalPages(Math.ceil(response.data.total / recordsPerPage));
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchTerm, filterStatus, filterMime, filterDate]);

    useEffect(() => {
        fetchFiles(currentPage);
    }, [fetchFiles, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterStatus, filterMime, filterDate]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'clean':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'infected':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default:
                return <File className="w-4 h-4 text-gray-400" />;
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'clean':
                return 'bg-green-500/20 text-green-400';
            case 'infected':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };
    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
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
            fetchFiles(currentPage);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-primary-500" />
                <div>
                    <h1 className="text-2xl font-bold text-white">Scan History</h1>
                    <p className="text-gray-400">All scanned files with filters and pagination</p>
                </div>
            </div>
            {/* Filters */}
            <div className="card flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search filename..."
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
                        <option value="all">All Status</option>
                        <option value="clean">Clean</option>
                        <option value="infected">Infected</option>
                        <option value="unscanned">Unscanned</option>
                    </select>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Mime type (e.g. image/png)"
                        value={filterMime}
                        onChange={(e) => setFilterMime(e.target.value)}
                        className="bg-dark-600 border border-dark-500 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-primary-500"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="bg-dark-600 border border-dark-500 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>
            {/* Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-dark-600">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">File</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Size</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Mime Type</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Uploaded</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Threat</th>
                                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file, index) => (
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
                                    <td className="py-4 px-4 text-gray-400">{formatFileSize(file.file_size)}</td>
                                    <td className="py-4 px-4 text-gray-400">{file.mime_type}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(file.scan_status)}`}>
                                            {file.scan_status ? file.scan_status.toUpperCase() : 'UNSCANNED'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-400">{formatDate(file.uploaded_at)}</td>
                                    <td className="py-4 px-4">
                                        {file.virus_name ? <span className="text-red-400 font-medium">{file.virus_name}</span> : <span className="text-gray-500">-</span>}
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
                    {files.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <File className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">No files found</p>
                        </div>
                    )}
                </div>
                {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchFiles(page)} />}
            </div>
        </div>
    );
};

export default Reports; 