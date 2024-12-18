import axios from '../../axios/userAxios';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const Breadcrumb = ({ category }) => {
  const [productName, setProductName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const { id: productId } = useParams();

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/productdetails/${productId}`);
      if (response.status === 200 && response.data) {
        setProductName(response.data.name);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  useEffect(() => {
    if (category) {
      fetchCategoryDetails();
    }
  }, [category]);

  const fetchCategoryDetails = async () => {
    try {
      const response = await axios.get(`/api/categories/${category}`);
      setCategoryName(response.data.name || 'Category Not Found');
    } catch (error) {
      console.error('Error fetching category:', error);
      setCategoryName('Category Not Found');
    }
  };

  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    category && { name: categoryName || 'Shop', path: `/shop` },
    productId && { name: productName || 'Product Details', path: `/productdetails/${productId}` },
  ].filter(Boolean);

  return (
    <nav className="bg-white p-4 rounded-md shadow-md">
      <ol className="flex flex-wrap items-center space-x-2 text-gray-600">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <li>
              <Link to={item.path} className="text-blue-600 hover:text-blue-800">
                {item.name}
              </Link>
            </li>
            {index < breadcrumbItems.length - 1 && <li>/</li>}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
