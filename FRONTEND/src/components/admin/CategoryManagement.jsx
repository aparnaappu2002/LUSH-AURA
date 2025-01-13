import React, { useState, useEffect } from 'react';
import axios from '../../axios/adminAxios';
import { PlusIcon, PencilIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', status: true });
  const [selectedId, setSelectedId] = useState(null);
  const [editNameCategory, setEditNameCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetch, setFetch] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  
  const [currentOffer, setCurrentOffer] = useState({
    offerName: '',
    description: '',
    discountPercentage: 0,
    startDate: '',
    endDate: '',
    status: 'active'
  });

  
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get('/category');
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategory();
  }, [fetch]);

  
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      try {
        const response = await axios.post('/addcategory', {
          newCategory: newCategory.name,
        });
        toast.success(response.data.message);
        setFetch(!fetch); 
        setNewCategory({ name: '', status: true });
      } catch (error) {
        console.error('Error adding category:', error);
        toast.error(
          error.response?.data?.message || 'Failed to add category'
        );
      }
    } else {
      toast.error('Category name cannot be empty');
    }
  };

  
  const handleStatus = async (id) => {
    try {
      const category = categories.find((cat) => cat._id === id);
      const newStatus = category.status === 'active' ? 'inactive' : 'active';

      const response = await axios.patch(`/editstatus/${id}`, {
        status: newStatus,
      });
      toast.success(response.data.message);

      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === id ? { ...cat, status: newStatus } : cat
        )
      );
    } catch (error) {
      console.error('Error changing category status:', error);
      toast.error('Failed to change category status');
    }
  };

  
  const handleEditCategory = async () => {
    try {
      const response = await axios.patch(`/editcategory/${selectedId}`, {
        editNameCategory,
      });
      setFetch(!fetch); 
      setIsModalOpen(false);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error editing category:', error);
      toast.error('Failed to edit category');
    }
  };

  const handleAddOffer = (categoryId) => {
    setSelectedId(categoryId);
    setCurrentOffer({
      offerName: '',
      description: '',
      discountPercentage: 0,
      startDate: '',
      endDate: '',
      status: 'active'
    });
    setIsOfferModalOpen(true);
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/addoffercategory`, {
        ...currentOffer,
        category: selectedId
      });
      toast.success('Offer added successfully');
      setIsOfferModalOpen(false);
      setFetch(!fetch);
    } catch (error) {
      console.error('Error adding offer:', error);
      toast.error('Failed to add offer');
    }
  };

  return (
    <>
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Category Management</h1>

      
      <form
        onSubmit={handleAddCategory}
        className="mb-8 p-4 bg-white rounded-lg shadow"
      >
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <div className="flex gap-4">
          <input
            className="border p-2 rounded w-full"
            type="text"
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            required
          />
          <button
  type="submit"
  className="bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 
  text-white font-bold py-2 px-6 rounded-lg shadow-lg transform transition-all 
  hover:scale-105 active:scale-95 flex items-center gap-2"
>
  <PlusIcon className="w-5 h-5" />
  Add Category
</button>

        </div>
      </form>

      {/* Categories List */}
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Actions</th>
            <th className="p-4 text-left">Offers</th>
          </tr>
        </thead>
        <tbody>
          {categories?.length > 0 ? (
            categories.map((category) => (
              <tr key={category._id} className="border-b">
                <td className="p-4">{category.categoryName}</td>
                <td className="p-4">
  {/* Toggle Button */}
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={category.status === 'active'}
      onChange={() => handleStatus(category._id)}
    />
    <div
      className={`w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-pink-500
      peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-400 
      transition-all duration-300`}
    ></div>
    <span
      className={`absolute top-0.5 left-[2px] w-5 h-5 bg-white rounded-full transition-transform 
      ${category.status === 'active' ? 'translate-x-5' : ''}`}
    ></span>
  </label>
</td>

                <td className="p-4">
                  <button
                    onClick={() => {
                      setSelectedId(category._id);
                      setEditNameCategory(category.categoryName);
                      setIsModalOpen(true);
                    }}
                    className={`${
                      category.status === 'inactive'
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-pink-600 hover:text-pink-900'
                    }`}
                    disabled={category.status === 'inactive'}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleAddOffer(category._id)}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-full text-xs flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add Offer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="p-4 text-center">
                No categories available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Category</h2>
            <form onSubmit={handleEditCategory}>
              <input
                type="text"
                className="border p-2 rounded w-full mb-4"
                value={editNameCategory}
                onChange={(e) => setEditNameCategory(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
              >
                Update Category
              </button>
            </form>
          </div>
        </div>
      )}

{isOfferModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Offer to Category</h2>
            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Offer Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={currentOffer.offerName}
                  onChange={(e) => setCurrentOffer({...currentOffer, offerName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={currentOffer.description}
                  onChange={(e) => setCurrentOffer({...currentOffer, description: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount Percentage</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={currentOffer.discountPercentage}
                  onChange={(e) => setCurrentOffer({...currentOffer, discountPercentage: e.target.value})}
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={currentOffer.startDate}
                  onChange={(e) => setCurrentOffer({...currentOffer, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={currentOffer.endDate}
                  onChange={(e) => setCurrentOffer({...currentOffer, endDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={currentOffer.status}
                  onChange={(e) => setCurrentOffer({...currentOffer, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Offer
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
