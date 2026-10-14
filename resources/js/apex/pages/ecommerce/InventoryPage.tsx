import React, { useState } from 'react';
import { Package, AlertTriangle, ArrowUpDown, CheckCircle, RefreshCw, Warehouse } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { mockProducts } from '../../data/products';
import { useToast } from '../../context/ToastContext';

export const InventoryPage: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState(mockProducts);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [stockInput, setStockInput] = useState(0);

  const handleOpenAdjust = (item: any) => {
    setSelectedItem(item);
    setStockInput(item.stock);
  };

  const handleSaveStock = () => {
    if (!selectedItem) return;
    setItems(prev =>
      prev.map(it => (it.id === selectedItem.id ? { ...it, stock: Number(stockInput) } : it))
    );
    toast.success(`Updated stock count for ${selectedItem.name}`);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Warehouse Depot"
        subtitle="Live stock counts, replenishment triggers, and warehouse location management."
        breadcrumbs={[{ label: 'E-Commerce' }, { label: 'Inventory' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Warehouse synchronization completed')}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync Inventory
          </Button>
        }
      />

      {/* Warehouse distribution centers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Central Distribution Hub', loc: 'Chicago, IL', cap: '84% utilized', count: '14,280 units' },
          { name: 'West Coast Logistics Depot', loc: 'Reno, NV', cap: '62% utilized', count: '9,450 units' },
          { name: 'European Transit Center', loc: 'Rotterdam, NL', cap: '48% utilized', count: '6,120 units' },
        ].map((wh, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Warehouse className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{wh.name}</h4>
                <span className="text-[11px] text-slate-400">{wh.loc}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200">{wh.count}</span>
              <span className="text-slate-400">{wh.cap}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Inventory SKU Management Table */}
      <Card>
        <CardHeader
          title="Active SKU Stock Matrix"
          description="Real-time physical count and re-order thresholds"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                <th className="py-2.5 px-4">Item & SKU</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-center">Re-order Min</th>
                <th className="py-2.5 px-4 text-right">Available Stock</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map(item => {
                const isLow = item.stock <= item.minStock && item.stock > 0;
                const isOut = item.stock === 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white block">
                          {item.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{item.sku}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.category}</td>
                    <td className="py-3 px-4 text-center text-slate-500">{item.minStock}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {item.stock}
                    </td>
                    <td className="py-3 px-4">
                      {isOut ? (
                        <Badge variant="danger" dot>
                          Out of Stock
                        </Badge>
                      ) : isLow ? (
                        <Badge variant="warning" dot>
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="success" dot>
                          Adequate
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button size="xs" variant="outline" onClick={() => handleOpenAdjust(item)}>
                        Adjust Stock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Adjust Physical Inventory"
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Updating on-hand warehouse count for{' '}
              <strong className="text-slate-900 dark:text-white">{selectedItem.name}</strong> (SKU: {selectedItem.sku})
            </p>
            <Input
              label="New Physical Stock Count"
              type="number"
              value={stockInput}
              onChange={e => setStockInput(parseInt(e.target.value) || 0)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveStock}>
                Save Adjustment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
