import React, { useState, useEffect } from 'react';
import SubNavbar from '../components/SubNavbar';
import { receiptService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface Receipt {
  id: number;
  filePath?: string;
  metadata?: any;
  userId: number;
  uploadedAt: string;
}

const Receipts: React.FC = () => {
  const { t } = useLanguage();

  const financeTabs = [
    { path: '/finance/transactions', labelKey: 'transactions', icon: '💳' },
    { path: '/finance/accounts', labelKey: 'accounts', icon: '🏦' },
    { path: '/finance/receipts', labelKey: 'receipts', icon: '🧾' },
  ];

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    merchant: '',
    amount: '',
    date: '',
    category: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await receiptService.getAll();
      setReceipts(data as Receipt[]);
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('metadata', JSON.stringify(metadata));

      setUploadProgress(30);
      await receiptService.create(formData);
      setUploadProgress(100);

      await fetchReceipts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error uploading receipt:', error);
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return;

    try {
      await receiptService.delete(id.toString());
      fetchReceipts();
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setMetadata({
      merchant: '',
      amount: '',
      date: '',
      category: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SubNavbar tabs={financeTabs} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('receipts')}</h1>
          <p className="text-gray-400">{t('manageReceipts')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-xl">📁</span>
          {t('uploadReceipt')}
        </button>
      </div>

      {/* Content Container */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
          <p className="text-gray-400 mt-4">{t('loadingReceipts')}</p>
        </div>
      ) : receipts.length === 0 ? (
        <div className="card-glass p-12 text-center border border-white/10">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-2xl font-bold text-white mb-2">{t('noReceiptsYet')}</h3>
          <p className="text-gray-400 mb-6">{t('uploadReceiptsMessage')}</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            {t('uploadFirstReceipt')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="card-glass p-6 hover:scale-[1.02] transition-all duration-300 border border-white/5 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-navy to-brand-green rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:rotate-3 transition-transform">
                  🧾
                </div>
                <span className="text-gray-400 text-sm">
                  {new Date(receipt.uploadedAt).toLocaleDateString()}
                </span>
              </div>

              {receipt.metadata && (
                <div className="space-y-2 mb-6">
                  {receipt.metadata.merchant && (
                    <p className="text-white font-bold text-lg">{receipt.metadata.merchant}</p>
                  )}
                  {receipt.metadata.amount && (
                    <p className="text-brand-green text-2xl font-black">${receipt.metadata.amount}</p>
                  )}
                  {receipt.metadata.category && (
                    <span className="inline-block px-3 py-1 bg-brand-navy/30 text-blue-400 rounded-full text-xs font-semibold border border-blue-400/20">
                      {receipt.metadata.category}
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/10">
                {receipt.filePath && (
                  <button
                    onClick={() => window.open(receipt.filePath, '_blank')}
                    className="flex-[2] py-2 bg-brand-navy/20 hover:bg-brand-navy/40 text-blue-400 rounded-lg font-bold transition-all border border-blue-400/10"
                  >
                    👁️ {t('view')}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-all border border-red-500/10"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="card-glass p-8 max-w-2xl w-full border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">{t('uploadReceipt')}</h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-400 hover:text-white transition-colors"
              >✕</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-300 font-semibold px-1">{t('selectFile')}</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="w-full px-4 py-8 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl text-white cursor-pointer hover:border-brand-green transition-all"
                    required
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 group-hover:text-brand-green">
                    {selectedFile ? selectedFile.name : 'اسحب الملف هنا أو انقر للاختيار'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">{t('merchant')}</label>
                  <input
                    type="text"
                    value={metadata.merchant}
                    onChange={(e) => setMetadata({ ...metadata, merchant: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                    placeholder="مثال: أمازون"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">{t('amount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={metadata.amount}
                    onChange={(e) => setMetadata({ ...metadata, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">{t('date')}</label>
                  <input
                    type="date"
                    value={metadata.date}
                    onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 px-1">{t('category')}</label>
                  <input
                    type="text"
                    value={metadata.category}
                    onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-brand-green"
                    placeholder="مثال: تسوق"
                  />
                </div>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-navy to-brand-green h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-xs text-gray-500">{uploadProgress}% جاري الرفع...</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold transition-all"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-gradient-to-r from-brand-navy to-brand-green text-white rounded-xl font-bold shadow-lg shadow-brand-green/20 hover:shadow-brand-green/30 transform hover:scale-[1.02] transition-all"
                >
                  {t('uploadReceipt')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;
