declare module 'zustand' {
  export type StateCreator<T> = (set: (partial: Partial<T>) => void, get: () => T) => T;
  export function create<T>(fn: any): any;
}

declare module 'zustand/middleware' {
  export function persist(config: any, options?: any): any;
}
