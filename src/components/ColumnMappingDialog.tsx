import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ColumnMapping {
  field: string;
  label: string;
  detectedColumn: string;
  required: boolean;
}

interface ColumnMappingDialogProps {
  open: boolean;
  onClose: () => void;
  detectedColumns: string[];
  onConfirm: (mapping: Record<string, string>) => void;
}

const ColumnMappingDialog: React.FC<ColumnMappingDialogProps> = ({
  open,
  onClose,
  detectedColumns,
  onConfirm
}) => {
  const [mappings, setMappings] = useState<ColumnMapping[]>([
    { field: 'article', label: 'Артикул', detectedColumn: '', required: false },
    { field: 'brand', label: 'Бренд', detectedColumn: '', required: false },
    { field: 'name', label: 'Наименование', detectedColumn: '', required: true },
    { field: 'unit', label: 'Единица измерения', detectedColumn: '', required: false },
    { field: 'recommendedPrice', label: 'Рекомендуемая цена', detectedColumn: '', required: false },
    { field: 'dealerPrice', label: 'Цена дилера', detectedColumn: '', required: false },
    { field: 'specialPrice', label: 'Специальная цена', detectedColumn: '', required: false },
    { field: 'discount', label: 'Скидка (%)', detectedColumn: '', required: false },
    { field: 'promo', label: 'Акция', detectedColumn: '', required: false },
    { field: 'package', label: 'Упаковка', detectedColumn: '', required: false },
    { field: 'barcode', label: 'Штрих-код', detectedColumn: '', required: false },
    { field: 'photo', label: 'Фото', detectedColumn: '', required: false }
  ]);

  // Auto-detect mappings when component opens
  React.useEffect(() => {
    if (detectedColumns.length > 0) {
      const autoMappings = mappings.map(mapping => {
        const detected = autoDetectColumn(mapping.field, detectedColumns);
        return { ...mapping, detectedColumn: detected };
      });
      setMappings(autoMappings);
    }
  }, [detectedColumns]);

  const autoDetectColumn = (field: string, columns: string[]): string => {
    const patterns: Record<string, string[]> = {
      article: ['артикул', 'код', 'id', 'sku', 'арт'],
      brand: ['бренд', 'производитель', 'марка', 'торговая марка'],
      name: ['наименование', 'название', 'товар', 'описание'],
      unit: ['ед.', 'единица', 'упаковка', 'шт', 'уп'],
      recommendedPrice: ['цена', 'рекомендуемая', 'розничная', 'ррц', 'price'],
      dealerPrice: ['дилер', 'оптовая', 'базовая', 'себестоимость'],
      specialPrice: ['специальная', 'акционная', 'промо', 'sale'],
      discount: ['скидка', 'процент', 'дисконт', '%'],
      promo: ['акция', 'промо', 'новинка', 'спецпредложение'],
      package: ['упаковка', 'кратность', 'коробка', 'количество'],
      barcode: ['штрих', 'код', 'ean', 'шк'],
      photo: ['фото', 'изображение', 'картинка', 'image']
    };

    const fieldPatterns = patterns[field] || [];
    
    for (const column of columns) {
      const columnLower = column.toLowerCase();
      for (const pattern of fieldPatterns) {
        if (columnLower.includes(pattern) || pattern.includes(columnLower)) {
          return column;
        }
      }
    }
    
    return '';
  };

  const updateMapping = (index: number, column: string) => {
    const newMappings = [...mappings];
    newMappings[index].detectedColumn = column;
    setMappings(newMappings);
  };

  const handleConfirm = () => {
    const mapping: Record<string, string> = {};
    mappings.forEach(m => {
      if (m.detectedColumn) {
        mapping[m.field] = m.detectedColumn;
      }
    });
    onConfirm(mapping);
    onClose();
  };

  const requiredFieldsMapped = mappings
    .filter(m => m.required)
    .every(m => m.detectedColumn);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Settings" className="w-5 h-5" />
            Настройка соответствия колонок
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Настройте соответствие между колонками вашего файла и полями каталога.
            Система автоматически определила наиболее подходящие варианты.
          </div>

          <div className="grid gap-4">
            {mappings.map((mapping, index) => (
              <Card key={mapping.field} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-sm">
                        {mapping.label}
                        {mapping.required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                      {mapping.required && (
                        <div className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded">
                          Обязательное
                        </div>
                      )}
                    </div>
                    
                    <div className="w-64">
                      <Select
                        value={mapping.detectedColumn}
                        onValueChange={(value) => updateMapping(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите колонку" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Не сопоставлять</SelectItem>
                          {detectedColumns.map(column => (
                            <SelectItem key={column} value={column}>
                              {column}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              {requiredFieldsMapped ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Icon name="CheckCircle" className="w-4 h-4" />
                  Все обязательные поля настроены
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <Icon name="AlertCircle" className="w-4 h-4" />
                  Заполните обязательные поля
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={!requiredFieldsMapped}
              >
                Применить соответствие
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnMappingDialog;