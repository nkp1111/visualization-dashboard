const { MongoClient } = require("mongodb");


const mongodbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/visual-dashboard";
const client = new MongoClient(mongodbUrl);


exports.connectMongo = async () => {
  try {
    const connectedClient = await client.connect(mongodbUrl);
    console.log("MongoDB connected...");
    return connectedClient;
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
    throw new Error("Error connecting to Mongo DB...")
  }
}