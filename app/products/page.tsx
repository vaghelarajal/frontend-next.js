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

// Function to get category-based image
function getProductImage(product: Product): string {
  if (product.image_url) return product.image_url;
  
  // Map categories to relevant Unsplash images
  const categoryImages: { [key: string]: string } = {
    'Electronics': `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop`,
    'Clothing': `https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=200&fit=crop`,
    'Home & Garden': `https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300&h=200&fit=crop`,
    'Sports & Fitness': `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=200&fit=crop`,
    'Kitchen': `https://images.unsplash.com/photo-1556911220-bff31c812dba?w=300&h=200&fit=crop`,
    'Office': `https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=200&fit=crop`,
  };
  
  return categoryImages[product.category] || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop`;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1>Our Products</h1>
          <p>Browse our collection of quality products</p>
        </div>

        <div className="products-grid">
          {products.map((product) => (
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
      </div>
    </>
  );
}
