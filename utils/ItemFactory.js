import { array, number, object, string } from "yup";
import { ItemModel } from "../models/Item.model.js";
import { Types } from "mongoose";

class ItemFactory {
  static async createOrUpdate(io) {
    const schema = object({
      _id: string().nullable(),
      title: string().required().min(2).max(300),
      description: string().max(1000),
      images: array().of(string()),
    }).required();

    try {
      await schema.validate(io, { strict: true });
    } catch (e) {
      return {
        status: false,
        code: "BAD_REQUEST",
        message: e.toString(),
        data: null,
      };
    }
    const _id = io._id ?? new Types.ObjectId();
    await ItemModel.updateOne(
      {
        _id,
      },
      {
        title: io.title,
        description: io.description,
        images: io.images,
      },
      {
        upsert: true,
      }
    ).exec();

    return {
      status: true,
      code: null,
      message: null,
      data: {
        _id,
      },
    };
  }

  static async get(id) {
    const item = await ItemModel.findById(id).exec();
    if (!item) {
      return {
        status: false,
        code: "404",
        message: "DOES_NOT_EXIST",
        data: null,
      };
    }
    return {
      status: true,
      data: item,
    };
  }

  static async deleteDoc(id) {
    const item = await ItemModel.findByIdAndDelete(id).exec();
    if (!item) {
      return {
        status: false,
        code: "404",
        message: "DOES_NOT_EXIST",
        data: null,
      };
    }
    return {
      status: true,
      data: null,
    };
  }
  static async getPage(io) {
    const schema = object({
      limit: number().max(100).defined().nonNullable(),
      skip: number().defined().nonNullable(),
      filter: object({
        search: string().notRequired(),
      }).defined(),
    });
    try {
      await schema.validate(io, { strict: true });
    } catch (e) {
      return {
        status: false,
        code: "BAD_REQUEST",
        message: e.toString(),
        data: null,
      };
    }
    const $match = {};
    if (io.filter.search) {
      $match.$or = [{ title: { $regex: io.filter.search, $options: "i" } }];
    }
    const count = await ItemModel.countDocuments({}, { hint: "_id_" });
    const response = await ItemModel.aggregate([
      {
        $match,
      },
      {
        $skip: io.skip,
      },
      {
        $limit: io.limit,
      },
    ]);
    return { status: true, data: { totalDocuments: count, response } };
  }
}

export default ItemFactory;
