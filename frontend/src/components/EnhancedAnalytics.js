import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            setError(t('analytics.fetchError'));
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
            [t('analytics.csvHeaders.id'), t('analytics.csvHeaders.esgScore'), t('analytics.csvHeaders.creditAmount'), t('analytics.csvHeaders.loanAmount'), t('analytics.csvHeaders.sector'), t('analytics.csvHeaders.projectDescription'), t('analytics.csvHeaders.approved'), t('analytics.csvHeaders.date')],
            ...analyticsData.records.map(record => [
                record.id,
                record.esgScore,
                record.creditAmount,
                record.loanAmount,
                record.sector,
                record.projectDescription,
                record.approved ? t('common.yes') : t('common.no'),
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
                        <span className="visually-hidden">{t('common.loading')}</span>
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
                    <h4>{t('analytics.noData')}</h4>
                    <p className="text-muted">{t('analytics.submitEvaluations')}</p>
                </div>
            </div>
        );
    }

    const timeSeriesChartData = {
        labels: analyticsData.timeSeriesData.map(d => d.month),
        datasets: [
            {
                label: t('analytics.averageESGScore'),
                data: analyticsData.timeSeriesData.map(d => d.averageESG),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            },
            {
                label: t('analytics.averageCreditAmount'),
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
                label: t('analytics.averageESGScoreBySector'),
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
                text: t('analytics.chartTitle')
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
                text: t('analytics.sectorChartTitle')
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
                    <h2>📊 {t('analytics.title')}</h2>
                    <p className="text-muted">{t('analytics.subtitle')}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>🔍 {t('analytics.filters')}</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <label className="form-label">{t('analytics.sector')}</label>
                                    <select
                                        className="form-select"
                                        value={filters.sector}
                                        onChange={(e) => handleFilterChange('sector', e.target.value)}
                                    >
                                        <option value="all">{t('analytics.allSectors')}</option>
                                        <option value="Agriculture">{t('analytics.agriculture')}</option>
                                        <option value="Energy">{t('analytics.energy')}</option>
                                        <option value="Manufacturing">{t('analytics.manufacturing')}</option>
                                        <option value="Transportation">{t('analytics.transportation')}</option>
                                        <option value="Construction">{t('analytics.construction')}</option>
                                        <option value="Other">{t('analytics.other')}</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">{t('analytics.minESGScore')}</label>
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
                                    <label className="form-label">{t('analytics.maxESGScore')}</label>
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
                                    <label className="form-label">{t('analytics.startDate')}</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={filters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">{t('analytics.endDate')}</label>
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
                                        {t('analytics.clear')}
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
                            <small>{t('analytics.totalRecords')}</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-success">{analyticsData.averageESGScore}</h3>
                            <small>{t('analytics.averageESGScore')}</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-info">{analyticsData.averageCreditAmount.toLocaleString()}</h3>
                            <small>{t('analytics.averageCreditAmount')}</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-warning">{Object.keys(analyticsData.sectorAnalytics).length}</h3>
                            <small>{t('analytics.sectorsCovered')}</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="row mt-4">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h5>{t('analytics.timeSeriesAnalysis')}</h5>
                        </div>
                        <div className="card-body">
                            <Line data={timeSeriesChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                            <h5>{t('analytics.sectorAnalysis')}</h5>
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
                            <h5>{t('analytics.sectorBreakdown')}</h5>
                            <button className="btn btn-success" onClick={exportToCSV}>
                                📥 {t('analytics.exportCSV')}
                            </button>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>{t('analytics.sector')}</th>
                                            <th>{t('analytics.records')}</th>
                                            <th>{t('analytics.avgESGScore')}</th>
                                            <th>{t('analytics.avgCreditAmount')}</th>
                                            <th>{t('analytics.totalCredit')}</th>
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
                            <h5>{t('analytics.detailedRecords')}</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>{t('analytics.csvHeaders.id')}</th>
                                            <th>{t('analytics.csvHeaders.esgScore')}</th>
                                            <th>{t('analytics.csvHeaders.sector')}</th>
                                            <th>{t('analytics.csvHeaders.projectDescription')}</th>
                                            <th>{t('analytics.csvHeaders.creditAmount')}</th>
                                            <th>{t('analytics.csvHeaders.approved')}</th>
                                            <th>{t('analytics.csvHeaders.date')}</th>
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
                                                        {record.approved ? t('analytics.csvHeaders.approved') : t('progress.pending')}
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
