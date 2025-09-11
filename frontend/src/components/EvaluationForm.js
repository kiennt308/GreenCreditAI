import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';

const EvaluationForm = ({ user, token }) => {
    const [revenue, setRevenue] = useState('');
    const [emissions, setEmissions] = useState('');
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
            toast.success(`Transaction confirmed! ESG Score: ${data.esgScore}, TX Hash: ${data.txHash}`);
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
                emissions: parseFloat(finalEmissions)
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
                                    <div className="alert alert-success" role="alert">
                                        <h5>Evaluation Results</h5>
                                        <p><strong>ESG Score:</strong> {result.esgScore}</p>
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
