import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            setError(t('progress.fetchError'));
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

    if (!progressData || !progressData.records || progressData.records.length === 0) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <h4>{t('progress.noData')}</h4>
                    <p className="text-muted">{t('progress.submitEvaluations')}</p>
                </div>
            </div>
        );
    }

    const chartData = {
        labels: progressData?.trends?.records?.map(r => r.x) || [],
        datasets: [
            {
                label: t('progress.esgScore'),
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
                text: t('progress.chartTitle')
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
                    <h2>🌱 {t('progress.title')}</h2>
                    <p className="text-muted">{t('progress.subtitle')}</p>
                </div>
            </div>

            {/* Progress Metrics */}
            <div className="row mt-4">
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-primary">{progressData?.averageESGScore || 0}</h3>
                            <small>{t('progress.averageESGScore')}</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className={`text-${getTrendColor(progressData?.trends?.trendDirection || 'stable')}`}>
                                {getTrendIcon(progressData?.trends?.trendDirection || 'stable')} {progressData?.trends?.esgImprovement || 0}
                            </h3>
                            <small>{t('progress.esgImprovement')}</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-success">{progressData?.trends?.carbonReduction || 0}</h3>
                            <small>{t('progress.carbonReduction')}</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-light">
                        <div className="card-body text-center">
                            <h3 className="text-info">{progressData?.trends?.sustainabilityScore || 0}</h3>
                            <small>{t('progress.sustainabilityScore')}</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Chart */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>{t('progress.trendAnalysis')}</h5>
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
                            <h5>{t('progress.recentRecords')}</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>{t('progress.date')}</th>
                                            <th>{t('progress.esgScore')}</th>
                                            <th>{t('progress.project')}</th>
                                            <th>{t('progress.loanAmount')}</th>
                                            <th>{t('progress.status')}</th>
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
                                                <td>{record.loanAmount?.toLocaleString()} VND</td>
                                                <td>
                                                    <span className={`badge ${record.approved ? 'bg-success' : 'bg-warning'}`}>
                                                        {record.approved ? t('progress.approved') : t('progress.pending')}
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
                            <h5>💡 {t('progress.insights')}</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6>{t('progress.environmentalImpact')}</h6>
                                    <p className="text-muted">
                                        {t('progress.carbonReductionText', { tons: progressData?.trends?.carbonReduction || 0 })}
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <h6>{t('progress.trendAnalysis')}</h6>
                                    <p className="text-muted">
                                        {t('progress.trendText', { 
                                            trend: progressData?.trends?.trendDirection || 'stable',
                                            points: progressData?.trends?.esgImprovement || 0 
                                        })}
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
