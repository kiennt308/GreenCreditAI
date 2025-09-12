import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { Line } from 'react-chartjs-2';
import TokenRedemption from './TokenRedemption';
import AdminPanel from './AdminPanel';
import ProgressTracker from './ProgressTracker';
import EnhancedAnalytics from './EnhancedAnalytics';
// import {
//     Chart as ChartJS,
//     CategoryScale,
//     LinearScale,
//     PointElement,
//     LineElement,
//     Title,
//     Tooltip,
//     Legend,
// } from 'chart.js';

// ChartJS.register(
//     CategoryScale,
//     LinearScale,
//     PointElement,
//     LineElement,
//     Title,
//     Tooltip,
//     Legend
// );

const Dashboard = ({ user, token }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchUserRecords();
        // Check if user is admin
        setIsAdmin(user?.email === 'admin@greencredit.ai' || user?.username === 'admin');
    }, [user]);

    const fetchUserRecords = async () => {
        try {
            const response = await axios.get('http://localhost:3001/user-records', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRecords(response.data);
        } catch (err) {
            setError('Failed to fetch records');
            console.error('Error fetching records:', err);
        } finally {
            setLoading(false);
        }
    };

    const chartData = {
        labels: records.map((_, index) => `Record ${index + 1}`),
        datasets: [
            {
                label: 'ESG Score',
                data: records.map(record => record.esgScore),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            },
            {
                label: 'Credit Amount',
                data: records.map(record => record.creditAmount),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1
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
                text: 'ESG Score and Credit Amount Trends'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
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

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <h2>Welcome, {user?.username || 'User'}!</h2>
                    <p className="text-muted">Your GreenCredit AI Dashboard</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="row mb-4">
                <div className="col-12">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                📊 Overview
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'tokens' ? 'active' : ''}`}
                                onClick={() => setActiveTab('tokens')}
                            >
                                🪙 Token Redemption
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'progress' ? 'active' : ''}`}
                                onClick={() => setActiveTab('progress')}
                            >
                                🌱 Progress Tracker
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('analytics')}
                            >
                                📊 Analytics
                            </button>
                        </li>
                        {isAdmin && (
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('admin')}
                                >
                                    🔐 Admin Panel
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <>
                    <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>ESG Score and Credit Trends</h5>
                        </div>
                        <div className="card-body">
                            {/* <Line data={chartData} options={chartOptions} /> */}
                            <p>Chart temporarily disabled for debugging</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h5>Your Records</h5>
                        </div>
                        <div className="card-body">
                            {records.length === 0 ? (
                                <p className="text-muted">No records found. Submit an evaluation to see your data here.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Record ID</th>
                                                <th>ESG Score</th>
                                                <th>Credit Amount</th>
                                                <th>Status</th>
                                                <th>User Address</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records.map((record, index) => (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{record.esgScore}</td>
                                                    <td>{record.creditAmount}</td>
                                                    <td>
                                                        <span className={`badge ${record.approved ? 'bg-success' : 'bg-warning'}`}>
                                                            {record.approved ? 'Approved' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>{record.user}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
                </>
            )}

            {activeTab === 'tokens' && (
                <TokenRedemption user={user} token={token} />
            )}

            {activeTab === 'progress' && (
                <ProgressTracker user={user} token={token} />
            )}

            {activeTab === 'analytics' && (
                <EnhancedAnalytics user={user} token={token} />
            )}

            {activeTab === 'admin' && isAdmin && (
                <AdminPanel user={user} token={token} />
            )}
        </div>
    );
};

export default Dashboard;
