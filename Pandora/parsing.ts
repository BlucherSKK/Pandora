import * as fs from 'fs';
import * as ini from 'ini';

export function bruh_get_config_value(fileContent: string, head: string, key: string): string[] {

    // Парсим содержимое файла в объект
    const config = ini.parse(fileContent);

    // Извлекаем ids и преобразуем строку в массив
    const idsString = config[head]?.[key];
    if (idsString) {
        return idsString.split(',').map(id => id.trim()); // Преобразуем строку в массив
    }

    console.error("Ошибка парсинга конфиг файла")
    return [];
}
