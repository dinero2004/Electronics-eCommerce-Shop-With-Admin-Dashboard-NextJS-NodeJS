const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

const getAllWishlist = asyncHandler(async (_request, response) => {
  const items = await prisma.wishlist.findMany({ include: { product: true } });
  response.json(items);
});

const getAllWishlistByUserId = asyncHandler(async (request, response) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: request.params.userId },
    include: { product: true },
    orderBy: { id: "desc" },
  });
  response.json(items);
});

const getSingleProductFromWishlist = asyncHandler(async (request, response) => {
  const item = await prisma.wishlist.findFirst({
    where: {
      userId: request.params.userId,
      productId: request.params.productId,
    },
    include: { product: true },
  });

  if (!item) {
    throw new AppError("Wishlist item not found", 404);
  }

  response.json(item);
});

const createWishItem = asyncHandler(async (request, response) => {
  const { userId, productId } = request.body;

  if (!userId || !productId) {
    throw new AppError("User ID and product ID are required", 400);
  }

  const existingItem = await prisma.wishlist.findFirst({
    where: { userId, productId },
    include: { product: true },
  });

  if (existingItem) {
    return response.status(200).json(existingItem);
  }

  const item = await prisma.wishlist.create({
    data: { userId, productId },
    include: { product: true },
  });

  response.status(201).json(item);
});

const deleteWishItem = asyncHandler(async (request, response) => {
  const item = await prisma.wishlist.findFirst({
    where: {
      userId: request.params.userId,
      productId: request.params.productId,
    },
  });

  if (!item) {
    throw new AppError("Wishlist item not found", 404);
  }

  await prisma.wishlist.delete({ where: { id: item.id } });
  response.status(204).send();
});

module.exports = {
  getAllWishlistByUserId,
  getAllWishlist,
  createWishItem,
  deleteWishItem,
  getSingleProductFromWishlist,
};

