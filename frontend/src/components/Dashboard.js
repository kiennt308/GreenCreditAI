import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import TokenRedemption from './TokenRedemption';
import AdminPanel from './AdminPanel';
import ProgressTracker from './ProgressTracker';
import EnhancedAnalytics from './EnhancedAnalytics';
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
import CustomToast from './CustomToast';
import '../css/CustomToast.css';
import { BrowserProvider } from 'ethers';
import Web3 from 'web3';
import { contractABI, contractAddress } from "../config/contractConfig";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = ({ user, token }) => {
    const { t } = useTranslation();
    const [toast, setToast] = useState({ message: '', type: '', visible: false });
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [isAdmin, setIsAdmin] = useState(false);
    const [walletDetails, setWalletDetails] = useState(null);
    const [walletLoading, setWalletLoading] = useState(false);
    const [pendingTransactions, setPendingTransactions] = useState(new Set());
    const [transferForm, setTransferForm] = useState({ recipient: '', amount: '' });
    const [transferLoading, setTransferLoading] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    // Create Record form states
    const [createRecordLoading, setCreateRecordLoading] = useState(false);
    const [createRecordSuccess, setCreateRecordSuccess] = useState('');
    const [createRecordError, setCreateRecordError] = useState('');
    const [formData, setFormData] = useState({
        esgScore: '',
        creditAmount: '',
        projectDescription: '',
        loanAmount: ''
    });

    // User's wallet info
    const provider = new BrowserProvider(window.ethereum);
    const [walletInfo, setWalletInfo] = useState({
        walletAddress: '',
        secretKey: ''
    });
    const [status, setStatus] = useState('');
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);

    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            setIsMetaMaskInstalled(true);
        }
    }, []);

    useEffect(() => {
        fetchUserRecords();
        // Check if user is admin
        setIsAdmin(user?.email === 'admin@greencredit.ai' || user?.username === 'admin');
    }, [user]);

    useEffect(() => {
        fetchWalletDetails();
    }, [walletInfo.walletAddress]);

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

    const fetchUserRecords = async () => {
        try {
            const response = await axios.get('http://localhost:3001/user-records', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRecords(response.data);
        } catch (err) {
            setError(t('dashboard.error'));
            console.error('Error fetching records:', err);
        } finally {
            setLoading(false);
        }
    };

    const connectWallet = async () => {
        if (!isMetaMaskInstalled) {
            setStatus('Vui lòng cài đặt MetaMask!');
            return;
        }

        try {
            // Request user to connect Metamask wallet
            const accounts = await provider.send("eth_requestAccounts", []);

            // Get the first account
            const currentAddress = accounts[0];
            setWalletInfo({
                walletAddress: currentAddress,
                secretKey: ''
            });
            setStatus('Connect wallet successfully!');
            showToast({ message: t('dashboard.successConnectWallet'), type: 'success' });

        } catch (error) {
            console.error("Error when connect to wallet", error);
            showToast({ message: t('dashboard.errorConnectWallet'), type: 'error' });
            if (error.code === 4001) {
                setStatus('User rejected the connection request.');
            } else {
                setStatus('Error connecting to wallet.');
            }
        }
    };

    const fetchWalletDetails = async () => {
        setWalletLoading(true);
        try {
            const response = await axios.post('http://localhost:3001/wallet-details', walletInfo, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log("🚀 ~ fetchWalletDetails ~ response:", response)
            setWalletDetails(response.data);
        } catch (err) {
            console.error('Error fetching wallet details:', err);
        } finally {
            setWalletLoading(false);
        }
    };

    const handleCreateRecord = async (e) => {
        e.preventDefault();
        setCreateRecordLoading(true);

        try {
            const recordPayload = {
                esgScore: parseInt(formData.esgScore, 10) || 0,
                creditAmount: parseInt(formData.creditAmount, 10) || 0,
                projectDescription: formData.projectDescription?.trim() || 'ESG Project',
                loanAmount: parseInt(formData.loanAmount, 10) || parseInt(formData.creditAmount, 10) || 0,
            };

            // Validate input
            if (recordPayload.esgScore <= 0 || recordPayload.creditAmount <= 0) {
                showToast({ message: t('dashboard.invalidRecordFields'), type: 'error' });
                return;
            }

            const res = await axios.post(
                `http://localhost:3001/create-record`,
                recordPayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = res?.data ?? {};

            // Normalize response
            const result = {
                success: data.success ?? false,
                recordId: data.recordId ?? 'unknown',
                txHash: data.txHash ?? null,
                status: data.status ?? 'pending',
                message: data.message ?? t('dashboard.recordCreatedSuccess'),
                esgScore: recordPayload.esgScore,
                creditAmount: recordPayload.creditAmount,
                projectDescription: recordPayload.projectDescription,
                loanAmount: recordPayload.loanAmount,
            };

            // Add to pending transactions if available
            if (result.txHash) {
                setPendingTransactions((prev) => new Set([...prev, result.txHash]));
                // Poll for confirmation
                pollTransactionStatus(result.txHash);
            }

            // Update UI
            setCreateRecordSuccess(`${result.message} - ${t('dashboard.pendingConfirmation')}`);
            setFormData({ esgScore: '', creditAmount: '', projectDescription: '', loanAmount: '' });
            await fetchUserRecords();
            showToast({ message: result.message, type: 'success' });

        } catch (err) {
            console.error('Error creating record:', err);
            const msg = err?.response?.data?.error ?? err.message ?? t('dashboard.recordCreateError');
            setCreateRecordError(msg);
            showToast({ message: msg, type: 'error' });
        } finally {
            setCreateRecordLoading(false);
        }
    };

    const pollTransactionStatus = async (txHash) => {
        const maxAttempts = 30; // Poll for up to 5 minutes (10s intervals)
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/transaction-status/${txHash}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.status === 'confirmed') {
                    // Remove from pending transactions
                    setPendingTransactions(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(txHash);
                        return newSet;
                    });

                    // Refresh records and wallet details
                    await fetchUserRecords();
                    await fetchWalletDetails();

                    console.log('Transaction confirmed:', txHash);
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 10000); // Poll every 10 seconds
                } else {
                    console.log('Polling timeout for transaction:', txHash);
                    // Remove from pending after timeout
                    setPendingTransactions(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(txHash);
                        return newSet;
                    });
                }
            } catch (err) {
                console.error('Error polling transaction status:', err);
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 10000);
                }
            }
        };

        // Start polling after 5 seconds
        setTimeout(poll, 5000);
    };

    const handleTransferTokens = async (e) => {
        e.preventDefault();
        setTransferLoading(true);

        try {
            if (!window.ethereum) {
                throw new Error("No crypto wallet found. Please install MetaMask.");
            }

            // Switch to Sepolia (chainId: 11155111 → 0xaa36a7)
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0xaa36a7" }],
            });

            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.requestAccounts();
            const userAddress = accounts[0];

            const contract = new web3.eth.Contract(contractABI, contractAddress);

            // Transaction use gas by SepoliaETH
            const tx = await contract.methods
                .transfer(transferForm.recipient, transferForm.amount)
                .send({ from: userAddress });

            console.log("Transaction receipt:", tx);

            // Send txHash back to backend
            await axios.post(
                "http://localhost:3001/transfer-tokens",
                {
                    recipient: transferForm.recipient,
                    amount: transferForm.amount,
                    txHash: tx.transactionHash,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setTransferForm({ recipient: "", amount: "" });
            setShowTransferModal(false);
            await fetchWalletDetails();

            setCreateRecordSuccess("Tokens transferred successfully on Sepolia!");
        } catch (err) {
            console.error("Error transferring tokens:", err);
            setCreateRecordError(err.message || "Transfer failed");
        } finally {
            setTransferLoading(false);
        }
    };

    const handleTransferInputChange = (e) => {
        const { name, value } = e.target;
        setTransferForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                        <span className="visually-hidden">{t('common.loading')}</span>
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
                    <h2>{t('dashboard.welcomeMessage', { username: user?.username || 'User' })}</h2>
                    <p className="text-muted">{t('dashboard.subtitle')}</p>
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
                                📊 {t('navigation.overview')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'wallet' ? 'active' : ''}`}
                                onClick={() => setActiveTab('wallet')}
                            >
                                💳 {t('navigation.wallet')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'tokens' ? 'active' : ''}`}
                                onClick={() => setActiveTab('tokens')}
                            >
                                🪙 {t('navigation.tokens')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'progress' ? 'active' : ''}`}
                                onClick={() => setActiveTab('progress')}
                            >
                                🌱 {t('navigation.progress')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('analytics')}
                            >
                                📊 {t('navigation.analytics')}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
                                onClick={() => setActiveTab('create')}
                            >
                                ➕ {t('navigation.createRecord')}
                            </button>
                        </li>
                        {isAdmin && (
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('admin')}
                                >
                                    🔐 {t('navigation.admin')}
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
                                    <h5>{t('dashboard.esgScoreTrends')}</h5>
                                </div>
                                <div className="card-body">
                                    <Line data={chartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h5>{t('dashboard.yourRecords')}</h5>
                                    </div>
                                    <div className="card-body">
                                        {records.length === 0 ? (
                                            <p className="text-muted">{t('dashboard.noRecords')}</p>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-striped">
                                                    <thead>
                                                        <tr>
                                                            <th>{t('dashboard.recordId')}</th>
                                                            <th>{t('dashboard.esgScore')}</th>
                                                            <th>{t('dashboard.creditAmount')}</th>
                                                            <th>{t('dashboard.status')}</th>
                                                            <th>{t('dashboard.userAddress')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {records.map((record, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{record.esgScore}</td>
                                                                <td>{record.creditAmount}</td>
                                                                <td>
                                                                    {pendingTransactions.has(record.txHash) ? (
                                                                        <span className="badge bg-info d-flex align-items-center">
                                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                            {t('dashboard.confirming')}
                                                                        </span>
                                                                    ) : (
                                                                        <span className={`badge ${record.approved ? 'bg-success' : 'bg-warning'}`}>
                                                                            {record.approved ? t('dashboard.approved') : t('dashboard.pending')}
                                                                        </span>
                                                                    )}
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
                    )}
                </>
            )}

            {activeTab === 'wallet' && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5>💳 {t('dashboard.walletDetails')}</h5>
                                <div>
                                    <button
                                        className="btn btn-outline-success btn-sm me-2"
                                        onClick={() => setShowTransferModal(true)}
                                    >
                                        💸 Transfer Tokens
                                    </button>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={fetchWalletDetails}
                                        disabled={walletLoading}
                                    >
                                        {walletLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                {t('common.loading')}
                                            </>
                                        ) : (
                                            '🔄 Refresh'
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                {walletDetails ? (
                                    <>
                                        {/* Wallet Balance Cards */}
                                        <div className="row mb-4">
                                            <div className="col-md-4">
                                                <div className="card bg-primary text-white">
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title">{t('dashboard.currentBalance')}</h5>
                                                        <h3>{(walletDetails.balance || 0).toLocaleString()} GCT</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="card bg-success text-white">
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title">{t('dashboard.totalRecords')}</h5>
                                                        <h3>{walletDetails.totalRecords || 0}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="card bg-warning text-white">
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title">{t('dashboard.redeemedAmount')}</h5>
                                                        <h3>{(walletDetails.redeemedAmount || 0).toLocaleString()} GCT</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Transaction History */}
                                        <div className="row">
                                            <div className="col-12">
                                                <h6>{t('dashboard.transactionHistory')}</h6>
                                                {walletDetails.transactionHistory && walletDetails.transactionHistory.length > 0 ? (
                                                    <div className="table-responsive">
                                                        <table className="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th>{t('dashboard.type')}</th>
                                                                    <th>{t('dashboard.amount')}</th>
                                                                    <th>{t('dashboard.description')}</th>
                                                                    <th>{t('dashboard.esgScore')}</th>
                                                                    <th>{t('dashboard.status')}</th>
                                                                    <th>{t('dashboard.date')}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {walletDetails.transactionHistory.map((tx, index) => (
                                                                    <tr key={index}>
                                                                        <td>
                                                                            <span className="badge bg-primary">
                                                                                {tx.type === 'record_created' ? 'Record Created' : tx.type}
                                                                            </span>
                                                                        </td>
                                                                        <td>{(tx.amount || 0).toLocaleString()} GCT</td>
                                                                        <td>
                                                                            <small>{tx.description || 'N/A'}</small>
                                                                        </td>
                                                                        <td>
                                                                            <span className={`badge ${tx.esgScore >= 70 ? 'bg-success' : 'bg-warning'}`}>
                                                                                {tx.esgScore || 'N/A'}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <span className={`badge ${tx.status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                                                                                {tx.status === 'approved' ? t('dashboard.approved') : t('dashboard.pending')}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <small>
                                                                                {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString() : 'N/A'}
                                                                            </small>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted">{t('dashboard.noTransactions')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='mb-3'>
                                            {t('dashboard.errorConnectWallet')}
                                        </div>
                                        <div>
                                            {walletInfo?.walletAddress ? (
                                                <>
                                                    <p><b>Connected!</b></p>
                                                    <p>Wallet Address: {walletInfo?.walletAddress.slice(0, 6)}...{walletInfo?.walletAddress.slice(-4)}</p>
                                                </>
                                            ) : (
                                                <button onClick={connectWallet} disabled={!isMetaMaskInstalled}>
                                                    {isMetaMaskInstalled ? 'Connect with MetaMask' : 'MetaMask not installed'}
                                                </button>
                                            )}
                                            <p>{status}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tokens' && (
                <TokenRedemption user={user} token={token} walletInfo={walletInfo} provider={provider} />
            )}

            {activeTab === 'progress' && (
                <ProgressTracker user={user} token={token} />
            )}

            {activeTab === 'analytics' && (
                <EnhancedAnalytics user={user} token={token} />
            )}

            {activeTab === 'create' && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h4 className="mb-0">➕ {t('dashboard.createRecord')}</h4>
                                <p className="text-muted mb-0">{t('dashboard.createRecordSubtitle')}</p>
                            </div>
                            <div className="card-body">
                                {createRecordSuccess && (
                                    <div className="alert alert-success" role="alert">
                                        {createRecordSuccess}
                                    </div>
                                )}

                                {createRecordError && (
                                    <div className="alert alert-danger" role="alert">
                                        {createRecordError}
                                    </div>
                                )}

                                <form onSubmit={handleCreateRecord}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="esgScore" className="form-label">
                                                {t('dashboard.esgScore')} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="esgScore"
                                                name="esgScore"
                                                value={formData.esgScore}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="100"
                                                required
                                                placeholder={t('dashboard.esgScorePlaceholder')}
                                            />
                                            <div className="form-text">{t('dashboard.esgScoreHelp')}</div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="creditAmount" className="form-label">
                                                {t('dashboard.creditAmount')} <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="creditAmount"
                                                name="creditAmount"
                                                value={formData.creditAmount}
                                                onChange={handleInputChange}
                                                min="0"
                                                required
                                                placeholder={t('dashboard.creditAmountPlaceholder')}
                                            />
                                            <div className="form-text">{t('dashboard.creditAmountHelp')}</div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="projectDescription" className="form-label">
                                                {t('dashboard.projectDescription')}
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="projectDescription"
                                                name="projectDescription"
                                                value={formData.projectDescription}
                                                onChange={handleInputChange}
                                                placeholder={t('dashboard.projectDescriptionPlaceholder')}
                                            />
                                            <div className="form-text">{t('dashboard.projectDescriptionHelp')}</div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="loanAmount" className="form-label">
                                                {t('dashboard.loanAmount')}
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="loanAmount"
                                                name="loanAmount"
                                                value={formData.loanAmount}
                                                onChange={handleInputChange}
                                                min="0"
                                                placeholder={t('dashboard.loanAmountPlaceholder')}
                                            />
                                            <div className="form-text">{t('dashboard.loanAmountHelp')}</div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-12">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={createRecordLoading || !formData.esgScore || !formData.creditAmount}
                                            >
                                                {createRecordLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        {t('dashboard.creatingRecord')}
                                                    </>
                                                ) : (
                                                    <>
                                                        ➕ {t('dashboard.createRecordButton')}
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

            {activeTab === 'admin' && isAdmin && (
                <AdminPanel user={user} token={token} />
            )}

            {/* Transfer Tokens Modal */}
            {showTransferModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">💸 Transfer Tokens</h5>
                                <button type="button" className="btn-close" onClick={() => setShowTransferModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleTransferTokens}>
                                    <div className="mb-3">
                                        <label htmlFor="transferRecipient" className="form-label">
                                            Recipient Address <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="transferRecipient"
                                            name="recipient"
                                            value={transferForm.recipient}
                                            onChange={handleTransferInputChange}
                                            placeholder="0x..."
                                            required
                                        />
                                        <div className="form-text">Ethereum address to receive tokens</div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="transferAmount" className="form-label">
                                            Amount (GCT) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="transferAmount"
                                            name="amount"
                                            value={transferForm.amount}
                                            onChange={handleTransferInputChange}
                                            min="1"
                                            step="1"
                                            placeholder="100"
                                            required
                                        />
                                        <div className="form-text">
                                            Available: {(walletDetails?.balance || 0).toLocaleString()} GCT
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowTransferModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleTransferTokens}
                                    disabled={transferLoading || !transferForm.recipient || !transferForm.amount}
                                >
                                    {transferLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Transferring...
                                        </>
                                    ) : (
                                        '💸 Transfer Tokens'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
