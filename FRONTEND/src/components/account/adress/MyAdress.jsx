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
  const [errors, setErrors] = useState({});

  const user = useSelector(state => state.user.user);
  const userId = user.id || user._id

  const validateForm = (formData) => {
    const newErrors = {};
    
    // Address validation
    if (!formData.addressLine?.trim()) {
      newErrors.addressLine = 'Address is required';
    }

    // Street validation
    if (!formData.street?.trim()) {
      newErrors.street = 'Street is required';
    }

    // City validation
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }

    // State validation
    if (!formData.state?.trim()) {
      newErrors.state = 'State is required';
    }

    // Country validation
    if (!formData.country?.trim()) {
      newErrors.country = 'Country is required';
    }

    // Pincode validation
    if (!formData.pincode?.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    // Phone validation
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    return newErrors;
  };

  const fetchAddresses = useCallback(async () => {
    if (userId) {
      try {
        const { data } = await axios.get(`/showAddress/${userId}`);
       // console.log('Address List:', data);
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
    const validationErrors = validateForm(editedAddress);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const updatedAddress = {
      _id: currentAddress._id,
      ...editedAddress
    };
  
    console.log('Payload being sent:', updatedAddress);
    
    try {
      const response = await axios.put('/editAddress', updatedAddress);
     // console.log('Address updated successfully', response.data);
      
      setAddresses(prevAddresses => 
        prevAddresses.map(address => 
          address._id === updatedAddress._id ? response.data : address
        )
      );
  
      setEditModalOpen(false);
      // Fetch addresses again to ensure we have the latest data
      setErrors({});
      fetchAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const addNewAddress = async (newAddress) => {
    const validationErrors = validateForm(newAddress);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.post('/address', { ...newAddress, userId });
      //console.log('Address added:', response.data);
      setAddresses(prevAddresses => [...prevAddresses, response.data]);
      setNewAddressModalOpen(false);
      // Fetch addresses again to ensure we have the latest data
      setErrors({});
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const renderFormField = (field, value = '', isEdit = false) => {
    const fieldId = isEdit ? `edit-${field}` : field;
    const fieldName = field === 'addressLine' ? 'address' : field;
    
    return (
      <div key={field} className="mb-4">
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
          {fieldName}
        </label>
        <input
          type="text"
          id={fieldId}
          name={fieldName}
          defaultValue={value}
          className={`mt-1 block w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
            errors[field] ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors[field] && (
          <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
        )}
      </div>
    );
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
                {renderFormField('addressLine')}
                {renderFormField('street')}
                {renderFormField('city')}
                {renderFormField('state')}
                {renderFormField('country')}
                {renderFormField('pincode')}
                {renderFormField('phone')}
                
                <div className="flex justify-end space-x-2">
                  <button 
                    type="button"
                    className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md"
                    onClick={() => {
                      setNewAddressModalOpen(false);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm text-white bg-pink-600 rounded-md"
                  >
                    Add Address
                  </button>
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
                {renderFormField('addressLine', currentAddress.addressLine, true)}
                {renderFormField('street', currentAddress.street, true)}
                {renderFormField('city', currentAddress.city, true)}
                {renderFormField('state', currentAddress.state, true)}
                {renderFormField('country', currentAddress.country, true)}
                {renderFormField('pincode', currentAddress.pincode, true)}
                {renderFormField('phone', currentAddress.phone, true)}
                
                <div className="flex justify-end space-x-2">
                  <button 
                    type="button"
                    className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md"
                    onClick={() => {
                      setEditModalOpen(false);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm text-white bg-pink-600 rounded-md"
                  >
                    Save Changes
                  </button>
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

