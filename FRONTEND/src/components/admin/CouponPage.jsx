import React, { useState, useEffect } from 'react';
import axios from '../../axios/adminAxios';
import { PlusIcon, XIcon, PencilIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import {toast,Toaster} from "react-hot-toast"

const CouponPage = () => {
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const user = useSelector(state => state.user.user);
  const userId = user.id || user._id;

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('/coupons');
      if (response.status === 200) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons. Please try again.');
    }
  };

  const handleAddCoupon = async (newCoupon) => {
    try {
      const response = await axios.post('/addcoupon', {...newCoupon, userId});
      if (response.status === 201) {
        setCoupons([...coupons, response.data]);
        setShowAddCouponModal(false);
      }
    } catch (error) {
      console.error('Error adding coupon:', error);
      toast.error('Failed to add coupon. Please try again.');
    }
  };

  const handleEditCoupon = async (updatedCoupon) => {
    try {
      const response = await axios.put(`/updatecoupon/${updatedCoupon.code}`, updatedCoupon);
      if (response.status === 200) {
        const updatedCoupons = coupons.map(coupon => 
          coupon.code === updatedCoupon.code ? updatedCoupon : coupon
        );
        setCoupons(updatedCoupons);
        setShowEditCouponModal(false);
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Failed to update coupon. Please try again.');
    }
  };

  const handleStatusChange = async (index, newStatus) => {
    const updatedCoupons = [...coupons];
    const couponToUpdate = updatedCoupons[index];
  
    try {
      const response = await axios.put(`/couponstatus/${couponToUpdate.code}`, { status: newStatus });
      if (response.status === 200) {
        couponToUpdate.status = newStatus;
        updatedCoupons[index] = couponToUpdate;
        setCoupons(updatedCoupons);
        toast.success('Coupon status updated successfully.');
      }
    } catch (error) {
      console.error('Error updating coupon status:', error);
      toast.error('Failed to update coupon status. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-pink-800">Coupon Management</h1>
        <button
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center"
          onClick={() => setShowAddCouponModal(true)}
        >
          <PlusIcon className="mr-2" />
          Add Coupon
        </button>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-pink-700">Active Coupons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon, index) => (
              <div key={coupon.code} className="bg-white rounded-lg shadow-md p-6 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-pink-600">{coupon.code}</span>
                  <div className="flex items-center">
                    <select
                      className="border rounded px-2 py-1 text-sm bg-pink-100 text-pink-800 mr-2"
                      value={coupon.status}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <button
                      onClick={() => {
                        setEditingCoupon(coupon);
                        setShowEditCouponModal(true);
                      }}
                      className="text-pink-500 hover:text-pink-600"
                    >
                      <PencilIcon size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{coupon.description}</p>
                <p className="text-pink-500 font-semibold">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% Off`
                    : `₹${coupon.discountValue} Off`}
                </p>
                <p className="text-sm text-gray-500 mt-2">Valid until: {coupon.endDate}</p>
              </div>
            ))}
          </div>
          <Toaster position="top-right" />
        </div>

        {showAddCouponModal && (
          <CouponModal
            onClose={() => setShowAddCouponModal(false)}
            onSubmit={handleAddCoupon}
            title="Add New Coupon"
            submitText="Add Coupon"
          />
        )}

        {showEditCouponModal && (
          <CouponModal
            coupon={editingCoupon}
            onClose={() => setShowEditCouponModal(false)}
            onSubmit={handleEditCoupon}
            title="Edit Coupon"
            submitText="Update Coupon"
          />
        )}
      </div>
    </div>
  );
};

const CouponModal = ({ coupon, onClose, onSubmit, title, submitText }) => {
  const [couponData, setCouponData] = useState(
    coupon || {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchaseAmount: '',
      maxDiscount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      status: 'active',
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCouponData({ ...couponData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(couponData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 border w-full max-w-md shadow-lg rounded-2xl bg-white">
        <h3 className="text-2xl font-bold mb-6 text-pink-800">{title}</h3>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <XIcon size={24} />
        </button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              id="code"
              name="code"
              value={couponData.code}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              required
              readOnly={!!coupon}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={couponData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              rows="3"
            />
          </div>
          <div>
            <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">Discount Type</label>
            <select
              id="discountType"
              name="discountType"
              value={couponData.discountType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              required
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">Discount Value</label>
            <input
              type="number"
              id="discountValue"
              name="discountValue"
              value={couponData.discountValue}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="minPurchaseAmount" className="block text-sm font-medium text-gray-700">Minimum Purchase Amount</label>
            <input
              type="number"
              id="minPurchaseAmount"
              name="minPurchaseAmount"
              value={couponData.minPurchaseAmount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={couponData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={couponData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
};

export default CouponPage;

