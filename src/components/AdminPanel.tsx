import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface AdminPanelProps {
  excelFile: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProductsLoaded: (products: any[], categories: string[]) => void;
  texts: {
    uploadExcel: string;
    dragDrop: string;
  };
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  excelFile,
  onFileUpload,
  onProductsLoaded,
  texts
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{ success: boolean; message: string; } | null>(null);

  const processExcelFile = async () => {
    if (!excelFile) return;
    
    setIsProcessing(true);
    setProcessResult(null);
    
    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(excelFile);
      });
      
      // Send to backend
      const response = await fetch('https://functions.poehali.dev/f6fba462-eb1a-48ca-b42c-b598648fca0c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData,
          filename: excelFile.name
        })
      });
      
      // Check if response is JSON or HTML error
      const contentType = response.headers.get('Content-Type') || '';
      let result;
      
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Server returned HTML error page
        const errorText = await response.text();
        throw new Error('Сервер вернул ошибку. Проверьте формат файла и попробуйте снова.');
      }
      
      if (result.success) {
        setProcessResult({ 
          success: true, 
          message: result.message || `Загружено ${result.total_products} товаров` 
        });
        onProductsLoaded(result.products, result.categories);
      } else {
        setProcessResult({ 
          success: false, 
          message: result.error || 'Ошибка обработки файла' 
        });
      }
    } catch (error) {
      setProcessResult({ 
        success: false, 
        message: `Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon name="Upload" className="w-5 h-5 text-primary" />
          <span>{texts.uploadExcel}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-blue-50 transition-all duration-200 cursor-pointer"
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.tsv,.txt"
            onChange={onFileUpload}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer block">
            <Icon name="FileSpreadsheet" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">{texts.dragDrop}</p>
            <p className="text-sm text-gray-500">Поддерживаются форматы: .xlsx, .xls, .csv, .tsv</p>
            <p className="text-xs text-gray-400 mt-2">
              💡 Для Excel: сохраните как "Текст (разделители табуляции) .txt" или CSV
            </p>
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
            <Button 
              onClick={processExcelFile}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isProcessing ? (
                <>
                  <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Обработка файла...
                </>
              ) : (
                <>
                  <Icon name="Upload" className="w-4 h-4 mr-2" />
                  Обработать файл
                </>
              )}
            </Button>
          </div>
        )}
        
        {processResult && (
          <div className="mt-4">
            <Alert className={processResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <Icon 
                name={processResult.success ? 'CheckCircle' : 'AlertCircle'} 
                className={`w-4 h-4 ${processResult.success ? 'text-green-600' : 'text-red-600'}`} 
              />
              <AlertDescription className={processResult.success ? 'text-green-800' : 'text-red-800'}>
                {processResult.message}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPanel;