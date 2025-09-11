import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const EvaluationForm = ({ user, token }) => {
    const [revenue, setRevenue] = useState('');
    const [emissions, setEmissions] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [loanAmount, setLoanAmount] = useState('500000000');
    const [autoFetch, setAutoFetch] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Set up socket connection
        const newSocket = io('http://localhost:3001');
        setSocket(newSocket);

        newSocket.on('transactionUpdate', (data) => {
            const status = data.approved ? 'APPROVED' : 'PENDING REVIEW';
            toast.success(`Transaction confirmed! ESG Score: ${data.esgScore}, Status: ${status}`);
        });

        newSocket.on('creditApproved', (data) => {
            toast.success(`Credit approved! Loan Amount: ${data.finalLoanAmount.toLocaleString()} VND`);
        });

        return () => newSocket.close();
    }, []);

    const fetchESGData = async () => {
        try {
            const response = await axios.get('https://api.worldbank.org/v2/country/VN/indicator/EN.ATM.CO2E.KT?format=json');
            const data = response.data[1];
            
            if (data && data.length > 0) {
                // Get the most recent data
                const latestData = data[0];
                setEmissions(latestData.value ? latestData.value.toString() : '');
                toast.info('ESG data fetched from World Bank API');
            } else {
                toast.warning('No ESG data available from World Bank API');
            }
        } catch (err) {
            toast.error('Failed to fetch ESG data from World Bank API');
            console.error('Error fetching ESG data:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let finalEmissions = emissions;
            
            // Auto-fetch ESG data if requested
            if (autoFetch) {
                await fetchESGData();
                // Use the fetched data
                finalEmissions = emissions;
            }

            const res = await axios.post('http://localhost:3001/evaluate', {
                revenue: parseFloat(revenue),
                emissions: parseFloat(finalEmissions),
                projectDescription: projectDescription,
                loanAmount: parseInt(loanAmount)
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setResult(res.data);
            toast.success('ESG evaluation completed successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error: ' + err.message;
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-center">GreenCredit AI Evaluation</h3>
                            <p className="text-center text-muted">Submit your company data for ESG scoring and blockchain storage</p>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="revenue" className="form-label">Revenue (USD)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="revenue"
                                        value={revenue}
                                        onChange={(e) => setRevenue(e.target.value)}
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="emissions" className="form-label">CO2 Emissions (metric tons)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="emissions"
                                        value={emissions}
                                        onChange={(e) => setEmissions(e.target.value)}
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="projectDescription" className="form-label">Project Description</label>
                                    <textarea
                                        className="form-control"
                                        id="projectDescription"
                                        value={projectDescription}
                                        onChange={(e) => setProjectDescription(e.target.value)}
                                        rows="3"
                                        placeholder="Describe your sustainable project (e.g., irrigation system, renewable energy, etc.)"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="loanAmount" className="form-label">Loan Amount (VND)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="loanAmount"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(e.target.value)}
                                        min="1000000"
                                        step="1000000"
                                    />
                                    <div className="form-text">Minimum: 1,000,000 VND</div>
                                </div>
                                <div className="mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="autoFetch"
                                        checked={autoFetch}
                                        onChange={(e) => setAutoFetch(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="autoFetch">
                                        Auto-fetch ESG data from World Bank API
                                    </label>
                                </div>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                    disabled={loading}
                                >
                                    {loading ? 'Evaluating...' : 'Evaluate ESG and Submit to Blockchain'}
                                </button>
                            </form>
                            
                            {result && (
                                <div className="mt-4">
                                    <div className={`alert ${result.approved ? 'alert-success' : 'alert-warning'}`} role="alert">
                                        <h5>Evaluation Results</h5>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <p><strong>ESG Score:</strong> {result.esgScore}</p>
                                                <p><strong>Status:</strong> 
                                                    <span className={`badge ${result.approved ? 'bg-success' : 'bg-warning'} ms-2`}>
                                                        {result.approved ? 'APPROVED' : 'PENDING REVIEW'}
                                                    </span>
                                                </p>
                                                <p><strong>Interest Rate:</strong> {result.interestRate}%</p>
                                            </div>
                                            <div className="col-md-6">
                                                <p><strong>Loan Amount:</strong> {result.loanAmount.toLocaleString()} VND</p>
                                                <p><strong>Credit Amount:</strong> {result.creditAmount.toLocaleString()} VND</p>
                                                <p><strong>Project:</strong> {result.projectDescription}</p>
                                            </div>
                                        </div>
                                        <hr />
                                        <p><strong>Transaction Hash:</strong> 
                                            <a 
                                                href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ms-2"
                                            >
                                                {result.txHash}
                                            </a>
                                        </p>
                                        {!result.approved && (
                                            <div className="alert alert-info mt-2">
                                                <small>Your application is pending admin review. You will be notified when a decision is made.</small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationForm;
