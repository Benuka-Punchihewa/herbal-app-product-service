const express = require("express");
const ProductController = require("./product.controller");
const AuthMiddleware = require("../auth/auth.middleware");
const constants = require("../../constants");
const CommonMiddleware = require("../common/common.middleware");

const router = express.Router();

// create product
router.post(
  "/",
  CommonMiddleware.uploader.single("file"),
  AuthMiddleware.authorize([constants.ACCESS.ROLES.SELLER]),
  ProductController.createProduct
);

// get product
router.get(
  "/:productId",
  AuthMiddleware.authorize([constants.ACCESS.ROLES.CUSTOMER]),
  ProductController.findById
);

// get paginated products
router.get(
  "/",
  CommonMiddleware.paginate,
  AuthMiddleware.authorize([
    constants.ACCESS.ROLES.CUSTOMER,
    constants.ACCESS.ROLES.ADMIN,
    constants.ACCESS.ROLES.SELLER,
  ]),
  ProductController.getProductsPaginated
);

// update product
router.patch(
  "/:productId",
  AuthMiddleware.authorize([constants.ACCESS.ROLES.SELLER]),
  ProductController.updateProduct
);

// disable product
router.delete(
  "/:productId",
  AuthMiddleware.authorize([constants.ACCESS.ROLES.SELLER]),
  ProductController.disableProduct
);

// get self products
router.get(
  "/self/all",
  CommonMiddleware.paginate,
  AuthMiddleware.authorize([constants.ACCESS.ROLES.SELLER]),
  ProductController.getSelfProductsPaginated
);

module.exports = router;
