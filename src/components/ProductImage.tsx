import { useState } from "react";
import {
  Cable,
  Headphones,
  Laptop,
  Package,
  Smartphone,
  Tablet,
  Tv,
  Watch,
  type LucideIcon,
} from "lucide-react";
import type { Product } from "@/lib/types";

const CATEGORY_ICONS: Array<[RegExp, LucideIcon]> = [
  [/iphone/i, Smartphone],
  [/ipad/i, Tablet],
  [/mac|macbook|imac/i, Laptop],
  [/watch/i, Watch],
  [/airpods|audio|homepod/i, Headphones],
  [/tv|casa/i, Tv],
  [/accesorio|case|cable/i, Cable],
];

function iconFor(category: string): LucideIcon {
  return (
    CATEGORY_ICONS.find(([pattern]) => pattern.test(category))?.[1] ?? Package
  );
}

type Props = {
  product: Pick<Product, "name" | "category" | "imageUrl">;
  className?: string;
  padding?: string;
};

export function ProductImage({ product, className = "", padding = "p-6" }: Props) {
  const [failed, setFailed] = useState(false);
  const Icon = iconFor(product.category);

  if (!product.imageUrl || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200 dark:from-[#1d1d21] dark:via-[#18181b] dark:to-[#232327] ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <Icon size={44} strokeWidth={1.2} />
          <span className="max-w-[80%] truncate text-[11px] font-medium uppercase tracking-[0.14em]">
            {product.category}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-white via-white to-[#f2f2f5] dark:from-[#f7f7f9] dark:via-[#f2f2f5] dark:to-[#e9e9ee] ${className}`}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`h-full w-full object-contain mix-blend-multiply ${padding}`}
      />
    </div>
  );
}
