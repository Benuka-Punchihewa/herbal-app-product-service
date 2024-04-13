const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
  {
    seller: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    name: {
      type: String,
      required: [true, "Product name is required!"],
    },
    description: {
      type: String,
      required: [true, "Product description is required!"],
      maxLength: [250, "Product description cannot exceed 250 characters!"],
    },
    image: {
      mimeType: {
        type: String,
      },
      firebaseStorageRef: {
        type: String,
      },
    },
    price: {
      type: Number,
      required: [true, "Price is required!"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required!"],
      default: 5,
    },
    unit: {
      type: String,
      required: [true, "Unit is required!"],
    },
    unitAmount: {
      type: Number,
      required: [true, "Unit amount is required!"],
    },
    isDisabled: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
