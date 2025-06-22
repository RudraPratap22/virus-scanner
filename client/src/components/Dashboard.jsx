import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Info, HelpCircle, Trash, FileText } from 'lucide-react';
import CircularProgress from './CircularProgress';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, infected: 0 });
    const [lastFile, setLastFile] = useState(null);
    const [scanProgress, setScanProgress] = useState(72); // Mock progress

    const fetchDashboardData = async () => {
        try {
            const statsPromise = axios.get('/api/stats');
            const filesPromise = axios.get('/api/files?limit=1');
            
            const [statsResponse, filesResponse] = await Promise.all([statsPromise, filesPromise]);
            
            setStats(statsResponse.data);

            if (filesResponse.data.files && filesResponse.data.files.length > 0) {
                setLastFile(filesResponse.data.files[0]);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDeleteInfected = async () => {
        try {
            await axios.delete('/api/delete-infected');
            fetchDashboardData();
        } catch (error) {
            alert('Failed to delete infected files.');
        }
    };

    const handleExportReport = async (format) => {
        try {
            const { data } = await axios.get('/api/export-report');
            const files = data.files || [];

            if (format === 'pdf') {
                // --- PDF Generation ---
                const doc = new jsPDF();
                // Summary section
                const totalFiles = files.length;
                const infectedFiles = files.filter(f => f.scan_status === 'infected').length;
                const scanVersions = [...new Set(files.map(f => f.scan_version).filter(Boolean))].join(', ');
                const dates = files.map(f => f.uploaded_at).filter(Boolean).sort();
                const dateRange = dates.length ? `${dates[0].slice(0, 10)} to ${dates[dates.length - 1].slice(0, 10)}` : 'N/A';
                doc.setFontSize(16);
                doc.text('Scan Report Summary', 14, 16);
                doc.setFontSize(11);
                doc.text(`Total files scanned: ${totalFiles}`, 14, 26);
                doc.text(`Total infected files: ${infectedFiles}`, 14, 33);
                doc.text(`Date range: ${dateRange}`, 14, 40);
                doc.text(`Scanner version(s): ${scanVersions || 'N/A'}`, 14, 47);
                // Scan Details Table
                autoTable(doc, {
                    startY: 55,
                    head: [[
                        'File Name', 'Scan Date', 'Status', 'Virus Name', 'Version', 'Mime Type'
                    ]],
                    body: files.map(f => [
                        f.filename,
                        f.uploaded_at ? f.uploaded_at.replace('T', ' ').slice(0, 19) : '',
                        f.scan_status ? (f.scan_status === 'infected' ? 'Infected' : 'Clean') : 'Unscanned',
                        f.virus_name || 'N/A',
                        f.scan_version ? f.scan_version.split('/')[0] : 'N/A',
                        f.mime_type || 'N/A',
                    ]),
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [22, 160, 133] },
                    columnStyles: {
                        0: { cellWidth: 60 }, // File Name
                        1: { cellWidth: 30 }, // Scan Date
                        2: { cellWidth: 15 }, // Status
                        3: { cellWidth: 25 }, // Virus Name
                        4: { cellWidth: 25 }, // Version
                        5: { cellWidth: 20 }, // Mime Type
                    },
                    didParseCell: function (data) {
                        if (data.column.dataKey === 2 && data.cell.raw === 'Infected') {
                            data.cell.styles.textColor = [255, 0, 0];
                        }
                    }
                });
                doc.save('scan_report.pdf');
            } else if (format === 'csv') {
                // --- CSV Generation ---
                const csv = Papa.unparse(files.map(f => ({
                    filename: f.filename,
                    scan_date: f.uploaded_at,
                    scan_status: f.scan_status,
                    virus_name: f.virus_name,
                    scanner_version: f.scan_version,
                    scan_log_summary: f.scan_log ? f.scan_log.slice(0, 40) : '',
                    scan_id: f.id,
                    file_path: f.aws3_key,
                    scan_duration: f.scan_duration,
                    deleted_status: f.deleted_status,
                    mime_type: f.mime_type,
                })));
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'scan_report.csv');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            }
        } catch (error) {
            console.error(`Failed to export scan report as ${format}:`, error);
            alert(`Failed to export scan report as ${format}. Check the console for more details.`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {stats.infected > 0 ? `${stats.infected} threats detected` : 'No threats detected'}
                    </h1>
                    <p className="text-gray-400">Scan recommended to stay safe</p>
                </div>
                <div className="flex space-x-2">
                    <button className="p-2 rounded-full hover:bg-dark-700 transition-colors">
                        <HelpCircle className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-dark-700 transition-colors">
                        <Info className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Main Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div className="card text-center p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <p className="text-gray-400 text-sm mb-4">VIEW DETAILS</p>
                    <CircularProgress progress={scanProgress} size={160} strokeWidth={10} color="primary" />
                    <p className="text-white mt-4">Scan Progress</p>
                    <button className="btn-primary mt-4 w-full">STOP SCAN</button>
                </motion.div>

                <motion.div className="card text-center p-6 flex flex-col justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <p className="text-gray-400 text-sm mb-4">VIEW DETAILS</p>
                    <h2 className="text-6xl font-bold text-white">{stats.total || 0}</h2>
                    <p className="text-white mt-2">Total Files Scanned</p>
                    <p className="text-red-400 mt-1">{stats.infected || 0} infected files</p>
                </motion.div>

                <motion.div className="card text-center p-6 flex flex-col justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <p className="text-gray-400 text-sm mb-4">VIEW DETAILS</p>
                    <div className="w-32 h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl font-bold text-yellow-400">
                            {lastFile ? formatFileSize(lastFile.file_size) : 'N/A'}
                        </span>
                    </div>
                    <p className="text-white mt-4">Last File Scanned</p>
                </motion.div>
            </div>

            {/* Bottom Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.button className="card flex items-center justify-center space-x-3 py-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    onClick={handleDeleteInfected}
                >
                    <Trash className="w-6 h-6 text-red-400" />
                    <span className="text-white font-semibold">Delete Infected Files</span>
                </motion.button>
                <motion.button className="card flex items-center justify-center space-x-3 py-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    onClick={() => handleExportReport('pdf')}
                >
                    <FileText className="w-6 h-6 text-red-500" />
                    <span className="text-white font-semibold">Export as PDF</span>
                </motion.button>
                <motion.button className="card flex items-center justify-center space-x-3 py-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    onClick={() => handleExportReport('csv')}
                >
                    <FileText className="w-6 h-6 text-green-500" />
                    <span className="text-white font-semibold">Export as CSV</span>
                </motion.button>
            </div>
        </div>
    );
};

export default Dashboard;