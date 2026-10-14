import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Folder, Package, ExternalLink } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  featured: boolean;
}

export const CategoriesPage: React.FC = () => {
  const { toast } = useToast();

  const [categories, setCategories] = useState<CategoryItem[]>([
    {
      id: '1',
      name: 'Computer Peripherals',
      slug: 'computer-peripherals',
      description: 'Ergonomic mice, mechanical keyboards, monitors and docking stations',
      itemCount: 42,
      featured: true,
    },
    {
      id: '2',
      name: 'Office Furniture',
      slug: 'office-furniture',
      description: 'Standing desks, ergonomic chairs, active seating and credenzas',
      itemCount: 28,
      featured: true,
    },
    {
      id: '3',
      name: 'Consumer Electronics',
      slug: 'consumer-electronics',
      description: 'Audio devices, smart hubs, noise-cancelling headphones and speakers',
      itemCount: 65,
      featured: false,
    },
    {
      id: '4',
      name: 'Office Accessories',
      slug: 'office-accessories',
      description: 'Desk mats, cable management raceways, lighting and monitor arms',
      itemCount: 39,
      featured: false,
    },
    {
      id: '5',
      name: 'Smart Home & Automation',
      slug: 'smart-home',
      description: 'Sensors, lighting control systems, climate control and energy monitors',
      itemCount: 19,
      featured: false,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDesc(cat.description);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCategory) {
      setCategories(prev =>
        prev.map(c =>
          c.id === editingCategory.id
            ? { ...c, name: formName, slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'), description: formDesc }
            : c
        )
      );
      toast.success('Category updated successfully');
    } else {
      const newCat: CategoryItem = {
        id: Date.now().toString(),
        name: formName,
        slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'),
        description: formDesc,
        itemCount: 0,
        featured: false,
      };
      setCategories(prev => [...prev, newCat]);
      toast.success('New category registered');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Category deleted');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Categories"
        subtitle="Organize product catalog taxonomies, navigational hierarchies, and collections."
        breadcrumbs={[{ label: 'E-Commerce' }, { label: 'Categories' }]}
        actions={
          <Button size="sm" onClick={handleOpenAdd} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Category
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <Card key={cat.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Folder className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cat.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">/{cat.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {cat.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 font-medium">{cat.itemCount} linked products</span>
              {cat.featured && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
                  Featured
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Category Name *"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            placeholder="e.g. Ergonomic Accessories"
            required
          />
          <Input
            label="URL Slug"
            value={formSlug}
            onChange={e => setFormSlug(e.target.value)}
            placeholder="e.g. ergonomic-accessories"
            helperText="Auto-generated if left blank"
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Brief summary of items in this category..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
