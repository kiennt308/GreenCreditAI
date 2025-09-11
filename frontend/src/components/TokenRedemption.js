// TokenRedemption.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TokenRedemption = ({ user, token }) => {
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);

  // API base (use env var in production)
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (token) fetchTokenBalance();
    // refresh if token changes
  }, [token]);

  const fetchTokenBalance = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // try common property names, fallback to 0
      const total = Number(res.data?.totalTokens ?? res.data?.total ?? 0);
      setBalance(Number.isFinite(total) ? total : 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
      // don't toast here to avoid noisy messages on mount; uncomment if you want visible error
      // toast.error('Không thể lấy số dư hiện tại');
    }
  };

  const getDiscountTiers = () => [
    { min: 1000, discount: '15% interest reduction', color: 'success' },
    { min: 500, discount: '10% interest reduction', color: 'primary' },
    { min: 100, discount: '5% interest reduction', color: 'warning' },
    { min: 1, discount: '2% interest reduction', color: 'secondary' },
  ];

  // Return the tier object or null if amount < 1
  const getTierForAmount = (amt) => {
    const amountNum = Number(amt || 0);
    if (!Number.isFinite(amountNum) || amountNum < 1) return null;
    const tiers = getDiscountTiers();
    return tiers.find((t) => amountNum >= t.min) ?? null;
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redeemAmount = parseInt(amount, 10) || 0;

      if (redeemAmount < 1) {
        toast.error('Vui lòng nhập số token hợp lệ (> 0).');
        return;
      }
      if (redeemAmount > (balance || 0)) {
        toast.error('Số token nhập vượt quá số dư hiện tại.');
        return;
      }

      // Call backend
      const res = await axios.post(
        `${API_BASE}/redeem-token`,
        { amount: String(redeemAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res?.data ?? {};

      // Normalize response into our result object (safe defaults)
      const result = {
        discount: data.discount ?? getTierForAmount(redeemAmount)?.discount ?? 'N/A',
        newBalance: Number(data.newBalance ?? Math.max(0, (balance || 0) - redeemAmount)),
        txHash: data.txHash ?? null,
        redeemAmount: redeemAmount,
        message: data.message ?? null,
      };

      setRedemptionResult(result);
      setShowModal(true);
      setAmount('');
      await fetchTokenBalance(); // refresh balance after redeem
      toast.success(data.message ?? 'Redeem thành công!');
    } catch (err) {
      console.error('Redeem error:', err);
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err.message ?? 'Redemption failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const amountNum = parseInt(amount, 10) || 0;
  const currentTier = getTierForAmount(amountNum);

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
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
                      <h3 className="text-primary">{(Number(balance) || 0).toLocaleString()} GCT</h3>
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
                    max={balance || 0}
                    required
                    disabled={(balance || 0) < 1}
                  />
                  <div className="form-text">
                    Available: {(Number(balance) || 0).toLocaleString()} GCT
                  </div>
                </div>

                {amount ? (
                  currentTier ? (
                    <div className="alert alert-info">
                      <strong>Preview:</strong> Redeeming {amountNum.toLocaleString()} tokens will give you{' '}
                      <span className={`badge bg-${currentTier.color ?? 'secondary'}`}>
                        {currentTier.discount}
                      </span>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      Số token nhập chưa đủ để nhận khuyến mãi (tối thiểu 1 token).
                    </div>
                  )
                ) : null}

                <div className="mb-4">
                  <h6>Redemption Tiers:</h6>
                  <div className="row">
                    {getDiscountTiers().map((tier, index) => (
                      <div key={index} className="col-md-3 mb-2">
                        <div className={`card border-${tier.color ?? 'secondary'}`}>
                          <div className="card-body p-2 text-center">
                            <small className="text-muted">≥{tier.min} tokens</small>
                            <div className={`badge bg-${tier.color ?? 'secondary'} w-100`}>
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
                  disabled={
                    loading ||
                    !amount ||
                    (parseInt(amount, 10) || 0) < 1 ||
                    (parseInt(amount, 10) || 0) > (balance || 0)
                  }
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    'Redeem Tokens'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Redemption Result Modal */}
      {showModal && redemptionResult && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">🎉 Redemption Successful!</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-success">
                  <h6>Your Benefits:</h6>
                  <p><strong>Discount:</strong> {redemptionResult.discount ?? 'N/A'}</p>
                  <p><strong>Loan Amount:</strong> 500,000,000 VND</p>
                  <p><strong>Interest Rate:</strong> 8.5%</p>
                  <p><strong>Valid Until:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>

                <div className="alert alert-info">
                  <h6>Transaction Details:</h6>
                  <p><strong>Amount Redeemed:</strong> {(Number(redemptionResult.redeemAmount) || 0).toLocaleString()} GCT</p>
                  <p><strong>New Balance:</strong> {(Number(redemptionResult.newBalance) || 0).toLocaleString()} GCT</p>
                  <p>
                    <strong>Transaction Hash:</strong>{' '}
                    {redemptionResult.txHash ? (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${redemptionResult.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ms-2"
                      >
                        {redemptionResult.txHash}
                      </a>
                    ) : (
                      <span className="ms-2">N/A</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowModal(false)}>
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
