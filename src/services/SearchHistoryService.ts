export class SearchHistoryService {
    private static readonly STORAGE_KEY = 'streamify_search_history';
    private static readonly MAX_ITEMS = 20;

    static getHistory(): string[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    static addSearch(query: string) {
        if (!query.trim()) return;

        const history = this.getHistory();

        // Remove if already exists
        const filtered = history.filter(q => q.toLowerCase() !== query.toLowerCase());

        // Add to beginning
        filtered.unshift(query.trim());

        // Keep only last MAX_ITEMS
        const trimmed = filtered.slice(0, this.MAX_ITEMS);

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    }

    static removeSearch(query: string) {
        const history = this.getHistory();
        const filtered = history.filter(q => q !== query);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    }

    static clearHistory() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
}
