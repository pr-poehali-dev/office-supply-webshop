import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  finalPrice: number;
}

interface DealerInfo {
  name: string;
  inn: string;
  phone: string;
  discount: number;
}

interface ShoppingCartProps {
  cart: CartItem[];
  dealerInfo: DealerInfo;
  setDealerInfo: (info: DealerInfo) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onGoToCatalog: () => void;
  texts: {
    cartEmpty: string;
    cartItems: string;
    dealerInfo: string;
    dealerName: string;
    inn: string;
    phone: string;
    discount: string;
    total: string;
    placeOrder: string;
  };
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cart,
  dealerInfo,
  setDealerInfo,
  onUpdateQuantity,
  onGoToCatalog,
  texts
}) => {
  const totalAmount = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="ShoppingCart" className="w-5 h-5" />
              <span>Корзина ({cart.length} {texts.cartItems})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Icon name="ShoppingCart" className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">{texts.cartEmpty}</p>
                <p className="text-sm">Добавьте товары из каталога</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={onGoToCatalog}
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
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Icon name="Minus" className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
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
              <span>{texts.dealerInfo}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dealer-name">{texts.dealerName}</Label>
              <Input
                id="dealer-name"
                value={dealerInfo.name}
                onChange={(e) => setDealerInfo({...dealerInfo, name: e.target.value})}
                placeholder="ООО Канцтовары"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="inn">{texts.inn}</Label>
              <Input
                id="inn"
                value={dealerInfo.inn}
                onChange={(e) => setDealerInfo({...dealerInfo, inn: e.target.value})}
                placeholder="1234567890"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">{texts.phone}</Label>
              <Input
                id="phone"
                value={dealerInfo.phone}
                onChange={(e) => setDealerInfo({...dealerInfo, phone: e.target.value})}
                placeholder="+7 (999) 123-45-67"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="discount">{texts.discount}</Label>
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
                <span>{texts.total}:</span>
                <span className="text-primary">₽{totalAmount}</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-success-green hover:bg-green-700 text-white"
              disabled={cart.length === 0 || !dealerInfo.name || !dealerInfo.inn}
            >
              <Icon name="Send" className="w-4 h-4 mr-2" />
              {texts.placeOrder}
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
  );
};

export default ShoppingCart;