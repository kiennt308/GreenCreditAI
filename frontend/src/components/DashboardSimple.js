import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardSimple = ({ user, token }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserRecords();
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

    if (loading) {
        return (
            <div className="container mt-4">
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
            <div className="container mt-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h1>Dashboard</h1>
            <p>Welcome, {user?.username}!</p>
            
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h4>Your Records</h4>
                        </div>
                        <div className="card-body">
                            {records.length === 0 ? (
                                <p>No records found.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>ESG Score</th>
                                                <th>Credit Amount</th>
                                                <th>Approved</th>
                                                <th>Project Description</th>
                                                <th>Loan Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records.map((record, index) => (
                                                <tr key={index}>
                                                    <td>{record.id}</td>
                                                    <td>{record.esgScore}</td>
                                                    <td>{record.creditAmount?.toLocaleString()}</td>
                                                    <td>
                                                        <span className={`badge ${record.approved ? 'bg-success' : 'bg-warning'}`}>
                                                            {record.approved ? 'Approved' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td>{record.projectDescription}</td>
                                                    <td>{record.loanAmount?.toLocaleString()} VND</td>
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
        </div>
    );
};

export default DashboardSimple;
