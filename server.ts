import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { db, isAuthorizedAdmin } from './server/db';
import { Category, Product, SiteSettings } from './src/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers with large limit for image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Admin authentication middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminEmailHeader = req.headers['x-admin-email'] as string;

  let isAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === 'aura-admin-secret-token-7749') {
      isAdmin = true;
    }
  }

  if (!isAdmin && adminEmailHeader && isAuthorizedAdmin(adminEmailHeader)) {
    isAdmin = true;
  }

  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }

  next();
};

// ==========================================
// API ROUTES
// ==========================================

// 1. PRODUCTS
app.get('/api/products', (req: Request, res: Response) => {
  try {
    let products = db.getProducts();
    const { category, search, minPrice, maxPrice, sort, featured, discount, isNew } = req.query;

    if (category && typeof category === 'string' && category !== 'All') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (minPrice) {
      products = products.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    if (featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }

    if (discount === 'true') {
      products = products.filter(p => p.isDiscounted || (p.discount && p.discount > 0));
    }

    if (isNew === 'true') {
      products = products.filter(p => p.isNew);
    }

    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      brand,
      price,
      oldPrice,
      discount,
      images,
      description,
      material,
      color,
      availableColors,
      width,
      height,
      depth,
      weight,
      availableSizes,
      stock,
      availability,
      isFeatured,
      isNew,
      isDiscounted,
      isBestSeller,
      specifications
    } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ error: 'Product name, category, and price are required' });
    }

    const calculatedDiscount = discount !== undefined ? Number(discount) : (oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null);

    const product = db.createProduct({
      name: String(name),
      category: String(category),
      brand: String(brand || 'AURA Atelier'),
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      discount: calculatedDiscount,
      rating: 5.0,
      reviewsCount: 1,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'],
      description: String(description || ''),
      material: String(material || 'Engineered Carbon & Premium Fabric'),
      color: String(color || 'Obsidian Black'),
      availableColors: Array.isArray(availableColors) && availableColors.length > 0 ? availableColors : [color || 'Obsidian Black'],
      width: String(width || '100 cm'),
      height: String(height || '80 cm'),
      depth: String(depth || '90 cm'),
      weight: String(weight || '25 kg'),
      availableSizes: Array.isArray(availableSizes) ? availableSizes : ['Standard'],
      stock: Number(stock !== undefined ? stock : 10),
      availability: availability || (stock > 0 ? 'in_stock' : 'out_of_stock'),
      isFeatured: Boolean(isFeatured),
      isNew: Boolean(isNew !== undefined ? isNew : true),
      isDiscounted: Boolean(isDiscounted || (calculatedDiscount && calculatedDiscount > 0)),
      isBestSeller: Boolean(isBestSeller),
      specifications: specifications || {}
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    
    if (updates.oldPrice && updates.price && !updates.discount) {
      updates.discount = Math.round(((updates.oldPrice - updates.price) / updates.oldPrice) * 100);
    }

    const updated = db.updateProduct(id, updates);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found or already deleted' });
  res.json({ success: true, message: 'Product deleted successfully' });
});

app.post('/api/products/:id/reviews', (req: Request, res: Response) => {
  const { author, rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and review comment are required' });
  }
  const updatedProduct = db.addReview(req.params.id, { author, rating: Number(rating), comment });
  if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
  res.json(updatedProduct);
});

// 2. CATEGORIES
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(db.getCategories());
});

app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, slug, description, image } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const category = db.createCategory({
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || 'Premium architectural furniture for contemporary spaces.',
    image: image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80'
  });
  res.status(201).json(category);
});

app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Category not found' });
  res.json(updated);
});

app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true });
});

// 3. SETTINGS & DESIGN CUSTOMIZATION
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.post('/api/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: 'Failed to update website settings' });
  }
});

// 4. IMAGE UPLOAD & ASSETS
app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
  try {
    const { imageBase64, filename, images } = req.body;

    const saveSingleBase64 = (b64: string, origName?: string): string => {
      // If already a remote URL
      if (b64.startsWith('http://') || b64.startsWith('https://')) {
        return b64;
      }
      const matches = b64.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid image base64 format');
      }
      let ext = matches[1].split('/')[1] || 'png';
      if (ext === 'jpeg') ext = 'jpg';
      if (ext.includes('svg')) ext = 'svg';

      const safePrefix = origName ? origName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20) : 'img';
      const safeName = `${safePrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, safeName);
      const buffer = Buffer.from(matches[2], 'base64');
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${safeName}`;
    };

    // If batch images provided
    if (Array.isArray(images) && images.length > 0) {
      const savedUrls: string[] = [];
      for (const item of images) {
        const b64 = typeof item === 'string' ? item : item.imageBase64;
        const name = typeof item === 'object' ? item.filename : undefined;
        if (b64) {
          savedUrls.push(saveSingleBase64(b64, name));
        }
      }
      return res.json({ urls: savedUrls, url: savedUrls[0] });
    }

    // Single image
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const savedUrl = saveSingleBase64(imageBase64, filename);
    return res.json({ url: savedUrl, urls: [savedUrl] });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to save image' });
  }
});

// Media library assets list
app.get('/api/media', requireAdmin, (_req: Request, res: Response) => {
  try {
    const media: Array<{ name: string; url: string; category: string; size?: number }> = [];

    // Check data/uploads
    if (fs.existsSync(UPLOADS_DIR)) {
      const uploadFiles = fs.readdirSync(UPLOADS_DIR);
      uploadFiles.forEach(file => {
        if (/\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file)) {
          const stat = fs.statSync(path.join(UPLOADS_DIR, file));
          media.push({
            name: file,
            url: `/uploads/${file}`,
            category: 'User Uploads',
            size: stat.size
          });
        }
      });
    }

    // Check public/images
    const PUBLIC_IMG_DIR = path.resolve(process.cwd(), 'public', 'images');
    if (fs.existsSync(PUBLIC_IMG_DIR)) {
      const publicFiles = fs.readdirSync(PUBLIC_IMG_DIR);
      publicFiles.forEach(file => {
        if (/\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file)) {
          const stat = fs.statSync(path.join(PUBLIC_IMG_DIR, file));
          media.push({
            name: file,
            url: `/images/${file}`,
            category: 'Store Catalog Images',
            size: stat.size
          });
        }
      });
    }

    res.json(media);
  } catch (err) {
    console.error('Media listing error:', err);
    res.status(500).json({ error: 'Failed to list media library' });
  }
});

// 5. AUTHENTICATION
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.createOrLoginUser(email, name);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token: user.token,
    isAdmin: user.role === 'admin'
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const adminEmailHeader = req.headers['x-admin-email'] as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === 'aura-admin-secret-token-7749') {
      return res.json({
        user: {
          id: 'admin-1',
          email: 'tavadzeluka520@gmail.com',
          name: 'Luka Tavadze (Admin)',
          role: 'admin'
        },
        token,
        isAdmin: true
      });
    }
  }

  if (adminEmailHeader && isAuthorizedAdmin(adminEmailHeader)) {
    return res.json({
      user: {
        id: 'admin-1',
        email: adminEmailHeader,
        name: 'Luka Tavadze (Admin)',
        role: 'admin'
      },
      token: 'aura-admin-secret-token-7749',
      isAdmin: true
    });
  }

  res.json({ user: null, isAdmin: false });
});

// 6. ORDERS
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, shippingAddress, items, subtotal, tax, total } = req.body;
    if (!customerName || !customerEmail || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const order = db.createOrder({
      customerName,
      customerEmail,
      shippingAddress: shippingAddress || 'Standard Delivery',
      items,
      subtotal: Number(subtotal) || 0,
      tax: Number(tax) || 0,
      total: Number(total) || 0
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.get('/api/orders', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getOrders());
});

// 7. MULTILINGUAL AI CUSTOMER ASSISTANT
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const catalog = db.getProducts();
    const categories = db.getCategories();
    const settings = db.getSettings();

    // Summarize catalog concisely so the model has high-precision factual data
    const catalogSummary = catalog.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: `$${p.price}`,
      oldPrice: p.oldPrice ? `$${p.oldPrice}` : null,
      discount: p.discount ? `${p.discount}% OFF` : null,
      stock: p.stock > 0 ? `${p.stock} in stock` : 'Out of stock',
      dimensions: `Width: ${p.width}, Height: ${p.height}, Depth: ${p.depth}, Weight: ${p.weight}`,
      material: p.material,
      color: p.color,
      availableColors: p.availableColors.join(', '),
      availableSizes: p.availableSizes.join(', '),
      description: p.description
    }));

    const systemInstruction = `You are "AURA AI", the intelligent luxury interior design and furniture concierge for "${settings.siteName}".
Your mission is to provide an elite, helpful, polite, and deeply knowledgeable consultation to customers.

STRICT ACCURACY RULES:
1. Grounding: You MUST ONLY reference real products, prices, dimensions, materials, and colors from the live catalog provided below.
2. DO NOT invent, hallucinate, or assume products that are not in the catalog.
3. If a customer asks for a category or product we do not have, politely clarify what similar alternatives we currently offer in our catalog.
4. When you recommend a product from the catalog, you can include its exact id enclosed in brackets like "[product:prod-id]" so the website can render an interactive quick-view card for the user!

MULTILINGUAL INTELLIGENCE REQUIREMENT:
- Automatically detect the language of the user's message (e.g. Georgian, English, Russian, Turkish, German, French, Spanish, Italian, Portuguese, Arabic, Chinese, Japanese, Korean, Ukrainian, Polish, etc.).
- You MUST respond in the EXACT SAME LANGUAGE that the user is writing in.
- For example:
  * If the user writes in Georgian (ქართული), respond naturally and elegantly in Georgian.
  * If in Turkish (Türkçe), respond in Turkish.
  * If in English, respond in English.
  * If in Russian (Русский), respond in Russian.

STORE POLICIES & FAQ:
- Shipping: Free white-glove global delivery & in-room assembly for orders over $2,000. Standard shipping takes 3-7 business days.
- Warranty: All seating & beds include our 10-year structural architectural guarantee.
- Sleep Trial: Mattresses have a 100-night risk-free trial.
- Returns: 30-day hassle-free returns on all standard furniture pieces.
- Custom finishes: Inquire through our administrator design team for bespoke fabric and leather commissions.

CURRENT LIVE CATALOG:
${JSON.stringify(catalogSummary, null, 2)}

CURRENT CATEGORIES:
${categories.map(c => c.name).join(', ')}`;

    // Try Gemini API via @google/genai
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI();
        const formattedContents = [];

        if (Array.isArray(conversationHistory)) {
          for (const msg of conversationHistory.slice(-6)) {
            if (msg.role === 'user' || msg.role === 'assistant') {
              formattedContents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: String(msg.content) }]
              });
            }
          }
        }

        formattedContents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction
          }
        });

        const reply = aiResponse.text || 'I am delighted to assist you with our architectural furniture collection. How may I guide your interior selection today?';
        return res.json({ reply });
      } catch (geminiErr) {
        console.error('Gemini API call failed, falling back to smart concierge engine:', geminiErr);
      }
    }

    // Resilient Fallback Concierge if API key isn't set or error occurred
    const q = message.toLowerCase();
    const matchedProducts = catalog.filter(p =>
      q.includes(p.name.toLowerCase()) ||
      q.includes(p.category.toLowerCase()) ||
      q.includes(p.color.toLowerCase()) ||
      q.includes(p.material.toLowerCase())
    );

    let fallbackReply = '';
    // Detect Georgian script
    const hasGeorgian = /[\u10A0-\u10FF]/.test(message);
    // Detect Cyrillic
    const hasCyrillic = /[\u0400-\u04FF]/.test(message);
    // Detect Turkish characters
    const hasTurkish = /[ğüşıöçĞÜŞİÖÇ]/.test(message);

    if (hasGeorgian) {
      if (matchedProducts.length > 0) {
        const top = matchedProducts[0];
        fallbackReply = `გამარჯობა! მოხარული ვარ დაგეხმაროთ AURA-ს კოლექციის შერჩევაში. ჩვენს კატალოგში გვაქვს შესანიშნავი მოდელი: "${top.name}" (${top.category}), ფასი: $${top.price}${top.discount ? ` (${top.discount}% ფასდაკლება)` : ''}. მასალა: ${top.material}. ზომები: სიგანე ${top.width}, სიმაღლე ${top.height}, სიღრმე ${top.depth}. ხელმისაწვდომია მარაგში (${top.stock} ცალი). [product:${top.id}]`;
      } else {
        fallbackReply = `მოგესალმებით AURA Modern Living-ში! ჩვენ გვაქვს ექსკლუზიური თანამედროვე ავეჯი: დივნები, სავარძლები, საწოლები, სასადილო მაგიდები და განათება. რით შემიძლია დაგეხმაროთ დღეს?`;
      }
    } else if (hasTurkish) {
      if (matchedProducts.length > 0) {
        const top = matchedProducts[0];
        fallbackReply = `Merhaba! AURA koleksiyonumuzda aradığınız harika bir parça buldum: "${top.name}" (${top.category}), Fiyat: $${top.price}${top.discount ? ` (%${top.discount} indirim)` : ''}. Malzeme: ${top.material}. Boyutlar: ${top.width} x ${top.height} x ${top.depth}. Stok: ${top.stock} adet mevcut. [product:${top.id}]`;
      } else {
        fallbackReply = `AURA Modern Living'e hoş geldiniz! Lüks modern mobilyalarımız, koltuk takımlarımız, yataklarımız ve aydınlatma ürünlerimiz hakkında sorularınızı yanıtlamaktan mutluluk duyarım.`;
      }
    } else if (hasCyrillic) {
      if (matchedProducts.length > 0) {
        const top = matchedProducts[0];
        fallbackReply = `Здравствуйте! В нашей коллекции представлен отличный вариант: "${top.name}" (${top.category}), Цена: $${top.price}${top.discount ? ` (скидка ${top.discount}%)` : ''}. Материал: ${top.material}. Габариты: ${top.width} x ${top.height} x ${top.depth}. В наличии: ${top.stock} шт. [product:${top.id}]`;
      } else {
        fallbackReply = `Добро пожаловать в AURA Modern Living! Рад помочь вам подобрать мебель из нашего каталога: диваны, кровати, столы, кресла и освещение. Задайте любой вопрос по размерам, материалам или доставке!`;
      }
    } else {
      if (matchedProducts.length > 0) {
        const top = matchedProducts[0];
        fallbackReply = `Hello! Based on our live architectural catalog, I highly recommend the "${top.name}" from our ${top.category} collection. It features premium ${top.material} in ${top.color}, measuring ${top.width} x ${top.height} x ${top.depth}. It is currently priced at $${top.price}${top.discount ? ` (${top.discount}% OFF)` : ''} with ${top.stock} units in stock. [product:${top.id}]`;
      } else {
        fallbackReply = `Welcome to AURA Modern Living! I am your AI architectural design assistant. We offer premium modern collections across all living spaces including Sofas, Beds, Monolithic Tables, Lighting, and Office Furniture. How may I assist your space today?`;
      }
    }

    res.json({ reply: fallbackReply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'AI Concierge temporarily unavailable' });
  }
});

// ==========================================
// CLIENT SERVING (VITE IN DEV, STATIC IN PROD)
// ==========================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AURA Server] running on http://0.0.0.0:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer();
