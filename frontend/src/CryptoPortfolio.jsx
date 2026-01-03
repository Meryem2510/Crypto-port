import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, LogOut, User, X, DollarSign, CreditCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { generateUsername } from './utils/generateUsername';
import { getMyPortfolio, getAssets } from './services/api';

// ========================================
// DEPOSIT MODAL COMPONENT
// ========================================
const DepositModal = ({ isOpen, onClose, currentBalance, onDepositSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    const depositAmount = parseFloat(amount);

    if (!amount || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (depositAmount < 10) {
      setError('Minimum deposit amount is $10');
      return;
    }

    if (depositAmount > 100000) {
      setError('Maximum deposit amount is $100,000');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/wallet/deposit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: depositAmount })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Deposit failed');
      }

      const data = await response.json();
      setSuccess(true);
      
      if (onDepositSuccess) {
        onDepositSuccess(data);
      }

      setTimeout(() => {
        onClose();
        setAmount('');
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setQuickAmount = (value) => {
    setAmount(value.toString());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl max-w-md w-full border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Deposit Funds</h2>
              <p className="text-slate-400 text-sm">Add money to your wallet</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <p className="text-slate-400 text-sm">Current Balance</p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Deposit Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="10"
                max="100000"
                className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Min: $10 | Max: $100,000</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300 mb-2">Quick Select</p>
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 5000].map((value) => (
                <button
                  key={value}
                  onClick={() => setQuickAmount(value)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  ${value}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-300 mb-1">Payment Method</p>
                <p className="text-xs text-slate-300">
                  Instant deposit via credit/debit card or bank transfer. Funds available immediately.
                </p>
              </div>
            </div>
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
              <p className="text-sm text-slate-300 mb-1">New Balance After Deposit</p>
              <p className="text-2xl font-bold text-green-400">
                ${(currentBalance + parseFloat(amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm">
              Deposit successful! 🎉
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-all font-semibold text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              {loading ? 'Processing...' : 'Deposit Funds'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// BUY/SELL MODAL COMPONENT
// ========================================
const BuySellModal = ({ 
  isOpen, 
  onClose, 
  asset, 
  mode = 'buy',
  userBalance = 0,
  ownedQuantity = 0,
  onTransaction 
}) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !asset) return null;

  const isBuy = mode === 'buy';
  const totalCost = parseFloat(quantity || 0) * asset.price;
  const canAfford = isBuy ? totalCost <= userBalance : parseFloat(quantity || 0) <= ownedQuantity;

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!canAfford) {
      setError(isBuy ? 'Insufficient balance' : 'Insufficient assets to sell');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const endpoint = isBuy ? '/transactions/buy' : '/transactions/sell';
      
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asset_id: asset.id,
          quantity: parseFloat(quantity)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Transaction failed');
      }

      const data = await response.json();
      setSuccess(true);
      
      if (onTransaction) {
        onTransaction(data);
      }

      setTimeout(() => {
        onClose();
        setQuantity('');
        setSuccess(false);
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setPercentage = (percent) => {
    if (isBuy) {
      const maxQuantity = (userBalance * percent) / asset.price;
      setQuantity(maxQuantity.toFixed(8));
    } else {
      const sellQuantity = ownedQuantity * percent;
      setQuantity(sellQuantity.toFixed(8));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl max-w-md w-full border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
              isBuy ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {isBuy ? <TrendingUp className="w-6 h-6 text-green-400" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isBuy ? 'Buy' : 'Sell'} {asset.symbol}
              </h2>
              <p className="text-slate-400 text-sm">{asset.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-slate-400 text-sm mb-1">Current Price</p>
            <p className="text-2xl font-bold text-white">
              ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                <p className="text-slate-400 text-sm">
                  {isBuy ? 'Available' : 'You Own'}
                </p>
              </div>
              <p className="text-lg font-bold text-white">
                {isBuy 
                  ? `$${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : `${ownedQuantity.toFixed(8)} ${asset.symbol}`
                }
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <p className="text-slate-400 text-sm">Total Cost</p>
              </div>
              <p className="text-lg font-bold text-white">
                ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quantity ({asset.symbol})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00000000"
              step="0.00000001"
              min="0"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0.25, 0.5, 0.75, 1].map((percent) => (
              <button
                key={percent}
                onClick={() => setPercentage(percent)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                {percent * 100}%
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-200 text-sm">
              Transaction successful! 🎉
            </div>
          )}

          {quantity && !canAfford && !error && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-200 text-sm">
              {isBuy 
                ? `Insufficient balance. Max: ${(userBalance / asset.price).toFixed(8)} ${asset.symbol}`
                : `Insufficient assets. Max: ${ownedQuantity.toFixed(8)} ${asset.symbol}`
              }
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-all font-semibold text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !quantity || !canAfford}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isBuy
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
              } text-white`}
            >
              {loading ? 'Processing...' : `${isBuy ? 'Buy' : 'Sell'} ${asset.symbol}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// MAIN CRYPTO PORTFOLIO COMPONENT
// ========================================
export default function CryptoPortfolio() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('1M');
  const [username, setUsername] = useState('');
  
  const [portfolioData, setPortfolioData] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Wallet states
  const [walletBalance, setWalletBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('buy');
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (email) {
      setUsername(generateUsername(email));
    }
    
    fetchData();
    fetchWalletBalance();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [portfolio, assets] = await Promise.all([
        getMyPortfolio(),
        getAssets()
      ]);

      console.log('Assets API response:', assets);
      console.log('First asset:', assets[0]);
      console.log('Available price fields:', Object.keys(assets[0] || {}));
      
      setPortfolioData(portfolio);
      setAllAssets(assets);
      setError('');
    } catch (err) {
      setError(err.toString());
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      setBalanceLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/wallet/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance);
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleDepositSuccess = async (depositData) => {
    setWalletBalance(depositData.balance);
    await fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_email');
    navigate('/');
  };

  const openBuySellModal = (asset, mode) => {
    const portfolioEntry = portfolioData.find(p => p.asset_id === asset.id);
    const ownedQty = portfolioEntry ? portfolioEntry.quantity : 0;

    const modalAsset = {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      price: asset.current_price || asset.price,
      ownedQuantity: ownedQty
    };

    setSelectedAsset(modalAsset);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleTransactionComplete = async () => {

    if (transactionData?.balance) {
    setWalletBalance(transactionData.balance);
  }
    await fetchData();
    await fetchWalletBalance();
  };

  const walletAssets = portfolioData.map(entry => {
    const asset = allAssets.find(a => a.id === entry.asset_id);
    if (!asset) return null;
    
    const currentValue = entry.quantity * asset.current_price;
    const purchaseValue = entry.quantity * entry.average_buy_price;
    const change = ((currentValue - purchaseValue) / purchaseValue) * 100;
    
    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      amount: entry.quantity,
      value: currentValue,
      change: change || 0,
      current_price: asset.current_price
    };
  }).filter(Boolean);

  const totalValue = walletAssets.reduce((sum, asset) => sum + asset.value, 0);

  const trendingCrypto = allAssets
    .sort((a, b) => b.current_price - a.current_price)
    .slice(0, 4)
    .map(asset => {
      const portfolioEntry = portfolioData.find(p => p.asset_id === asset.id);
      let change = 0;
      
      if (portfolioEntry) {
        const currentValue = portfolioEntry.quantity * asset.current_price;
        const purchaseValue = portfolioEntry.quantity * portfolioEntry.average_buy_price;
        change = ((currentValue - purchaseValue) / purchaseValue) * 100;
      }
      
      return {
        id: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        price: asset.current_price,
        current_price: asset.current_price,
        change: change,
        icon: asset.symbol[0]
      };
    });

  const profitData = [
    { date: 'Nov 21', value: totalValue * 0.85 },
    { date: 'Nov 28', value: totalValue * 0.90 },
    { date: 'Dec 5', value: totalValue * 0.88 },
    { date: 'Dec 12', value: totalValue * 0.95 },
    { date: 'Dec 19', value: totalValue },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center bg-red-500/20 border border-red-500 rounded-lg p-8">
          <p className="text-xl mb-4">Error loading data</p>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-purple-500 rounded-lg hover:bg-purple-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
              ₿
            </div>
            <div>
              <h1 className="text-3xl font-bold">CryptoFolio</h1>
              <p className="text-slate-400 text-sm">Track your digital assets in real-time</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/5 rounded-lg border border-white/10 px-4 py-2">
              <p className="text-slate-400 text-xs mb-0.5">Wallet Balance</p>
              <p className="text-lg font-bold text-white">
                {balanceLoading ? '...' : `$${walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </p>
            </div>

            <button
              onClick={() => setShowDepositModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all font-semibold"
            >
              <Wallet className="w-4 h-4" />
              Deposit
            </button>

            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <User className="w-4 h-4 text-purple-400" />
              <span className="font-semibold">{username}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition-all font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold">My Wallet</h2>
            </div>

            {walletAssets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No assets in your portfolio yet</p>
                <p className="text-sm mt-2">Start by buying some crypto!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {walletAssets.map((asset) => (
                  <div key={asset.symbol} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{asset.symbol}</p>
                        <p className="text-sm text-slate-400">{asset.amount.toFixed(8)} {asset.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <div className={`flex items-center gap-1 text-sm ${asset.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{Math.abs(asset.change).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openBuySellModal(asset, 'buy')}
                        className="flex-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-xs font-semibold text-green-300 transition-colors"
                      >
                        Buy More
                      </button>
                      <button
                        onClick={() => openBuySellModal(asset, 'sell')}
                        className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-xs font-semibold text-red-300 transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Portfolio Value</h2>
                <p className="text-slate-400 text-sm">Track your growth over time</p>
              </div>
              <div className="flex gap-2">
                {['1W', '1M', '3M', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      timeframe === tf
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={profitData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [ + value.toLocaleString(), 'Value']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  fill="url(#colorValue)"
                  dot={{ fill: '#a855f7', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold">Available Assets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingCrypto.map((crypto) => (
              <div key={crypto.symbol} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                    {crypto.icon}
                  </div>
                  <div className={`flex items-center gap-1 ${crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {crypto.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-semibold">{Math.abs(crypto.change).toFixed(2)}%</span>
                  </div>
                </div>
                <h3 className="font-semibold text-lg">{crypto.symbol}</h3>
                <p className="text-slate-400 text-sm mb-2">{crypto.name}</p>
                <p className="text-xl font-bold mb-3">
                  ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openBuySellModal(crypto, 'buy')}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-semibold text-sm transition-all"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => openBuySellModal(crypto, 'sell')}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-lg font-semibold text-sm transition-all"
                  >
                    Sell
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BuySellModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        asset={selectedAsset}
        mode={modalMode}
        userBalance={walletBalance}
        ownedQuantity={selectedAsset?.ownedQuantity || 0}
        onTransaction={handleTransactionComplete}
      />

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        currentBalance={walletBalance}
        onDepositSuccess={handleDepositSuccess}
      />
    </div>
  );
}