import mongoose from "mongoose";

const { Schema } = mongoose;

const ItemSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  images: {
    type: Array,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ItemModel = mongoose.model("item", ItemSchema);

export { ItemModel, ItemSchema };
