import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface DealerInfo {
  discount: number;
}

interface ProductCatalogProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredProducts: Product[];
  categories: string[];
  dealerInfo: DealerInfo;
  onAddToCart: (product: Product) => void;
  texts: {
    search: string;
    category: string;
    allCategories: string;
    addToCart: string;
    outOfStock: string;
  };
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  filteredProducts,
  categories,
  dealerInfo,
  onAddToCart,
  texts
}) => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">{texts.search}</Label>
              <div className="relative mt-1">
                <Icon name="Search" className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder={texts.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Label className="text-sm font-medium">{texts.category}</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{texts.allCategories}</SelectItem>
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
                  onClick={() => onAddToCart(product)}
                  disabled={!product.inStock}
                  className="bg-primary hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {product.inStock ? (
                    <>
                      <Icon name="ShoppingCart" className="w-3 h-3 mr-1" />
                      {texts.addToCart}
                    </>
                  ) : (
                    texts.outOfStock
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;