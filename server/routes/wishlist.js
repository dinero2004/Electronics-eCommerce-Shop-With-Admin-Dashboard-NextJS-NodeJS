const express = require("express");

const router = express.Router();

const {
  getAllWishlistByUserId,
  getAllWishlist,
  createWishItem,
  deleteWishItem,
  getSingleProductFromWishlist
} = require("../controllers/wishlist");
const { requireUser, requireAdmin, requireSelfParam, requireSelfBody } = require("../middleware/auth");

router.get("/", requireAdmin, getAllWishlist);
router.post("/", requireUser, requireSelfBody("userId"), createWishItem);

router.get("/:userId", requireUser, requireSelfParam("userId"), getAllWishlistByUserId);
router.get("/:userId/:productId", requireUser, requireSelfParam("userId"), getSingleProductFromWishlist);
router.delete("/:userId/:productId", requireUser, requireSelfParam("userId"), deleteWishItem);

module.exports = router;
