import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema({
  login: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  profile: {
    type: Object,
    default: () => ({}),
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel = mongoose.model("user", UserSchema);

export { UserModel, UserSchema };
