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

interface ProductDetails {
  material?: string;
  colors?: string[];
  dimensions?: string;
  weight?: string;
  warranty?: string;
  brand?: string;
  features?: string[];
  specifications?: { [key: string]: string };
}

// Enhanced product details based on product name
function getProductDetails(product: Product): ProductDetails {
  const detailsMap: { [key: string]: ProductDetails } = {
    'Wireless Bluetooth Headphones': {
      material: 'Premium ABS Plastic with Soft Leather Padding',
      colors: ['Black', 'White', 'Silver', 'Rose Gold'],
      dimensions: '7.5" x 6.8" x 3.2"',
      weight: '250g',
      warranty: '2 Years International Warranty',
      brand: 'AudioTech Pro',
      features: [
        'Active Noise Cancellation',
        '30-hour Battery Life',
        'Quick Charge (15 min = 3 hours)',
        'Bluetooth 5.0 Connectivity',
        'Built-in Microphone',
        'Foldable Design'
      ],
      specifications: {
        'Driver Size': '40mm Dynamic Drivers',
        'Frequency Response': '20Hz - 20kHz',
        'Impedance': '32 Ohms',
        'Sensitivity': '105dB',
        'Charging Time': '2 Hours',
        'Bluetooth Range': '10 meters'
      }
    },
    'Organic Cotton T-Shirt': {
      material: '100% Organic Cotton, GOTS Certified',
      colors: ['White', 'Black', 'Navy Blue', 'Forest Green', 'Heather Gray'],
      dimensions: 'Available in XS, S, M, L, XL, XXL',
      weight: '180g',
      warranty: '30 Days Return Policy',
      brand: 'EcoWear',
      features: [
        'Breathable Organic Cotton',
        'Pre-shrunk Fabric',
        'Reinforced Seams',
        'Tagless Design',
        'Machine Washable',
        'Eco-Friendly Dyes'
      ],
      specifications: {
        'Fabric Weight': '180 GSM',
        'Fit': 'Regular Fit',
        'Neckline': 'Crew Neck',
        'Sleeve Type': 'Short Sleeve',
        'Care': 'Machine Wash Cold',
        'Origin': 'Ethically Made in India'
      }
    },
    'Stainless Steel Water Bottle': {
      material: '18/8 Food-Grade Stainless Steel',
      colors: ['Silver', 'Black', 'Blue', 'Pink', 'Green'],
      dimensions: '10.5" H x 2.8" W',
      weight: '320g',
      warranty: 'Lifetime Warranty',
      brand: 'HydroFlow',
      features: [
        'Double Wall Vacuum Insulation',
        'Keeps Cold 24hrs, Hot 12hrs',
        'Leak-Proof Cap',
        'Wide Mouth Opening',
        'BPA-Free',
        'Dishwasher Safe'
      ],
      specifications: {
        'Capacity': '500ml (17 oz)',
        'Insulation': 'Double Wall Vacuum',
        'Cap Type': 'Screw-on with Handle',
        'Temperature Range': '-40°F to 185°F',
        'Mouth Diameter': '2.16 inches',
        'Certification': 'FDA Approved'
      }
    },
    'Yoga Mat Premium': {
      material: 'Natural Rubber with Microfiber Top Layer',
      colors: ['Purple', 'Teal', 'Pink', 'Black', 'Navy'],
      dimensions: '72" L x 24" W x 6mm Thick',
      weight: '2.5kg',
      warranty: '1 Year Warranty',
      brand: 'ZenFlow',
      features: [
        'Non-Slip Textured Surface',
        'Eco-Friendly Materials',
        'Extra Thick Cushioning',
        'Alignment Lines',
        'Carrying Strap Included',
        'Odor Resistant'
      ],
      specifications: {
        'Thickness': '6mm High Density',
        'Grip': 'Superior Wet & Dry Grip',
        'Density': '0.95g/cm³',
        'Compression': 'High Resilience',
        'Cleaning': 'Easy Wipe Clean',
        'Certification': 'SGS Certified Non-Toxic'
      }
    },
    'Coffee Maker Deluxe': {
      material: 'Stainless Steel & BPA-Free Plastic',
      colors: ['Stainless Steel', 'Black', 'White'],
      dimensions: '14" H x 10" W x 8" D',
      weight: '4.2kg',
      warranty: '3 Years Manufacturer Warranty',
      brand: 'BrewMaster',
      features: [
        'Programmable 24-Hour Timer',
        'Auto Shut-off Safety',
        'Pause & Serve Function',
        'Water Level Indicator',
        'Permanent Gold Filter',
        'Keep Warm Plate'
      ],
      specifications: {
        'Capacity': '12 Cups (1.8L)',
        'Power': '1000W',
        'Brewing Time': '6-8 minutes',
        'Water Tank': 'Removable',
        'Filter Type': 'Permanent Gold Tone',
        'Voltage': '110-120V'
      }
    },
    'LED Desk Lamp': {
      material: 'Aluminum Alloy with ABS Base',
      colors: ['Silver', 'Black', 'White'],
      dimensions: '17" H x 8" W (Adjustable)',
      weight: '850g',
      warranty: '2 Years LED Warranty',
      brand: 'LightTech',
      features: [
        '3 Color Temperatures',
        '5 Brightness Levels',
        'Touch Control Panel',
        'USB Charging Port',
        'Memory Function',
        'Eye-Care Technology'
      ],
      specifications: {
        'LED Lifespan': '50,000 Hours',
        'Power Consumption': '12W',
        'Luminous Flux': '800 Lumens',
        'Color Temperature': '3000K-6500K',
        'CRI': '>90',
        'Input': '5V/2A USB-C'
      }
    },
    'Wireless Phone Charger': {
      material: 'Tempered Glass with Aluminum Frame',
      colors: ['Black', 'White', 'Silver'],
      dimensions: '4" x 4" x 0.4"',
      weight: '180g',
      warranty: '18 Months Warranty',
      brand: 'ChargeTech',
      features: [
        'Fast Wireless Charging',
        'Qi-Certified Safety',
        'LED Charging Indicator',
        'Case Friendly (up to 5mm)',
        'Over-heat Protection',
        'Foreign Object Detection'
      ],
      specifications: {
        'Output': '15W/10W/7.5W/5W',
        'Input': '9V/2A, 5V/3A',
        'Efficiency': '>75%',
        'Charging Distance': '≤8mm',
        'Compatibility': 'Qi-enabled devices',
        'Certification': 'FCC, CE, RoHS'
      }
    },
    'Running Shoes': {
      material: 'Breathable Mesh Upper with Rubber Sole',
      colors: ['Black/White', 'Navy/Orange', 'Gray/Blue', 'All Black'],
      dimensions: 'US Sizes 6-13 (Men), 5-11 (Women)',
      weight: '280g per shoe (Size 9)',
      warranty: '6 Months Manufacturing Defects',
      brand: 'RunFast',
      features: [
        'Responsive Foam Midsole',
        'Breathable Mesh Upper',
        'Durable Rubber Outsole',
        'Heel Counter Support',
        'Moisture-Wicking Lining',
        'Reflective Details'
      ],
      specifications: {
        'Drop': '10mm (Heel to Toe)',
        'Upper': 'Engineered Mesh',
        'Midsole': 'EVA Foam',
        'Outsole': 'Carbon Rubber',
        'Support': 'Neutral',
        'Terrain': 'Road Running'
      }
    },
    'Ceramic Dinner Set': {
      material: 'High-Quality Porcelain Ceramic',
      colors: ['White', 'Cream', 'Blue Pattern', 'Floral Design'],
      dimensions: 'Service for 4 People',
      weight: '8.5kg (Complete Set)',
      warranty: '1 Year Chip Warranty',
      brand: 'HomeElegance',
      features: [
        'Microwave Safe',
        'Dishwasher Safe',
        'Chip Resistant',
        'Lead-Free Glaze',
        'Stackable Design',
        'Elegant Finish'
      ],
      specifications: {
        'Set Includes': '4 Dinner Plates, 4 Salad Plates, 4 Bowls, 4 Mugs',
        'Plate Size': '10.5" Dinner, 8" Salad',
        'Bowl Capacity': '16 oz',
        'Mug Capacity': '12 oz',
        'Temperature Range': '-20°C to 120°C',
        'Certification': 'FDA Approved'
      }
    },
    'Bluetooth Speaker': {
      material: 'Fabric Mesh with Aluminum Frame',
      colors: ['Charcoal', 'Sandstone', 'Sage', 'Twilight Blue'],
      dimensions: '6.5" W x 3.5" H x 3.5" D',
      weight: '650g',
      warranty: '2 Years Limited Warranty',
      brand: 'SoundWave',
      features: [
        '360° Surround Sound',
        '12-Hour Battery Life',
        'IPX7 Waterproof',
        'Voice Assistant Compatible',
        'Multi-Device Pairing',
        'Built-in Speakerphone'
      ],
      specifications: {
        'Driver': '2 x 20W Full Range',
        'Frequency Response': '65Hz - 20kHz',
        'Bluetooth': 'Version 5.0',
        'Battery': '2600mAh Li-ion',
        'Charging Time': '3 Hours',
        'Range': '30 feet'
      }
    }
  };

  return detailsMap[product.name] || {
    material: 'High-Quality Materials',
    colors: ['Standard'],
    dimensions: 'Standard Size',
    weight: 'Lightweight',
    warranty: '1 Year Warranty',
    brand: 'Premium Brand',
    features: ['High Quality', 'Durable', 'Reliable'],
    specifications: {
      'Quality': 'Premium',
      'Origin': 'Manufactured with Care'
    }
  };
}

// Function to get single, specific product image
function getProductDetailImage(product: Product): string {
  if (product.image_url) return product.image_url;
  
  // Map specific product names to relevant Unsplash images
  const productImages: { [key: string]: string } = {
    'Wireless Bluetooth Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop',
    'Organic Cotton T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
    'Stainless Steel Water Bottle': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&h=600&fit=crop',
    'Yoga Mat Premium': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=600&fit=crop',
    'Coffee Maker Deluxe': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&h=600&fit=crop',
    'LED Desk Lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=600&fit=crop',
    'Wireless Phone Charger': 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&h=600&fit=crop',
    'Running Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
    'Ceramic Dinner Set': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=600&fit=crop',
    'Bluetooth Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop',
  };
  
  return productImages[product.name] || '';
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

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

  const productDetails = getProductDetails(product);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <Link href="/products" className="back-link">← Back to Products</Link>
        
        <div className="product-detail-layout">
          {/* Left Side - Single Image */}
          <div className="product-images-section">
            <div className="main-image">
              <img 
                src={getProductDetailImage(product)}
                alt={product.name}
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <span className="product-brand">{productDetails.brand}</span>
              <h1 className="product-title">{product.name}</h1>
              <div className="product-rating">
                <div className="stars">★★★★☆</div>
                <span className="rating-text">(4.2 out of 5 - 127 reviews)</span>
              </div>
              <div className="product-price">
                <span className="current-price">${product.price.toFixed(2)}</span>
                <span className="original-price">${(product.price * 1.2).toFixed(2)}</span>
                <span className="discount">Save 17%</span>
              </div>
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {/* Color Selection */}
            {productDetails.colors && productDetails.colors.length > 1 && (
              <div className="product-options">
                <h3>Available Colors:</h3>
                <div className="color-options">
                  {productDetails.colors.map((color) => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="quantity-section">
              <h3>Quantity:</h3>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
              <span className="stock-info">
                {product.stock_quantity > 0 
                  ? `${product.stock_quantity} items available` 
                  : 'Out of stock'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="btn-primary add-to-cart"
                disabled={product.stock_quantity === 0}
              >
                {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="btn-secondary wishlist">
                ♡ Add to Wishlist
              </button>
            </div>

            {/* Key Features */}
            <div className="key-features">
              <h3>Key Features:</h3>
              <ul>
                {productDetails.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Quick Info */}
            <div className="quick-info">
              <div className="info-item">
                <span className="info-icon">🚚</span>
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="info-item">
                <span className="info-icon">↩️</span>
                <span>30-day return policy</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🛡️</span>
                <span>{productDetails.warranty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Specifications */}
        <div className="product-tabs">
          <div className="tab-content">
            <div className="specifications-section">
              <h2>Detailed Specifications</h2>
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Material:</span>
                  <span className="spec-value">{productDetails.material}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Dimensions:</span>
                  <span className="spec-value">{productDetails.dimensions}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Weight:</span>
                  <span className="spec-value">{productDetails.weight}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Brand:</span>
                  <span className="spec-value">{productDetails.brand}</span>
                </div>
                {Object.entries(productDetails.specifications || {}).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{key}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section">
              <h2>Customer Reviews</h2>
              <div className="review-summary">
                <div className="rating-breakdown">
                  <div className="overall-rating">
                    <span className="rating-number">4.2</span>
                    <div className="stars">★★★★☆</div>
                    <span className="review-count">Based on 127 reviews</span>
                  </div>
                </div>
              </div>
              
              <div className="sample-reviews">
                <div className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">Sarah M.</span>
                    <div className="review-stars">★★★★★</div>
                    <span className="review-date">2 weeks ago</span>
                  </div>
                  <p className="review-text">
                    &quot;Excellent quality! Exactly as described and arrived quickly. 
                    Would definitely recommend this product to others.&quot;
                  </p>
                </div>
                
                <div className="review-item">
                  <div className="review-header">
                    <span className="reviewer-name">Mike R.</span>
                    <div className="review-stars">★★★★☆</div>
                    <span className="review-date">1 month ago</span>
                  </div>
                  <p className="review-text">
                    &quot;Great value for money. The build quality is solid and it works 
                    exactly as expected. Minor packaging issues but product is perfect.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
