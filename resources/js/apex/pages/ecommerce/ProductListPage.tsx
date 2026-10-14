import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Star, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteKeys, setBulkDeleteKeys] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { toast } = useToast();
  const navigate = useNavigate();

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await productService.getProducts({
        filters: {
          category: categoryFilter,
          status: statusFilter,
        },
      });
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await productService.deleteProduct(deleteId);
      toast.success('Product removed successfully');
      setDeleteId(null);
      loadProducts();
    } catch {
      toast.error('Could not delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (bulkDeleteKeys.length === 0) return;
    for (const key of bulkDeleteKeys) {
      await productService.deleteProduct(key);
    }
    toast.success(`Removed ${bulkDeleteKeys.length} products`);
    setBulkDeleteKeys([]);
    loadProducts();
  };

  const getStatusBadge = (status: Product['status']) => {
    const map: Record<Product['status'], { variant: BadgeVariant; label: string }> = {
      published: { variant: 'success', label: 'Published' },
      draft: { variant: 'neutral', label: 'Draft' },
      out_of_stock: { variant: 'danger', label: 'Out of Stock' },
      archived: { variant: 'warning', label: 'Archived' },
    };
    const s = map[status] || { variant: 'neutral', label: status };
    return <Badge variant={s.variant} dot>{s.label}</Badge>;
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-3">
          <img
            src={row.images[0]}
            alt={row.name}
            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
          />
          <div className="min-w-0">
            <Link
              to={`/ecommerce/products/${row.id}`}
              className="font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block max-w-xs"
            >
              {row.name}
            </Link>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
              <span>{row.sku}</span>
              <span>•</span>
              <span className="text-slate-500">{row.brand}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: row => <span className="text-slate-600 dark:text-slate-400">{row.category}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'right',
      render: row => (
        <div className="text-right">
          <span className="font-semibold text-slate-900 dark:text-white">${row.price.toFixed(2)}</span>
          {row.compareAtPrice && (
            <span className="text-[11px] text-slate-400 line-through block">
              ${row.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              row.stock === 0
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : row.stock <= row.minStock
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {row.stock} in stock
          </span>
          {row.stock <= row.minStock && row.stock > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              Low
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: row => getStatusBadge(row.status),
    },
    {
      key: 'salesCount',
      header: 'Orders',
      sortable: true,
      align: 'right',
      render: row => <span className="font-mono">{row.salesCount.toLocaleString()}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: row => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/ecommerce/products/${row.id}`)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate(`/ecommerce/products/${row.id}/edit`)}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteId(row.id)}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        subtitle="Manage inventory items, pricing, variants, and catalog status."
        breadcrumbs={[{ label: 'E-Commerce' }, { label: 'Products' }]}
        actions={
          <Link to="/ecommerce/products/create">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </Button>
          </Link>
        }
      />

      <DataTable
        title="All Catalog Items"
        columns={columns}
        data={products}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="Search product by title, SKU, brand..."
        onBulkDelete={keys => setBulkDeleteKeys(keys)}
        customFilters={
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Computer Peripherals">Computer Peripherals</option>
              <option value="Office Furniture">Office Furniture</option>
              <option value="Consumer Electronics">Consumer Electronics</option>
              <option value="Office Accessories">Office Accessories</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={bulkDeleteKeys.length > 0}
        onClose={() => setBulkDeleteKeys([])}
        onConfirm={handleBulkDelete}
        title={`Delete ${bulkDeleteKeys.length} Products`}
        message="Are you sure you want to remove all selected items from catalog?"
      />
    </div>
  );
};
