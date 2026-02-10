'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  created_at: string;
  updated_at: string;
  image_url?: string;
}

// Function to get product-specific or category-based image
function getProductDetailImage(product: Product): string {
  if (product.image_url) return product.image_url;
  
  // Map specific product names to relevant Unsplash images (larger size for detail page)
  const productImages: { [key: string]: string } = {
    'Wireless Bluetooth Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=500&fit=crop',
    'Organic Cotton T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=500&fit=crop',
    'Stainless Steel Water Bottle': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=500&fit=crop',
    'Yoga Mat Premium': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=500&fit=crop',
    'Coffee Maker Deluxe': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&h=500&fit=crop',
    'LED Desk Lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=500&fit=crop',
    'Wireless Phone Charger': 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&h=500&fit=crop',
    'Running Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop',
    'Ceramic Dinner Set': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=500&fit=crop',
    'Bluetooth Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=500&fit=crop',
  };
  
  // Check if we have a specific image for this product name
  if (productImages[product.name]) {
    return productImages[product.name];
  }
  
  // Fallback to category-based images
  const categoryImages: { [key: string]: string } = {
    'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=500&fit=crop',
    'Clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=500&fit=crop',
    'Home & Garden': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&h=500&fit=crop',
    'Sports & Fitness': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=500&fit=crop',
    'Kitchen': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=500&fit=crop',
    'Office': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop',
  };
  
  return categoryImages[product.category] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=500&fit=crop';
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadProduct() {
      const authToken = getToken();
      
      if (!authToken) {
        router.push('/login');
        return;
      }

      try {
        const productData = await api.getProduct(productId);
        setProduct(productData);
      } catch (error) {
        console.error('Failed to load product:', error);
        setErrorMessage('Unable to load product details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [router, productId]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="loading-message">Loading product details...</div>
        </div>
      </>
    );
  }

  if (errorMessage || !product) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="error-message">{errorMessage || 'Product not found'}</div>
          <Link href="/products" className="back-link">← Back to Products</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <Link href="/products" className="back-link">← Back to Products</Link>
        
        <div className="product-detail-card">
          <div className="product-detail-image">
            <img 
              src={getProductDetailImage(product)}
              alt={product.name}
              loading="lazy"
            />
          </div>

          <div className="product-detail-header">
            <div>
              <span className="product-category-badge">{product.category}</span>
              <h1 className="product-detail-title">{product.name}</h1>
            </div>
            <div className="product-detail-price">${product.price.toFixed(2)}</div>
          </div>

          <div className="product-detail-section">
            <h2>Description</h2>
            <p>{product.description}</p>
          </div>

          <div className="product-detail-section">
            <h2>Product Information</h2>
            <div className="product-info-grid">
              <div className="product-info-item">
                <span className="info-label">Category:</span>
                <span className="info-value">{product.category}</span>
              </div>
              <div className="product-info-item">
                <span className="info-label">Stock:</span>
                <span className="info-value">
                  {product.stock_quantity > 0 
                    ? `${product.stock_quantity} available` 
                    : 'Out of stock'}
                </span>
              </div>
              <div className="product-info-item">
                <span className="info-label">Status:</span>
                <span className="info-value">
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="product-detail-actions">
            <button 
              className="btn-primary"
              disabled={product.stock_quantity === 0}
            >
              {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
