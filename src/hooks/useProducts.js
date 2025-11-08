import { useState } from 'react';

export const useProducts = (initialProducts = []) => {
  const [products, setProducts] = useState(initialProducts);

  const addProduct = (productData) => {
    const newProduct = {
      id: Date.now(),
      ...productData,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock) || 0
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const updateProduct = (id, updatedData) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, ...updatedData } : p
    ));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const getProductById = (id) => {
    return products.find(p => p.id === id);
  };

  const getFeaturedProducts = () => {
    return products.filter(p => p.featured);
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getFeaturedProducts
  };
};
