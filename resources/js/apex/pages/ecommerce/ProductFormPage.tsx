import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  UploadCloud,
  X,
  Plus,
  ArrowLeft,
  Save,
  Trash2,
  Bold,
  Italic,
  List,
  Link2,
  Sparkles,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import { Product } from '../../types';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Computer Peripherals',
    brand: '',
    description: '',
    price: 0,
    compareAtPrice: 0,
    costPrice: 0,
    discount: 0,
    tax: 8.5,
    stock: 25,
    minStock: 5,
    weight: '1.2 kg',
    dimensions: '20 x 15 x 5 cm',
    status: 'published' as Product['status'],
    tags: ['electronics', 'workspace'],
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80',
    ],
    // SEO fields
    metaTitle: '',
    metaDescription: '',
    slug: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      productService.getProductById(id).then(prod => {
        if (prod) {
          setFormData({
            name: prod.name,
            sku: prod.sku,
            category: prod.category,
            brand: prod.brand,
            description: prod.description,
            price: prod.price,
            compareAtPrice: prod.compareAtPrice || 0,
            costPrice: prod.costPrice || 0,
            discount: prod.discount,
            tax: prod.tax,
            stock: prod.stock,
            minStock: prod.minStock,
            weight: prod.weight,
            dimensions: prod.dimensions,
            status: prod.status,
            tags: prod.tags || [],
            images: prod.images || [],
            metaTitle: `${prod.name} | Apex Store`,
            metaDescription: prod.description.slice(0, 150),
            slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          });
        }
      });
    }
  }, [isEdit, id]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleMockImageAdd = () => {
    const sampleImages = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580481077180-2a818cbaec4e?w=500&auto=format&fit=crop&q=80',
    ];
    const chosen = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setFormData(prev => ({ ...prev, images: [...prev.images, chosen] }));
    toast.success('Mock photo uploaded to gallery');
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      toast.error('Please enter product name and SKU');
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit && id) {
        await productService.updateProduct(id, formData);
        toast.success('Product details updated successfully');
      } else {
        await productService.createProduct({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        });
        toast.success('Product created and added to catalog');
      }
      navigate('/ecommerce/products');
    } catch {
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <PageHeader
        title={isEdit ? `Edit Product: ${formData.name || 'Loading...'}` : 'Create New Product'}
        subtitle="Specify product attributes, pricing, media gallery, inventory control, and SEO."
        breadcrumbs={[
          { label: 'E-Commerce', href: '/ecommerce/products' },
          { label: 'Products', href: '/ecommerce/products' },
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/ecommerce/products">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="sm" isLoading={isLoading} leftIcon={<Save className="w-3.5 h-3.5" />}>
              {isEdit ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Core Info, Description, Gallery, Pricing, Variants */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <Card>
            <CardHeader title="General Information" description="Name, SKU identifier, brand and category" />
            <CardBody className="space-y-4">
              <Input
                label="Product Name *"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. UltraWide 34-Inch Curved Display"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="SKU (Stock Keeping Unit) *"
                  value={formData.sku}
                  onChange={e => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. PERIPH-UW-003"
                  required
                />
                <Input
                  label="Brand / Manufacturer"
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. ApexForge"
                />
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  options={[
                    { value: 'Computer Peripherals', label: 'Computer Peripherals' },
                    { value: 'Office Furniture', label: 'Office Furniture' },
                    { value: 'Consumer Electronics', label: 'Consumer Electronics' },
                    { value: 'Smart Home', label: 'Smart Home' },
                    { value: 'Office Accessories', label: 'Office Accessories' },
                  ]}
                />
              </div>

              {/* Rich Text Editor Simulation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description & Specifications
                </label>
                <div className="rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Write a clear, descriptive specification of the product..."
                    className="w-full p-3 text-sm bg-transparent border-none focus:outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pricing & Economics */}
          <Card>
            <CardHeader title="Pricing & Taxation" description="Retail pricing, discount rate, and tax calculation" />
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Input
                  label="Base Price ($) *"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
                <Input
                  label="Compare At Price ($)"
                  type="number"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={e => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || 0 })}
                  helperText="Strikethrough price"
                />
                <Input
                  label="Cost Per Item ($)"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  helperText="Internal COGS"
                />
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  step="0.1"
                  value={formData.tax}
                  onChange={e => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </CardBody>
          </Card>

          {/* Media Gallery */}
          <Card>
            <CardHeader
              title="Product Gallery"
              description="High-resolution images and visual assets"
              action={
                <Button type="button" variant="outline" size="sm" onClick={handleMockImageAdd} leftIcon={<UploadCloud className="w-3.5 h-3.5" />}>
                  Add Mock Photo
                </Button>
              }
            />
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square">
                    <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-indigo-600/90 text-[10px] text-white font-semibold">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

                {/* Dropzone mock */}
                <div
                  onClick={handleMockImageAdd}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors aspect-square"
                >
                  <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload Image</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Drag & drop or browse</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* SEO Metadata */}
          <Card>
            <CardHeader title="Search Engine Optimization (SEO)" description="Metadata rendered for Google SERP snippet" />
            <CardBody className="space-y-4">
              <Input
                label="SEO Meta Title"
                value={formData.metaTitle}
                onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Product page title tag"
              />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  SEO Meta Description
                </label>
                <textarea
                  rows={2}
                  value={formData.metaDescription}
                  onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Summary for search engines..."
                  className="w-full rounded-lg text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <Input
                label="URL Slug"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. ultrawide-curved-display"
              />
            </CardBody>
          </Card>
        </div>

        {/* Right Column (1 col): Status, Inventory, Shipping & Tags */}
        <div className="space-y-6">
          {/* Publication Status */}
          <Card>
            <CardHeader title="Catalog Status" />
            <CardBody className="space-y-4">
              <Select
                label="Status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Product['status'] })}
                options={[
                  { value: 'published', label: 'Published (Live)' },
                  { value: 'draft', label: 'Draft (Hidden)' },
                  { value: 'out_of_stock', label: 'Out of Stock' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Published products are immediately viewable across public catalog storefronts.</span>
              </div>
            </CardBody>
          </Card>

          {/* Inventory Controls */}
          <Card>
            <CardHeader title="Warehouse & Inventory" />
            <CardBody className="space-y-4">
              <Input
                label="Stock on Hand *"
                type="number"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
              />
              <Input
                label="Low Stock Alert Threshold"
                type="number"
                value={formData.minStock}
                onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                helperText="Triggers dashboard warning below this count"
              />
            </CardBody>
          </Card>

          {/* Shipping & Logistics */}
          <Card>
            <CardHeader title="Physical Dimensions" />
            <CardBody className="space-y-4">
              <Input
                label="Package Weight"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 2.4 kg"
              />
              <Input
                label="Dimensions (L x W x H)"
                value={formData.dimensions}
                onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g. 45 x 30 x 12 cm"
              />
            </CardBody>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader title="Tags & Collections" />
            <CardBody className="space-y-3">
              <Input
                placeholder="Type tag and press Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Unsaved changes will be committed to local repository.
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <Link to="/ecommerce/products">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="sm" isLoading={isLoading} leftIcon={<Save className="w-3.5 h-3.5" />}>
              {isEdit ? 'Save Changes' : 'Publish Product'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
