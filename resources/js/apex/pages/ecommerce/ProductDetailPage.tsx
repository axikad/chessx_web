import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Star,
  Package,
  TrendingUp,
  DollarSign,
  Share2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'variants' | 'reviews'>('overview');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (id) {
      productService.getProductById(id).then(p => {
        if (p) {
          setProduct(p);
          setActiveImage(p.images[0] || '');
        }
      });
    }
  }, [id]);

  if (!product) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p>Loading product details...</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!product) return;
    try {
      await productService.deleteProduct(product.id);
      toast.success('Product removed from catalog');
      navigate('/ecommerce/products');
    } catch {
      toast.error('Failed to remove product');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku} • Brand: ${product.brand}`}
        breadcrumbs={[
          { label: 'E-Commerce', href: '/ecommerce/products' },
          { label: 'Products', href: '/ecommerce/products' },
          { label: product.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/ecommerce/products">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Back to Catalog
              </Button>
            </Link>
            <Link to={`/ecommerce/products/${product.id}/edit`}>
              <Button size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                Edit Product
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Main product visual & economics layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 aspect-square">
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                  activeImage === img
                    ? 'border-indigo-600 scale-95 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column (7 cols): Overview, KPI summary, and Tabs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Selling Price</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                ${product.price.toFixed(2)}
              </div>
              {product.compareAtPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Available Stock</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {product.stock} units
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">In warehouse depot</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Total Orders</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                {product.salesCount.toLocaleString()}
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">+12% this month</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Gross Revenue</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ${product.revenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400">Historical sales</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <Card>
            <div className="flex border-b border-slate-200 dark:border-slate-800 px-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Specifications & Description
              </button>
              <button
                onClick={() => setActiveTab('variants')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'variants'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                SKU Variants ({product.variants?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Customer Rating (4.9 ★)
              </button>
            </div>

            <CardBody className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1.5 text-sm">Product Description</h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Category</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{product.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Physical Weight</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{product.weight}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Dimensions</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{product.dimensions}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Standard Tax Rate</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{product.tax}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Min Re-order Stock</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{product.minStock} units</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Tags</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {product.tags.map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'variants' && (
                <div className="space-y-3">
                  {product.variants && product.variants.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                            <th className="pb-2">Variant Option</th>
                            <th className="pb-2">SKU Code</th>
                            <th className="pb-2 text-right">Price</th>
                            <th className="pb-2 text-right">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {product.variants.map(v => (
                            <tr key={v.id}>
                              <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">{v.name}</td>
                              <td className="py-2.5 font-mono text-slate-500">{v.sku}</td>
                              <td className="py-2.5 text-right font-semibold">${v.price.toFixed(2)}</td>
                              <td className="py-2.5 text-right font-medium">{v.stock} in stock</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No additional child variants defined for this base SKU.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white">4.9</div>
                    <div>
                      <div className="flex items-center text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-slate-500 text-[11px]">Based on 84 verified purchases</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">Marcus Vance</span>
                        <span className="text-slate-400 text-[11px]">2 days ago</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        Flawless engineering and premium build quality. Integrates effortlessly with our modern office setup.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Catalog Item"
        message={`Are you sure you want to permanently delete "${product.name}"?`}
      />
    </div>
  );
};
