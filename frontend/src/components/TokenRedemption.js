import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TokenRedemption = ({ user, token }) => {
    const [amount, setAmount] = useState('');
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [redemptionResult, setRedemptionResult] = useState(null);

    useEffect(() => {
        fetchTokenBalance();
    }, []);

    const fetchTokenBalance = async () => {
        try {
            const response = await axios.get('http://localhost:3001/user-stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBalance(response.data.totalTokens);
        } catch (err) {
            console.error('Error fetching balance:', err);
        }
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/redeem-token', {
                amount: amount
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setRedemptionResult(response.data);
            setShowModal(true);
            setAmount('');
            fetchTokenBalance(); // Refresh balance
            toast.success('Tokens redeemed successfully!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Redemption failed');
        } finally {
            setLoading(false);
        }
    };

    const getDiscountTiers = () => {
        return [
            { min: 1000, discount: '15% interest reduction', color: 'success' },
            { min: 500, discount: '10% interest reduction', color: 'primary' },
            { min: 100, discount: '5% interest reduction', color: 'warning' },
            { min: 1, discount: '2% interest reduction', color: 'secondary' }
        ];
    };

    const getCurrentTier = () => {
        const tiers = getDiscountTiers();
        const amountNum = parseInt(amount) || 0;
        return tiers.find(tier => amountNum >= tier.min) || tiers[tiers.length - 1];
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="mb-0">🪙 Token Redemption</h4>
                            <p className="text-muted mb-0">Redeem your GreenCredit tokens for bank loan benefits</p>
                        </div>
                        <div className="card-body">
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h5 className="card-title">Current Balance</h5>
                                            <h3 className="text-primary">{balance.toLocaleString()} GCT</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h5 className="card-title">Available for HDBank</h5>
                                            <h3 className="text-success">500M VND Loan</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleRedeem}>
                                <div className="mb-3">
                                    <label htmlFor="amount" className="form-label">Amount to Redeem</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="1"
                                        max={balance}
                                        required
                                    />
                                    <div className="form-text">
                                        Available: {balance.toLocaleString()} GCT
                                    </div>
                                </div>

                                {amount && (
                                    <div className="alert alert-info">
                                        <strong>Preview:</strong> Redeeming {parseInt(amount).toLocaleString()} tokens will give you{' '}
                                        <span className={`badge bg-${getCurrentTier().color}`}>
                                            {getCurrentTier().discount}
                                        </span>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h6>Redemption Tiers:</h6>
                                    <div className="row">
                                        {getDiscountTiers().map((tier, index) => (
                                            <div key={index} className="col-md-3 mb-2">
                                                <div className={`card border-${tier.color}`}>
                                                    <div className="card-body p-2 text-center">
                                                        <small className="text-muted">≥{tier.min} tokens</small>
                                                        <div className={`badge bg-${tier.color} w-100`}>
                                                            {tier.discount}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                    disabled={loading || !amount || parseInt(amount) > balance}
                                >
                                    {loading ? 'Processing...' : 'Redeem Tokens'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Redemption Result Modal */}
            {showModal && redemptionResult && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">🎉 Redemption Successful!</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-success">
                                    <h6>Your Benefits:</h6>
                                    <p><strong>Discount:</strong> {redemptionResult.discount}</p>
                                    <p><strong>Loan Amount:</strong> 500,000,000 VND</p>
                                    <p><strong>Interest Rate:</strong> 8.5%</p>
                                    <p><strong>Valid Until:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                                </div>
                                <div className="alert alert-info">
                                    <h6>Transaction Details:</h6>
                                    <p><strong>Amount Redeemed:</strong> {parseInt(amount).toLocaleString()} GCT</p>
                                    <p><strong>New Balance:</strong> {redemptionResult.newBalance.toLocaleString()} GCT</p>
                                    <p><strong>Transaction Hash:</strong> 
                                        <a 
                                            href={`https://sepolia.etherscan.io/tx/${redemptionResult.txHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ms-2"
                                        >
                                            {redemptionResult.txHash}
                                        </a>
                                    </p>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TokenRedemption;
