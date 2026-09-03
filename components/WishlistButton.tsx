"use client";

import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import { useSession } from "next-auth/react";
import { FaHeart } from "react-icons/fa6";
import toast from "react-hot-toast";

const WishlistButton = ({ product }: { product: Product }) => {
  const { data: session } = useSession();
  const { wishlist, addToWishlist } = useWishlistStore();
  const isSaved = wishlist.some((item) => item.id === product.id);

  const saveProduct = async () => {
    if (!session?.user?.id) {
      toast.error("Sign in to save products to your wishlist");
      return;
    }

    if (isSaved) {
      toast("This product is already in your wishlist");
      return;
    }

    const response = await apiClient.post("/api/wishlist", {
      userId: session.user.id,
      productId: product.id,
    });

    if (!response.ok) {
      toast.error("We could not update your wishlist");
      return;
    }

    addToWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.mainImage,
      slug: product.slug,
      stockAvailabillity: product.inStock,
    });
    toast.success("Added to your wishlist");
  };

  return (
    <button
      type="button"
      onClick={saveProduct}
      className="flex items-center justify-center gap-2 border border-blue-600 px-6 py-3 font-bold text-blue-600 hover:bg-blue-50"
    >
      <FaHeart />
      {isSaved ? "SAVED" : "ADD TO WISHLIST"}
    </button>
  );
};

export default WishlistButton;

