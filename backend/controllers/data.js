const { StatusCodes } = require("http-status-codes");

const { connectMongo } = require("../config/connect-mongo");
const { DB_NAME, DATA_COLLECTION_NAME } = require("../constant/db")

exports.getData = async (req, res, next) => {
  try {
    const client = await connectMongo();
    if (!client) throw new Error("Couldn't connect to Mongo");

    const db = client.db(DB_NAME);
    if (!db) throw new Error("Database not found");

    const collection = db.collection(DATA_COLLECTION_NAME);
    if (!collection) throw new Error("Collection not found");

    const data = await collection.find({}).toArray();
    if (!data) throw new Error("Error fetching data from collection");
    return res.status(StatusCodes.OK).json({ data });
  } catch (error) {
    next(error);
  }
}