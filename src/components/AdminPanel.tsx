import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Paintbrush, 
  Layers, 
  Package, 
  ShoppingBag, 
  Sliders, 
  Image as ImageIcon, 
  Check, 
  Save, 
  Upload, 
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Eye,
  Copy,
  CheckCheck,
  Loader2,
  Star,
  ArrowUp
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Category, SiteSettings } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { 
    isAdmin, 
    currentUser, 
    products, 
    categories, 
    settings, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    updateSettings 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'media' | 'design' | 'sections' | 'orders'>('products');
  
  // Media library & batch file upload state
  const [mediaList, setMediaList] = useState<Array<{ name: string; url: string; category: string; size?: number }>>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isDraggingOverProductModal, setIsDraggingOverProductModal] = useState(false);
  const [isDraggingOverMediaTab, setIsDraggingOverMediaTab] = useState(false);
  
  // Custom in-app confirmation dialogs for deletion (prevents browser confirm() suppression in iframes)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deletingCategoryItem, setDeletingCategoryItem] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');
  
  // Product Form State (for adding or editing)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Sofas',
    brand: 'AURA Atelier',
    price: 1200,
    oldPrice: '' as string | number,
    discount: '' as string | number,
    description: '',
    material: '',
    color: 'Midnight Obsidian',
    availableColors: 'Midnight Obsidian, Cobalt Phantom, Ghost Grey',
    width: '200 cm',
    height: '85 cm',
    depth: '90 cm',
    weight: '45 kg',
    availableSizes: 'Standard',
    stock: 10,
    availability: 'in_stock' as 'in_stock' | 'low_stock' | 'pre_order' | 'out_of_stock',
    isFeatured: true,
    isNew: true,
    isDiscounted: false,
    isBestSeller: false,
    images: ['/images/sofa_modular_luxury.jpg']
  });

  // Category Form State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '/images/chair_dining_sculptural.jpg'
  });

  // Design Settings Form (Local working state)
  const [designForm, setDesignForm] = useState<SiteSettings>(() => {
    return settings || {
      siteName: 'AURA Modern Living',
      logoText: 'AURA',
      logoIcon: 'sparkle',
      logoImageUrl: '',
      heroTitle: 'Modern Furniture For Your Perfect Home',
      heroSubtitle: 'Architectural silhouettes, premium carbon-infused materials, and electric-blue luminescence.',
      heroBadge: '2026 Architectural Collection',
      heroImage: '/images/hero_scandinavian_lounge.jpg',
      heroCtaText: 'Shop Now',
      heroSecondaryCtaText: 'Explore Collection',
      announcementText: '',
      showAnnouncement: false,
      primaryColor: '#00f0ff',
      secondaryColor: '#2563eb',
      backgroundColor: '#07090e',
      surfaceColor: '#0e1322',
      fontFamily: 'Plus Jakarta Sans',
      borderRadius: 'rounded-xl',
      cardStyle: 'glass-glow',
      headerStyle: 'glass-sticky',
      bannerStyle: 'futuristic-glow',
      homeSections: {
        featured: { enabled: true, title: 'Featured Masterpieces', subtitle: 'Curated architectural centerpieces' },
        categories: { enabled: true, title: 'Curated Categories', subtitle: 'Explore visionary designs' },
        newArrivals: { enabled: true, title: 'New Arrivals', subtitle: 'Fresh silhouettes from our studios' },
        bestSellers: { enabled: true, title: 'Best Sellers', subtitle: 'Most coveted pieces' },
        specialOffers: { enabled: true, title: 'Special Offers', subtitle: 'Limited-time acquisitions' },
        discounted: { enabled: true, title: 'Discounted Furniture', subtitle: 'Special promotional rates' }
      }
    };
  });

  const [savingDesign, setSavingDesign] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Handle open product modal for creation
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories[0]?.name || 'Sofas',
      brand: 'AURA Atelier',
      price: 1500,
      oldPrice: '',
      discount: '',
      description: '',
      material: 'Matte Carbon & Premium Leather',
      color: 'Midnight Obsidian',
      availableColors: 'Midnight Obsidian, Cobalt Phantom, Ghost Grey',
      width: '200 cm',
      height: '85 cm',
      depth: '90 cm',
      weight: '45 kg',
      availableSizes: 'Standard, Extended',
      stock: 10,
      availability: 'in_stock',
      isFeatured: true,
      isNew: true,
      isDiscounted: false,
      isBestSeller: false,
      images: ['/images/sofa_modular_luxury.jpg']
    });
    setIsProductModalOpen(true);
  };

  // Handle open product modal for edit
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      price: prod.price,
      oldPrice: prod.oldPrice || '',
      discount: prod.discount || '',
      description: prod.description,
      material: prod.material,
      color: prod.color,
      availableColors: prod.availableColors?.join(', ') || prod.color,
      width: prod.width,
      height: prod.height,
      depth: prod.depth,
      weight: prod.weight,
      availableSizes: prod.availableSizes?.join(', ') || 'Standard',
      stock: prod.stock,
      availability: prod.availability,
      isFeatured: prod.isFeatured,
      isNew: prod.isNew,
      isDiscounted: prod.isDiscounted,
      isBestSeller: prod.isBestSeller,
      images: [...prod.images]
    });
    setIsProductModalOpen(true);
  };

  // Submit product create/edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : null,
      discount: productForm.discount ? Number(productForm.discount) : null,
      stock: Number(productForm.stock),
      availableColors: productForm.availableColors.split(',').map(s => s.trim()).filter(Boolean),
      availableSizes: productForm.availableSizes.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await createProduct(payload);
    }
    setIsProductModalOpen(false);
  };

  // Media Library loader
  const loadMedia = async () => {
    try {
      setLoadingMedia(true);
      const res = await fetch('/api/media', {
        headers: {
          'Authorization': `Bearer ${currentUser?.token || ''}`,
          'x-admin-email': currentUser?.email || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (err) {
      console.error('Failed to load media list:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'media' && isOpen) {
      loadMedia();
    }
  }, [activeTab, isOpen]);

  // Robust Batch File Uploader
  const uploadFilesBatch = async (files: FileList | File[]): Promise<string[]> => {
    const arr = Array.from(files);
    if (arr.length === 0) return [];

    setIsUploadingImage(true);
    setUploadProgressText(`Uploading ${arr.length} image(s)...`);

    const urls: string[] = [];
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      setUploadProgressText(`Uploading ${i + 1} of ${arr.length}: ${file.name}...`);
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.token || ''}`,
            'x-admin-email': currentUser?.email || ''
          },
          body: JSON.stringify({ imageBase64: base64, filename: file.name })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) urls.push(data.url);
        }
      } catch (err) {
        console.error('Upload failed for file:', file.name, err);
      }
    }

    setIsUploadingImage(false);
    setUploadProgressText('');
    return urls;
  };

  // Product files selection (multiple)
  const handleProductFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newUrls = await uploadFilesBatch(files);
    if (newUrls.length > 0) {
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...newUrls]
      }));
    }
  };

  // Make an image primary cover
  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setProductForm(prev => {
      const newImages = [...prev.images];
      const [chosen] = newImages.splice(index, 1);
      newImages.unshift(chosen);
      return { ...prev, images: newImages };
    });
  };

  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, newImageUrlInput.trim()]
    }));
    setNewImageUrlInput('');
  };

  const handleRemoveProductImage = (idx: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  // Category image file upload
  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const urls = await uploadFilesBatch([file]);
    if (urls[0]) {
      setCategoryForm(prev => ({ ...prev, image: urls[0] }));
    }
  };

  // Hero banner & Logo file uploads for Global Design
  const handleHeroImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const urls = await uploadFilesBatch([file]);
    if (urls[0]) {
      setDesignForm(prev => ({ ...prev, heroImage: urls[0] }));
    }
  };

  const handleLogoImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const urls = await uploadFilesBatch([file]);
    if (urls[0]) {
      setDesignForm(prev => ({ ...prev, logoImageUrl: urls[0] }));
    }
  };

  const handleCopyUrl = (url: string) => {
    const full = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(full);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleCreateProductFromMedia = (url: string) => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Sofas',
      brand: 'AURA Atelier',
      price: 1950,
      oldPrice: 2250,
      discount: 13,
      description: '',
      material: '',
      color: '',
      availableColors: '',
      width: '220 cm',
      height: '80 cm',
      depth: '95 cm',
      weight: '55 kg',
      availableSizes: 'Standard',
      stock: 8,
      availability: 'in_stock',
      isFeatured: true,
      isNew: true,
      isDiscounted: true,
      isBestSeller: false,
      images: [url]
    });
    setIsProductModalOpen(true);
  };

  // Save Global Design Settings
  const handleSaveDesign = async () => {
    setSavingDesign(true);
    const success = await updateSettings(designForm);
    setSavingDesign(false);
    if (success) {
      setSaveSuccessMessage('Global design settings saved and broadcasted to all visitors!');
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    }
  };

  // Categories CRUD
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      image: '/images/chair_dining_sculptural.jpg'
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      await updateCategory(editingCategory.id, categoryForm);
    } else {
      await createCategory(categoryForm);
    }
    setIsCategoryModalOpen(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  // Strict administrator check:
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
        <div className="glass-panel rounded-3xl p-8 max-w-md w-full border border-rose-500/40 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-slate-300">
            This private Admin Command Center is strictly restricted to authorized administrators.
            Please sign in with your store administrator account to continue.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
      
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Admin Window */}
      <div className="relative w-full max-w-6xl glass-panel rounded-3xl border border-cyan-500/30 shadow-[0_0_60px_rgba(0,240,255,0.15)] flex flex-col h-[92vh] z-10 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-black font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  AURA Administrator Hub
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  {currentUser?.email}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Centralized real-time catalog, design, and category command system
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2 border-b border-white/10 flex items-center gap-2 sm:gap-4 overflow-x-auto bg-black/30 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('media');
              loadMedia();
            }}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media & Images {mediaList.length > 0 && `(${mediaList.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'design'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Paintbrush className="w-4 h-4" />
            <span>Global Design Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Homepage Sections</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-grow">
          
          {/* ================================================= */}
          {/* TAB 1: PRODUCTS MANAGEMENT                        */}
          {/* ================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {actionFeedback && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
                  <span className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{actionFeedback}</span>
                  </span>
                  <button onClick={() => setActionFeedback('')} className="text-emerald-400 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Product Tools Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Filter products by name, category, or brand..."
                  value={productSearchTerm}
                  onChange={e => setProductSearchTerm(e.target.value)}
                  className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />

                <button
                  onClick={handleOpenAddProduct}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add New Furniture</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/[0.04] text-[11px] font-mono uppercase text-slate-400 border-b border-white/10">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3">Badges</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-xs truncate max-w-xs">{p.name}</div>
                              <div className="text-[10px] text-slate-500">{p.brand} · {p.material}</div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-cyan-400">{p.category}</td>
                          <td className="p-3">
                            <div className="font-mono font-bold text-white">${p.price.toLocaleString()}</div>
                            {p.oldPrice && (
                              <div className="text-[10px] text-slate-500 line-through font-mono">
                                ${p.oldPrice.toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              p.stock > 3 ? 'text-emerald-400 bg-emerald-950/40' : 'text-amber-400 bg-amber-950/40'
                            }`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-3 space-x-1">
                            {p.isFeatured && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                                Featured
                              </span>
                            )}
                            {p.isNew && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                                New
                              </span>
                            )}
                            {p.discount && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                                -{p.discount}%
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                              title="Edit product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingProduct(p)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 2: CATEGORIES MANAGEMENT                      */}
          {/* ================================================= */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Manage all 17 furniture categories. Adding or editing updates the store and AI navigation.
                </span>
                <button
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="glass-card rounded-2xl p-4 border border-white/10 flex gap-3.5 relative group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0 pr-8">
                      <h4 className="text-sm font-bold text-white truncate">{cat.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{cat.description}</p>
                      <div className="text-[10px] font-mono text-cyan-400 mt-2">
                        {cat.itemCount || 0} active furniture items
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryForm({
                            name: cat.name,
                            slug: cat.slug,
                            description: cat.description,
                            image: cat.image
                          });
                          setIsCategoryModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-cyan-400"
                        title="Edit category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingCategoryItem(cat)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB: MEDIA & IMAGES ASSET HUB                     */}
          {/* ================================================= */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Media Header & Upload Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-cyan-400" />
                    <span>Media & Image Asset Hub</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upload image files directly to post new product photographs, hero banners, and category covers.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={loadMedia}
                    disabled={loadingMedia}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Refresh media gallery"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingMedia ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  <label className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:opacity-90 transition-opacity cursor-pointer">
                    {isUploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Upload className="w-4 h-4 text-black" />
                    )}
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image Files'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => {
                        handleProductFiles(e.target.files);
                        setTimeout(loadMedia, 1200);
                      }}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Drag & Drop Visual Dropzone */}
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDraggingOverMediaTab(true);
                }}
                onDragLeave={() => setIsDraggingOverMediaTab(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDraggingOverMediaTab(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleProductFiles(e.dataTransfer.files);
                    setTimeout(loadMedia, 1200);
                  }
                }}
                className={`relative rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
                  isDraggingOverMediaTab
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                    : 'border-white/15 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-white/[0.04]'
                }`}
              >
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                    {isUploadingImage ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <Upload className="w-7 h-7" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {isUploadingImage ? uploadProgressText || 'Uploading images...' : 'Drag & Drop Image Files Here'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Supports batch upload of multiple images (JPG, PNG, WebP, SVG). Images are stored securely on the server and immediately ready for products.
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer border border-white/10">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Select Images from Computer / Phone</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => {
                        handleProductFiles(e.target.files);
                        setTimeout(loadMedia, 1200);
                      }}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Available Store Assets & Uploads ({mediaList.length})</span>
                  {copiedUrl && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Image URL copied to clipboard!
                    </span>
                  )}
                </div>

                {loadingMedia && mediaList.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-2" />
                    <p className="text-xs">Loading media assets...</p>
                  </div>
                ) : mediaList.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 border border-white/5 rounded-2xl bg-white/[0.01]">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-400">No uploaded media found yet</p>
                    <p className="text-xs text-slate-500 mt-1">Upload your furniture photography above to see them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                    {mediaList.map((m, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all flex flex-col"
                      >
                        {/* Image Preview */}
                        <div className="aspect-[4/3] w-full overflow-hidden bg-black/40 relative">
                          <img
                            src={m.url}
                            alt={m.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <span className="absolute top-2 left-2 text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-slate-300 border border-white/10">
                            {m.category === 'User Uploads' ? 'Upload' : 'Catalog'}
                          </span>
                        </div>

                        {/* File Details & Quick Action Buttons */}
                        <div className="p-2.5 flex flex-col gap-2 flex-grow justify-between bg-black/40">
                          <p className="text-[11px] font-medium text-slate-300 truncate" title={m.name}>
                            {m.name}
                          </p>

                          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(m.url)}
                              className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Copy URL to clipboard"
                            >
                              {copiedUrl === m.url ? (
                                <CheckCheck className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{copiedUrl === m.url ? 'Copied' : 'Copy'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCreateProductFromMedia(m.url)}
                              className="px-2 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[10px] font-bold text-cyan-300 hover:text-cyan-200 transition-colors flex items-center justify-center gap-1 border border-cyan-500/30 cursor-pointer"
                              title="Create new product using this image"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Use</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* ================================================= */}
          {activeTab === 'design' && (
            <div className="space-y-6 max-w-4xl">
              
              {saveSuccessMessage && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* Theme Colors */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Paintbrush className="w-4 h-4 text-cyan-400" />
                  <span>Futuristic Theme Palette</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Primary Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={designForm.primaryColor}
                        onChange={e => setDesignForm({ ...designForm, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20"
                      />
                      <input
                        type="text"
                        value={designForm.primaryColor}
                        onChange={e => setDesignForm({ ...designForm, primaryColor: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Secondary Electric Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={designForm.secondaryColor}
                        onChange={e => setDesignForm({ ...designForm, secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20"
                      />
                      <input
                        type="text"
                        value={designForm.secondaryColor}
                        onChange={e => setDesignForm({ ...designForm, secondaryColor: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Background Void Tone</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={designForm.backgroundColor}
                        onChange={e => setDesignForm({ ...designForm, backgroundColor: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/20"
                      />
                      <input
                        type="text"
                        value={designForm.backgroundColor}
                        onChange={e => setDesignForm({ ...designForm, backgroundColor: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block mb-2">Architectural Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Cyan Neon & Abyssal Dark', primary: '#00f0ff', secondary: '#2563eb', bg: '#07090e' },
                      { name: 'Cobalt Royal & Pitch Black', primary: '#3b82f6', secondary: '#1d4ed8', bg: '#030712' },
                      { name: 'Electric Emerald & Slate', primary: '#10b981', secondary: '#047857', bg: '#060d09' },
                      { name: 'Ultra Violet Cyber', primary: '#8b5cf6', secondary: '#6d28d9', bg: '#090611' }
                    ].map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => setDesignForm({
                          ...designForm,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          backgroundColor: preset.bg
                        })}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 text-[11px] text-slate-300 flex items-center gap-1.5"
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.primary }} />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Typography & Card Styles */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Typography & Geometry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Primary Typeface</label>
                    <select
                      value={designForm.fontFamily}
                      onChange={e => setDesignForm({ ...designForm, fontFamily: e.target.value })}
                      className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Architectural)</option>
                      <option value="Space Grotesk">Space Grotesk (Futuristic Geometric)</option>
                      <option value="Inter">Inter (Ultra Clean Minimalist)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Card Border Radius</label>
                    <select
                      value={designForm.borderRadius}
                      onChange={e => setDesignForm({ ...designForm, borderRadius: e.target.value })}
                      className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="rounded-md">Sharp (6px)</option>
                      <option value="rounded-xl">Medium Curved (12px)</option>
                      <option value="rounded-2xl">Smooth Futuristic (16px)</option>
                      <option value="rounded-3xl">Deep Organic (24px)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Logo & Brand Identity */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Brand Identity & Logo
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Brand Name / Logo Text</label>
                    <input
                      type="text"
                      value={designForm.logoText}
                      onChange={e => setDesignForm({ ...designForm, logoText: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Custom Logo Image URL (Optional)</label>
                    <input
                      type="text"
                      value={designForm.logoImageUrl}
                      onChange={e => setDesignForm({ ...designForm, logoImageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Banner Content */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Hero Banner Photography & Text
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Hero Main Title</label>
                    <input
                      type="text"
                      value={designForm.heroTitle}
                      onChange={e => setDesignForm({ ...designForm, heroTitle: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Hero Subtitle</label>
                    <textarea
                      rows={2}
                      value={designForm.heroSubtitle}
                      onChange={e => setDesignForm({ ...designForm, heroSubtitle: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Hero Furniture Photography</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Hero image URL or upload file..."
                        value={designForm.heroImage}
                        onChange={e => setDesignForm({ ...designForm, heroImage: e.target.value })}
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                      />
                      <label className="px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold cursor-pointer hover:bg-cyan-500/30 flex items-center gap-1.5 text-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input type="file" accept="image/*" onChange={handleHeroImageFileUpload} className="hidden" />
                      </label>
                    </div>
                    {designForm.heroImage && (
                      <div className="relative w-full h-28 rounded-xl overflow-hidden border border-white/15 bg-black/40">
                        <img src={designForm.heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 block mb-1">Primary CTA Button</label>
                      <input
                        type="text"
                        value={designForm.heroCtaText}
                        onChange={e => setDesignForm({ ...designForm, heroCtaText: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Secondary CTA Button</label>
                      <input
                        type="text"
                        value={designForm.heroSecondaryCtaText}
                        onChange={e => setDesignForm({ ...designForm, heroSecondaryCtaText: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Top Announcement Bar
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Promotional bar displayed at the very top of the website
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={designForm.showAnnouncement}
                      onChange={e => setDesignForm({ ...designForm, showAnnouncement: e.target.checked })}
                      className="rounded"
                    />
                    <span>Show Announcement</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter announcement text or leave blank to hide..."
                    value={designForm.announcementText}
                    onChange={e => setDesignForm({ ...designForm, announcementText: e.target.value })}
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                  {designForm.announcementText && (
                    <button
                      type="button"
                      onClick={() => setDesignForm({ ...designForm, announcementText: '', showAnnouncement: false })}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
                      title="Delete announcement text and disable banner"
                    >
                      Delete / Clear Text
                    </button>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveDesign}
                disabled={savingDesign}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-black font-extrabold text-sm shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingDesign ? 'Broadcasting Changes...' : 'Save & Publish Design Globally'}</span>
              </button>

            </div>
          )}

          {/* ================================================= */}
          {/* TAB 4: HOMEPAGE SECTIONS CONFIG                   */}
          {/* ================================================= */}
          {activeTab === 'sections' && (
            <div className="space-y-4 max-w-3xl">
              <span className="text-xs text-slate-400 block mb-2">
                Enable or rename homepage product showcase sections:
              </span>

              {Object.entries(designForm.homeSections).map(([secKey, secVal]) => (
                <div key={secKey} className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                      {secKey}
                    </span>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={secVal.enabled}
                        onChange={e => {
                          setDesignForm({
                            ...designForm,
                            homeSections: {
                              ...designForm.homeSections,
                              [secKey]: { ...secVal, enabled: e.target.checked }
                            }
                          });
                        }}
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Section Title</label>
                      <input
                        type="text"
                        value={secVal.title}
                        onChange={e => {
                          setDesignForm({
                            ...designForm,
                            homeSections: {
                              ...designForm.homeSections,
                              [secKey]: { ...secVal, title: e.target.value }
                            }
                          });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Section Subtitle</label>
                      <input
                        type="text"
                        value={secVal.subtitle}
                        onChange={e => {
                          setDesignForm({
                            ...designForm,
                            homeSections: {
                              ...designForm.homeSections,
                              [secKey]: { ...secVal, subtitle: e.target.value }
                            }
                          });
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSaveDesign}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Section Changes</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* MODAL: ADD / EDIT PRODUCT                         */}
      {/* ================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-cyan-400/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-20 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
                {editingProduct ? 'Edit Furniture Masterpiece' : 'Add New Furniture Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-[#0c1220] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Old Price ($) (Optional)</label>
                  <input
                    type="number"
                    value={productForm.oldPrice}
                    onChange={e => setProductForm({ ...productForm, oldPrice: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Multiple Images Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Product Photography & Image Files</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({productForm.images.length} added — 1st is Primary Cover)
                    </span>
                  </label>
                  {isUploadingImage && (
                    <span className="text-[11px] text-cyan-300 flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {uploadProgressText || 'Uploading...'}
                    </span>
                  )}
                </div>

                {/* Drag & Drop File Zone */}
                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDraggingOverProductModal(true);
                  }}
                  onDragLeave={() => setIsDraggingOverProductModal(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setIsDraggingOverProductModal(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      handleProductFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                    isDraggingOverProductModal
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-white/15 bg-white/[0.02] hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="flex items-center gap-2 text-slate-300 text-xs">
                      <Upload className="w-4 h-4 text-cyan-400" />
                      <span>Drag & drop image files here, or</span>
                    </div>

                    <label className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold cursor-pointer hover:bg-cyan-500/30 flex items-center gap-1.5 text-xs">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Choose Files to Post</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={e => handleProductFiles(e.target.files)}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </label>
                  </div>
                </div>

                {/* Or paste URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or paste an image URL here..."
                    value={newImageUrlInput}
                    onChange={e => setNewImageUrlInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 text-xs cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* Thumbnails preview & management */}
                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {productForm.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border group bg-black/40 ${
                          idx === 0
                            ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400'
                            : 'border-white/15 hover:border-white/40'
                        }`}
                      >
                        <div className="aspect-[4/3] w-full">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* Primary Badge */}
                        {idx === 0 ? (
                          <div className="absolute top-1.5 left-1.5 bg-cyan-500 text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            COVER
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="absolute top-1.5 left-1.5 bg-black/75 hover:bg-cyan-500 hover:text-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 cursor-pointer"
                            title="Set this image as primary cover"
                          >
                            <ArrowUp className="w-2.5 h-2.5" />
                            Make Cover
                          </button>
                        )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveProductImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-rose-600/90 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer shadow-md"
                          title="Remove this image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Architectural Description</label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white resize-none"
                />
              </div>

              {/* Physical Specifications & Dimensions */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Width</label>
                  <input
                    type="text"
                    value={productForm.width}
                    onChange={e => setProductForm({ ...productForm, width: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Height</label>
                  <input
                    type="text"
                    value={productForm.height}
                    onChange={e => setProductForm({ ...productForm, height: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Depth</label>
                  <input
                    type="text"
                    value={productForm.depth}
                    onChange={e => setProductForm({ ...productForm, depth: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Weight</label>
                  <input
                    type="text"
                    value={productForm.weight}
                    onChange={e => setProductForm({ ...productForm, weight: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Materials</label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={e => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Colors (comma separated)</label>
                  <input
                    type="text"
                    value={productForm.availableColors}
                    onChange={e => setProductForm({ ...productForm, availableColors: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={e => setProductForm({ ...productForm, isNew: e.target.checked })}
                  />
                  <span>New</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isDiscounted}
                    onChange={e => setProductForm({ ...productForm, isDiscounted: e.target.checked })}
                  />
                  <span>Discounted</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={e => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-white/10">
                {editingProduct ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingProduct(editingProduct);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Product</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-bold cursor-pointer"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL: ADD / EDIT CATEGORY                        */}
      {/* ================================================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-cyan-400/40 p-6 z-20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Category Imagery</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter image URL or upload file..."
                    value={categoryForm.image}
                    onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <label className="px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold cursor-pointer hover:bg-cyan-500/30 flex items-center gap-1.5 text-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input type="file" accept="image/*" onChange={handleCategoryFileUpload} className="hidden" />
                  </label>
                </div>
                {categoryForm.image && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-white/15 bg-black/40">
                    <img src={categoryForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* IN-APP CONFIRMATION MODAL: DELETE PRODUCT         */}
      {/* ================================================= */}
      {deletingProduct && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="glass-panel border border-rose-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div>
              <h4 className="text-base font-bold text-white">Delete Product?</h4>
              <p className="text-xs text-slate-300 mt-2">
                Are you sure you want to permanently delete <span className="font-semibold text-cyan-300">"{deletingProduct.name}"</span> from the store catalog?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  const success = await deleteProduct(deletingProduct.id);
                  setIsDeleting(false);
                  const deletedName = deletingProduct.name;
                  setDeletingProduct(null);
                  if (editingProduct?.id === deletingProduct.id) {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                  }
                  if (success) {
                    setActionFeedback(`Product "${deletedName}" was successfully deleted.`);
                    setTimeout(() => setActionFeedback(''), 4500);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* IN-APP CONFIRMATION MODAL: DELETE CATEGORY        */}
      {/* ================================================= */}
      {deletingCategoryItem && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="glass-panel border border-rose-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            
            <div>
              <h4 className="text-base font-bold text-white">Delete Category?</h4>
              <p className="text-xs text-slate-300 mt-2">
                Are you sure you want to delete category <span className="font-semibold text-cyan-300">"{deletingCategoryItem.name}"</span>?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCategoryItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  const success = await deleteCategory(deletingCategoryItem.id);
                  setIsDeleting(false);
                  const deletedName = deletingCategoryItem.name;
                  setDeletingCategoryItem(null);
                  if (success) {
                    setActionFeedback(`Category "${deletedName}" was successfully deleted.`);
                    setTimeout(() => setActionFeedback(''), 4500);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
