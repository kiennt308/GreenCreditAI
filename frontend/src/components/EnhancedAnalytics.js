import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const EnhancedAnalytics = ({ user, token }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        sector: 'all',
        startDate: '',
        endDate: '',
        minScore: '',
        maxScore: ''
    });

    useEffect(() => {
        fetchAnalyticsData();
    }, [filters]);

    const fetchAnalyticsData = async () => {
        try {
            const params = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key] && filters[key] !== 'all') {
                    params.append(key, filters[key]);
                }
            });

            const response = await axios.get(`http://localhost:3001/esg-analytics?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAnalyticsData(response.data);
        } catch (err) {
            setError('Failed to fetch analytics data');
            console.error('Error fetching analytics data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const exportToCSV = () => {
        if (!analyticsData || !analyticsData.records) return;

        const csvContent = [
            ['ID', 'ESG Score', 'Credit Amount', 'Loan Amount', 'Sector', 'Project Description', 'Approved', 'Date'],
            ...analyticsData.records.map(record => [
                record.id,
                record.esgScore,
                record.creditAmount,
                record.loanAmount,
                record.sector,
                record.projectDescription,
                record.approved ? 'Yes' : 'No',
                new Date(record.timestamp * 1000).toLocaleDateString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `esg-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <h4>No Analytics Data Available</h4>
                    <p className="text-muted">Submit some evaluations to see analytics.</p>
                </div>
            </div>
        );
    }

    const timeSeriesChartData = {
        labels: analyticsData.timeSeriesData.map(d => d.month),
        datasets: [
            {
                label: 'Average ESG Score',
                data: analyticsData.timeSeriesData.map(d => d.averageESG),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            },
            {
                label: 'Average Credit Amount',
                data: analyticsData.timeSeriesData.map(d => d.averageCredit),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1
            }
        ]
    };

    const sectorChartData = {
        labels: Object.keys(analyticsData.sectorAnalytics),
        datasets: [
            {
                label: 'Average ESG Score by Sector',
                data: Object.values(analyticsData.sectorAnalytics).map(s => s.averageESG),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)'
                ]
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'ESG Analytics Over Time'
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'ESG Scores by Sector'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <h2>📊 Enhanced ESG Analytics</h2>
                    <p className="text-muted">Comprehensive analytics with filtering and export capabilities</p>
                </div>
            </div>

            {/* Filters */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>🔍 Filters</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <label className="form-label">Sector</label>
                                    <select
                                        className="form-select"
                                        value={filters.sector}
                                        onChange={(e) => handleFilterChange('sector', e.target.value)}
                                    >
                                        <option value="all">All Sectors</option>
                                        <option value="Agriculture">Agriculture</option>
                                        <option value="Energy">Energy</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Transportation">Transportation</option>
                                        <option value="Construction">Construction</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Min ESG Score</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={filters.minScore}
                                        onChange={(e) => handleFilterChange('minScore', e.target.value)}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Max ESG Score</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={filters.maxScore}
                                        onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={filters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-1">
                                    <label className="form-label">&nbsp;</label>
                                    <button
                                        className="btn btn-outline-primary w-100"
                                        onClick={() => setFilters({
                                            sector: 'all',
                                            startDate: '',
                                            endDate: '',
                                            minScore: '',
                                            maxScore: ''
                                        })}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="row mt-4">
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-primary">{analyticsData.totalRecords}</h3>
                            <small>Total Records</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-success">{analyticsData.averageESGScore}</h3>
                            <small>Average ESG Score</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-info">{analyticsData.averageCreditAmount.toLocaleString()}</h3>
                            <small>Average Credit Amount</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-warning">{Object.keys(analyticsData.sectorAnalytics).length}</h3>
                            <small>Sectors Covered</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="row mt-4">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h5>Time Series Analysis</h5>
                        </div>
                        <div className="card-body">
                            <Line data={timeSeriesChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                            <h5>Sector Analysis</h5>
                        </div>
                        <div className="card-body">
                            <Bar data={sectorChartData} options={barChartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sector Breakdown */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5>Sector Breakdown</h5>
                            <button className="btn btn-success" onClick={exportToCSV}>
                                📥 Export CSV
                            </button>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Sector</th>
                                            <th>Records</th>
                                            <th>Avg ESG Score</th>
                                            <th>Avg Credit Amount</th>
                                            <th>Total Credit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(analyticsData.sectorAnalytics).map(([sector, data]) => (
                                            <tr key={sector}>
                                                <td><strong>{sector}</strong></td>
                                                <td>{data.count}</td>
                                                <td>
                                                    <span className={`badge ${data.averageESG >= 70 ? 'bg-success' : 'bg-warning'}`}>
                                                        {data.averageESG}
                                                    </span>
                                                </td>
                                                <td>{data.averageCredit.toLocaleString()}</td>
                                                <td>{(data.averageCredit * data.count).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Records */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>Detailed Records</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>ESG Score</th>
                                            <th>Sector</th>
                                            <th>Project</th>
                                            <th>Credit Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analyticsData.records.slice(0, 20).map((record) => (
                                            <tr key={record.id}>
                                                <td>{record.id}</td>
                                                <td>
                                                    <span className={`badge ${record.esgScore >= 70 ? 'bg-success' : 'bg-warning'}`}>
                                                        {record.esgScore}
                                                    </span>
                                                </td>
                                                <td>{record.sector}</td>
                                                <td>
                                                    <div style={{ maxWidth: '200px' }}>
                                                        <small>{record.projectDescription}</small>
                                                    </div>
                                                </td>
                                                <td>{record.creditAmount.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${record.approved ? 'bg-success' : 'bg-warning'}`}>
                                                        {record.approved ? 'Approved' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <small>{new Date(record.timestamp * 1000).toLocaleDateString()}</small>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedAnalytics;
