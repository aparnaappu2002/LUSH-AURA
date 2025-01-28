import React, { useState, useEffect } from 'react';
import axios from '../../axios/userAxios';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, PlusCircle, MinusCircle, ArrowUpCircle, ArrowDownCircle, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../shared/Navbar';
import { useSelector } from 'react-redux';

const EnhancedWalletPage = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [amount, setAmount] = useState('');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const user = useSelector(state => state.user.user);
  const userId = user.id || user._id;

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/wallet/${userId}`);
      setWalletData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch wallet data');
      setLoading(false);
    }
  };

  const addFunds = async () => {
    try {
      await axios.post('/api/wallet/add-funds', { amount: parseFloat(amount) });
      fetchWalletData();
      setAmount('');
      setShowAddFunds(false);
    } catch (err) {
      setError('Failed to add funds');
    }
  };

  const filteredTransactions = walletData?.transactions?.filter(transaction => {
    if (filter === 'All') return true;
    return transaction.transactionType === filter;
  }) ?? [];

  // Sort transactions by date in descending order (latest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Pagination logic
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({
      top: document.querySelector('.transaction-list')?.offsetTop,
      behavior: 'smooth'
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-pink-100 to-purple-100">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <RefreshCw size={48} className="text-pink-500" />
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-pink-100 to-purple-100">
      <div className="text-center py-10 px-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-pink-700 mb-4">Oops! Something went wrong</h2>
        <p className="text-pink-600">{error}</p>
      </div>
    </div>
  );

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-r from-pink-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-8 text-center flex items-center justify-center">
            <Wallet className="mr-4" size={48} />
             My Lush Wallet
          </h1>
        </motion.div>
        
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-semibold text-pink-600 mb-4">Current Balance</h2>
          <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            ₹{(walletData?.balance ?? 0).toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-semibold text-pink-600 mb-4">Transaction History</h2>
          <div className="mb-4 flex items-center">
            <Filter className="text-pink-500 mr-2" size={20} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border-2 border-pink-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="All">All Transactions</option>
              <option value="Credit">Credits Only</option>
              <option value="Debit">Debits Only</option>
            </select>
          </div>
          <div className="transaction-list">
            <ul className="space-y-4">
              {paginatedTransactions.map((transaction, index) => (
                <motion.li
                  key={index}
                  className="border-b-2 border-pink-100 pb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-pink-700">{transaction.description}</p>
                      <p className="text-sm text-pink-500">{new Date(transaction.date).toLocaleString()}</p>
                    </div>
                    <div className={`flex items-center ${transaction.transactionType === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.transactionType === 'Credit' ? (
                        <ArrowUpCircle className="mr-2" size={24} />
                      ) : (
                        <ArrowDownCircle className="mr-2" size={24} />
                      )}
                      <span className="font-bold text-lg">₹{transaction.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-pink-600 hover:bg-pink-100'}`}
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-full ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'text-pink-600 hover:bg-pink-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-pink-600 hover:bg-pink-100'}`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default EnhancedWalletPage;