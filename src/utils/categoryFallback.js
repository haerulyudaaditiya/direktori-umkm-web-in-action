import {
  Utensils,
  Coffee,
  Settings,
  ShoppingBag,
  Wheat,
  Store,
} from 'lucide-react';

export const getCategoryFallback = (kategori) => {
  const kategoriMap = {
    // FOOD - Tetap utensils
    kuliner: { icon: Utensils },
    'makanan berat': { icon: Utensils },
    cemilan: { icon: Utensils },

    // DRINKS - Tetap coffee
    minuman: { icon: Coffee },
    kopi: { icon: Coffee },

    // SERVICES - Tetap settings
    jasa: { icon: Settings },
    laundry: { icon: Settings },
    print: { icon: Settings },
    bengkel: { icon: Settings },

    // RETAIL - Tetap shopping bag
    retail: { icon: ShoppingBag },
    toko: { icon: ShoppingBag },

    // AGRICULTURE - Tetap wheat
    pertanian: { icon: Wheat },
  };

  const config = kategoriMap[kategori.toLowerCase()] || {
    icon: Store,
  };

  return config;
};
