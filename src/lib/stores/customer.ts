import { writable } from 'svelte/store';
export type Customer = { id: string; full_name: string };
export const currentCustomer = writable<Customer | null>(null);
