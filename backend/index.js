const express = require("express");
require("dotenv").config();
const cors = require("cors");
const {
	StatusCodes,
} = require("http-status-codes");

const app = express();


const port = process.env.PORT || 3000;
const clientUrls = process.env.CLIENT_URLS.includes(",")
	? process.env.CLIENT_URLS.split(",")
	: [process.env.CLIENT_URLS];


app.use(cors({
	origin: clientUrls,
	credentials: true,
	allowedHeaders: "Authorization, Content-Type",
}))

app.get("/", (req, res, next) => {
	res.status(StatusCodes.OK)
		.json({
			message: "Welcome to Visualization Dashboard",
		});
});


app.use("*", (req, res, next) => {
	res.status(StatusCodes.NOT_FOUND)
		.json({
			error: "Page not found",
		})
})

const startServer = async () => {
	try {
		app.listen(port, () => {
			console.log("Server listening...");
		})
	} catch (error) {
		console.log("Server encountered error: ", error);
		process.exit();
	}
}


startServer();