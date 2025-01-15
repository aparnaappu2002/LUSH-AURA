import React, { useState, useEffect } from 'react';
import axios from '../../axios/adminAxios'; // Using your custom axios instance
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const AdminDashboard = () => {
  const [salesData, setSalesData] = useState(null);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
        
        const response = await axios.get('/salesreport', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }
        });

        // Validate required data
        if (!response.data?.orders || !Array.isArray(response.data.orders)) {
          throw new Error('Invalid data received from server');
        }

        setSalesData(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching sales data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processDataForChart = (data, frame) => {
    if (!data?.orders) return [];

    return Object.values(data.orders.reduce((acc, order) => {
      const date = new Date(order.orderDate);
      const key = frame === 'monthly' 
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        : date.getFullYear().toString();

      if (!acc[key]) {
        acc[key] = { 
          date: key, 
          sales: 0, 
          revenue: 0, 
          items: 0, 
          discounts: 0 
        };
      }

      // Safely access nested properties
      const orderTotal = order.order?.totalPrice || 0;
      const finalAmount = order.order?.finalAmount || 0;
      const itemCount = order.order?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      const discount = order.totalOrderDiscount || 0;

      acc[key].sales += orderTotal;
      acc[key].revenue += finalAmount;
      acc[key].items += itemCount;
      acc[key].discounts += discount;

      return acc;
    }, {})).sort((a, b) => a.date.localeCompare(b.date));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-pink-50">
        <div className="text-pink-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-pink-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  const chartData = processDataForChart(salesData, timeFrame);

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-800 mb-8">LUSH AURA Dashboard</h1>

        <div className="mb-6">
          <label htmlFor="timeFrame" className="mr-2 text-pink-700">View by:</label>
          <select
            id="timeFrame"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="border border-pink-300 rounded p-2 bg-white text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {salesData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-pink-200">
                <h2 className="text-xl font-semibold mb-4 text-pink-700">Total Sales</h2>
                <p className="text-3xl font-bold text-pink-600">₹{salesData.totalSales?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-pink-200">
                <h2 className="text-xl font-semibold mb-4 text-pink-700">Total Revenue</h2>
                <p className="text-3xl font-bold text-pink-600">₹{salesData.totalRevenue?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-pink-200">
                <h2 className="text-xl font-semibold mb-4 text-pink-700">Total Items Sold</h2>
                <p className="text-3xl font-bold text-pink-600">{salesData.totalItems?.toLocaleString() || '0'}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-pink-200">
                <h2 className="text-xl font-semibold mb-4 text-pink-700">Total Discounts</h2>
                <p className="text-3xl font-bold text-pink-600">₹{salesData.totalDiscounts?.toLocaleString() || '0'}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-200 mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-pink-800">Sales Overview</h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFA69E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFA69E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF7096" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF7096" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFC4D6" />
                  <XAxis dataKey="date" stroke="#FF7096" />
                  <YAxis stroke="#FF7096" />
                  <Tooltip contentStyle={{ backgroundColor: '#FFF0F5', border: '1px solid #FFA69E' }} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="#FFA69E" fillOpacity={1} fill="url(#colorSales)" name="Total Sales" />
                  <Area type="monotone" dataKey="revenue" stroke="#FF7096" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-200">
              <h2 className="text-2xl font-semibold mb-4 text-pink-800">Items Sold and Discounts</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFC4D6" />
                  <XAxis dataKey="date" stroke="#FF7096" />
                  <YAxis yAxisId="left" stroke="#FF7096" />
                  <YAxis yAxisId="right" orientation="right" stroke="#FF7096" />
                  <Tooltip contentStyle={{ backgroundColor: '#FFF0F5', border: '1px solid #FFA69E' }} />
                  <Legend />
                  <Bar dataKey="items" fill="#FFB7B2" name="Items Sold" yAxisId="left" />
                  <Bar dataKey="discounts" fill="#FFDAC1" name="Discounts" yAxisId="right" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;