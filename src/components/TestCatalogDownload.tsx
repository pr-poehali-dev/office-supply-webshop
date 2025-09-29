import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

const TestCatalogDownload = () => {
  const csvContent = `Артикул,Бренд,Наименование,Ед. (единицы измерения),Цена (Рекомендуемая),Цена дилер (по которой идет рассчет),Акция!!!,% скидки,Специальная цена!!!,Упаковка (сколько единиц товара в большой коробке/средней коробки/малой коробки),Штрих-код,Фото
RU-001,Hatber,Ручка шариковая синяя Megapolis,шт,120,85,,,,,4606782024689,/images/pen-blue.jpg
NB-005,Brauberg,Блокнот А5 80 листов клетка,шт,280,195,15%,,,,4606788000567,/images/notebook-a5.jpg
ST-012,Office Space,Степлер металлический №24/6,шт,450,320,,,290,20 шт,4606793245891,/images/stapler.jpg
PEN-003,Erich Krause,Карандаш чернографитный НВ,шт,35,25,Новинка!!!,,,,4606788567234,/images/pencil-hb.jpg
FOLD-008,Sponsor,Папка-регистратор А4 75мм,шт,220,160,,,149,10 шт,4606782156789,/images/folder-a4.jpg
MARK-002,Attache,Маркер выделитель желтый,шт,95,70,25,,,,4606789234567,/images/marker-yellow.jpg
CLIP-001,Brauberg,Скрепки металлические 28мм,уп,65,45,,,39,50 уп,4606788345678,/images/clips.jpg
TAPE-005,Scotch,Скотч прозрачный 19мм х 33м,шт,180,125,10%,,,,4606782987654,/images/tape.jpg`;

  const downloadCSV = () => {
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test-catalog.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Icon name="FileDown" size={48} className="mx-auto text-blue-600" />
          <h1 className="text-2xl font-bold">Тестовый CSV файл каталога</h1>
          <p className="text-gray-600">
            Скачайте тестовый файл с 8 товарами канцелярии для проверки загрузки каталога
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>📝 8 товаров со всеми колонками</p>
            <p>💰 Включены скидки и специальные цены</p>
            <p>📦 Указана упаковка и штрих-коды</p>
          </div>
          <Button onClick={downloadCSV} className="mt-4">
            <Icon name="Download" className="w-4 h-4 mr-2" />
            Скачать test-catalog.csv
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TestCatalogDownload;