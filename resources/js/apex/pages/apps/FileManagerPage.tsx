import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Image,
  Film,
  UploadCloud,
  Grid,
  List,
  Download,
  Trash2,
  HardDrive,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

interface StorageFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video';
  size: string;
  modified: string;
  url: string;
}

export const FileManagerPage: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFolder, setActiveFolder] = useState('Product Assets');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [files, setFiles] = useState<StorageFile[]>([
    {
      id: 'f1',
      name: 'ultrawide-display-hero.png',
      type: 'image',
      size: '2.4 MB',
      modified: 'Jun 08, 2026',
      url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'f2',
      name: 'q2-commercial-audit.pdf',
      type: 'document',
      size: '1.1 MB',
      modified: 'Jun 05, 2026',
      url: '#',
    },
    {
      id: 'f3',
      name: 'mechanical-keyboard-black.jpg',
      type: 'image',
      size: '3.8 MB',
      modified: 'May 28, 2026',
      url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'f4',
      name: 'enterprise-contract-template.docx',
      type: 'document',
      size: '450 KB',
      modified: 'May 14, 2026',
      url: '#',
    },
  ]);

  const handleUploadMock = () => {
    const newF: StorageFile = {
      id: `f-${Date.now()}`,
      name: 'uploaded-invoice-spec.pdf',
      type: 'document',
      size: '890 KB',
      modified: 'Just now',
      url: '#',
    };
    setFiles([newF, ...files]);
    setIsUploadOpen(false);
    toast.success('Asset uploaded to cloud storage');
  };

  const getFileIcon = (type: StorageFile['type']) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-indigo-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'video':
        return <Film className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="File & Asset Manager"
        subtitle="Media library, product photography assets, documents, and secure cloud storage."
        breadcrumbs={[{ label: 'Apps' }, { label: 'File Manager' }]}
        actions={
          <Button size="sm" onClick={() => setIsUploadOpen(true)} leftIcon={<UploadCloud className="w-3.5 h-3.5" />}>
            Upload File
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (3 cols): Folders & Storage */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
              Directories
            </span>
            {['Product Assets', 'Invoices & Billing', 'Marketing Graphics', 'System Backups'].map(
              folder => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    activeFolder === folder
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Folder className="w-4 h-4 text-indigo-500" />
                  <span>{folder}</span>
                </button>
              )
            )}
          </Card>

          {/* Storage Meter Card */}
          <Card className="p-4 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <HardDrive className="w-4 h-4 text-indigo-500" />
              <span>Storage Allocated</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-[42%]" />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>42.8 GB Used</span>
              <span>100 GB Total</span>
            </div>
          </Card>
        </div>

        {/* Right Column (9 cols): Files View */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeFolder}</h3>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-slate-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 shadow-xs' : 'text-slate-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {files.map(file => (
                <div
                  key={file.id}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-video bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center mb-2">
                    {file.type === 'image' ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </h5>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{file.size}</span>
                      <span>{file.modified}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {files.map(file => (
                  <div key={file.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 truncate">
                      {getFileIcon(file.type)}
                      <span className="font-semibold text-slate-900 dark:text-white truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-slate-400 text-[11px] shrink-0">
                      <span>{file.size}</span>
                      <span>{file.modified}</span>
                      <button
                        onClick={() => toast.success(`Downloading ${file.name}`)}
                        className="p-1 hover:text-indigo-600"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Asset">
        <div className="space-y-4 text-center">
          <div
            onClick={handleUploadMock}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 cursor-pointer hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Click to select files or drag and drop
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PNG, JPG, PDF, DOCX up to 50MB
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUploadMock}>
              Upload Demo Asset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
