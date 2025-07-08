import * as fs from 'fs';
import * as ini from 'ini';
import { BruhFn } from './Pandora';


export namespace files_io{
    export function ini_get_config_value(fileContent: string, head: string, key: string): string[] {

        // Парсим содержимое файла в объект
        const config = ini.parse(fileContent);

        // Извлекаем ids и преобразуем строку в массив
        const idsString = config[head]?.[key];
        if (idsString) {
            return idsString.split(',').map((id: string) => id.trim()); // Преобразуем строку в массив
        }

        console.error("Ошибка парсинга конфиг файла")
        return [];
    }

    export function random_anime_und_move(filePath: string, lineNumber: number): String | null | Error{
        try {
        // Читаем содержимое файла
        const data = fs.readFileSync(filePath, 'utf-8');
        const lines = data.split('\n'); // Разделяем содержимое на строки

        console.log(lines.length);
        console.log(lineNumber)
        // Проверяем, существует ли строка с указанным номером
        if (lineNumber > (lines.length - 1)) {
            return new Error('Неверный номер строки.');
        }

        // Получаем строку (уменьшаем на 1, так как массив начинается с 0)
        const lineToReturn = lines[lineNumber];

        // Удаляем строку из массива
        lines.splice(lineNumber, 1);

        // Записываем обновлённые строки обратно в файл
        fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');

        return lineToReturn; // Возвращаем удалённую строку
        } catch (error) {
            BruhFn.low.logHandle(`Ошибка: ${error as string}`);
            return null; // Возвращаем null в случае ошибки
        }
    }

    export function add_anime_to_file(filePath: string, data: string): void {
        fs.appendFile(filePath, data + '\n', (err) => {
            if (err) {
                console.error('Ошибка при добавлении строки в файл:', err);
            } else {
                console.log('Строка успешно добавлена в файл.');
            }
        });
    }
}