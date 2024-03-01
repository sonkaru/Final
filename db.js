import mongoose from "mongoose";
import "dotenv/config";

async function mongoose_tryToConnect(resolve) {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.MONGO_DBNAME,
    });
    resolve(true);
  } catch (error) {
    console.error(error);
    console.log("Failed to connect to Mongo DB. Retrying in 2000 ms...");
    setTimeout(() => {
      mongoose_tryToConnect(resolve);
    }, 2000);
  }
}

function initDatabase() {
  return new Promise((resolve) => {
    mongoose_tryToConnect(resolve);
  });
}

export { initDatabase };
