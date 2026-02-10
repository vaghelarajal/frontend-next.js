'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_active: boolean;
  image_url?: string;
}

// Function to get product-specific or category-based image
function getProductImage(product: Product): string {
  if (product.image_url) return product.image_url;
  
  // Map specific product names to relevant Unsplash images
  const productImages: { [key: string]: string } = {
    'Wireless Bluetooth Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
    'Organic Cotton T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop',
    'Stainless Steel Water Bottle': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=200&fit=crop',
    'Yoga Mat Premium': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=200&fit=crop',
    'Coffee Maker Deluxe': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&h=200&fit=crop',
    'LED Desk Lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=200&fit=crop',
    'Wireless Phone Charger': 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=300&h=200&fit=crop',
    'Running Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
    'Ceramic Dinner Set': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=300&h=200&fit=crop',
    'Bluetooth Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=200&fit=crop',
  };
  
  // Check if we have a specific image for this product name
  if (productImages[product.name]) {
    return productImages[product.name];
  }
  
  // Fallback to category-based images
  const categoryImages: { [key: string]: string } = {
    'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop',
    'Clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop',
    'Home & Garden': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300&h=200&fit=crop',
    'Sports & Fitness': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=200&fit=crop',
    'Kitchen': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=300&h=200&fit=crop',
    'Office': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=200&fit=crop',
  };
  
  return categoryImages[product.category] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop';
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 6;

  useEffect(() => {
    async function loadProducts() {
      const authToken = getToken();
      
      if (!authToken) {
        router.push('/login');
        return;
      }

      try {
        const productsData = await api.getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load products:', error);
        setErrorMessage('Unable to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="loading-message">Loading products...</div>
        </div>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="error-message">{errorMessage}</div>
        </div>
      </>
    );
  }

  // Pagination calculations
  // Get unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  
  // Filter products by selected category
  const categoryFilteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);
  
  // Filter products by search query
  const filteredProducts = categoryFilteredProducts.filter(product => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  });
  
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1>Our Products</h1>
          <p>Browse our collection of quality products</p>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products by name, description, or category..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="search-clear"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-container">
          <div className="filter-label">Filter by Category:</div>
          <div className="filter-buttons">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Count */}
        <div className="products-count">
          {searchQuery && (
            <span>Search results for {searchQuery}: </span>
          )}
          Showing {currentProducts.length} of {filteredProducts.length} products
        </div>

        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found matching your search.</p>
            <button 
              onClick={() => {
                handleSearchChange('');
                setSelectedCategory('All');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
          {currentProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`}
              className="product-card"
            >
              <div className="product-image">
                <img 
                  src={getProductImage(product)}
                  alt={product.name}
                  loading="lazy"
                />
              </div>
              <div className="product-card-content">
                <div className="product-category">{product.category}</div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <span className="product-stock">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
