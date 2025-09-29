import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Header from '@/components/Header';
import AdminPanel from '@/components/AdminPanel';
import ProductCatalog from '@/components/ProductCatalog';
import ShoppingCart from '@/components/ShoppingCart';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
  finalPrice: number;
}

interface DealerInfo {
  name: string;
  inn: string;
  phone: string;
  discount: number;
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Ручка шариковая синяя',
    category: 'Письменные принадлежности',
    price: 45,
    image: '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg',
    description: 'Качественная шариковая ручка с синими чернилами',
    inStock: true
  },
  {
    id: '2',
    name: 'Блокнот А5 линейка',
    category: 'Тетради и блокноты',
    price: 120,
    image: '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg',
    description: 'Блокнот формата А5 с линованными страницами',
    inStock: true
  },
  {
    id: '3',
    name: 'Степлер офисный',
    category: 'Офисная техника',
    price: 350,
    image: '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg',
    description: 'Надежный офисный степлер для документов',
    inStock: false
  },
  {
    id: '4',
    name: 'Карандаш простой НВ',
    category: 'Письменные принадлежности',
    price: 25,
    image: '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg',
    description: 'Простой карандаш твердости НВ',
    inStock: true
  },
  {
    id: '5',
    name: 'Папка-регистратор',
    category: 'Офисная техника',
    price: 180,
    image: '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg',
    description: 'Папка-регистратор А4 для документов',
    inStock: true
  },
  {
    id: '6',
    name: 'Маркер выделитель желтый',
    category: 'Письменные принадлежности',
    price: 65,
    image: '/img/dc9855aa-d3ba-40f6-91a6-c00afab470de.jpg',
    description: 'Маркер-выделитель флуоресцентный желтый',
    inStock: true
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dealerInfo, setDealerInfo] = useState<DealerInfo>({
    name: '',
    inn: '',
    phone: '',
    discount: 0
  });
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('ru');

  const categories = ['all', 'Письменные принадлежности', 'Тетради и блокноты', 'Офисная техника'];

  const filteredProducts = sampleProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const discountMultiplier = (100 - dealerInfo.discount) / 100;
    const finalPrice = Math.round(product.price * discountMultiplier);
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, finalPrice }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, finalPrice }]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setExcelFile(file);
    }
  };

  const texts = {
    ru: {
      dealerPortal: 'DEALER PORTAL',
      adminPanel: 'Панель администратора',
      catalog: 'Каталог товаров',
      cart: 'Корзина',
      uploadExcel: 'Загрузить Excel каталог',
      dragDrop: 'Перетащите файл Excel сюда или нажмите для выбора',
      search: 'Поиск товаров...',
      category: 'Категория',
      allCategories: 'Все категории',
      addToCart: 'В корзину',
      outOfStock: 'Нет в наличии',
      dealerInfo: 'Информация о дилере',
      dealerName: 'Наименование дилера',
      inn: 'ИНН',
      phone: 'Телефон',
      discount: 'Скидка (%)',
      total: 'Итого',
      placeOrder: 'Оформить заказ',
      cartEmpty: 'Корзина пуста',
      cartItems: 'товаров'
    },
    en: {
      dealerPortal: 'DEALER PORTAL',
      adminPanel: 'Admin Panel',
      catalog: 'Product Catalog',
      cart: 'Cart',
      uploadExcel: 'Upload Excel Catalog',
      dragDrop: 'Drag Excel file here or click to select',
      search: 'Search products...',
      category: 'Category',
      allCategories: 'All Categories',
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      dealerInfo: 'Dealer Information',
      dealerName: 'Dealer Name',
      inn: 'Tax ID',
      phone: 'Phone',
      discount: 'Discount (%)',
      total: 'Total',
      placeOrder: 'Place Order',
      cartEmpty: 'Cart is empty',
      cartItems: 'items'
    }
  };

  const t = texts[language as keyof typeof texts];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        language={language}
        setLanguage={setLanguage}
        cartLength={cart.length}
        onCartClick={() => setActiveTab('cart')}
        texts={t}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Icon name="Settings" className="w-4 h-4" />
              <span>{t.adminPanel}</span>
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center space-x-2">
              <Icon name="Package" className="w-4 h-4" />
              <span>{t.catalog}</span>
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center space-x-2">
              <Icon name="ShoppingCart" className="w-4 h-4" />
              <span>{t.cart} ({cart.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <AdminPanel
              excelFile={excelFile}
              onFileUpload={handleFileUpload}
              texts={t}
            />
          </TabsContent>

          <TabsContent value="catalog">
            <ProductCatalog
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filteredProducts={filteredProducts}
              categories={categories}
              dealerInfo={dealerInfo}
              onAddToCart={addToCart}
              texts={t}
            />
          </TabsContent>

          <TabsContent value="cart">
            <ShoppingCart
              cart={cart}
              dealerInfo={dealerInfo}
              setDealerInfo={setDealerInfo}
              onUpdateQuantity={updateQuantity}
              onGoToCatalog={() => setActiveTab('catalog')}
              texts={t}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;