import React, { useState } from 'react';
import { useFaq } from '../../contexts/FaqContext';
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown } from 'lucide-react';

const AdminFaq = () => {
  const { faqs, categories, addFaq, updateFaq, deleteFaq, toggleFaqStatus } = useFaq();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({
    category: categories[0] || '',
    question: '',
    answer: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) {
      alert('Lütfen soru ve cevap alanlarını doldurun');
      return;
    }

    if (editingFaq) {
      updateFaq(editingFaq.id, newFaq);
      setEditingFaq(null);
    } else {
      addFaq(newFaq);
    }

    setNewFaq({
      category: categories[0] || '',
      question: '',
      answer: ''
    });
    setIsAdding(false);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setNewFaq({
      category: faq.category,
      question: faq.question,
      answer: faq.answer
    });
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
      deleteFaq(id);
    }
  };

  const moveOrder = (faq, direction) => {
    const sameCategoryFaqs = faqs
      .filter(f => f.category === faq.category)
      .sort((a, b) => a.order - b.order);
    
    const currentIndex = sameCategoryFaqs.findIndex(f => f.id === faq.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sameCategoryFaqs.length) return;

    const currentFaq = sameCategoryFaqs[currentIndex];
    const swapFaq = sameCategoryFaqs[newIndex];

    updateFaq(currentFaq.id, { order: swapFaq.order });
    updateFaq(swapFaq.id, { order: currentFaq.order });
  };

  // Group FAQs by category
  const groupedFaqs = categories.map(category => ({
    category,
    faqs: faqs.filter(f => f.category === category).sort((a, b) => a.order - b.order)
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light uppercase tracking-wider">SSS Yönetimi</h2>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingFaq(null);
            setNewFaq({
              category: categories[0] || '',
              question: '',
              answer: ''
            });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Yeni Soru
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white border border-neutral-200 p-6 mb-6">
          <h3 className="text-lg font-light mb-4">
            {editingFaq ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Kategori *</label>
              <select
                value={newFaq.category}
                onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                className="input-field w-full"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Soru *</label>
              <input
                type="text"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                className="input-field w-full"
                placeholder="Sıkça sorulan soru"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Cevap *</label>
              <textarea
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                className="input-field w-full"
                rows="4"
                placeholder="Sorunun cevabı"
                required
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingFaq ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingFaq(null);
                }}
                className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQs by Category */}
      <div className="space-y-6">
        {groupedFaqs.map(({ category, faqs: categoryFaqs }) => (
          <div key={category} className="bg-white border border-neutral-200">
            <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
              <h3 className="font-medium uppercase tracking-wider">{category}</h3>
              <p className="text-xs text-neutral-500 mt-1">{categoryFaqs.length} soru</p>
            </div>

            {categoryFaqs.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                Bu kategoride henüz soru bulunmuyor
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {categoryFaqs.map((faq, index) => (
                  <div key={faq.id} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveOrder(faq, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-neutral-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveOrder(faq, 'down')}
                          disabled={index === categoryFaqs.length - 1}
                          className="p-1 hover:bg-neutral-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium mb-2">{faq.question}</p>
                        <p className="text-sm text-neutral-600">{faq.answer}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFaqStatus(faq.id)}
                          className={`p-2 rounded transition ${
                            faq.isActive ? 'text-green-600 hover:bg-green-50' : 'text-neutral-400 hover:bg-neutral-100'
                          }`}
                        >
                          {faq.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                        <button
                          onClick={() => handleEdit(faq)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Toplam Soru</p>
          <p className="text-2xl font-light">{faqs.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Aktif</p>
          <p className="text-2xl font-light text-green-600">{faqs.filter(f => f.isActive).length}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Pasif</p>
          <p className="text-2xl font-light">{faqs.filter(f => !f.isActive).length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminFaq;
