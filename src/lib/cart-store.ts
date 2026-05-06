"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `cart_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export type CartItem = {
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  image?: string;
  size?: string;
  color?: string;
  unitPrice: number;
  quantity: number;
};

type CartState = {
  cartId: string;
  items: CartItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  updateQty: (id: string, variantId: string | undefined, qty: number) => void;
  removeItem: (id: string, variantId: string | undefined) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
};

const sameLine = (a: CartItem, productId: string, variantId?: string) =>
  a.productId === productId && (a.variantId ?? null) === (variantId ?? null);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: newId(),
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      addItem: (item) => {
        const items = get().items.slice();
        const idx = items.findIndex((i) => sameLine(i, item.productId, item.variantId));
        if (idx >= 0) {
          items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity };
        } else {
          items.push(item);
        }
        set({ items, open: true });
      },
      updateQty: (productId, variantId, qty) => {
        const items = get()
          .items.map((i) => (sameLine(i, productId, variantId) ? { ...i, quantity: Math.max(1, qty) } : i));
        set({ items });
      },
      removeItem: (productId, variantId) => {
        set({ items: get().items.filter((i) => !sameLine(i, productId, variantId)) });
      },
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: "valerio-cart",
      storage: createJSONStorage(() => (globalThis.window === undefined ? ({} as any) : globalThis.window.localStorage)),
      partialize: (s) => ({ items: s.items, cartId: s.cartId }),
    },
  ),
);
