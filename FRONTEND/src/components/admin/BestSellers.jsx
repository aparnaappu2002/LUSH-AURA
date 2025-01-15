import React, { useEffect, useState } from 'react';
import axios from '../../axios/adminAxios';

function BestSellersAndCategories() {
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [bestSellingCategories, setBestSellingCategories] = useState([]);

  useEffect(() => {
    // Fetch best-selling products
    axios.get('/bestsellers/products')
      .then(response => {
        setBestSellingProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching best-selling products:', error);
      });

    // Fetch best-selling categories
    axios.get('/bestsellers/categories')
      .then(response => {
        setBestSellingCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching best-selling categories:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-800 mb-8">Best Sellers Dashboard</h1>

        {/* Best Selling Products Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-pink-700 mb-4">Top 10 Best Selling Products</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-pink-200">
                <thead className="bg-pink-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Product</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Category</th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Sales</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-pink-100">
                  {bestSellingProducts.map((product, index) => (
                    <tr key={product._id} className={index % 2 === 0 ? 'bg-pink-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={product.productImage[0] || "/placeholder.svg"} alt={product.title} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-pink-900">{product.title}</div>
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-700">{product.categoryId.name}</td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-700">{product.salesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Best Selling Categories Table */}
        <div>
          <h2 className="text-2xl font-semibold text-pink-700 mb-4">Top 10 Best Selling Categories</h2>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-pink-200">
                <thead className="bg-pink-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Total Sales</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Number of Products</th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-pink-100">
                  {bestSellingCategories.map((category, index) => (
                    <tr key={category._id} className={index % 2 === 0 ? 'bg-pink-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-900">{category.categoryName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-700">{category.salesCount}</td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-pink-700">{category.products}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BestSellersAndCategories;
