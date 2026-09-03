import { SectionTitle } from "@/components";
import { WishlistModule } from "@/components/modules/wishlist";

export default function WishlistPage() {
  return (
    <main className="min-h-[50vh] bg-white pb-16">
      <SectionTitle title="Wishlist" path="Home | Wishlist" />
      <WishlistModule />
    </main>
  );
}

