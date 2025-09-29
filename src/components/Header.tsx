import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  language: string;
  setLanguage: (language: string) => void;
  cartLength: number;
  onCartClick: () => void;
  texts: {
    dealerPortal: string;
  };
}

const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  cartLength,
  onCartClick,
  texts
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="FileSpreadsheet" className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{texts.dealerPortal}</h1>
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
            
            <Button variant="outline" size="sm" className="relative" onClick={onCartClick}>
              <Icon name="ShoppingCart" className="w-4 h-4" />
              {cartLength > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                  {cartLength}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;