const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: "Other" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    isVeg: { type: Boolean, default: false },
    state: { type: String, default: "" },
    restaurant: { type: String, default: "" },
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
