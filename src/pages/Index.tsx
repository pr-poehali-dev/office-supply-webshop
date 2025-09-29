import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

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

  const totalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="FileSpreadsheet" className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{t.dealerPortal}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">RU</SelectItem>
                  <SelectItem value="en">EN</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="relative" onClick={() => setActiveTab('cart')}>
                <Icon name="ShoppingCart" className="w-4 h-4" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {cart.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
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

          {/* Admin Panel */}
          <TabsContent value="admin">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="Upload" className="w-5 h-5 text-primary" />
                  <span>{t.uploadExcel}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer block">
                    <Icon name="FileSpreadsheet" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">{t.dragDrop}</p>
                    <p className="text-sm text-gray-500">Поддерживаются форматы: .xlsx, .xls</p>
                    {excelFile && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-success-green font-medium flex items-center justify-center">
                          <Icon name="CheckCircle" className="w-4 h-4 mr-2" />
                          {excelFile.name}
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                
                {excelFile && (
                  <div className="mt-6">
                    <Button className="w-full bg-primary hover:bg-blue-700">
                      <Icon name="Upload" className="w-4 h-4 mr-2" />
                      Обработать файл
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Catalog */}
          <TabsContent value="catalog">
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="search" className="text-sm font-medium">{t.search}</Label>
                      <div className="relative mt-1">
                        <Icon name="Search" className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder={t.search}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-64">
                      <Label className="text-sm font-medium">{t.category}</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t.allCategories}</SelectItem>
                          {categories.slice(1).map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <Badge variant="secondary" className="mb-3 text-xs">
                        {product.category}
                      </Badge>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-primary">
                            ₽{product.price}
                          </div>
                          {dealerInfo.discount > 0 && (
                            <div className="text-sm text-success-green">
                              ₽{Math.round(product.price * (100 - dealerInfo.discount) / 100)} с учетом скидки
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                          className="bg-primary hover:bg-blue-700 disabled:bg-gray-300"
                        >
                          {product.inStock ? (
                            <>
                              <Icon name="ShoppingCart" className="w-3 h-3 mr-1" />
                              {t.addToCart}
                            </>
                          ) : (
                            t.outOfStock
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Cart */}
          <TabsContent value="cart">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon name="ShoppingCart" className="w-5 h-5" />
                      <span>Корзина ({cart.length} {t.cartItems})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cart.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Icon name="ShoppingCart" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg mb-2">{t.cartEmpty}</p>
                        <p className="text-sm">Добавьте товары из каталога</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setActiveTab('catalog')}
                        >
                          Перейти к каталогу
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map(item => (
                          <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{item.name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>₽{item.price}</span>
                                {dealerInfo.discount > 0 && (
                                  <>
                                    <Icon name="ArrowRight" className="w-3 h-3" />
                                    <span className="text-success-green font-medium">₽{item.finalPrice}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Icon name="Minus" className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Icon name="Plus" className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="font-bold text-primary min-w-[80px] text-right">
                              ₽{item.finalPrice * item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon name="User" className="w-5 h-5" />
                      <span>{t.dealerInfo}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="dealer-name">{t.dealerName}</Label>
                      <Input
                        id="dealer-name"
                        value={dealerInfo.name}
                        onChange={(e) => setDealerInfo({...dealerInfo, name: e.target.value})}
                        placeholder="ООО Канцтовары"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inn">{t.inn}</Label>
                      <Input
                        id="inn"
                        value={dealerInfo.inn}
                        onChange={(e) => setDealerInfo({...dealerInfo, inn: e.target.value})}
                        placeholder="1234567890"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t.phone}</Label>
                      <Input
                        id="phone"
                        value={dealerInfo.phone}
                        onChange={(e) => setDealerInfo({...dealerInfo, phone: e.target.value})}
                        placeholder="+7 (999) 123-45-67"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">{t.discount}</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="50"
                        value={dealerInfo.discount}
                        onChange={(e) => setDealerInfo({...dealerInfo, discount: Number(e.target.value)})}
                        placeholder="10"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Максимум 50%</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Товаров: {cart.length}</span>
                        <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} шт.</span>
                      </div>
                      {dealerInfo.discount > 0 && (
                        <div className="flex justify-between text-sm text-success-green">
                          <span>Скидка {dealerInfo.discount}%:</span>
                          <span>-₽{cart.reduce((sum, item) => sum + ((item.price - item.finalPrice) * item.quantity), 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>{t.total}:</span>
                        <span className="text-primary">₽{totalAmount}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-success-green hover:bg-green-700 text-white"
                      disabled={cart.length === 0 || !dealerInfo.name || !dealerInfo.inn}
                    >
                      <Icon name="Send" className="w-4 h-4 mr-2" />
                      {t.placeOrder}
                    </Button>
                    
                    {(cart.length === 0 || !dealerInfo.name || !dealerInfo.inn) && (
                      <p className="text-xs text-gray-500 text-center">
                        {cart.length === 0 ? 'Добавьте товары в корзину' : 'Заполните обязательные поля'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;