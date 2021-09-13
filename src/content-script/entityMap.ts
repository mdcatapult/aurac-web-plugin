// provides a wrapper around Map<string, T>() to ensure key formatting
export class EntityMap<T> {
  private m = new Map<string, T>();

  set(entityText: string, value: T) {
    this.m.set(entityText.toLowerCase(), value);
  }

  has(text: string): boolean {
    return this.m.has(text.toLowerCase());
  }

  get(text: string): T | undefined {
    return this.m.get(text.toLowerCase());
  }

  values(): IterableIterator<T> {
    return this.m.values();
  }

  clear(): void {
    this.m.clear()
  }

  delete(entityText: string, document: Document): void {
    this.m.delete(entityText.toLowerCase());
    if (this.m.size === 0) {
      document.getElementById('aurac-narrative')!.style.display = 'block';
    }
  }
}
