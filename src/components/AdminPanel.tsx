import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminPanelProps {
  excelFile: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  texts: {
    uploadExcel: string;
    dragDrop: string;
  };
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  excelFile,
  onFileUpload,
  texts
}) => {
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
            accept=".xlsx,.xls"
            onChange={onFileUpload}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="cursor-pointer block">
            <Icon name="FileSpreadsheet" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">{texts.dragDrop}</p>
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
  );
};

export default AdminPanel;