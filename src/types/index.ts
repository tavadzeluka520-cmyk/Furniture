export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number | null;
  discount?: number | null;
  rating: number;
  reviewsCount: number;
  images: string[];
  description: string;
  material: string;
  color: string;
  availableColors: string[];
  width: string;
  height: string;
  depth: string;
  weight: string;
  availableSizes: string[];
  stock: number;
  availability: 'in_stock' | 'low_stock' | 'pre_order' | 'out_of_stock';
  isFeatured: boolean;
  isNew: boolean;
  isDiscounted: boolean;
  isBestSeller: boolean;
  specifications: Record<string, string>;
  reviews: ProductReview[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
}

export interface SiteSettings {
  siteName: string;
  logoText: string;
  logoIcon: string;
  logoImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroImage: string;
  heroCtaText: string;
  heroSecondaryCtaText: string;
  announcementText: string;
  showAnnouncement: boolean;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  fontFamily: string;
  borderRadius: string;
  cardStyle: 'glass-glow' | 'minimal-matte' | 'cyberpunk-border';
  headerStyle: 'glass-sticky' | 'floating-island' | 'solid-dark';
  bannerStyle: 'futuristic-glow' | 'cyber-grid' | 'full-bleed';
  homeSections: {
    featured: { enabled: boolean; title: string; subtitle: string };
    categories: { enabled: boolean; title: string; subtitle: string };
    newArrivals: { enabled: boolean; title: string; subtitle: string };
    bestSellers: { enabled: boolean; title: string; subtitle: string };
    specialOffers: { enabled: boolean; title: string; subtitle: string };
    discounted: { enabled: boolean; title: string; subtitle: string };
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  token?: string;
  password?: string;
  phone?: string;
  provider?: 'google' | 'email';
  avatar?: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    color?: string;
    size?: string;
    image: string;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
}
