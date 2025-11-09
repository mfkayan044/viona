import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFaq } from '../contexts/FaqContext';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FaqPage = () => {
  const navigate = useNavigate();
  const { categories, getFaqsByCategory } = useFaq();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFaq = (faqId) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  const getFilteredFaqs = () => {
    let allFaqs = [];
    
    if (selectedCategory === 'all') {
      categories.forEach(cat => {
        allFaqs = [...allFaqs, ...getFaqsByCategory(cat)];
      });
    } else {
      allFaqs = getFaqsByCategory(selectedCategory);
    }

    if (searchTerm) {
      allFaqs = allFaqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return allFaqs;
  };

  const filteredFaqs = getFilteredFaqs();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-4">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wider mb-4">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Merak ettiğiniz her şey burada! Aradığınızı bulamazsanız bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-neutral-300 focus:border-black focus:outline-none transition-colors"
              placeholder="Soru ara..."
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-sm uppercase tracking-wider transition-colors ${
              selectedCategory === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            Tümü
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm uppercase tracking-wider transition-colors ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQs */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-12 text-center">
            <HelpCircle size={48} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-neutral-500">
              {searchTerm ? 'Aradığınız kriterlere uygun soru bulunamadı' : 'Bu kategoride henüz soru bulunmuyor'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedCategory === 'all' ? (
              // Group by category when showing all
              categories.map(category => {
                const categoryFaqs = getFaqsByCategory(category).filter(faq =>
                  !searchTerm ||
                  faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (categoryFaqs.length === 0) return null;

                return (
                  <div key={category} className="mb-8">
                    <h2 className="text-xl font-light uppercase tracking-wider mb-4 pb-2 border-b border-neutral-200">
                      {category}
                    </h2>
                    <div className="space-y-3">
                      {categoryFaqs.map(faq => (
                        <div
                          key={faq.id}
                          className="bg-white border border-neutral-200 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFaq(faq.id)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors text-left"
                          >
                            <span className="font-light text-lg pr-4">{faq.question}</span>
                            {openFaqId === faq.id ? (
                              <ChevronUp size={20} className="flex-shrink-0" />
                            ) : (
                              <ChevronDown size={20} className="flex-shrink-0" />
                            )}
                          </button>
                          {openFaqId === faq.id && (
                            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                              <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Show filtered faqs
              filteredFaqs.map(faq => (
                <div
                  key={faq.id}
                  className="bg-white border border-neutral-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors text-left"
                  >
                    <span className="font-light text-lg pr-4">{faq.question}</span>
                    {openFaqId === faq.id ? (
                      <ChevronUp size={20} className="flex-shrink-0" />
                    ) : (
                      <ChevronDown size={20} className="flex-shrink-0" />
                    )}
                  </button>
                  {openFaqId === faq.id && (
                    <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
                      <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-neutral-900 text-white p-8 text-center">
          <h3 className="text-2xl font-light mb-3">Aradığınızı Bulamadınız mı?</h3>
          <p className="text-neutral-300 mb-6">
            Sorularınız için bizimle iletişime geçebilirsiniz
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="inline-block px-8 py-3 bg-white text-black hover:bg-neutral-100 transition-colors uppercase tracking-wider text-sm"
          >
            İletişime Geç
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FaqPage;
