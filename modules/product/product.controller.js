const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/error.classes/BadRequestError");
const NotFoundError = require("../error/error.classes/NotFoundError");
const Product = require("./product.model");
const ProductService = require("./product.service");
const CommonService = require("../common/common.service");
const ForbiddenError = require("../error/error.classes/ForbiddenError");
const constants = require("../../constants");
const { default: mongoose } = require("mongoose");

const createProduct = async (req, res) => {
  const { strigifiedBody } = req.body;
  const { user } = req.auth;

  // validate seller
  if (user.role !== constants.USER.ROLES.SELLER)
    throw new ForbiddenError("You're not authorized to access this resource!");

  if (!req.file)
    // validate image
    throw new BadRequestError("Image is Required!");

  // parse strigifiedBody
  let parsedBody;
  if (strigifiedBody) {
    try {
      parsedBody = JSON.parse(strigifiedBody);
    } catch (err) {
      throw new BadRequestError("Invalid JSON body!");
    }
  }

  // save product
  const product = new Product({
    seller: {
      user: user?._id,
      name: user?.name,
    },
    name: parsedBody?.name,
    description: parsedBody?.description,
    price: parsedBody?.price,
    unit: parsedBody?.unit,
    unitAmount: parsedBody?.unitAmount,
  });
  const dbProduct = await ProductService.save(product);

  // upload & set image
  const path = `products/${product._id}`;
  let mimeType;
  mimeType = req.file.mimetype;
  // validate file type
  if (mimeType.split("/")[0] !== "image")
    throw new BadRequestError("Only Image Files are Permitted!");

  // upload image to firebase
  await CommonService.uploadToFirebase(req.file, path);

  // update image
  dbProduct.image = {
    mimeType: mimeType,
    firebaseStorageRef: path,
  };
  const dbUpdatedProduct = await ProductService.save(dbProduct);

  return res.status(StatusCodes.CREATED).json(dbUpdatedProduct);
};

const findById = async (req, res) => {
  const { productId } = req.params;
  const dbProduct = await ProductService.findActiveProductById(productId);
  return res.status(StatusCodes.OK).json(dbProduct);
};

const getProductsPaginated = async (req, res) => {
  const pageable = req.pageable;
  const { keyword } = req.query;
  const dbProducts = await ProductService.findPaginatedActiveProducts(
    keyword,
    pageable
  );
  return res.status(StatusCodes.OK).json(dbProducts);
};

const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, unit, unitAmount } = req.body;
  const auth = req.auth;

  // validate product
  const dbProduct = await ProductService.findById(productId);
  if (!dbProduct) throw new NotFoundError("Product not found!");
  if (dbProduct.seller.user.toString() !== auth.user._id.toString())
    throw new ForbiddenError("You're not authorized to access this resource!");

  if (name) dbProduct.name = name;
  if (description) dbProduct.description = description;
  if (price) dbProduct.price = price;
  if (unit) dbProduct.unit = unit;
  if (unitAmount) dbProduct.unitAmount = unitAmount;

  const dbUpdatedProduct = await ProductService.save(dbProduct);

  return res.status(StatusCodes.OK).json(dbUpdatedProduct);
};

const disableProduct = async (req, res) => {
  const { productId } = req.params;
  const auth = req.auth;

  // validate product
  const dbProduct = await ProductService.findById(productId);
  if (!dbProduct) throw new NotFoundError("Product not found!");
  if (dbProduct.seller.user.toString() !== auth.user._id.toString())
    throw new ForbiddenError("You're not authorized to access this resource!");

  dbProduct.isDisabled = true;
  const dbUpdatedProduct = await ProductService.save(dbProduct);

  return res.status(StatusCodes.OK).json(dbUpdatedProduct);
};

const getSelfProductsPaginated = async (req, res) => {
  const pageable = req.pageable;
  const { keyword } = req.query;
  const auth = req.auth;

  // validate seller
  if (auth.user.role !== constants.USER.ROLES.SELLER)
    throw new ForbiddenError("You're not authorized to access this resource!");

  const dbProducts = await ProductService.findPaginatedActiveProductsBySellerId(
    keyword,
    new mongoose.Types.ObjectId(auth.user._id),
    pageable
  );

  return res.status(StatusCodes.OK).json(dbProducts);
};

module.exports = {
  createProduct,
  findById,
  getProductsPaginated,
  updateProduct,
  disableProduct,
  getSelfProductsPaginated,
};
