import React, { createContext, useContext, useState, useEffect } from 'react';

const FaqContext = createContext();

export const useFaq = () => {
  const context = useContext(FaqContext);
  if (!context) {
    throw new Error('useFaq must be used within a FaqProvider');
  }
  return context;
};

export const FaqProvider = ({ children }) => {
  const [faqs, setFaqs] = useState(() => {
    const saved = localStorage.getItem('faqs');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        category: 'Sipariş',
        question: 'Siparişimi nasıl takip edebilirim?',
        answer: 'Siparişinizi "Siparişlerim" sayfasından takip edebilirsiniz. Sipariş numaranız ile kargo takibi yapabilirsiniz.',
        order: 1,
        isActive: true
      },
      {
        id: 2,
        category: 'Sipariş',
        question: 'Sipariş iptali yapabilir miyim?',
        answer: 'Henüz kargoya verilmemiş siparişler için iptal talebinde bulunabilirsiniz. "Siparişlerim" sayfasından iptal işlemini gerçekleştirebilirsiniz.',
        order: 2,
        isActive: true
      },
      {
        id: 3,
        category: 'Kargo',
        question: 'Kargo ücreti ne kadardır?',
        answer: '500 TL ve üzeri alışverişlerde kargo ücretsizdir. 500 TL altı alışverişlerde kargo ücreti 50 TL\'dir.',
        order: 1,
        isActive: true
      },
      {
        id: 4,
        category: 'Kargo',
        question: 'Kargo ne kadar sürede teslim edilir?',
        answer: 'Siparişleriniz 2-5 iş günü içerisinde kargoya verilir ve 1-3 iş günü içinde adresinize teslim edilir.',
        order: 2,
        isActive: true
      },
      {
        id: 5,
        category: 'İade & Değişim',
        question: 'İade ve değişim koşulları nelerdir?',
        answer: 'Ürünlerinizi teslim aldığınız tarihten itibaren 14 gün içerisinde kullanılmamış ve etiketleri sökülmemiş olması koşuluyla iade edebilirsiniz.',
        order: 1,
        isActive: true
      },
      {
        id: 6,
        category: 'İade & Değişim',
        question: 'İade işlemi nasıl yapılır?',
        answer: 'İade işlemi için bizimle iletişime geçmeniz yeterlidir. Size iade kargo kodu göndereceğiz. Ürünü kargoya verdikten sonra iade işleminiz başlatılacaktır.',
        order: 2,
        isActive: true
      },
      {
        id: 7,
        category: 'Ödeme',
        question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
        answer: 'Kredi kartı, banka havalesi ve kapıda ödeme seçeneklerini kullanabilirsiniz.',
        order: 1,
        isActive: true
      },
      {
        id: 8,
        category: 'Ödeme',
        question: 'Taksit yapabilir miyim?',
        answer: 'Kredi kartı ile yapacağınız ödemelerde bankanızın sunduğu taksit seçeneklerinden yararlanabilirsiniz.',
        order: 2,
        isActive: true
      },
      {
        id: 9,
        category: 'Ürün',
        question: 'Ürünler orijinal mi?',
        answer: 'Tüm ürünlerimiz %100 orijinal olup, resmi distribütörlerden temin edilmektedir. Ürünlerimiz garanti kapsamındadır.',
        order: 1,
        isActive: true
      },
      {
        id: 10,
        category: 'Ürün',
        question: 'Stokta olmayan ürünler ne zaman gelir?',
        answer: 'Stokta olmayan ürünlerin temin süresi değişkenlik gösterebilir. Ürün sayfasından "Stokta olunca haber ver" butonuna tıklayarak bilgilendirilme talebinde bulunabilirsiniz.',
        order: 2,
        isActive: true
      }
    ];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('faqCategories');
    return saved ? JSON.parse(saved) : ['Sipariş', 'Kargo', 'İade & Değişim', 'Ödeme', 'Ürün', 'Diğer'];
  });

  useEffect(() => {
    localStorage.setItem('faqs', JSON.stringify(faqs));
  }, [faqs]);

  useEffect(() => {
    localStorage.setItem('faqCategories', JSON.stringify(categories));
  }, [categories]);

  const addFaq = (faqData) => {
    const newFaq = {
      ...faqData,
      id: Date.now(),
      order: faqs.filter(f => f.category === faqData.category).length + 1,
      isActive: true
    };
    setFaqs(prev => [...prev, newFaq]);
  };

  const updateFaq = (faqId, updates) => {
    setFaqs(prev => prev.map(faq =>
      faq.id === faqId ? { ...faq, ...updates } : faq
    ));
  };

  const deleteFaq = (faqId) => {
    setFaqs(prev => prev.filter(faq => faq.id !== faqId));
  };

  const toggleFaqStatus = (faqId) => {
    setFaqs(prev => prev.map(faq =>
      faq.id === faqId ? { ...faq, isActive: !faq.isActive } : faq
    ));
  };

  const getFaqsByCategory = (category) => {
    return faqs
      .filter(faq => faq.category === category && faq.isActive)
      .sort((a, b) => a.order - b.order);
  };

  const getActiveFaqs = () => {
    return faqs.filter(faq => faq.isActive);
  };

  const addCategory = (category) => {
    if (category && !categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const deleteCategory = (category) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  return (
    <FaqContext.Provider value={{
      faqs,
      categories,
      addFaq,
      updateFaq,
      deleteFaq,
      toggleFaqStatus,
      getFaqsByCategory,
      getActiveFaqs,
      addCategory,
      deleteCategory
    }}>
      {children}
    </FaqContext.Provider>
  );
};
