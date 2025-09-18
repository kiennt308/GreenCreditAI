import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomToast from './CustomToast';
import '../css/CustomToast.css';

const AdminPanel = ({ user, token }) => {
    const [pendingRecords, setPendingRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '', visible: false });
    
    // Token minting states
    const [mintForm, setMintForm] = useState({ recipient: '', amount: '' });
    const [mintLoading, setMintLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('approvals');

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const showToast = ({ message, type }) => {
        setToast({ message, type, visible: true });

        // Hide after 3 seconds
        setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, 3000);
    };

    const closeToast = () => {
        setToast({ ...toast, visible: false });
    };

    const fetchPendingApprovals = async () => {
        try {
            const response = await axios.get('http://localhost:3001/pending-approvals', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setPendingRecords(response.data);
        } catch (err) {
            if (err.response?.status === 403) {
                showToast({ message: 'Admin access required', type: 'error'});
            } else {
                showToast({ message: 'Failed to fetch pending approvals', type: 'error'});
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (recordId, finalLoanAmount, adminNotes) => {
        setApproving(recordId);
        try {
            const response = await axios.post('http://localhost:3001/approve-credit', {
                recordId: recordId.toLocaleString(),
                finalLoanAmount: finalLoanAmount,
                adminNotes: adminNotes
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            showToast({ message: 'Credit approved successfully!', type: 'success'});
            fetchPendingApprovals(); // Refresh the list
        } catch (err) {
            showToast({ message: err.response?.data?.error || 'Approval failed', type: 'error'});
        } finally {
            setApproving(null);
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(parseInt(timestamp) * 1000).toLocaleString();
    };

    const formatVND = (amount) => {
        return parseInt(amount).toLocaleString() + ' VND';
    };

    const handleMintTokens = async (e) => {
        e.preventDefault();
        setMintLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/mint-tokens', {
                recipient: mintForm.recipient,
                amount: mintForm.amount
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            showToast({ message: 'Tokens minted successfully!', type: 'success' });
            setMintForm({ recipient: '', amount: '' });
        } catch (err) {
            showToast({ message: err.response?.data?.error || 'Minting failed', type: 'error' });
        } finally {
            setMintLoading(false);
        }
    };

    const handleMintInputChange = (e) => {
        const { name, value } = e.target;
        setMintForm(prev => ({
            ...prev,
            [name]: value
        }));
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
            {toast.visible && (
                <CustomToast message={toast.message} type={toast.type} onClose={closeToast} />
            )}
            <div className="row">
                <div className="col-12">
                    <h2>🔐 Admin Panel</h2>
                    <p className="text-muted">Administrative controls and monitoring</p>
                </div>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="row mb-4">
                <div className="col-12">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'approvals' ? 'active' : ''}`}
                                onClick={() => setActiveTab('approvals')}
                            >
                                📋 Credit Approvals
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${activeTab === 'minting' ? 'active' : ''}`}
                                onClick={() => setActiveTab('minting')}
                            >
                                🪙 Token Minting
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'approvals' && (
                <>
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">Pending Approvals ({pendingRecords.length})</h5>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={fetchPendingApprovals}
                                    >
                                        Refresh
                                    </button>
                                </div>
                                <div className="card-body">
                                    {pendingRecords.length === 0 ? (
                                        <div className="text-center py-4">
                                            <p className="text-muted">No pending approvals</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>User</th>
                                                        <th>ESG Score</th>
                                                        <th>Project Description</th>
                                                        <th>Loan Amount</th>
                                                        <th>Credit Amount</th>
                                                        <th>Submitted</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingRecords.map((record) => (
                                                        <tr key={record.id}>
                                                            <td>{record.id}</td>
                                                            <td>
                                                                <code>{record.user.slice(0, 10)}...</code>
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
                                                            <td>{formatVND(record.loanAmount)}</td>
                                                            <td>{formatVND(record.creditAmount)}</td>
                                                            <td>
                                                                <small>{formatTimestamp(record.timestamp)}</small>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() => handleApprove(record.id, record.loanAmount, 'Approved by admin')}
                                                                    disabled={approving === record.id}
                                                                >
                                                                    {approving === record.id ? 'Approving...' : 'Approve'}
                                                                </button>
                                                            </td>
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

                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h5>📊 Approval Statistics</h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="card bg-light">
                                                <div className="card-body text-center">
                                                    <h5 className="text-primary">{pendingRecords.length}</h5>
                                                    <small>Pending Reviews</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-light">
                                                <div className="card-body text-center">
                                                    <h5 className="text-success">
                                                        {pendingRecords.filter(r => r.esgScore >= 70).length}
                                                    </h5>
                                                    <small>High ESG Score</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-light">
                                                <div className="card-body text-center">
                                                    <h5 className="text-warning">
                                                        {pendingRecords.filter(r => r.esgScore < 70).length}
                                                    </h5>
                                                    <small>Low ESG Score</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-light">
                                                <div className="card-body text-center">
                                                    <h5 className="text-info">
                                                        {pendingRecords.reduce((sum, r) => sum + parseInt(r.loanAmount), 0).toLocaleString()}
                                                    </h5>
                                                    <small>Total VND Requested</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'minting' && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5>🪙 Token Minting</h5>
                                <p className="text-muted mb-0">Mint new GreenCredit tokens for users</p>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleMintTokens}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="recipient" className="form-label">
                                                Recipient Address <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="recipient"
                                                name="recipient"
                                                value={mintForm.recipient}
                                                onChange={handleMintInputChange}
                                                placeholder="0x..."
                                                required
                                            />
                                            <div className="form-text">Ethereum address to receive tokens</div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="amount" className="form-label">
                                                Amount (GCT) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="amount"
                                                name="amount"
                                                value={mintForm.amount}
                                                onChange={handleMintInputChange}
                                                min="1"
                                                step="1"
                                                placeholder="1000"
                                                required
                                            />
                                            <div className="form-text">Number of tokens to mint</div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-12">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={mintLoading || !mintForm.recipient || !mintForm.amount}
                                            >
                                                {mintLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Minting...
                                                    </>
                                                ) : (
                                                    <>
                                                        🪙 Mint Tokens
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
