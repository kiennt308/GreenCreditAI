// TokenRedemption.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';

const TokenRedemption = ({ user, token }) => {
  const { t } = useTranslation();
  
  // Token redemption states
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState(null);
  
  // ESG evaluation states
  const [revenue, setRevenue] = useState('');
  const [emissions, setEmissions] = useState('');
  const [esgScore, setEsgScore] = useState(null);
  const [esgLoading, setEsgLoading] = useState(false);
  const [esgError, setEsgError] = useState('');
  const [showEsgResult, setShowEsgResult] = useState(false);

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

  // ESG Evaluation function
  const handleEsgEvaluation = async (e) => {
    e.preventDefault();
    setEsgLoading(true);
    setEsgError('');
    setEsgScore(null);
    setShowEsgResult(false);

    try {
      // Validate input
      if (!revenue || !emissions) {
        setEsgError(t('tokens.esgValidationError'));
        return;
      }

      const revenueNum = parseFloat(revenue);
      const emissionsNum = parseFloat(emissions);

      if (isNaN(revenueNum) || isNaN(emissionsNum) || revenueNum <= 0 || emissionsNum < 0) {
        setEsgError(t('tokens.esgInvalidInput'));
        return;
      }

      // Call ESG evaluation API
      const response = await axios.post(
        `${API_BASE}/evaluate`,
        { 
          revenue: revenueNum, 
          emissions: emissionsNum 
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      const { result, error } = response.data;
      
      if (error) {
        setEsgError(error);
        return;
      }

      const score = parseFloat(result);
      if (isNaN(score)) {
        setEsgError(t('tokens.esgInvalidResponse'));
        return;
      }

      setEsgScore(score);
      setShowEsgResult(true);
      
      // Show success message
      toast.success(t('tokens.esgEvaluationSuccess', { score: score.toFixed(2) }));

    } catch (err) {
      console.error('ESG evaluation error:', err);
      const errorMsg = err?.response?.data?.error || err?.message || t('tokens.esgEvaluationError');
      setEsgError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setEsgLoading(false);
    }
  };

  const getDiscountTiers = () => [
    { min: 1000, discount: t('tokens.tier15'), color: 'success' },
    { min: 500, discount: t('tokens.tier10'), color: 'primary' },
    { min: 100, discount: t('tokens.tier5'), color: 'warning' },
    { min: 1, discount: t('tokens.tier2'), color: 'secondary' },
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
        toast.error(t('tokens.invalidAmount'));
        return;
      }
      if (redeemAmount > (balance || 0)) {
        toast.error(t('tokens.insufficientTokens'));
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
      toast.success(data.message ?? t('tokens.redemptionSuccess'));
    } catch (err) {
      console.error('Redeem error:', err);
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err.message ?? t('tokens.redemptionError');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const amountNum = parseInt(amount, 10) || 0;
  const currentTier = getTierForAmount(amountNum);
  const isEligibleForTokens = esgScore && esgScore >= 80;

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="row justify-content-center">
        <div className="col-md-10">
          
          {/* ESG Evaluation Section */}
          <div className="card mb-4">
            <div className="card-header">
              <h4 className="mb-0">🌱 {t('tokens.esgEvaluation')}</h4>
              <p className="text-muted mb-0">{t('tokens.esgEvaluationSubtitle')}</p>
            </div>
            <div className="card-body">
              <form onSubmit={handleEsgEvaluation}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="revenue" className="form-label">{t('tokens.revenue')}</label>
                    <input
                      type="number"
                      className="form-control"
                      id="revenue"
                      value={revenue}
                      onChange={(e) => setRevenue(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                      placeholder={t('tokens.revenuePlaceholder')}
                    />
                    <div className="form-text">{t('tokens.revenueHelp')}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="emissions" className="form-label">{t('tokens.emissions')}</label>
                    <input
                      type="number"
                      className="form-control"
                      id="emissions"
                      value={emissions}
                      onChange={(e) => setEmissions(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                      placeholder={t('tokens.emissionsPlaceholder')}
                    />
                    <div className="form-text">{t('tokens.emissionsHelp')}</div>
                  </div>
                </div>

                {esgError && (
                  <div className="alert alert-danger" role="alert">
                    {esgError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={esgLoading || !revenue || !emissions}
                >
                  {esgLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {t('tokens.esgEvaluating')}
                    </>
                  ) : (
                    t('tokens.evaluateEsg')
                  )}
                </button>
              </form>

              {/* ESG Result Display */}
              {showEsgResult && esgScore !== null && (
                <div className="mt-4">
                  <div className={`alert ${isEligibleForTokens ? 'alert-success' : 'alert-info'}`}>
                    <h5>{t('tokens.esgResult')}</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>{t('tokens.esgScore')}:</strong> 
                          <span className={`badge ${isEligibleForTokens ? 'bg-success' : 'bg-warning'} ms-2`}>
                            {esgScore.toFixed(2)}
                          </span>
                        </p>
                        <p><strong>{t('tokens.revenue')}:</strong> {parseFloat(revenue).toLocaleString()} VND</p>
                        <p><strong>{t('tokens.emissions')}:</strong> {parseFloat(emissions).toLocaleString()} tons CO2</p>
                      </div>
                      <div className="col-md-6">
                        {isEligibleForTokens ? (
                          <div className="text-success">
                            <h6>🎉 {t('tokens.eligibleForTokens')}</h6>
                            <p className="mb-0">{t('tokens.eligibleMessage')}</p>
                          </div>
                        ) : (
                          <div className="text-warning">
                            <h6>📈 {t('tokens.improveEsg')}</h6>
                            <p className="mb-0">{t('tokens.improveMessage', { score: esgScore.toFixed(2) })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Token Redemption Section */}
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">🪙 {t('tokens.title')}</h4>
              <p className="text-muted mb-0">{t('tokens.subtitle')}</p>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h5 className="card-title">{t('tokens.currentBalance')}</h5>
                      <h3 className="text-primary">{(Number(balance) || 0).toLocaleString()} GCT</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body text-center">
                      <h5 className="card-title">{t('tokens.availableForBank')}</h5>
                      <h3 className="text-success">500M VND Loan</h3>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRedeem}>
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">{t('tokens.redeemAmount')}</label>
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
                    {t('tokens.available')}: {(Number(balance) || 0).toLocaleString()} GCT
                  </div>
                </div>

                {amount ? (
                  currentTier ? (
                    <div className="alert alert-info">
                      <strong>{t('tokens.preview')}:</strong> {t('tokens.redeemingTokens', { amount: amountNum.toLocaleString() })}{' '}
                      <span className={`badge bg-${currentTier.color ?? 'secondary'}`}>
                        {currentTier.discount}
                      </span>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      {t('tokens.minimumTokens')}
                    </div>
                  )
                ) : null}

                <div className="mb-4">
                  <h6>{t('tokens.redemptionTiers')}:</h6>
                  <div className="row">
                    {getDiscountTiers().map((tier, index) => (
                      <div key={index} className="col-md-3 mb-2">
                        <div className={`card border-${tier.color ?? 'secondary'}`}>
                          <div className="card-body p-2 text-center">
                            <small className="text-muted">≥{tier.min} {t('tokens.tokens')}</small>
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
                      {t('tokens.processing')}
                    </>
                  ) : (
                    t('tokens.redeemButton')
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
                <h5 className="modal-title">🎉 {t('tokens.redemptionSuccessful')}!</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-success">
                  <h6>{t('tokens.yourBenefits')}:</h6>
                  <p><strong>{t('tokens.discount')}:</strong> {redemptionResult.discount ?? 'N/A'}</p>
                  <p><strong>{t('tokens.loanAmount')}:</strong> 500,000,000 VND</p>
                  <p><strong>{t('tokens.interestRate')}:</strong> 8.5%</p>
                  <p><strong>{t('tokens.validUntil')}:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>

                <div className="alert alert-info">
                  <h6>{t('tokens.transactionDetails')}:</h6>
                  <p><strong>{t('tokens.amountRedeemed')}:</strong> {(Number(redemptionResult.redeemAmount) || 0).toLocaleString()} GCT</p>
                  <p><strong>{t('tokens.newBalance')}:</strong> {(Number(redemptionResult.newBalance) || 0).toLocaleString()} GCT</p>
                  <p>
                    <strong>{t('tokens.transactionHash')}:</strong>{' '}
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
                  {t('common.close')}
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