// *********************
// Role of the component: Product item component 
// Name of the component: ProductItem.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <ProductItem product={product} color={color} />
// Input parameters: { product: Product; color: string; }
// Output: Product item component that contains product image, title, link to the single product page, price, button...
// *********************

import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiStar } from "react-icons/fi";

import { sanitize } from "@/lib/sanitize";

const ProductItem = ({
  product,
  color: _color,
}: {
  product: Product;
  color: string;
}) => {
  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-brand-sage hover:shadow-xl">
      <Link href={`/product/${product.slug}`} className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-brand-cream p-6">
        <span className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${product.inStock ? "bg-white/90 text-brand-pine" : "bg-brand-ink/90 text-white"}`}>
          {product.inStock ? "In stock" : "Sold out"}
        </span>
        <Image
          src={
            product.mainImage
              ? `/${product.mainImage}`
              : "/product_placeholder.jpg"
          }
          width={360}
          height={280}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
          alt={sanitize(product?.title) || "Product image"}
        />
      </Link>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          <span>{sanitize(product.manufacturer) || "My First Shop"}</span>
          <span className="flex items-center gap-1"><FiStar className="fill-current text-[#A57F3D]" /> {product.rating || 5}</span>
        </div>
        <Link href={`/product/${product.slug}`} className="mt-3 line-clamp-2 text-lg font-semibold leading-6 text-brand-ink transition group-hover:text-brand-pine">
          {sanitize(product.title)}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <p className="text-lg font-semibold text-brand-ink">CHF {product.price}</p>
          <Link href={`/product/${product.slug}`} aria-label={`View ${sanitize(product.title)}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-ink text-white transition group-hover:bg-brand-pine">
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductItem;
