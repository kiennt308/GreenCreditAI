import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ProgressTracker = ({ user, token }) => {
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProgressData();
    }, []);

    const fetchProgressData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/progress-tracker', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProgressData(response.data);
        } catch (err) {
            setError('Failed to fetch progress data');
            console.error('Error fetching progress data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (direction) => {
        switch (direction) {
            case 'improving': return '📈';
            case 'declining': return '📉';
            default: return '➡️';
        }
    };

    const getTrendColor = (direction) => {
        switch (direction) {
            case 'improving': return 'success';
            case 'declining': return 'danger';
            default: return 'secondary';
        }
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

    if (!progressData || !progressData.records || progressData.records.length === 0) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <h4>No Progress Data Available</h4>
                    <p className="text-muted">Submit some evaluations to see your sustainability progress.</p>
                </div>
            </div>
        );
    }

    const chartData = {
        labels: progressData?.trends?.records?.map(r => r.x) || [],
        datasets: [
            {
                label: 'ESG Score',
                data: progressData?.trends?.records?.map(r => r.y) || [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: true
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
                text: 'ESG Score Progress Over Time'
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
                    <h2>🌱 Sustainability Progress Tracker</h2>
                    <p className="text-muted">Track your environmental impact and ESG improvements over time</p>
                </div>
            </div>

            {/* Progress Metrics */}
            <div className="row mt-4">
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-primary">{progressData?.averageESGScore || 0}</h3>
                            <small>Average ESG Score</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className={`text-${getTrendColor(progressData?.trends?.trendDirection || 'stable')}`}>
                                {getTrendIcon(progressData?.trends?.trendDirection || 'stable')} {progressData?.trends?.esgImprovement || 0}
                            </h3>
                            <small>ESG Improvement</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-success">{progressData?.trends?.carbonReduction || 0}</h3>
                            <small>Carbon Reduction (tons)</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-info">{progressData?.trends?.sustainabilityScore || 0}</h3>
                            <small>Sustainability Score</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Chart */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>ESG Score Trend Analysis</h5>
                        </div>
                        <div className="card-body">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Records */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>Recent Sustainability Records</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>ESG Score</th>
                                            <th>Project</th>
                                            <th>Loan Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(progressData?.records || []).slice(-10).reverse().map((record) => (
                                            <tr key={record.id}>
                                                <td>
                                                    {new Date(record.timestamp * 1000).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <span className={`badge ${record.esgScore >= 70 ? 'bg-success' : 'bg-warning'}`}>
                                                        {record.esgScore}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ maxWidth: '200px' }}>
                                                        <small>{record.projectDescription}</small>
                                                    </div>
                                                </td>
                                                <td>{record.loanAmount.toLocaleString()} VND</td>
                                                <td>
                                                    <span className={`badge ${record.approved ? 'bg-success' : 'bg-warning'}`}>
                                                        {record.approved ? 'Approved' : 'Pending'}
                                                    </span>
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

            {/* Sustainability Insights */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>💡 Sustainability Insights</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6>Environmental Impact</h6>
                                    <p className="text-muted">
                                        Your ESG improvements have resulted in an estimated{' '}
                                        <strong>{progressData?.trends?.carbonReduction || 0} tons</strong> of carbon reduction.
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <h6>Trend Analysis</h6>
                                    <p className="text-muted">
                                        Your sustainability trend is{' '}
                                        <span className={`text-${getTrendColor(progressData?.trends?.trendDirection || 'stable')}`}>
                                            {progressData?.trends?.trendDirection || 'stable'}
                                        </span>
                                        {' '}with an ESG score change of{' '}
                                        <strong>{progressData?.trends?.esgImprovement || 0} points</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;
