import { hash as bCryptHash, compare as bCryptCompare } from "bcrypt";
import { UserModel } from "../models/User.model.js";
import { number, object, string } from "yup";
import TokenFactory from "./TokenFactory.js";
import MailFactory from "./MailFactory.js";

class AuthFactory {
  /**
   * @param {string} password
   * @returns {Promise<string>}
   */
  static async hash(password) {
    return bCryptHash(password, 10);
  }

  /**
   *
   * @param {string} plainTextPassword
   * @param {string} hashedPassword
   * @returns {Promise<boolean>}
   */
  static async verifyPassword(plainTextPassword, hashedPassword) {
    return bCryptCompare(plainTextPassword, hashedPassword);
  }

  static async createAccount(io) {
    const schema = object({
      login: string().required().min(2).max(64),
      password: string().required().min(3).max(64),
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

    const exists = await UserModel.exists({
      login: io.login,
    });
    if (exists) {
      return {
        status: false,
        code: "ALREADY_EXISTS",
        data: null,
      };
    }
    const newAcc = new UserModel({
      login: io.login,
      password: await this.hash(io.password),
      role: "regular",
      profile: {
        fullname: "",
      },
    });

    const createdAccount = await newAcc.save();

    MailFactory.send('sunkar@gmail.com', 'You have successfully signed up in Songharu Assignment!', `
    <h1>Welcome to Songharu Assignment!</h1>
    <span>You are ready to work with our website!</span>
    `)
    return {
      status: true,
      data: {
        account: this.parseAccount(createdAccount.toObject()),
      },
    };
  }

  static async authAccount(io) {
    const schema = object({
      login: string().required().min(2).max(64),
      password: string().required().min(3).max(64),
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

    const account = await UserModel.findOne({ login: io.login });
    if (account == null) {
      return {
        status: false,
        code: "DOES_NOT_EXIST",
        data: null,
      };
    }
    if (!(await this.verifyPassword(io.password, account.password))) {
      return {
        status: false,
        code: "WRONG_CREDENTIALS",
        data: null,
      };
    }

    const accessToken = await TokenFactory.generateToken({
      _id: account._id,
    });

    return {
      status: true,
      data: {
        account: this.parseAccount(account.toObject()),
        accessToken,
      },
    };
  }

  static async authByToken(token) {
    try {
      const data = await TokenFactory.validateToken(token);
      const userId = data.payload._id;
      const account = await UserModel.findOne({ _id: userId });
      if (account == null) {
        return {
          status: false,
          code: "DOES_NOT_EXIST",
          data: null,
        };
      }
      return {
        status: true,
        data: {
          account: this.parseAccount(account.toObject()),
        },
      };
    } catch (e) {
      return {
        status: false,
        code: "WRONG_CREDENTIALS",
        data: null,
      };
    }
  }

  static parseAccount(doc) {
    return {
      ...doc,
      password: undefined,
    };
  }

  static async getUser(id) {
    const item = await UserModel.findById(id).exec();
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
  static async getUsersPage(io) {
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
      $match.$or = [{ login: { $regex: io.filter.search, $options: "i" } }];
    }
    const count = await UserModel.countDocuments({}, { hint: "_id_" });
    const response = await UserModel.aggregate([
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

  static async updateUser(io) {
    const schema = object({
      _id: string().required(),
      login: string().required().min(2).max(64),
      role: string().required(),
      profile: object().required(),
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

    const user = await UserModel.findById(io._id);
    if (!user) {
      return {
        status: false,
        code: "DOES_NOT_EXIST",
        data: null,
      };
    }

    user.login = io.login;
    user.role = io.role;
    user.profile = io.profile;
    user.markModified("profile");
    await user.save();
    return { status: true, data: null };
  }
}

export default AuthFactory;
