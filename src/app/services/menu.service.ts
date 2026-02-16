import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MenuItem } from '../models/menu-item.model';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private http = inject(HttpClient);

    // Google Sheet Public CSV URL (Published to Web)
    // The user provided the /pubhtml link, we convert it to /pub?output=csv
    private apiUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQpxxVtGgZfl0b4YtCb5d7jodVOidUNupkBPopjB3xamxD7B-mC5ZlHBOlQ5kYWAwn_yCybBWAD1BQ5/pub?output=csv';

    getMenu(): Observable<MenuItem[]> {
        const urlWithCacheBuster = `${this.apiUrl}&t=${new Date().getTime()}`;
        console.log('MenuService: Fetching from', urlWithCacheBuster);
        return this.http.get(urlWithCacheBuster, { responseType: 'text' }).pipe(
            map(csvData => {
                console.log('MenuService: Received CSV data length:', csvData.length);
                const parsed = this.parseCsv(csvData);
                console.log('MenuService: Parsed items:', parsed);
                return parsed;
            })
        );
    }

    private parseCsv(csvText: string): MenuItem[] {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const items: MenuItem[] = [];

        // Simple parser (assuming no commas in values for now, or use a proper lib if needed)
        // For a robust solution we'd use 'papaparse', but for this demo a regex split is better
        // to handle quoted strings if Google exports them that way.

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Matches CSV values, handling quotes
            const pattern = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
            // actually simple split for now to verify connectivity first
            // Google Sheets CSV exports are standard.
            // Let's use a simpler split but be mindful of commas in descriptions.
            // A robust manual parser:

            const row = this.csvToArray(line);
            if (row.length < 5) continue; // Skip incomplete

            // Map based on expected column order or headers
            // Expected: id, name, description, price, category, imageUrl
            // If headers match loose names:

            const item: any = {};
            // Default mapping by index if headers are standard
            // 0: id, 1: name, 2: description, 3: price, 4: category, 5: imageUrl

            item.id = row[0] || i.toString();
            item.name = row[1];
            item.description = row[2];
            item.price = Number(row[3].replace(/[^0-9.-]+/g, "")); // Clean currency symbols
            item.category = row[4];
            item.imageUrl = row[5];

            // Column 6: Disponible (Optional)
            // Default to true if missing. Check for "NO", "FALSE" (case insensitive)
            const availableStr = (row[6] || '').trim().toUpperCase();
            const isAvailable = !['NO', 'FALSE', '0', 'OFF'].includes(availableStr);

            // ...
            if (item.name && item.price && isAvailable) {
                // Smart Parsing
                item.ingredients = this.detectIngredients(item.description);

                // Column 7: Extras Custom (Nombre:Precio, Nombre:Precio)
                const extrasStr = (row[7] || '').trim();
                if (extrasStr) {
                    item.extras = this.parseExtras(extrasStr);
                } else {
                    item.extras = this.getSmartExtras(item.category);
                }

                items.push(item);
            }
        }

        return items;
    }

    private parseExtras(extrasStr: string): any[] {
        // Format: "Extra Cheddar:1500, Bacon:2000"
        return extrasStr.split(',').map(e => {
            const parts = e.trim().split(':');
            return {
                name: parts[0].trim(),
                price: Number(parts[1]) || 0
            };
        }).filter(e => e.name && e.price > 0);
    }

    private detectIngredients(description: string): string[] {
        const ingredients: string[] = [];
        const keywords = [
            { term: 'queso', label: 'Queso' },
            { term: 'cheddar', label: 'Cheddar' },
            { term: 'tomate', label: 'Tomate' },
            { term: 'lechuga', label: 'Lechuga' },
            { term: 'cebolla', label: 'Cebolla' },
            { term: 'bacon', label: 'Bacon' },
            { term: 'panceta', label: 'Panceta' },
            { term: 'huevo', label: 'Huevo' },
            { term: 'salsa', label: 'Salsa' },
            { term: 'pepinillo', label: 'Pepinillo' },
            { term: 'jamon', label: 'Jamón' },
            { term: 'rucula', label: 'Rúcula' }
        ];

        const lowerDesc = description.toLowerCase();
        keywords.forEach(k => {
            if (lowerDesc.includes(k.term)) {
                ingredients.push(k.label);
            }
        });

        return ingredients;
    }

    private getSmartExtras(category: string): any[] {
        const cat = category.toLowerCase();
        if (cat.includes('hamburguesa')) {
            return [
                { name: 'Extra Cheddar', price: 1500 },
                { name: 'Bacon', price: 2000 },
                { name: 'Huevo', price: 1200 },
                { name: 'Medallon Carne', price: 4000 }
            ];
        } else if (cat.includes('pizza')) {
            return [
                { name: 'Extra Queso', price: 2000 },
                { name: 'Pepperoni', price: 2500 },
                { name: 'Aceitunas', price: 1000 }
            ];
        } else {
            // Default Extras
            return [];
        }
    }

    // Helper to parse a CSV line handling quotes
    private csvToArray(text: string): string[] {
        const re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;

        // Simple implementation for "comma separated, quotes allowed"
        const result: string[] = [];
        let startValue = 0;
        let insideQuote = false;

        for (let i = 0; i < text.length; i++) {
            if (text[i] === '"') {
                insideQuote = !insideQuote;
            } else if (text[i] === ',' && !insideQuote) {
                let val = text.substring(startValue, i).trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
                result.push(val);
                startValue = i + 1;
            }
        }
        // Push last value
        let val = text.substring(startValue).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
        result.push(val);

        return result;
    }
}
