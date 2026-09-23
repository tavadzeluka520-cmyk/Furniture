import fs from 'fs';
import path from 'path';
import { Category, Order, Product, SiteSettings, User } from '../src/types';
import { initialCategories, initialProducts, initialSiteSettings } from './seedData';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
  orders: Order[];
  users: User[];
}

export function isAuthorizedAdmin(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === 'tavadzeluka520@gamil.com' || clean === 'tavadzeluka520@gmail.com';
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.products && parsed.categories && parsed.settings) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading database, resetting to seed:', err);
    }

    // Default initial seed
    const initialDb: DatabaseSchema = {
      products: initialProducts,
      categories: initialCategories,
      settings: initialSiteSettings,
      orders: [],
      users: [
        {
          id: 'admin-1',
          email: 'tavadzeluka520@gamil.com',
          name: 'Luka Tavadze (Admin)',
          role: 'admin',
          token: 'aura-admin-secret-token-7749'
        },
        {
          id: 'admin-2',
          email: 'tavadzeluka520@gmail.com',
          name: 'Luka Tavadze (Admin)',
          role: 'admin',
          token: 'aura-admin-secret-token-7749'
        }
      ]
    };

    this.saveData(initialDb);
    return initialDb;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // PRODUCTS
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'reviews'>): Product {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      reviews: [],
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.updateCategoryCounts();
    this.saveData(this.data);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.data.products[index] = {
      ...this.data.products[index],
      ...updates,
      id // preserve ID
    };
    this.updateCategoryCounts();
    this.saveData(this.data);
    return this.data.products[index];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.updateCategoryCounts();
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  addReview(productId: string, review: { author: string; rating: number; comment: string }): Product | null {
    const product = this.getProductById(productId);
    if (!product) return null;

    const newReview = {
      id: 'rev-' + Date.now(),
      author: review.author || 'Verified Buyer',
      rating: Math.max(1, Math.min(5, review.rating)),
      date: new Date().toISOString().split('T')[0],
      comment: review.comment,
      verified: true
    };

    product.reviews.unshift(newReview);
    product.reviewsCount = product.reviews.length;
    const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((sum / product.reviewsCount).toFixed(1));

    this.saveData(this.data);
    return product;
  }

  // CATEGORIES
  getCategories(): Category[] {
    this.updateCategoryCounts();
    return this.data.categories;
  }

  createCategory(categoryData: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...categoryData,
      id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemCount: 0
    };
    this.data.categories.push(newCategory);
    this.updateCategoryCounts();
    this.saveData(this.data);
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    const oldName = this.data.categories[index].name;
    this.data.categories[index] = {
      ...this.data.categories[index],
      ...updates,
      id
    };

    // If category name changed, update all products under this category
    if (updates.name && updates.name !== oldName) {
      this.data.products.forEach(p => {
        if (p.category === oldName) {
          p.category = updates.name!;
        }
      });
    }

    this.updateCategoryCounts();
    this.saveData(this.data);
    return this.data.categories[index];
  }

  deleteCategory(id: string): boolean {
    const category = this.data.categories.find(c => c.id === id);
    if (!category) return false;

    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveData(this.data);
    return true;
  }

  private updateCategoryCounts() {
    this.data.categories.forEach(cat => {
      cat.itemCount = this.data.products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
    });
  }

  // SETTINGS
  getSettings(): SiteSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      homeSections: {
        ...this.data.settings.homeSections,
        ...(updates.homeSections || {})
      }
    };
    this.saveData(this.data);
    return this.data.settings;
  }

  // ORDERS
  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
    const newOrder: Order = {
      ...orderData,
      id: 'AURA-' + Math.floor(100000 + Math.random() * 900000),
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Decrement stock for purchased items
    orderData.items.forEach(item => {
      const prod = this.getProductById(item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (prod.stock === 0) {
          prod.availability = 'out_of_stock';
        } else if (prod.stock <= 3) {
          prod.availability = 'low_stock';
        }
      }
    });

    this.data.orders.unshift(newOrder);
    this.saveData(this.data);
    return newOrder;
  }

  getOrders(): Order[] {
    return this.data.orders;
  }

  // USERS
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createOrLoginUser(email: string, name?: string): User {
    const cleanEmail = email.trim().toLowerCase();
    let user = this.getUserByEmail(cleanEmail);
    const isAdmin = isAuthorizedAdmin(cleanEmail);

    if (!user) {
      user = {
        id: 'user-' + Date.now(),
        email: cleanEmail,
        name: name || (isAdmin ? 'Luka Tavadze (Admin)' : cleanEmail.split('@')[0]),
        role: isAdmin ? 'admin' : 'customer',
        token: isAdmin ? 'aura-admin-secret-token-7749' : 'cust-tok-' + Date.now()
      };
      this.data.users.push(user);
      this.saveData(this.data);
    } else if (isAdmin && user.role !== 'admin') {
      user.role = 'admin';
      user.token = 'aura-admin-secret-token-7749';
      this.saveData(this.data);
    }

    return user;
  }
}

export const db = new Database();
