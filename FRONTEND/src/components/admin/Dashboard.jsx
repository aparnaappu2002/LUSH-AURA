import React, { useState, useEffect } from 'react';
import axios from '../../axios/adminAxios';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const AdminDashboard = () => {
  const [salesData, setSalesData] = useState(null);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        
        // Adjust date range based on timeFrame
        if (timeFrame === 'yearly') {
          startDate.setFullYear(endDate.getFullYear() - 1);
        } else if (timeFrame === 'monthly') {
          startDate.setMonth(endDate.getMonth() - 12);
        } else {
          // For daily view, show last 30 days
          startDate.setDate(endDate.getDate() - 30);
        }

        // Set times to start and end of day
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        const response = await axios.get('/salesreport', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          }
        });

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
  }, [timeFrame]);

  const processDataForChart = (data, frame) => {
    if (!data?.orders || !Array.isArray(data.orders)) return [];

    const processedData = data.orders.reduce((acc, orderData) => {
      const date = new Date(orderData.orderDate);
      let key;
      
      switch (frame) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          sales: 0,
          revenue: 0,
          items: 0,
          discounts: 0
        };
      }

      acc[key].sales += orderData.order.totalPrice || 0;
      acc[key].revenue += orderData.order.finalAmount || 0;
      acc[key].items += orderData.order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      acc[key].discounts += orderData.totalOrderDiscount || 0;

      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(processedData).sort((a, b) => a.date.localeCompare(b.date));
  };

  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';

    try {
      switch (timeFrame) {
        case 'daily':
          return new Date(tickItem).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        case 'monthly':
          const [year, month] = tickItem.split('-');
          return new Date(year, month - 1).toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });
        case 'yearly':
          return tickItem;
        default:
          return tickItem;
      }
    } catch (e) {
      console.error('Date formatting error:', e);
      return tickItem;
    }
  };

  const formatTooltipDate = (label) => {
    if (!label) return '';
    
    try {
      switch (timeFrame) {
        case 'daily':
          return new Date(label).toLocaleDateString('en-US', { 
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        case 'monthly':
          const [year, month] = label.split('-');
          return new Date(year, month - 1).toLocaleDateString('en-US', { 
            month: 'long',
            year: 'numeric'
          });
        case 'yearly':
          return `Year ${label}`;
        default:
          return label;
      }
    } catch (e) {
      console.error('Tooltip date formatting error:', e);
      return label;
    }
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
            <option value="daily">Daily</option>
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
                  <XAxis 
                    dataKey="date" 
                    stroke="#FF7096"
                    tickFormatter={formatXAxis}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#FF7096" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF0F5', border: '1px solid #FFA69E' }}
                    labelFormatter={formatTooltipDate}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#FFA69E" 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                    name="Total Sales" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#FF7096" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Revenue" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-200">
              <h2 className="text-2xl font-semibold mb-4 text-pink-800">Items Sold and Discounts</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFC4D6" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#FF7096"
                    tickFormatter={formatXAxis}
                    interval="preserveStartEnd"
                  />
                  <YAxis yAxisId="left" stroke="#FF7096" />
                  <YAxis yAxisId="right" orientation="right" stroke="#FF7096" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFF0F5', border: '1px solid #FFA69E' }}
                    labelFormatter={formatTooltipDate}
                  />
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