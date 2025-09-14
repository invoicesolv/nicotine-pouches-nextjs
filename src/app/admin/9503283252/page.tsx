'use client';

import '../globals.css'; // Import admin-specific dark mode styles
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseAdmin } from '../../../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Upload, 
  Users, 
  Package, 
  Settings, 
  Eye, 
  EyeOff, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Globe,
  Link as LinkIcon,
  FileText,
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  Database,
  Download,
  RefreshCw,
  AlertCircle,
  CheckSquare,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Inbox,
  LineChart,
  Square,
  CreditCard,
  PieChart,
  Crown,
  HelpCircle,
  Move,
  UserPlus,
  ShoppingCart,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AdminThemeProvider } from '@/components/admin-theme-provider';
import { toast } from 'sonner';

interface Vendor {
  id: number;
  name: string;
  website: string;
  website_url?: string;
  contact_email: string;
  contact_phone: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface USVendor {
  id: string;
  name: string;
  website: string;
  website_url?: string;
  contact_email: string;
  contact_phone: string;
  description: string;
  is_active: boolean;
  region: string;
  created_at: string;
  updated_at?: string;
}

interface USVendorProduct {
  id: string;
  vendor_id: string;
  us_product_id: number;
  price_1pack?: number;
  price_3pack?: number;
  price_5pack?: number;
  price_10pack?: number;
  price_20pack?: number;
  price_25pack?: number;
  price_30pack?: number;
  price_50pack?: number;
  url?: string;
}

interface Signup {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  source: string;
  is_active: boolean;
  confirmed_at?: string;
  unsubscribed_at?: string;
}

interface USProduct {
  id: number;
  product_title: string;
  brand: string;
  flavour?: string;
  strength?: string;
  format?: string;
  nicotine_mg_pouch?: number;
  td_element?: string;
  description?: string;
  page_url?: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
}

interface VendorProduct {
  id: string;
  vendor_id: number;
  name: string;
  brand: string;
  url?: string;
  price_1pack?: string;
  price_3pack?: string;
  price_5pack?: string;
  price_10pack?: string;
  price_20pack?: string;
  price_25pack?: string;
  price_30pack?: string;
  price_50pack?: string;
  created_at: string;
  updated_at?: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  flavour?: string;
  strength_group?: string;
  format?: string;
  price?: number;
  image_url?: string;
  description?: string;
  page_url?: string;
  created_at: string;
  updated_at?: string;
}

interface ProductMatch {
  id: number;
  name: string;
  brand: string;
  flavour?: string;
  similarity: number;
}

interface VendorProductMatch {
  vendor_product: string;
  matches: ProductMatch[];
}

interface ProductMapping {
  vendor_product: string;
  product_id: number;
  vendor_id: string | number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<'UK' | 'US'>('UK');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
  const [mainProducts, setMainProducts] = useState<Product[]>([]);
  
  // US-specific state
  const [usVendors, setUsVendors] = useState<USVendor[]>([]);
  const [usVendorProducts, setUsVendorProducts] = useState<USVendorProduct[]>([]);
  const [usProducts, setUsProducts] = useState<USProduct[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [signupsLoading, setSignupsLoading] = useState(false);
  const [signupsSearchTerm, setSignupsSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('vendors');
  const [selectedVendorForProducts, setSelectedVendorForProducts] = useState('all');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productBrandFilter, setProductBrandFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  
  // Product matching state
  const [productMatches, setProductMatches] = useState<{[key: string]: ProductMatch[]}>({});
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [selectedMappings, setSelectedMappings] = useState<{[key: string]: number}>({});
  
  // Pagination states
  const [mainProductsPage, setMainProductsPage] = useState(1);
  const [vendorProductsPage, setVendorProductsPage] = useState(1);
  const [mainProductsTotalPages, setMainProductsTotalPages] = useState(1);
  const [vendorProductsTotalPages, setVendorProductsTotalPages] = useState(1);
  const [mainProductsPageSize, setMainProductsPageSize] = useState(20);
  const [vendorProductsPageSize, setVendorProductsPageSize] = useState(20);
  const [mainProductsTotalCount, setMainProductsTotalCount] = useState(0);
  const [vendorProductsTotalCount, setVendorProductsTotalCount] = useState(0);
  
  // Search states
  const [mainProductsSearchTerm, setMainProductsSearchTerm] = useState('');
  const [vendorProductsSearchTerm, setVendorProductsSearchTerm] = useState('');
  const [bulkAutolinkCount, setBulkAutolinkCount] = useState(0);
  const [isProcessingBulkAutolink, setIsProcessingBulkAutolink] = useState(false);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [vendorFilter, setVendorFilter] = useState('all'); // all, active, inactive
  const [sortBy, setSortBy] = useState('name'); // name, created_at, updated_at
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [showMappingInterface, setShowMappingInterface] = useState(false);
  const [mappingResults, setMappingResults] = useState<any[]>([]);
  const [isProcessingMapping, setIsProcessingMapping] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    description: '',
    is_active: true
  });

  // CSV Upload states
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [csvProgress, setCsvProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const [showImportHistory, setShowImportHistory] = useState(false);
  
  // Product CSV Upload states
  const [productCsvFile, setProductCsvFile] = useState<File | null>(null);
  const [productCsvData, setProductCsvData] = useState<any[]>([]);
  const [productCsvHeaders, setProductCsvHeaders] = useState<string[]>([]);
  const [productColumnMapping, setProductColumnMapping] = useState<Record<string, string>>({});
  const [productCsvPreview, setProductCsvPreview] = useState<any[]>([]);
  const [isProcessingProductCsv, setIsProcessingProductCsv] = useState(false);
  const [productCsvProgress, setProductCsvProgress] = useState(0);
  const [productImportResults, setProductImportResults] = useState<any>(null);
  const [showProductCsvPreview, setShowProductCsvPreview] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    totalProducts: 0,
    avgPrice: 0
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const adminKey = localStorage.getItem('admin_key');
      if (adminKey === '9503283252') {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      // Load import history from localStorage
      const savedHistory = localStorage.getItem('import_history');
      if (savedHistory) {
        try {
          setImportHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error('Failed to load import history:', error);
        }
      }
    }
  }, [isAuthenticated]);

  // Handle region changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [selectedRegion]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (selectedRegion === 'UK') {
        // Fetch UK vendors
        const { data: vendorsData, error: vendorsError } = await supabase()
          .from('vendors')
          .select('*')
          .order('created_at', { ascending: false });

        if (vendorsError) throw vendorsError;

        setVendors(vendorsData || []);

        // Calculate stats
        const activeVendors = vendorsData?.filter((v: any) => v.is_active).length || 0;

        setStats({
          totalVendors: vendorsData?.length || 0,
          activeVendors,
          totalProducts: 0, // Will be updated by individual fetch functions
          avgPrice: 0
        });

        // Fetch initial data for both tabs
        await fetchMainProducts();
        await fetchVendorProducts();
      } else {
        // Fetch US vendors
        const { data: usVendorsData, error: usVendorsError } = await supabase()
          .from('us_vendors')
          .select('*')
          .order('created_at', { ascending: false });

        if (usVendorsError) throw usVendorsError;

        setUsVendors(usVendorsData || []);

        // Calculate stats
        const activeUsVendors = usVendorsData?.filter((v: any) => v.is_active).length || 0;

        setStats({
          totalVendors: usVendorsData?.length || 0,
          activeVendors: activeUsVendors,
          totalProducts: 0, // Will be updated by individual fetch functions
          avgPrice: 0
        });

        // Fetch initial data for both tabs
        await fetchUSMainProducts();
        await fetchUSVendorProducts();
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMainProducts = async (page = 1, search = '', pageSize?: number) => {
    try {
      const limit = pageSize || mainProductsPageSize;
      const offset = (page - 1) * limit;

      let query = supabase()
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,flavour.ilike.%${search}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setMainProducts(data || []);
      setMainProductsTotalCount(count || 0);
      setMainProductsTotalPages(Math.ceil((count || 0) / limit));
      setMainProductsPage(page);

      // Update stats
      const avgPrice = data?.length > 0 
        ? data.reduce((sum: any, p: any) => sum + (p.price || 0), 0) / data.length 
        : 0;

      setStats(prev => ({
        ...prev,
        totalProducts: count || 0,
        avgPrice
      }));

    } catch (error) {
      console.error('Error fetching main products:', error);
      toast.error('Failed to fetch main products');
    }
  };

  const fetchVendorProducts = async (page = 1, search = '', vendorId = 'all', pageSize?: number) => {
    try {
      const limit = pageSize || vendorProductsPageSize;
      const offset = (page - 1) * limit;

      let query = supabase()
        .from('vendor_products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (vendorId !== 'all') {
        // Handle both string and number vendor IDs
        const vendorIdValue = typeof vendorId === 'string' ? vendorId : String(vendorId);
        query = query.eq('vendor_id', vendorIdValue);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setVendorProducts(data || []);
      setVendorProductsTotalCount(count || 0);
      setVendorProductsTotalPages(Math.ceil((count || 0) / limit));
      setVendorProductsPage(page);

      // Automatically find matches for all vendor products
      if (data && data.length > 0) {
        await findMatchesForVendorProducts(data);
      }

    } catch (error) {
      console.error('Error fetching vendor products:', error);
      toast.error('Failed to fetch vendor products');
    }
  };

  // US-specific fetch functions
  const fetchUSMainProducts = async (page = 1, search = '', pageSize?: number) => {
    try {
      const limit = pageSize || mainProductsPageSize;
      const offset = (page - 1) * limit;

      let query = supabase()
        .from('us_products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`product_title.ilike.%${search}%,brand.ilike.%${search}%,flavour.ilike.%${search}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setUsProducts(data || []);
      setMainProductsTotalCount(count || 0);
      setMainProductsTotalPages(Math.ceil((count || 0) / limit));
      setMainProductsPage(page);

      // Update stats for US products
      const avgPrice = data?.length > 0 
        ? data.reduce((sum: any, p: any) => sum + (p.price || 0), 0) / data.length 
        : 0;

      setStats(prev => ({
        ...prev,
        totalProducts: count || 0,
        avgPrice
      }));

    } catch (error) {
      console.error('Error fetching US products:', error);
      toast.error('Failed to fetch US products');
    }
  };

  const fetchUSVendorProducts = async (page = 1, search = '', vendorId = 'all', pageSize?: number) => {
    try {
      const limit = pageSize || vendorProductsPageSize;
      const offset = (page - 1) * limit;

      let query = supabase()
        .from('us_vendor_products')
        .select(`
          *,
          us_products!inner(product_title, brand, flavour, strength, format, image_url),
          us_vendors!inner(name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (vendorId !== 'all') {
        // Handle both string and number vendor IDs
        const vendorIdValue = typeof vendorId === 'string' ? vendorId : String(vendorId);
        query = query.eq('us_vendor_id', vendorIdValue);
      }

      if (search) {
        query = query.or(`us_products.product_title.ilike.%${search}%,us_products.brand.ilike.%${search}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setUsVendorProducts(data || []);
      setVendorProductsTotalCount(count || 0);
      setVendorProductsTotalPages(Math.ceil((count || 0) / limit));
      setVendorProductsPage(page);

    } catch (error) {
      console.error('Error fetching US vendor products:', error);
      toast.error('Failed to fetch US vendor products');
    }
  };

  const handleAddVendor = async () => {
    try {
      const { error } = await supabase()
        .from('vendors')
        .insert([newVendor]);

      if (error) throw error;

      toast.success('Vendor added successfully');
      setNewVendor({
        name: '',
        website: '',
        contact_email: '',
        contact_phone: '',
        description: '',
        is_active: true
      });
      setIsAddingVendor(false);
      fetchData();
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast.error('Failed to add vendor');
    }
  };

  const handleDeleteVendor = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone and will also delete all associated vendor products and mappings.')) {
      return;
    }

    try {
      // First delete all vendor products and mappings
      const { error: productsError } = await supabase()
        .from('vendor_products')
        .delete()
        .eq('vendor_id', id);

      if (productsError) throw productsError;

      const { error: mappingsError } = await supabase()
        .from('vendor_product_mapping')
        .delete()
        .eq('vendor_id', id);

      if (mappingsError) throw mappingsError;

      // Then delete the vendor
      const { error } = await supabase()
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Vendor and all associated data deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      // Determine which table to delete from based on ID type
      if (typeof id === 'number') {
        // Main products table
        const { error } = await supabase()
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        // Refresh main products
        await fetchMainProducts(mainProductsPage, mainProductsSearchTerm, mainProductsPageSize);
      } else {
        // Vendor products table
      const { error } = await supabase()
        .from('vendor_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
        
        // Refresh vendor products
        await fetchVendorProducts(vendorProductsPage, vendorProductsSearchTerm, selectedVendorForProducts, vendorProductsPageSize);
      }

      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // CSV Processing Functions
  const parseCSV = (text: string): { headers: string[], data: any[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return { headers, data };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, data } = parseCSV(text);
      
      setCsvHeaders(headers);
      setCsvData(data);
      setCsvPreview(data.slice(0, 5)); // Show first 5 rows
      setShowCsvPreview(true);
      
      // Auto-map common columns for vendor products with flexible pack detection
      const autoMapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase().trim();
        
        // Basic field mapping
        if (lowerHeader.includes('name') || lowerHeader.includes('product')) {
          autoMapping[header] = 'name';
        } else if (lowerHeader.includes('brand')) {
          autoMapping[header] = 'brand';
        } else if (lowerHeader.includes('url') || lowerHeader.includes('link')) {
          autoMapping[header] = 'url';
        } else {
          // Dynamic pack detection - look for any number followed by pack/can/unit (with plural support)
          const packMatch = lowerHeader.match(/(\d+)\s*(pack|packs|can|cans|unit|units|pcs?|pieces?)/);
          if (packMatch) {
            const packSize = packMatch[1];
            const packType = packMatch[2];
            
            // Map to standard pack column names
            if (packSize === '1') {
              autoMapping[header] = 'price_1pack';
            } else if (packSize === '3') {
              autoMapping[header] = 'price_3pack';
            } else if (packSize === '5') {
              autoMapping[header] = 'price_5pack';
            } else if (packSize === '10') {
              autoMapping[header] = 'price_10pack';
            } else if (packSize === '20') {
              autoMapping[header] = 'price_20pack';
            } else if (packSize === '25') {
              autoMapping[header] = 'price_25pack';
            } else if (packSize === '30') {
              autoMapping[header] = 'price_30pack';
            } else if (packSize === '50') {
              autoMapping[header] = 'price_50pack';
            } else {
              // For any other pack size, map to the closest standard size
              const size = parseInt(packSize);
              if (size <= 1) {
                autoMapping[header] = 'price_1pack';
              } else if (size <= 3) {
                autoMapping[header] = 'price_3pack';
              } else if (size <= 5) {
                autoMapping[header] = 'price_5pack';
              } else if (size <= 10) {
                autoMapping[header] = 'price_10pack';
              } else if (size <= 20) {
                autoMapping[header] = 'price_20pack';
              } else if (size <= 25) {
                autoMapping[header] = 'price_25pack';
              } else if (size <= 30) {
                autoMapping[header] = 'price_30pack';
              } else {
                autoMapping[header] = 'price_50pack';
              }
            }
          }
          // Also check for price_ format
          else if (lowerHeader.startsWith('price_') && lowerHeader.includes('pack')) {
            autoMapping[header] = lowerHeader.replace('price_', 'price_');
          }
        }
      });
      setColumnMapping(autoMapping);
    };
    reader.readAsText(file);
  };


  const processCsvImport = async () => {
    if (!selectedVendor || !csvData.length) {
      toast.error('Please select a vendor and ensure CSV data is loaded');
      return;
    }

    setIsProcessingCsv(true);
    setCsvProgress(0);

    const importStartTime = new Date().toISOString();
    const selectedVendorData = vendors.find(v => v.id === parseInt(selectedVendor, 10));

    try {
      const results = {
        success: 0,
        errors: 0,
        matches: 0,
        newProducts: 0,
        errors_list: [] as string[]
      };

      // Process each row
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        setCsvProgress(Math.round((i / csvData.length) * 100));

        try {
          // Map CSV columns to vendor product data with flexible pack handling
          const productData: any = {
            vendor_id: selectedVendor,
            name: row[columnMapping.name] || '',
            brand: row[columnMapping.brand] || '',
            url: row[columnMapping.url] || ''
          };

          // Add all pack prices dynamically
          const standardPacks = ['price_1pack', 'price_3pack', 'price_5pack', 'price_10pack', 'price_20pack', 'price_25pack', 'price_30pack', 'price_50pack'];
          standardPacks.forEach(pack => {
            productData[pack] = row[columnMapping[pack]] || '';
          });

          // Handle custom pack sizes - map to closest standard size
          Object.entries(columnMapping).forEach(([header, field]) => {
            if (field === 'custom_pack') {
              // Extract pack size from header (with plural support)
              const packMatch = header.toLowerCase().match(/(\d+)\s*(pack|packs|can|cans|unit|units|pcs?|pieces?)/);
              if (packMatch) {
                const packSize = parseInt(packMatch[1]);
                // Map to closest standard pack size
                if (packSize <= 1) {
                  productData.price_1pack = row[header] || '';
                } else if (packSize <= 3) {
                  productData.price_3pack = row[header] || '';
                } else if (packSize <= 5) {
                  productData.price_5pack = row[header] || '';
                } else if (packSize <= 10) {
                  productData.price_10pack = row[header] || '';
                } else if (packSize <= 20) {
                  productData.price_20pack = row[header] || '';
                } else if (packSize <= 25) {
                  productData.price_25pack = row[header] || '';
                } else if (packSize <= 30) {
                  productData.price_30pack = row[header] || '';
                } else {
                  productData.price_50pack = row[header] || '';
                }
              }
            }
          });

          if (!productData.name) {
            results.errors++;
            results.errors_list.push(`Row ${i + 1}: Missing product name`);
            continue;
          }

          // Insert product
          const { error } = await supabase()
            .from('vendor_products')
            .insert([productData]);

          if (error) throw error;

          results.success++;
          results.newProducts++;

        } catch (error) {
          results.errors++;
          results.errors_list.push(`Row ${i + 1}: ${error}`);
        }
      }

      setImportResults(results);
      setCsvProgress(100);
      
      // Save import history
      const importRecord = {
        id: Date.now().toString(),
        timestamp: importStartTime,
        vendor_id: selectedVendor,
        vendor_name: selectedVendorData?.name || 'Unknown Vendor',
        filename: csvFile?.name || 'Unknown File',
        total_rows: csvData.length,
        success_count: results.success,
        error_count: results.errors,
        match_count: results.matches,
        new_product_count: results.newProducts,
        status: results.errors > 0 ? 'partial' : 'success',
        errors: results.errors_list.slice(0, 10) // Keep only first 10 errors
      };

      // Update import history
      setImportHistory(prev => [importRecord, ...prev.slice(0, 49)]); // Keep last 50 imports
      
      // Save to localStorage for persistence
      localStorage.setItem('import_history', JSON.stringify([importRecord, ...importHistory.slice(0, 49)]));
      
      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} products`);
        fetchData(); // Refresh data
      }

    } catch (error) {
      console.error('CSV import error:', error);
      toast.error('Failed to import CSV data');
    } finally {
      setIsProcessingCsv(false);
    }
  };

  const resetCsvUpload = () => {
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setSelectedVendor('');
    setColumnMapping({});
    setCsvPreview([]);
    setShowCsvPreview(false);
    setImportResults(null);
    setCsvProgress(0);
  };

  // Product CSV Upload Functions
  const handleProductFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setProductCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, data } = parseCSV(text);
      
      setProductCsvHeaders(headers);
      setProductCsvData(data);
      setProductCsvPreview(data.slice(0, 5)); // Show first 5 rows
      setShowProductCsvPreview(true);
      
      // Auto-map common columns for products
      const autoMapping: Record<string, string> = {};
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        if (lowerHeader.includes('name') || lowerHeader.includes('product')) {
          autoMapping[header] = 'name';
        } else if (lowerHeader.includes('brand')) {
          autoMapping[header] = 'brand';
        } else if (lowerHeader.includes('price')) {
          autoMapping[header] = 'price';
        } else if (lowerHeader.includes('flavour') || lowerHeader.includes('flavor')) {
          autoMapping[header] = 'flavour';
        } else if (lowerHeader.includes('strength')) {
          autoMapping[header] = 'strength_group';
        } else if (lowerHeader.includes('format')) {
          autoMapping[header] = 'format';
        } else if (lowerHeader.includes('description')) {
          autoMapping[header] = 'description';
        } else if (lowerHeader.includes('image') || lowerHeader.includes('photo')) {
          autoMapping[header] = 'image_url';
        } else if (lowerHeader.includes('url') || lowerHeader.includes('link')) {
          autoMapping[header] = 'page_url';
        }
      });
      setProductColumnMapping(autoMapping);
    };
    reader.readAsText(file);
  };

  const processProductCsvImport = async () => {
    if (!productCsvData.length) {
      toast.error('Please ensure CSV data is loaded');
      return;
    }

    setIsProcessingProductCsv(true);
    setProductCsvProgress(0);

    try {
      const results = {
        success: 0,
        errors: 0,
        errors_list: [] as string[]
      };

      // Process each row
      for (let i = 0; i < productCsvData.length; i++) {
        const row = productCsvData[i];
        setProductCsvProgress(Math.round((i / productCsvData.length) * 100));

        try {
          // Map CSV columns to product data
          const productData = {
            name: row[productColumnMapping.name] || '',
            brand: row[productColumnMapping.brand] || '',
            price: parseFloat(row[productColumnMapping.price] || '0'),
            flavour: row[productColumnMapping.flavour] || null,
            strength_group: row[productColumnMapping.strength_group] || null,
            format: row[productColumnMapping.format] || null,
            description: row[productColumnMapping.description] || null,
            image_url: row[productColumnMapping.image_url] || null,
            page_url: row[productColumnMapping.page_url] || null
          };

          if (!productData.name) {
            results.errors++;
            results.errors_list.push(`Row ${i + 1}: Missing product name`);
            continue;
          }

          // Insert product
          const { error } = await supabase()
            .from('products')
            .insert([productData]);

          if (error) throw error;

          results.success++;

        } catch (error) {
          results.errors++;
          results.errors_list.push(`Row ${i + 1}: ${error}`);
        }
      }

      setProductImportResults(results);
      setProductCsvProgress(100);
      
      if (results.success > 0) {
        toast.success(`Successfully imported ${results.success} products`);
        fetchData(); // Refresh data
      }

    } catch (error) {
      console.error('Product CSV import error:', error);
      toast.error('Failed to import product CSV data');
    } finally {
      setIsProcessingProductCsv(false);
    }
  };

  const resetProductCsvUpload = () => {
    setProductCsvFile(null);
    setProductCsvData([]);
    setProductCsvHeaders([]);
    setProductColumnMapping({});
    setProductCsvPreview([]);
    setShowProductCsvPreview(false);
    setProductImportResults(null);
    setProductCsvProgress(0);
  };

  // Product mapping functions (from vendor-profiles)
  const calculateSimilarity = (str1: string, str2: string): number => {
    // Normalize strings for comparison
    const normalizeString = (str: string) => {
      return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    };
    
    const s1 = normalizeString(str1);
    const s2 = normalizeString(str2);
    
    // Check for exact match first
    if (s1 === s2) {
      return 0.99; // 99% match for exact matches
    }
    
    // Extract brand and flavor for nicotine pouches
    const parts1 = extractBrandAndFlavor(s1);
    const parts2 = extractBrandAndFlavor(s2);
    
    // Calculate multiple similarity scores
    const scores: { [key: string]: number } = {};
    
    // 1. Basic string similarity (20% weight)
    const levenshtein = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    scores.basic = 1 - (levenshtein / maxLength);
    
    // 2. Brand matching (50% weight) - most important for nicotine pouches
    let brandScore = 0;
    if (parts1.brand && parts2.brand) {
      if (parts1.brand === parts2.brand) {
        brandScore = 1.0; // Exact brand match
      } else if (parts2.brand.includes(parts1.brand) || parts1.brand.includes(parts2.brand)) {
        brandScore = 0.8; // Partial brand match
      }
    }
    scores.brand = brandScore;
    
    // 3. Flavor matching (30% weight)
    let flavorScore = 0;
    if (parts1.flavor && parts2.flavor) {
      flavorScore = calculateFlavorSimilarity(parts1.flavor, parts2.flavor);
    }
    scores.flavor = flavorScore;
    
    // 4. Combined weighted score
    const combinedScore = (scores.basic * 0.2) + (scores.brand * 0.5) + (scores.flavor * 0.3);
    
    return combinedScore;
  };

  const extractBrandAndFlavor = (productName: string): { brand: string; flavor: string } => {
    const name = productName.trim();
    const parts = { brand: '', flavor: '' };
    
    // Common nicotine pouch patterns
    const patterns = [
      // Pattern: "4NX Arctic Mint" -> brand: "4NX", flavor: "Arctic Mint"
      /^([A-Z0-9]+)\s+(.+)$/,
      // Pattern: "77 Apple & Mint" -> brand: "77", flavor: "Apple & Mint"
      /^(\d+)\s+(.+)$/,
      // Pattern: "Velo Ice Cool" -> brand: "Velo", flavor: "Ice Cool"
      /^([A-Za-z]+)\s+(.+)$/
    ];
    
    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        parts.brand = match[1].trim();
        parts.flavor = match[2].trim();
        break;
      }
    }
    
    // If no pattern matched, try to split on common separators
    if (!parts.brand) {
      const separators = [' - ', ' | ', ' / ', ' & '];
      for (const sep of separators) {
        if (name.includes(sep)) {
          const split = name.split(sep, 2);
          parts.brand = split[0].trim();
          parts.flavor = split[1].trim();
          break;
        }
      }
    }
    
    return parts;
  };

  const calculateFlavorSimilarity = (flavor1: string, flavor2: string): number => {
    const f1 = flavor1.toLowerCase();
    const f2 = flavor2.toLowerCase();
    
    // Exact match
    if (f1 === f2) return 1.0;
    
    // Common flavor variations mapping for nicotine pouches
    const variations: { [key: string]: string[] } = {
      'mint': ['mint', 'minty', 'fresh mint', 'cool mint'],
      'arctic': ['arctic', 'ice', 'icy', 'cool', 'frost'],
      'berry': ['berry', 'berries', 'forest fruits', 'mixed berries'],
      'apple': ['apple', 'green apple', 'red apple'],
      'cherry': ['cherry', 'cherries', 'sour cherry'],
      'vanilla': ['vanilla', 'cream', 'sweet'],
      'cola': ['cola', 'coke', 'cola flavor'],
      'peach': ['peach', 'peaches', 'peachy'],
      'raspberry': ['raspberry', 'raspberries'],
      'tropical': ['tropical', 'tropical fruits', 'exotic'],
      'energy': ['energy', 'energizing', 'boost'],
      'fire': ['fire', 'spicy', 'hot', 'burning'],
      'citrus': ['citrus', 'lemon', 'lime', 'orange'],
      'coffee': ['coffee', 'espresso', 'cappuccino'],
      'chocolate': ['chocolate', 'cocoa', 'mocha'],
      'strawberry': ['strawberry', 'strawberries'],
      'grape': ['grape', 'grapes'],
      'watermelon': ['watermelon', 'water melon'],
      'pineapple': ['pineapple', 'pine apple'],
      'coconut': ['coconut', 'coco'],
      'cinnamon': ['cinnamon', 'cinnamon spice'],
      'licorice': ['licorice', 'liquorice'],
      'menthol': ['menthol', 'mentholated'],
      'eucalyptus': ['eucalyptus', 'eucaliptus']
    };
    
    // Check if flavors are in the same variation group
    for (const [group, flavors] of Object.entries(variations)) {
      const f1InGroup = flavors.includes(f1);
      const f2InGroup = flavors.includes(f2);
      
      if (f1InGroup && f2InGroup) {
        return 0.9; // High similarity for same flavor group
      }
    }
    
    // Check for partial matches
    if (f1.includes(f2) || f2.includes(f1)) {
      return 0.7; // Medium similarity for partial matches
    }
    
    // Use Levenshtein distance for other cases
    const levenshtein = levenshteinDistance(f1, f2);
    const maxLength = Math.max(f1.length, f2.length);
    return 1 - (levenshtein / maxLength);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const findMatchesForVendorProducts = async (vendorProducts: any[]) => {
    try {
      // Get all existing products from Supabase
      const { data: existingProducts, error } = await supabase()
        .from('products')
        .select('*');

      if (error) throw error;

      const matches: { [key: string]: ProductMatch[] } = {};
      
      for (const vendorProduct of vendorProducts) {
        const productName = vendorProduct.name || 'Unknown Product';
        const potentialMatches: ProductMatch[] = [];
        
        for (const existingProduct of existingProducts || []) {
          const similarity = calculateSimilarity(productName, existingProduct.name);
          if (similarity >= 0.75) { // 75% similarity threshold
            potentialMatches.push({
              id: existingProduct.id,
              name: existingProduct.name,
              brand: existingProduct.brand || 'Unknown',
              flavour: existingProduct.flavour,
              similarity: Math.round(similarity * 100)
            });
          }
        }
        
        // Sort by similarity
        potentialMatches.sort((a, b) => b.similarity - a.similarity);
        
        // Store matches for this vendor product
        matches[productName] = potentialMatches.slice(0, 5); // Top 5 matches
      }
      
      setProductMatches(matches);
      
    } catch (error) {
      console.error('Error finding product matches:', error);
    }
  };

  const findProductMatchesForMapping = async (vendorProducts: any[], columnMapping: Record<string, string>) => {
    setIsProcessingMapping(true);
    try {
      // Get all existing products from Supabase
      const { data: existingProducts, error } = await supabase()
        .from('products')
        .select('*');

      if (error) throw error;

      const matches = [];
      
      for (const vendorProduct of vendorProducts) {
        // Extract product name using column mapping
        const productName = columnMapping.name ? vendorProduct[columnMapping.name] : vendorProduct.name || vendorProduct.product_name || 'Unknown Product';
        const potentialMatches = [];
        
        for (const existingProduct of existingProducts || []) {
          const similarity = calculateSimilarity(productName, existingProduct.name);
          if (similarity >= 0.75) { // 75% similarity threshold (increased for more accurate matches)
            potentialMatches.push({
              id: existingProduct.id,
              name: existingProduct.name,
              brand: existingProduct.brand || 'Unknown',
              flavour: existingProduct.flavour,
              similarity: Math.round(similarity * 100)
            });
          }
        }
        
        // Sort by similarity
        potentialMatches.sort((a, b) => b.similarity - a.similarity);
        
        matches.push({
          vendor_product: productName,
          potential_matches: potentialMatches.slice(0, 5) // Top 5 matches
        });
      }
      
      setMappingResults(matches);
      setShowMappingInterface(true);
      
    } catch (error) {
      console.error('Error finding product matches:', error);
      toast.error('Failed to find product matches');
    } finally {
      setIsProcessingMapping(false);
    }
  };

  const confirmMapping = (vendorProduct: string, productId: string, productName: string) => {
    setProductMappings(prev => ({
      ...prev,
      [vendorProduct]: productId
    }));
    toast.success(`Mapped "${vendorProduct}" to "${productName}"`);
  };

  const saveMappings = async () => {
    try {
      const mappingsToSave = Object.entries(productMappings).map(([vendorProduct, productId]) => ({
        vendor_product: vendorProduct,
        product_id: productId,
        vendor_id: selectedVendor,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase()
        .from('vendor_product_mapping')
        .insert(mappingsToSave);

      if (error) throw error;

      toast.success(`Successfully saved ${mappingsToSave.length} product mappings`);
      setShowMappingInterface(false);
      setProductMappings([]);
      setMappingResults([]);
      
    } catch (error) {
      console.error('Error saving mappings:', error);
      toast.error('Failed to save mappings');
    }
  };

  // Bulk autolink functionality
  const countExactMatches = async (vendorId: string | number) => {
    try {
      console.log('Counting exact matches for vendor:', vendorId);
      
      if (!supabaseAdmin) {
        console.error('Supabase admin client not available');
        return 0;
      }
      
      const { data: vendorProducts, error: vendorError } = await supabaseAdmin()
        .from('vendor_products')
        .select('name')
        .eq('vendor_id', vendorId);

      if (vendorError) {
        console.error('Error fetching vendor products for count:', vendorError);
        throw vendorError;
      }

      const { data: existingProducts, error: productsError } = await supabaseAdmin()
        .from('products')
        .select('name');

      if (productsError) {
        console.error('Error fetching existing products for count:', productsError);
        throw productsError;
      }

      // Get existing mappings for this vendor
      const { data: existingMappings, error: mappingsError } = await supabaseAdmin()
        .from('vendor_product_mapping')
        .select('vendor_product')
        .eq('vendor_id', vendorId);

      if (mappingsError) {
        console.error('Error fetching existing mappings for count:', mappingsError);
        throw mappingsError;
      }

      console.log('Vendor products for count:', vendorProducts?.length || 0);
      console.log('Existing products for count:', existingProducts?.length || 0);
      console.log('Existing mappings for count:', existingMappings?.length || 0);

      let exactMatches = 0;
      const mappedProducts = new Set();
      
      // Create a set of already mapped vendor product names
      existingMappings?.forEach((mapping: any) => {
        mappedProducts.add(mapping.vendor_product.toLowerCase());
      });

      vendorProducts?.forEach((vendorProduct: any) => {
        const vendorName = vendorProduct.name;
        
        // Skip if already mapped
        if (mappedProducts.has(vendorName.toLowerCase())) {
          return;
        }
        
        // Use our advanced matching algorithm to find the best match
        let bestSimilarity = 0;
        
        for (const existingProduct of existingProducts || []) {
          const similarity = calculateSimilarity(vendorName, existingProduct.name);
          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
          }
        }
        
        // Only count if similarity is 95% or higher
        if (bestSimilarity >= 0.95) {
          exactMatches++;
        }
      });

      console.log('Unmapped exact matches found:', exactMatches);
      return exactMatches;
    } catch (error) {
      console.error('Error counting exact matches:', error);
      return 0;
    }
  };

  const bulkAutolinkExactMatches = async (vendorId: string) => {
    setIsProcessingBulkAutolink(true);
    try {
      console.log('Starting bulk autolink for vendor:', vendorId);
      
      if (!supabaseAdmin) {
        console.error('Supabase admin client not available');
        toast.error('Admin client not available');
        return;
      }
      
      const { data: vendorProducts, error: vendorError } = await supabaseAdmin()
        .from('vendor_products')
        .select('*')
        .eq('vendor_id', typeof vendorId === 'string' ? vendorId : String(vendorId));

      if (vendorError) {
        console.error('Error fetching vendor products:', vendorError);
        throw vendorError;
      }

      console.log('Found vendor products:', vendorProducts?.length || 0);

      const { data: existingProducts, error: productsError } = await supabaseAdmin()
        .from('products')
        .select('*');

      if (productsError) {
        console.error('Error fetching existing products:', productsError);
        throw productsError;
      }

      console.log('Found existing products:', existingProducts?.length || 0);

      let linkedCount = 0;
      const mappingsToSave = [];

      for (const vendorProduct of vendorProducts || []) {
        const vendorName = vendorProduct.name;
        
        // Use our advanced matching algorithm to find the best match
        let bestMatch = null;
        let bestSimilarity = 0;
        
        for (const existingProduct of existingProducts || []) {
          const similarity = calculateSimilarity(vendorName, existingProduct.name);
          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestMatch = existingProduct;
          }
        }
        
        // Only consider it an exact match if similarity is 95% or higher
        if (bestMatch && bestSimilarity >= 0.95) {
          mappingsToSave.push({
            vendor_product: vendorProduct.name,
            product_id: bestMatch.id,
            vendor_id: typeof vendorId === 'string' ? vendorId : String(vendorId)
          });
          linkedCount++;
        }
      }

      console.log('Found exact matches:', linkedCount);
      console.log('Mappings to save:', mappingsToSave);

      if (mappingsToSave.length > 0) {
        const { error: mappingError } = await supabaseAdmin()
          .from('vendor_product_mapping')
          .insert(mappingsToSave);

        if (mappingError) {
          console.error('Error inserting mappings:', mappingError);
          throw mappingError;
        }
      }

      toast.success(`Successfully linked ${linkedCount} exact matches`);
      setBulkAutolinkCount(0);
      fetchData();
      
      // Reload mappings for the current vendor
      if (selectedVendorForProducts !== 'all') {
        await loadProductMappings(selectedVendorForProducts);
      }
      
    } catch (error) {
      console.error('Error in bulk autolink:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to perform bulk autolink: ${errorMessage}`);
    } finally {
      setIsProcessingBulkAutolink(false);
    }
  };

  // Update bulk autolink count when vendor changes
  useEffect(() => {
    if (selectedVendorForProducts !== 'all') {
      countExactMatches(selectedVendorForProducts).then(setBulkAutolinkCount);
      loadProductMappings(selectedVendorForProducts);
    } else {
      setBulkAutolinkCount(0);
      setProductMappings([]);
      setSelectedMappings({});
    }
  }, [selectedVendorForProducts]);

  // Fetch all vendor products when status filter changes (for proper filtering)
  useEffect(() => {
    if (productStatusFilter !== 'all' && selectedVendorForProducts !== 'all') {
      fetchAllVendorProducts(selectedVendorForProducts);
    }
  }, [productStatusFilter, selectedVendorForProducts]);

  // Fetch signups when signups tab is active
  useEffect(() => {
    if (activeTab === 'signups' && isAuthenticated) {
      fetchSignups(signupsSearchTerm);
    }
  }, [activeTab, isAuthenticated, signupsSearchTerm]);

  // Type guards for products
  const isUKProduct = (product: Product | USProduct): product is Product => {
    return 'name' in product;
  };

  const isUSProduct = (product: Product | USProduct): product is USProduct => {
    return 'product_title' in product;
  };

  const isUKVendorProduct = (product: VendorProduct | USVendorProduct): product is VendorProduct => {
    return 'name' in product;
  };

  const isUSVendorProduct = (product: VendorProduct | USVendorProduct): product is USVendorProduct => {
    return 'us_products' in product;
  };

  // Filter and sort vendors based on selected region
  const currentVendors = selectedRegion === 'UK' ? vendors : usVendors;
  const currentProductCount = selectedRegion === 'UK' ? mainProductsTotalCount : (usProducts.length > 0 ? mainProductsTotalCount : 0);
  const filteredVendors = currentVendors
    .filter(vendor => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          vendor.name.toLowerCase().includes(searchLower) ||
          vendor.contact_email?.toLowerCase().includes(searchLower) ||
          vendor.website?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(vendor => {
      // Status filter
      if (vendorFilter === 'active') return vendor.is_active;
      if (vendorFilter === 'inactive') return !vendor.is_active;
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at || a.created_at).getTime();
          bValue = new Date(b.updated_at || b.created_at).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });


  // Search handlers
  const handleMainProductsSearch = async (searchTerm: string) => {
    setMainProductsSearchTerm(searchTerm);
    await fetchMainProducts(1, searchTerm, mainProductsPageSize);
  };

  const handleVendorProductsSearch = async (searchTerm: string) => {
    setVendorProductsSearchTerm(searchTerm);
    await fetchVendorProducts(1, searchTerm, selectedVendorForProducts, vendorProductsPageSize);
  };

  // Pagination handlers
  const handleMainProductsPageChange = async (page: number) => {
    await fetchMainProducts(page, mainProductsSearchTerm, mainProductsPageSize);
  };

  const handleVendorProductsPageChange = async (page: number) => {
    await fetchVendorProducts(page, vendorProductsSearchTerm, selectedVendorForProducts, vendorProductsPageSize);
  };

  const handleMainProductsPageSizeChange = async (pageSize: number) => {
    setMainProductsPageSize(pageSize);
    setMainProductsPage(1);
    await fetchMainProducts(1, mainProductsSearchTerm, pageSize);
  };

  const handleVendorProductsPageSizeChange = async (pageSize: number) => {
    setVendorProductsPageSize(pageSize);
    setVendorProductsPage(1);
    await fetchVendorProducts(1, vendorProductsSearchTerm, selectedVendorForProducts, pageSize);
  };

  // Vendor filter handler
  const handleVendorFilterChange = async (vendorId: string) => {
    setSelectedVendorForProducts(vendorId);
    await fetchVendorProducts(1, vendorProductsSearchTerm, vendorId, vendorProductsPageSize);
    
    // Load product mappings for this vendor
    if (vendorId !== 'all') {
      await loadProductMappings(typeof vendorId === 'string' ? vendorId : String(vendorId));
      // Also fetch all vendor products for filtering
      await fetchAllVendorProducts(vendorId);
    } else {
      setAllVendorProducts([]);
    }
  };

  // Product matching functions
  const loadProductMappings = async (vendorId: string | number) => {
    try {
      console.log('Loading product mappings for vendor ID:', vendorId);
      
      if (!supabaseAdmin) {
        console.error('Supabase admin client not available');
        return;
      }
      
      const { data, error } = await supabaseAdmin()
        .from('vendor_product_mapping')
        .select('*')
        .eq('vendor_id', vendorId);

      if (error) throw error;
      
      const mappings: ProductMapping[] = data || [];
      console.log('Loaded mappings for vendor', vendorId, ':', mappings.length, 'mappings');
      console.log('Sample mappings:', mappings.slice(0, 3));
      setProductMappings(mappings);
      
      // Create selected mappings lookup
      const mappingLookup: {[key: string]: number} = {};
      mappings.forEach(mapping => {
        mappingLookup[mapping.vendor_product] = mapping.product_id;
      });
      setSelectedMappings(mappingLookup);
      console.log('Set selected mappings lookup:', Object.keys(mappingLookup).length, 'entries');

      // Also load main products if not already loaded (needed for mapping status)
      if (mainProducts.length === 0) {
        const { data: productsData, error: productsError } = await supabaseAdmin()
          .from('products')
          .select('*');

        if (!productsError && productsData) {
          setMainProducts(productsData);
          console.log('Loaded main products:', productsData.length);
        }
      }
    } catch (error) {
      console.error('Error loading product mappings:', error);
    }
  };

  const findProductMatches = async (vendorProductName: string) => {
    if (productMatches[vendorProductName]) {
      return productMatches[vendorProductName];
    }

    setMatchingLoading(true);
    try {
      const response = await fetch('/api/vendor-product-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_product_name: vendorProductName,
          threshold: 0.75
        })
      });

      if (response.ok) {
        const data = await response.json();
        const matches = data.matches || [];
        
        setProductMatches(prev => ({
          ...prev,
          [vendorProductName]: matches
        }));
        
        return matches;
      }
    } catch (error) {
      console.error('Error finding product matches:', error);
    } finally {
      setMatchingLoading(false);
    }
    
    return [];
  };

  const handleConfirmMatch = async (vendorProductName: string, productId: number) => {
    if (selectedVendorForProducts === 'all') return;

    try {
      const response = await fetch('/api/vendor-product-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_product: vendorProductName,
          product_id: productId,
          vendor_id: selectedVendorForProducts
        })
      });

      if (response.ok) {
        setSelectedMappings(prev => ({
          ...prev,
          [vendorProductName]: productId
        }));
        
        // Add to local mappings
        const newMapping: ProductMapping = {
          vendor_product: vendorProductName,
          product_id: productId,
          vendor_id: selectedVendorForProducts
        };
        setProductMappings(prev => [...prev, newMapping]);
        
        // Reload mappings from database to ensure consistency
        await loadProductMappings(selectedVendorForProducts);
        
        toast.success('Product mapping created successfully!');
      } else {
        toast.error('Failed to create product mapping');
      }
    } catch (error) {
      console.error('Error creating mapping:', error);
      toast.error('Error creating product mapping');
    }
  };

  const getMappingStatus = (vendorProductName: string) => {
    // First check if we have a saved mapping - use case-insensitive comparison
    const mapping = productMappings.find(m => 
      m.vendor_product.toLowerCase() === vendorProductName.toLowerCase()
    );
    if (mapping) {
      console.log('Found saved mapping for:', vendorProductName, 'Maps to:', mapping.vendor_product, 'Product ID:', mapping.product_id);
      return { status: 'mapped', productId: mapping.product_id };
    }
    
    // Check if we have a selected mapping (from dropdown selection)
    const selectedMapping = selectedMappings[vendorProductName];
    if (selectedMapping) {
      return { status: 'selected', productId: selectedMapping };
    }
    
    // Check for exact match using our advanced algorithm
    let bestMatch = null;
    let bestSimilarity = 0;
    
    for (const mainProduct of mainProducts) {
      const similarity = calculateSimilarity(vendorProductName, mainProduct.name);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = mainProduct;
      }
    }
    
    // If we found a very good match (95%+), consider it found
    if (bestMatch && bestSimilarity >= 0.95) {
      return { status: 'found', productId: bestMatch.id };
    }
    
    // Check for similar matches from our automatic matching
    const matches = productMatches[vendorProductName];
    if (matches && matches.length > 0) {
      return { status: 'similar', productId: null };
    }
    
    return { status: 'none', productId: null };
  };

  // State for all vendor products (for filtering)
  const [allVendorProducts, setAllVendorProducts] = useState<VendorProduct[]>([]);

  // Fetch all vendor products for filtering (not paginated)
  const fetchSignups = async (search = '') => {
    try {
      setSignupsLoading(true);
      
      let query = supabase()
        .from('signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('email', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSignups(data || []);
    } catch (error) {
      console.error('Error fetching signups:', error);
      toast.error('Failed to fetch signups');
    } finally {
      setSignupsLoading(false);
    }
  };

  const exportSignupsToCSV = () => {
    const csvContent = [
      ['Email', 'Source', 'Created At', 'Status', 'Confirmed At', 'Unsubscribed At'],
      ...signups.map(signup => [
        signup.email,
        signup.source,
        new Date(signup.created_at).toLocaleDateString(),
        signup.is_active ? 'Active' : 'Inactive',
        signup.confirmed_at ? new Date(signup.confirmed_at).toLocaleDateString() : '',
        signup.unsubscribed_at ? new Date(signup.unsubscribed_at).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `signups-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchAllVendorProducts = async (vendorId: string) => {
    try {
      if (vendorId === 'all') {
        setAllVendorProducts([]);
        return;
      }

      const { data, error } = await supabase()
        .from('vendor_products')
        .select('*')
        .eq('vendor_id', parseInt(vendorId))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllVendorProducts(data || []);
    } catch (error) {
      console.error('Error fetching all vendor products:', error);
    }
  };

  // Filter vendor products based on search, brand, and status filters
  const filteredVendorProducts = (productStatusFilter !== 'all' ? allVendorProducts : vendorProducts).filter(product => {
    // Debug logging for status filter
    if (productStatusFilter === 'mapped') {
      console.log('Filtering for mapped products. Total mappings loaded:', productMappings.length);
      console.log('Sample mappings:', productMappings.slice(0, 3).map(m => m.vendor_product));
    }
    // Search filter
    if (vendorProductsSearchTerm) {
      const searchTerm = vendorProductsSearchTerm.toLowerCase();
      const productName = isUKVendorProduct(product) ? product.name : (product as any).us_products?.product_title || '';
      const productBrand = isUKVendorProduct(product) ? product.brand : (product as any).us_products?.brand || '';
      if (!productName.toLowerCase().includes(searchTerm) && 
          !productBrand.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }

    // Brand filter
    if (productBrandFilter !== 'all' && product.brand !== productBrandFilter) {
      return false;
    }

    // Status filter
    if (productStatusFilter !== 'all') {
      const productName = isUKVendorProduct(product) ? product.name : (product as any).us_products?.product_title || '';
      const mappingStatus = getMappingStatus(productName);
      
      // Map status values to filter values
      let statusForFilter = mappingStatus.status;
      if (mappingStatus.status === 'selected') {
        statusForFilter = 'mapped'; // Selected items should show as mapped
      }
      
      if (statusForFilter !== productStatusFilter) {
        return false;
      }
    }
    
    return true;
  });

  // Count of filtered products
  const filteredVendorProductsCount = filteredVendorProducts.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-foreground"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-background/50 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Manage vendors and products</h2>
              <ThemeToggle />
            </div>
            
            {/* Region Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Region</Label>
              <div className="flex space-x-2">
                <Button
                  variant={selectedRegion === 'UK' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedRegion('UK');
                    fetchData();
                  }}
                  className="flex-1"
                >
                  🇬🇧 United Kingdom
                </Button>
                <Button
                  variant={selectedRegion === 'US' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedRegion('US');
                    fetchData();
                  }}
                  className="flex-1"
                >
                  🇺🇸 United States
                </Button>
              </div>
            </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{stats.totalVendors}</p>
                        <p className="text-xs text-muted-foreground">Total Vendors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{stats.activeVendors}</p>
                        <p className="text-xs text-muted-foreground">Active Vendors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{stats.totalProducts}</p>
                        <p className="text-xs text-muted-foreground">Total Products</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">£{stats.avgPrice.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Avg. Price</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vendor Management Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Vendor Management</h3>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={() => setIsAddingVendor(true)} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vendor
                    </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="h-full">
              {/* Header */}
              <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center justify-between px-6">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Authenticated
                    </Badge>
                  </div>
                  <ThemeToggle />
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="flex items-center justify-between">
                    <TabsList className="grid w-[750px] grid-cols-5">
                      <TabsTrigger value="vendors" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Vendors
                      </TabsTrigger>
                      <TabsTrigger value="products" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Products
                      </TabsTrigger>
                      <TabsTrigger value="vendor-products" className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Vendor Products
                      </TabsTrigger>
                      <TabsTrigger value="signups" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Signups
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>

                  {/* Vendors Tab */}
                  <TabsContent value="vendors" className="space-y-4">
                    {/* Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search vendors by name, email, or website..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={vendorFilter}
                          onChange={(e) => setVendorFilter(e.target.value)}
                          className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                        >
                          <option value="all">All Vendors</option>
                          <option value="active">Active Only</option>
                          <option value="inactive">Inactive Only</option>
                        </select>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                        >
                          <option value="name">Sort by Name</option>
                          <option value="created_at">Sort by Created</option>
                          <option value="updated_at">Sort by Updated</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </Button>
                      </div>
                    </div>

                    {/* Vendor Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Total Vendors</p>
                              <p className="text-2xl font-bold">{vendors.length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Active</p>
                              <p className="text-2xl font-bold">{vendors.filter(v => v.is_active).length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <div>
                              <p className="text-sm font-medium">Inactive</p>
                              <p className="text-2xl font-bold">{vendors.filter(v => !v.is_active).length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium">With Websites</p>
                              <p className="text-2xl font-bold">{vendors.filter(v => v.website_url).length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid gap-4">
                      {filteredVendors.map((vendor) => (
                        <Card key={vendor.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold">{vendor.name}</h3>
                                  <Badge variant={vendor.is_active ? "default" : "secondary"}>
                                    {vendor.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  {vendor.website_url && (
                                    <div className="flex items-center space-x-2">
                                      <Globe className="h-3 w-3 text-muted-foreground" />
                                      <a 
                                        href={vendor.website_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                      >
                                        {vendor.website_url}
                                      </a>
                              </div>
                                  )}
                                  {vendor.contact_email && (
                              <div className="flex items-center space-x-2">
                                      <Mail className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">{vendor.contact_email}</span>
                                    </div>
                                  )}
                                  {vendor.contact_phone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">{vendor.contact_phone}</span>
                                    </div>
                                  )}
                                </div>
                                {vendor.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">{vendor.description}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {vendor.website_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                    onClick={() => window.open(vendor.website_url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteVendor(vendor.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Products Tab */}
                  <TabsContent value="products" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">Product Management</h2>
                        <p className="text-muted-foreground">{currentProductCount} products</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowProductCsvPreview(!showProductCsvPreview)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Products CSV
                        </Button>
                      </div>
                    </div>

                    {/* Product Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="Search products by name, brand, or flavour..."
                            value={mainProductsSearchTerm}
                            onChange={(e) => handleMainProductsSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMainProductsSearch('')}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Product Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">Total Products</p>
                              <p className="text-2xl font-bold">{mainProductsTotalCount}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium">Avg Price</p>
                              <p className="text-2xl font-bold">
                                £{mainProducts.length > 0 ? (mainProducts.reduce((sum, p) => sum + (p.price || 0), 0) / mainProducts.length).toFixed(2) : '0.00'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-sm font-medium">Unique Brands</p>
                              <p className="text-2xl font-bold">
                                {new Set(mainProducts.map(p => p.brand)).size}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium">Vendors</p>
                              <p className="text-2xl font-bold">
                                {selectedVendorForProducts === 'all' ? vendors.length : 1}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Product CSV Upload Section */}
                    {showProductCsvPreview && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload Products CSV
                          </CardTitle>
                          <CardDescription>
                            Upload a CSV file to import new products into the system
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* File Upload */}
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <h3 className="text-sm font-semibold mb-1">Upload Products CSV</h3>
                            <p className="text-xs text-muted-foreground mb-3">
                              Drag and drop your CSV file here, or click to browse
                            </p>
                            <input
                              type="file"
                              accept=".csv"
                              onChange={handleProductFileUpload}
                              className="hidden"
                              id="product-csv-upload"
                            />
                            <Button asChild>
                              <label htmlFor="product-csv-upload" className="cursor-pointer">
                                <Upload className="h-4 w-4 mr-2" />
                                Choose File
                              </label>
                            </Button>
                          </div>

                          {/* File Info */}
                          {productCsvFile && (
                            <div className="bg-muted/50 p-3 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm font-medium">{productCsvFile.name}</span>
                                  <Badge variant="outline">{productCsvData.length} rows</Badge>
                                </div>
                                <Button variant="ghost" size="sm" onClick={resetProductCsvUpload}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Column Mapping */}
                          {productCsvFile && productCsvHeaders.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="text-sm font-semibold">Map CSV Columns</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {productCsvHeaders.map((header) => (
                                  <div key={header} className="space-y-1">
                                    <Label htmlFor={`product-mapping-${header}`} className="text-xs">{header}</Label>
                                    <select
                                      id={`product-mapping-${header}`}
                                      value={productColumnMapping[header] || ''}
                                      onChange={(e) => setProductColumnMapping(prev => ({
                                        ...prev,
                                        [header]: e.target.value
                                      }))}
                                      className="w-full p-2 border border-border rounded-md bg-background text-sm"
                                    >
                                      <option value="">Select field...</option>
                                      <option value="name">Product Name *</option>
                                      <option value="brand">Brand *</option>
                                      <option value="price">Price</option>
                                      <option value="flavour">Flavour</option>
                                      <option value="strength_group">Strength Group</option>
                                      <option value="format">Format</option>
                                      <option value="description">Description</option>
                                      <option value="image_url">Image URL</option>
                                      <option value="page_url">Page URL</option>
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Import Actions */}
                          {productCsvFile && productColumnMapping.name && (
                            <div className="space-y-3">
                              {isProcessingProductCsv && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Processing...</span>
                                    <span>{productCsvProgress}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${productCsvProgress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {!isProcessingProductCsv && (
                                <div className="flex items-center space-x-3">
                                  <Button 
                                    onClick={processProductCsvImport}
                                    disabled={!productColumnMapping.name}
                                    className="flex-1"
                                  >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import {productCsvData.length} Products
                                  </Button>
                                  <Button variant="outline" onClick={resetProductCsvUpload}>
                                    Cancel
                                  </Button>
                                </div>
                              )}

                              {productImportResults && (
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <h5 className="text-sm font-semibold mb-2">Import Results</h5>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-green-600 font-medium">{productImportResults.success}</span>
                                      <span className="text-muted-foreground"> Success</span>
                                    </div>
                                    <div>
                                      <span className="text-red-600 font-medium">{productImportResults.errors}</span>
                                      <span className="text-muted-foreground"> Errors</span>
                                    </div>
                                  </div>
                                  
                                  {productImportResults.errors_list.length > 0 && (
                                    <div className="mt-2">
                                      <h6 className="text-xs font-medium text-red-600 mb-1">Errors:</h6>
                                      <div className="max-h-20 overflow-y-auto">
                                        {productImportResults.errors_list.slice(0, 5).map((error: string, index: number) => (
                                          <div key={index} className="text-xs text-red-600">
                                            • {error}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid gap-4">
                      {(selectedRegion === 'UK' ? mainProducts : usProducts).map((product) => (
                        <Card key={product.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h3 className="font-semibold">{isUKProduct(product) ? product.name : product.product_title}</h3>
                                <p className="text-sm text-muted-foreground">{product.brand}</p>
                                <p className="text-sm text-muted-foreground">Price: £{isUKProduct(product) ? product.price || 'N/A' : 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">Flavour: {product.flavour || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">Strength: {isUKProduct(product) ? product.strength_group || 'N/A' : product.strength || 'N/A'}</p>
                                <div className="flex items-center space-x-2">
                                  {product.brand && <Badge variant="outline">{product.brand}</Badge>}
                                  {product.format && <Badge variant="secondary">{product.format}</Badge>}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination for Main Products */}
                    {mainProductsTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-muted-foreground">
                            Showing {((mainProductsPage - 1) * mainProductsPageSize) + 1} to {Math.min(mainProductsPage * mainProductsPageSize, currentProductCount)} of {currentProductCount} products
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Show:</span>
                            <select
                              value={mainProductsPageSize}
                              onChange={(e) => handleMainProductsPageSizeChange(parseInt(e.target.value))}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                              <option value={500}>500</option>
                              <option value={1000}>1000</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMainProductsPageChange(mainProductsPage - 1)}
                            disabled={mainProductsPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm">
                            Page {mainProductsPage} of {mainProductsTotalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMainProductsPageChange(mainProductsPage + 1)}
                            disabled={mainProductsPage === mainProductsTotalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Vendor Products Tab */}
                  <TabsContent value="vendor-products" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">Vendor Products Management</h2>
                        <p className="text-muted-foreground">{vendorProductsTotalCount} vendor products</p>
                      </div>
                    </div>

                    {/* Vendor Selection and Filters */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <Label htmlFor="vendor-select">Select Vendor</Label>
                              <select
                                id="vendor-select"
                                value={selectedVendorForProducts}
                                onChange={(e) => handleVendorFilterChange(e.target.value)}
                                className="w-full p-2 border border-border rounded-md bg-background mt-1"
                              >
                                <option value="all">-- All Vendors --</option>
                                {currentVendors.map((vendor) => (
                                  <option key={vendor.id} value={vendor.id}>
                                    {vendor.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <Label htmlFor="product-search">Search Products</Label>
                              <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                  id="product-search"
                                  placeholder="Search products..."
                                  value={vendorProductsSearchTerm}
                                  onChange={(e) => handleVendorProductsSearch(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <Label htmlFor="brand-filter">Brand Filter</Label>
                              <select
                                id="brand-filter"
                                value={productBrandFilter}
                                onChange={(e) => setProductBrandFilter(e.target.value)}
                                className="w-full p-2 border border-border rounded-md bg-background mt-1"
                              >
                                <option value="all">-- All Brands --</option>
                                {Array.from(new Set((selectedRegion === 'UK' ? vendorProducts : usVendorProducts).map(p => {
                                  if (isUKVendorProduct(p)) return p.brand;
                                  return (p as any).us_products?.brand;
                                }))).map((brand) => (
                                  <option key={brand} value={brand}>
                                    {brand}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <Label htmlFor="status-filter">Status Filter</Label>
                              <select
                                id="status-filter"
                                value={productStatusFilter}
                                onChange={(e) => setProductStatusFilter(e.target.value)}
                                className="w-full p-2 border border-border rounded-md bg-background mt-1"
                              >
                                <option value="all">-- All Status --</option>
                                <option value="mapped">Mapped</option>
                                <option value="found">Found but not linked</option>
                                <option value="similar">Similar found</option>
                                <option value="none">Not found</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setProductSearchTerm('');
                                  setProductBrandFilter('all');
                                  setProductStatusFilter('all');
                                }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Clear Filters
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bulk Autolink Section */}
                    {selectedVendorForProducts !== 'all' && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">Bulk Autolink Exact Matches</h3>
                              <p className="text-sm text-muted-foreground">
                                This will automatically link all vendor products that have exact name matches with existing products.
                                {bulkAutolinkCount > 0 ? (
                                  <span className="text-green-600 font-medium"> ({bulkAutolinkCount} exact matches available)</span>
                                ) : (
                                  <span className="text-muted-foreground"> (No exact matches found)</span>
                                )}
                              </p>
                            </div>
                            <Button
                              onClick={() => bulkAutolinkExactMatches(selectedVendorForProducts)}
                              disabled={isProcessingBulkAutolink || bulkAutolinkCount === 0}
                              className="bg-gray-900 hover:bg-gray-800"
                            >
                              {isProcessingBulkAutolink ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 mr-2" />
                                  Bulk Autolink Exact Matches
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Vendor Products Table */}
                    <Card>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="border-b">
                              <tr>
                                <th className="text-left p-4 font-medium">Product Name</th>
                                <th className="text-left p-4 font-medium">Brand</th>
                                <th className="text-left p-4 font-medium">Suggested/Mapped Product</th>
                                <th className="text-left p-4 font-medium">Mapping Status</th>
                                <th className="text-left p-4 font-medium">URL</th>
                                <th className="text-left p-4 font-medium">1 Pack</th>
                                <th className="text-left p-4 font-medium">3 Pack</th>
                                <th className="text-left p-4 font-medium">5 Pack</th>
                                <th className="text-left p-4 font-medium">10 Pack</th>
                                <th className="text-left p-4 font-medium">20 Pack</th>
                                <th className="text-left p-4 font-medium">25 Pack</th>
                                <th className="text-left p-4 font-medium">30 Pack</th>
                                <th className="text-left p-4 font-medium">50 Pack</th>
                                <th className="text-left p-4 font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(selectedRegion === 'UK' ? filteredVendorProducts : usVendorProducts).map((product) => {
                                const vendor = currentVendors.find(v => v.id === (isUKVendorProduct(product) ? product.vendor_id : (product as any).us_vendor_id));
                                const productName = isUKVendorProduct(product) ? product.name : (product as any).us_products?.product_title || '';
                                const mappingStatus = getMappingStatus(productName);
                                const matches = productMatches[productName] || [];
                                const selectedProductId = selectedMappings[productName];
                                
                                return (
                                  <tr key={product.id} className="border-b hover:bg-muted/50">
                                    <td className="p-4">
                                      <div className="font-medium">{productName}</div>
                                      <div className="text-sm text-muted-foreground">{vendor?.name}</div>
                                    </td>
                                    <td className="p-4">{isUKVendorProduct(product) ? product.brand : (product as any).us_products?.brand}</td>
                                    <td className="p-4">
                                      {mappingStatus.status === 'mapped' ? (
                                        <div>
                                          <div className="font-medium text-green-600">
                                            {(() => {
                                              const foundProduct = (selectedRegion === 'UK' ? mainProducts : usProducts).find(p => p.id === mappingStatus.productId);
                                              return foundProduct ? (isUKProduct(foundProduct) ? foundProduct.name : foundProduct.product_title) : '';
                                            })()}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            ID: {mappingStatus.productId}
                                          </div>
                                        </div>
                                      ) : mappingStatus.status === 'selected' ? (
                                        <div>
                                          <div className="font-medium text-blue-600">
                                            {(() => {
                                              const foundProduct = (selectedRegion === 'UK' ? mainProducts : usProducts).find(p => p.id === mappingStatus.productId);
                                              return foundProduct ? (isUKProduct(foundProduct) ? foundProduct.name : foundProduct.product_title) : '';
                                            })()}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            ID: {mappingStatus.productId} (Selected)
                                          </div>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="mt-1"
                                            onClick={() => handleConfirmMatch(productName, mappingStatus.productId!)}
                                          >
                                            Link Selected
                                          </Button>
                                        </div>
                                      ) : mappingStatus.status === 'found' ? (
                                        <div>
                                          <div className="font-medium text-orange-600">
                                            {(() => {
                                              const foundProduct = (selectedRegion === 'UK' ? mainProducts : usProducts).find(p => p.id === mappingStatus.productId);
                                              return foundProduct ? (isUKProduct(foundProduct) ? foundProduct.name : foundProduct.product_title) : '';
                                            })()}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            ID: {mappingStatus.productId} (Exact match)
                                          </div>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="mt-1"
                                            onClick={() => handleConfirmMatch(productName, mappingStatus.productId!)}
                                          >
                                            Link Exact Match
                                          </Button>
                                        </div>
                                      ) : matches.length > 0 ? (
                                        <div className="space-y-2">
                                          <select 
                                            className="w-full p-2 border border-border rounded-md bg-background text-sm"
                                            value={selectedProductId || ''}
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                setSelectedMappings(prev => ({
                                                  ...prev,
                                                  [productName]: parseInt(e.target.value)
                                                }));
                                              }
                                            }}
                                          >
                                            <option value="">-- Select Product --</option>
                                            {matches.map((match) => (
                                              <option key={match.id} value={match.id}>
                                                {match.name} ({match.similarity}% match)
                                              </option>
                                            ))}
                                          </select>
                                          {selectedProductId && (
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="w-full"
                                              onClick={() => handleConfirmMatch(productName, selectedProductId)}
                                            >
                                              Link Selected
                                            </Button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          <div className="text-sm text-gray-500">
                                            No matches found
                                          </div>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => findProductMatches(productName)}
                                            disabled={matchingLoading}
                                          >
                                            {matchingLoading ? 'Finding...' : 'Search Again'}
                                          </Button>
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-4">
                                      {mappingStatus.status === 'mapped' ? (
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                          ✓ Mapped
                                        </Badge>
                                      ) : mappingStatus.status === 'selected' ? (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                          ⚡ Selected
                                        </Badge>
                                      ) : mappingStatus.status === 'found' ? (
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                          ⚠ Found but not linked
                                        </Badge>
                                      ) : mappingStatus.status === 'similar' ? (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                          ? Similar found
                                        </Badge>
                                      ) : (
                                        <Badge variant="destructive">
                                          ✗ Not found
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="p-4">
                                      {(isUKVendorProduct(product) ? product.url : product.url) ? (
                                        <Button size="sm" variant="outline" asChild>
                                          <a href={isUKVendorProduct(product) ? product.url : product.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            View
                                          </a>
                                        </Button>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </td>
                                    <td className="p-4">{product.price_1pack || '-'}</td>
                                    <td className="p-4">{product.price_3pack || '-'}</td>
                                    <td className="p-4">{product.price_5pack || '-'}</td>
                                    <td className="p-4">{product.price_10pack || '-'}</td>
                                    <td className="p-4">{product.price_20pack || '-'}</td>
                                    <td className="p-4">{product.price_25pack || '-'}</td>
                                    <td className="p-4">{product.price_30pack || '-'}</td>
                                    <td className="p-4">{product.price_50pack || '-'}</td>
                                    <td className="p-4">
                                      <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pagination for Vendor Products */}
                    {vendorProductsTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-muted-foreground">
                            Showing {((vendorProductsPage - 1) * vendorProductsPageSize) + 1} to {Math.min(vendorProductsPage * vendorProductsPageSize, filteredVendorProductsCount)} of {filteredVendorProductsCount} vendor products
                            {filteredVendorProductsCount !== vendorProductsTotalCount && (
                              <span className="text-orange-600"> (filtered from {vendorProductsTotalCount} total)</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Show:</span>
                            <select
                              value={vendorProductsPageSize}
                              onChange={(e) => handleVendorProductsPageSizeChange(parseInt(e.target.value))}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                              <option value={500}>500</option>
                              <option value={1000}>1000</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVendorProductsPageChange(vendorProductsPage - 1)}
                            disabled={vendorProductsPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm">
                            Page {vendorProductsPage} of {vendorProductsTotalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVendorProductsPageChange(vendorProductsPage + 1)}
                            disabled={vendorProductsPage === vendorProductsTotalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Upload Tab */}
                  {/* Signups Tab */}
                  <TabsContent value="signups" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">Email Signups</h2>
                        <p className="text-muted-foreground">Manage and export email subscriptions</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button onClick={exportSignupsToCSV} disabled={signups.length === 0}>
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button onClick={() => fetchSignups(signupsSearchTerm)} variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </div>

                    {/* Search and Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search signups..."
                            value={signupsSearchTerm}
                            onChange={(e) => setSignupsSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted-foreground">
                          Total: {signups.length} signups
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Active: {signups.filter(s => s.is_active).length}
                        </div>
                      </div>
                    </div>

                    {/* Signups Table */}
                    <Card>
                      <CardContent className="p-0">
                        {signupsLoading ? (
                          <div className="flex items-center justify-center p-8">
                            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                            Loading signups...
                          </div>
                        ) : signups.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-8 text-center">
                            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No signups found</h3>
                            <p className="text-muted-foreground">
                              {signupsSearchTerm ? 'Try adjusting your search terms' : 'No email signups yet'}
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-4 font-medium">Email</th>
                                  <th className="text-left p-4 font-medium">Source</th>
                                  <th className="text-left p-4 font-medium">Created</th>
                                  <th className="text-left p-4 font-medium">Status</th>
                                  <th className="text-left p-4 font-medium">Confirmed</th>
                                  <th className="text-left p-4 font-medium">Unsubscribed</th>
                                </tr>
                              </thead>
                              <tbody>
                                {signups.map((signup) => (
                                  <tr key={signup.id} className="border-b hover:bg-muted/50">
                                    <td className="p-4">
                                      <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{signup.email}</span>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <Badge variant="secondary">
                                        {signup.source}
                                      </Badge>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                      {new Date(signup.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                      <Badge variant={signup.is_active ? "default" : "destructive"}>
                                        {signup.is_active ? "Active" : "Inactive"}
                                      </Badge>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                      {signup.confirmed_at ? new Date(signup.confirmed_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                      {signup.unsubscribed_at ? new Date(signup.unsubscribed_at).toLocaleDateString() : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">Vendor CSV Upload & Import</h2>
                        <p className="text-muted-foreground">Upload vendor product CSV files and map them to existing products</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowImportHistory(!showImportHistory)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Import History ({importHistory.length})
                        </Button>
                        {csvFile && (
                          <Button variant="outline" onClick={resetCsvUpload}>
                            <X className="h-4 w-4 mr-2" />
                            Reset Upload
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Import History */}
                    {showImportHistory && (
                    <Card>
                      <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">Import History</h3>
                              <Badge variant="outline">{importHistory.length} imports</Badge>
                            </div>
                            
                            {importHistory.length === 0 ? (
                              <p className="text-muted-foreground text-center py-8">No import history found</p>
                            ) : (
                              <div className="space-y-3">
                                {importHistory.map((record) => (
                                  <div key={record.id} className="border border-border rounded-lg p-4 hover:bg-muted/25">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        <Badge 
                                          variant={record.status === 'success' ? 'default' : record.status === 'partial' ? 'secondary' : 'destructive'}
                                        >
                                          {record.status}
                                        </Badge>
                                        <span className="font-medium">{record.vendor_name}</span>
                                        <span className="text-sm text-muted-foreground">•</span>
                                        <span className="text-sm text-muted-foreground">{record.filename}</span>
                                      </div>
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(record.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Total:</span>
                                        <span className="ml-1 font-medium">{record.total_rows}</span>
                                      </div>
                                      <div>
                                        <span className="text-green-600 font-medium">{record.success_count}</span>
                                        <span className="text-muted-foreground ml-1">Success</span>
                                      </div>
                                      <div>
                                        <span className="text-red-600 font-medium">{record.error_count}</span>
                                        <span className="text-muted-foreground ml-1">Errors</span>
                                      </div>
                                      <div>
                                        <span className="text-blue-600 font-medium">{record.match_count}</span>
                                        <span className="text-muted-foreground ml-1">Matches</span>
                                      </div>
                                      <div>
                                        <span className="text-purple-600 font-medium">{record.new_product_count}</span>
                                        <span className="text-muted-foreground ml-1">New</span>
                                      </div>
                                    </div>
                                    
                                    {record.errors && record.errors.length > 0 && (
                                      <details className="mt-2">
                                        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                                          Show errors ({record.errors.length})
                                        </summary>
                                        <div className="mt-2 text-xs text-red-600 max-h-20 overflow-y-auto">
                                          {record.errors.map((error: string, index: number) => (
                                            <div key={index}>• {error}</div>
                                          ))}
                                        </div>
                                      </details>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Vendor CSV Upload Instructions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HelpCircle className="h-5 w-5" />
                          Vendor CSV Upload Instructions
                        </CardTitle>
                        <CardDescription>
                          Follow these steps to successfully upload and import vendor product data for mapping
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold">📋 Vendor CSV Format Requirements</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• File must be in CSV format (.csv)</li>
                              <li>• First row should contain column headers</li>
                              <li>• Required columns: Name, URL, Brand</li>
                            <li>• Pack columns: Any pack size (e.g., 1 Pack, 3 Packs, 5 Packs, 10 Packs, 20 Packs)</li>
                            <li>• Flexible naming: "Pack", "Packs", "Can", "Cans", "Unit", "Units", "Pcs", "Pieces"</li>
                              <li>• Maximum file size: 10MB</li>
                              <li>• Select vendor before uploading</li>
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-semibold">🔧 Supported Column Names</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Product Name: "Name", "name", "product_name"</li>
                              <li>• Brand: "Brand", "brand", "manufacturer"</li>
                              <li>• URL: "URL", "url", "link"</li>
                            <li>• UK Packs: "1 Pack", "3 Packs", "5 Packs", "10 Packs", "20 Packs"</li>
                            <li>• US Cans: "1 Can", "5 Cans", "10 Cans", "25 Cans", "30 Cans", "50 Cans"</li>
                            <li>• Units: "1 Unit", "3 Units", "6 Units", etc.</li>
                            </ul>
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Flexible Pack Structure</h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Supports any pack size: 1, 2, 3, 5, 6, 10, 12, 15, 20, 25, 30, 50, etc.</li>
                            <li>• Automatically maps to closest standard pack size</li>
                            <li>• Works with "Pack/Packs", "Can/Cans", "Unit/Units", "Pcs", "Pieces" naming</li>
                            <li>• Custom pack sizes are mapped to the nearest standard size</li>
                            <li>• Use bulk autolink for exact name matches</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    {/* File Upload Section */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                          <p className="text-muted-foreground mb-4">
                            Drag and drop your CSV file here, or click to browse
                          </p>
                            <input
                              type="file"
                              accept=".csv"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="csv-upload"
                            />
                            <Button asChild>
                              <label htmlFor="csv-upload" className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose File
                              </label>
                          </Button>
                          </div>

                          {csvFile && (
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4" />
                                  <span className="font-medium">{csvFile.name}</span>
                                  <Badge variant="outline">{csvData.length} rows</Badge>
                                </div>
                                <Button variant="ghost" size="sm" onClick={resetCsvUpload}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Vendor Selection */}
                    {csvFile && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Select Vendor</h3>
                            <div className="space-y-2">
                              <Label htmlFor="vendor-select">Choose vendor for this import</Label>
                              <select
                                id="vendor-select"
                                value={selectedVendor}
                                onChange={(e) => setSelectedVendor(e.target.value)}
                                className="w-full p-2 border border-border rounded-md bg-background"
                              >
                                <option value="">Select a vendor...</option>
                                {currentVendors.map((vendor) => (
                                  <option key={vendor.id} value={vendor.id}>
                                    {vendor.name} ({vendor.website})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Column Mapping */}
                    {csvFile && csvHeaders.length > 0 && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Map CSV Columns</h3>
                            <p className="text-sm text-muted-foreground">
                              Map your CSV columns to the product fields. Required fields are marked with *
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {csvHeaders.map((header) => (
                                <div key={header} className="space-y-2">
                                  <Label htmlFor={`mapping-${header}`}>{header}</Label>
                                  <select
                                    id={`mapping-${header}`}
                                    value={columnMapping[header] || ''}
                                    onChange={(e) => setColumnMapping(prev => ({
                                      ...prev,
                                      [header]: e.target.value
                                    }))}
                                    className="w-full p-2 border border-border rounded-md bg-background"
                                  >
                                    <option value="">Select field...</option>
                                    <option value="name">Product Name *</option>
                                    <option value="brand">Brand *</option>
                                    <option value="url">URL *</option>
                                    <optgroup label="Pack Prices">
                                      <option value="price_1pack">1 Pack Price</option>
                                      <option value="price_3pack">3 Pack Price</option>
                                      <option value="price_5pack">5 Pack Price</option>
                                      <option value="price_10pack">10 Pack Price</option>
                                      <option value="price_20pack">20 Pack Price</option>
                                      <option value="price_25pack">25 Pack Price</option>
                                      <option value="price_30pack">30 Pack Price</option>
                                      <option value="price_50pack">50 Pack Price</option>
                                    </optgroup>
                                    <optgroup label="Custom Pack Sizes">
                                      <option value="custom_pack">Custom Pack Size</option>
                                    </optgroup>
                                  </select>
                                </div>
                              ))}
                            </div>

                            {/* Product Mapping Actions */}
                            <div className="flex gap-4 pt-4 border-t">
                              <Button
                                onClick={() => findProductMatchesForMapping(csvData, columnMapping)}
                                disabled={isProcessingMapping || !selectedVendor}
                                className="flex-1"
                              >
                                {isProcessingMapping ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Finding Matches...
                                  </>
                                ) : (
                                  <>
                                    <Search className="h-4 w-4 mr-2" />
                                    Find Product Matches
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowCsvPreview(!showCsvPreview)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview Data
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Product Mapping Interface */}
                    {showMappingInterface && mappingResults.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Product Mapping Results
                          </CardTitle>
                          <CardDescription>
                            Review and confirm matches between vendor products and existing products
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {mappingResults.map((result, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-lg">{result.vendor_product}</h4>
                                <Badge variant={productMappings[result.vendor_product] ? "default" : "secondary"}>
                                  {productMappings[result.vendor_product] ? "Mapped" : "Not Mapped"}
                                </Badge>
                              </div>
                              
                              {result.potential_matches.length > 0 ? (
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">Potential matches:</p>
                                  <div className="grid gap-2">
                                    {result.potential_matches.map((match: any, matchIndex: number) => (
                                      <div
                                        key={matchIndex}
                                        className={`flex items-center justify-between p-3 border rounded-lg ${
                                          productMappings[result.vendor_product] === match.id
                                            ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                                            : 'hover:bg-muted/50'
                                        }`}
                                      >
                                        <div className="flex-1">
                                          <p className="font-medium">{match.name}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge 
                                              variant={
                                                match.similarity >= 80 ? "default" :
                                                match.similarity >= 60 ? "secondary" : "outline"
                                              }
                                              className="text-xs"
                                            >
                                              {match.similarity}% match
                                            </Badge>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant={productMappings[result.vendor_product] === match.id ? "default" : "outline"}
                                          onClick={() => confirmMapping(result.vendor_product, match.id, match.name)}
                                          disabled={productMappings[result.vendor_product] === match.id}
                                        >
                                          {productMappings[result.vendor_product] === match.id ? "✓ Confirmed" : "Confirm Match"}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-muted-foreground">No potential matches found</p>
                              )}
                            </div>
                          ))}
                          
                          <div className="flex gap-4 pt-4 border-t">
                            <Button
                              onClick={saveMappings}
                              disabled={Object.keys(productMappings).length === 0}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Save {Object.keys(productMappings).length} Mappings
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowMappingInterface(false);
                                setMappingResults([]);
                                setProductMappings([]);
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* CSV Preview */}
                    {showCsvPreview && csvPreview.length > 0 && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">Data Preview</h3>
                              <Badge variant="outline">First 5 rows</Badge>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse border border-border">
                                <thead>
                                  <tr className="bg-muted/50">
                                    {csvHeaders.map((header) => (
                                      <th key={header} className="border border-border p-2 text-left text-sm font-medium">
                                        {header}
                                        {columnMapping[header] && (
                                          <Badge variant="secondary" className="ml-2 text-xs">
                                            → {columnMapping[header]}
                                          </Badge>
                                        )}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {csvPreview.map((row, index) => (
                                    <tr key={index} className="hover:bg-muted/25">
                                      {csvHeaders.map((header) => (
                                        <td key={header} className="border border-border p-2 text-sm">
                                          {row[header] || '-'}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Import Actions */}
                    {csvFile && selectedVendor && columnMapping.name && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Import Products</h3>
                            
                            {isProcessingCsv && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Processing...</span>
                                  <span>{csvProgress}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${csvProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {!isProcessingCsv && (
                              <div className="flex items-center space-x-4">
                                <Button 
                                  onClick={processCsvImport}
                                  disabled={!columnMapping.name}
                                  className="flex-1"
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Import {csvData.length} Products
                                </Button>
                                <Button variant="outline" onClick={resetCsvUpload}>
                                  Cancel
                                </Button>
                              </div>
                            )}

                            {importResults && (
                              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-semibold mb-2">Import Results</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-green-600 font-medium">{importResults.success}</span>
                                    <span className="text-muted-foreground"> Success</span>
                                  </div>
                                  <div>
                                    <span className="text-red-600 font-medium">{importResults.errors}</span>
                                    <span className="text-muted-foreground"> Errors</span>
                                  </div>
                                  <div>
                                    <span className="text-blue-600 font-medium">{importResults.matches}</span>
                                    <span className="text-muted-foreground"> Matches</span>
                                  </div>
                                  <div>
                                    <span className="text-purple-600 font-medium">{importResults.newProducts}</span>
                                    <span className="text-muted-foreground"> New</span>
                                  </div>
                                </div>
                                
                                {importResults.errors_list.length > 0 && (
                                  <div className="mt-4">
                                    <h5 className="font-medium text-red-600 mb-2">Errors:</h5>
                                    <div className="max-h-32 overflow-y-auto">
                                      {importResults.errors_list.map((error: string, index: number) => (
                                        <div key={index} className="text-sm text-red-600">
                                          • {error}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              </div>
            </div>
          </div>
        </div>

      {/* Add Vendor Dialog */}
      <Dialog open={isAddingVendor} onOpenChange={setIsAddingVendor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={newVendor.website}
                onChange={(e) => setNewVendor({ ...newVendor, website: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={newVendor.contact_email}
                onChange={(e) => setNewVendor({ ...newVendor, contact_email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                value={newVendor.contact_phone}
                onChange={(e) => setNewVendor({ ...newVendor, contact_phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newVendor.description}
                onChange={(e) => setNewVendor({ ...newVendor, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={newVendor.is_active}
                onChange={(e) => setNewVendor({ ...newVendor, is_active: e.target.checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingVendor(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVendor}>
                Add Vendor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminThemeProvider>
  );
}