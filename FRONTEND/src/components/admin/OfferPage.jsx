import React, { useState, useEffect } from 'react';
import axios from '../../axios/adminAxios';
import { PencilIcon, TrashIcon, XIcon } from 'lucide-react';
import { format } from 'date-fns';

import {toast,Toaster} from "react-hot-toast"

export default function OfferPage() {
  const [offers, setOffers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState({
    offerName: '',
    description: '',
    discountPercentage: 0,
    startDate: '',
    endDate: '',
    products: [],
    category: '',
    status: 'active'
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get('/viewoffers');
      setOffers(response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to fetch offers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOffer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting offer:', currentOffer); // Log to verify the currentOffer before submission
  
    try {
      const updatedOffer = { ...currentOffer };
  
      // Ensure products are properly retained unless explicitly modified
      if (!updatedOffer.products || updatedOffer.products.length === 0) {
        updatedOffer.products = currentOffer.products; // Ensure products are not lost
      }
  
      console.log('Updated Offer Payload:', updatedOffer); // Check payload before sending
  
      await axios.put(`/editoffers/${currentOffer._id}`, updatedOffer);
      toast.success('Offer updated successfully');
      setIsModalOpen(false);
      setCurrentOffer({
        offerName: '',
        description: '',
        discountPercentage: 0,
        startDate: '',
        endDate: '',
        products: [], // Ensure products are retained unless modified
        category: '',
        status: 'active'
      });
  
      fetchOffers();
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('Failed to update offer');
    }
  };
  

  

  const handleEdit = (offer) => {
    if (!offer) {
      console.error('No offer provided for editing');
      toast.error('No offer data available to edit');
      return;
    }
  
    // Log the offer to ensure it has all required properties
    console.log('Offer to edit:', offer);
  
    // Safely handle products array, ensuring it exists and has proper structure
    const products = Array.isArray(offer.products) 
      ? offer.products.filter(p => p && p._id).map(p => p._id)
      : [];
  
    setCurrentOffer({
      ...offer,
      startDate: offer.startDate ? offer.startDate.split('T')[0] : '',
      endDate: offer.endDate ? offer.endDate.split('T')[0] : '',
      products: products
    });
    setIsModalOpen(true);
  };

  

  return (
    <>
    <div className="container mx-auto p-6 bg-pink-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-pink-800">Offer Management</h1>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-pink-200">
          <thead className="bg-pink-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-pink-800 uppercase tracking-wider">Offer Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-pink-800 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-pink-800 uppercase tracking-wider">Date Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-pink-800 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-pink-800 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-pink-100">
            {offers.map((offer) => (
              <tr key={offer._id} className="hover:bg-pink-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-pink-900">{offer.offerName}</div>
                  <div className="text-sm text-pink-500">{offer.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-pink-900 font-semibold">{offer.discountPercentage}% OFF</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-pink-900">
                    {format(new Date(offer.startDate), 'MMM d, yyyy')} - {format(new Date(offer.endDate), 'MMM d, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    offer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(offer)} className="text-pink-600 hover:text-pink-900 mr-4 transition-colors duration-150">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  {/* <button onClick={() => handleDelete(offer._id)} className="text-red-600 hover:text-red-900 transition-colors duration-150">
                    <TrashIcon className="w-5 h-5" />
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-pink-800">Edit Offer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-pink-500 hover:text-pink-700">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pink-700">Offer Name</label>
                <input
                  type="text"
                  name="offerName"
                  value={currentOffer.offerName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-pink-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-700">Description</label>
                <textarea
                  name="description"
                  value={currentOffer.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-pink-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-700">Discount Percentage</label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={currentOffer.discountPercentage}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-pink-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-700">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={currentOffer.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-pink-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-700">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={currentOffer.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-pink-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-700">Status</label>
                <select
                  name="status"
                  value={currentOffer.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-pink-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-pink-100 text-pink-800 hover:bg-pink-200 font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
                >
                  Update Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
          <Toaster position="top-right" />
         </>
  );
}
