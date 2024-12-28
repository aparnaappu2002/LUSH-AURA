import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../../axios/userAxios';
import { MdEdit, MdDelete, MdLocationOn, MdAdd } from 'react-icons/md';
import { useSelector } from 'react-redux';
import Navbar from '../../shared/Navbar';

export default function MyAddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState({});

  const user = useSelector(state => state.user.user);
  const userId = user.id || user._id

  const fetchAddresses = useCallback(async () => {
    if (userId) {
      try {
        const { data } = await axios.get(`/showAddress/${userId}`);
        console.log('Address List:', data);
        setAddresses(data.addresses || []);
        const defaultAddr = data.addresses?.find(addr => addr.defaultAddress === true);
        setDefaultAddress(defaultAddr || {});
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    } else {
      console.warn('User ID not found.');
    }
  }, [userId]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleEdit = (address) => {
    console.log('Editing Address:', address);
    setCurrentAddress(address);
    setEditModalOpen(true);
  };

  const handleDelete = (address) => {
    setCurrentAddress(address);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/deleteAddress/${currentAddress._id}`);
      setAddresses(prevAddresses => prevAddresses.filter(address => address._id !== currentAddress._id));
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const saveAddress = async (editedAddress) => {
    const updatedAddress = {
      _id: currentAddress._id,
      ...editedAddress
    };
  
    console.log('Payload being sent:', updatedAddress);
    
    try {
      const response = await axios.put('/editAddress', updatedAddress);
      console.log('Address updated successfully', response.data);
      
      setAddresses(prevAddresses => 
        prevAddresses.map(address => 
          address._id === updatedAddress._id ? response.data : address
        )
      );
  
      setEditModalOpen(false);
      // Fetch addresses again to ensure we have the latest data
      fetchAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const addNewAddress = async (newAddress) => {
    try {
      const response = await axios.post('/address', { ...newAddress, userId });
      console.log('Address added:', response.data);
      setAddresses(prevAddresses => [...prevAddresses, response.data]);
      setNewAddressModalOpen(false);
      // Fetch addresses again to ensure we have the latest data
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Addresses</h1>
      <button 
        className="mb-4 px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
        onClick={() => setNewAddressModalOpen(true)}
      >
        <MdAdd className="w-4 h-4 mr-2 inline" /> Add New Address
      </button>
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address._id} className="w-full border rounded-lg overflow-hidden">
            <div className="flex items-start p-6">
              <MdLocationOn className="w-6 h-6 mr-4 text-pink-500" />
              <div className="flex-grow">
                <h2 className="text-xl font-semibold mb-2">Address </h2>
                <p>{address.addressLine}</p>
                <p>{address.street}</p>
                <p>{address.city}, {address.state}</p>
                <p>{address.country}</p>
                <p>Pincode: {address.pincode}</p>
                <p>Phone: {address.phone}</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 bg-gray-50 p-4">
              <button 
                className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                onClick={() => handleEdit(address)}
              >
                <MdEdit className="w-4 h-4 mr-2 inline" /> Edit
              </button>
              <button 
                className="px-4 py-2 text-sm text-white bg-pink-600 rounded-md hover:bg-pink-700"
                onClick={() => handleDelete(address)}
              >
                <MdDelete className="w-4 h-4 mr-2 inline" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {newAddressModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Address</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newAddress = {
                addressLine: formData.get('address'),
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                country: formData.get('country'),
                pincode: formData.get('pincode'),
                phone: formData.get('phone')
              };
              addNewAddress(newAddress);
            }}>
              {['address', 'street', 'city', 'state', 'country', 'pincode', 'phone'].map((field) => (
                <div key={field} className="mb-4">
                  <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    id={field}
                    name={field}
                    required
                    className="mt-1 block w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md"
                  onClick={() => setNewAddressModalOpen(false)}
                >Cancel</button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-pink-600 rounded-md"
                >Add Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModalOpen && currentAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Address</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const editedAddress = {
                addressLine: formData.get('address'),
                street: formData.get('street'),
                city: formData.get('city'),
                state: formData.get('state'),
                country: formData.get('country'),
                pincode: formData.get('pincode'),
                phone: formData.get('phone')
              };
              saveAddress(editedAddress);
            }}>
              {['address', 'street', 'city', 'state', 'country', 'pincode', 'phone'].map((field) => (
                <div key={field} className="mb-4">
                  <label htmlFor={`edit-${field}`} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    id={`edit-${field}`}
                    name={field}
                    defaultValue={field === 'address' ? currentAddress.addressLine : currentAddress[field]}
                    required
                    className="mt-1 block w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <div className="flex justify-end space-x-2">
                <button 
                  type="button"
                  className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md"
                  onClick={() => setEditModalOpen(false)}
                >Cancel</button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-pink-600 rounded-md"
                >Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && currentAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this address? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md"
                onClick={() => setDeleteModalOpen(false)}
              >Cancel</button>
              <button 
                className="px-4 py-2 text-sm text-white bg-pink-600 rounded-md"
                onClick={confirmDelete}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

