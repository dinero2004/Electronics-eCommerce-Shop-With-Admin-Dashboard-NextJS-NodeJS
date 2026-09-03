"use client";

import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const WishItem = ({
  id,
  title,
  image,
  slug,
  stockAvailabillity,
}: ProductInWishlist) => {
  const { data: session } = useSession();
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  const removeItem = async () => {
    if (!session?.user?.id) return;

    const response = await apiClient.delete(
      `/api/wishlist/${session.user.id}/${id}`
    );

    if (!response.ok) {
      toast.error("We could not remove this product");
      return;
    }

    removeFromWishlist(id);
    toast.success("Removed from your wishlist");
  };

  return (
    <tr>
      <td>
        <button type="button" onClick={removeItem} className="font-bold text-red-600" aria-label={`Remove ${title}`}>
          ×
        </button>
      </td>
      <td>
        <Image
          src={image ? `/${image}` : "/product_placeholder.jpg"}
          alt={title}
          width={72}
          height={72}
          className="mx-auto h-16 w-16 object-contain"
        />
      </td>
      <td>
        <Link href={`/product/${slug}`} className="font-semibold hover:text-blue-600">
          {title}
        </Link>
      </td>
      <td>{stockAvailabillity ? "In stock" : "Out of stock"}</td>
      <td>
        <Link href={`/product/${slug}`} className="inline-block bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          View product
        </Link>
      </td>
    </tr>
  );
};

export default WishItem;

