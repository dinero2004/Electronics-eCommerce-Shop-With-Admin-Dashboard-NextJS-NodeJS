"use client";

import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import WishItem from "@/components/WishItem";
import apiClient from "@/lib/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";

export const WishlistModule = () => {
  const { data: session, status } = useSession();
  const { wishlist, setWishlist } = useWishlistStore();

  useEffect(() => {
    if (!session?.user?.id) {
      setWishlist([]);
      return;
    }

    let cancelled = false;

    apiClient
      .get(`/api/wishlist/${session.user.id}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((items) => {
        if (cancelled || !Array.isArray(items)) return;

        setWishlist(
          items.map((item: WishListItem) => ({
            id: item.product.id,
            title: item.product.title,
            price: item.product.price,
            image: item.product.mainImage,
            slug: item.product.slug,
            stockAvailabillity: item.product.inStock,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setWishlist([]);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, setWishlist]);

  if (status === "loading") {
    return <p className="py-10 text-center text-xl">Loading your wishlist…</p>;
  }

  if (!session) {
    return (
      <div className="py-12 text-center">
        <p className="mb-5 text-2xl">Sign in to create and view your wishlist.</p>
        <Link href="/login" className="inline-block bg-brand-pine px-8 py-3 font-bold text-white hover:bg-brand-ink">
          Sign in
        </Link>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-5 text-2xl">Your wishlist is empty.</p>
        <Link href="/shop" className="inline-block bg-brand-pine px-8 py-3 font-bold text-white hover:bg-brand-ink">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl">
      <div className="overflow-x-auto">
        <table className="table text-center">
          <thead>
            <tr>
              <th></th>
              <th className="text-accent-content">Image</th>
              <th className="text-accent-content">Name</th>
              <th className="text-accent-content">Stock Status</th>
              <th className="text-accent-content">Action</th>
            </tr>
          </thead>
          <tbody>
            {wishlist.map((item) => (
              <WishItem {...item} key={item.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
