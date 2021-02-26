const { default: axios } = require("axios");
const express = require("express");

const weatherRouter = express.Router();

const { authorize } = require("../auth/middleware");

weatherRouter.get("/getWeek", authorize, async (req, res, next) => {
  try {
    const weather = await axios.get(
      process.env.WEATHER_URL_ONECALL + `?lat=${req.query.lat}&lon=${req.query.lon}&exclude=current,minutely,alerts,hourly&appid=${process.env.WEATHER_API_KEY}&units="metric"`
    );
    if (weather.data) {
      res.send(weather.data.daily);
    } else {
      const error = new Error();
      error.httpStatusCode = 401;
      res.send(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
weatherRouter.get("/getHourly", authorize, async (req, res, next) => {
  try {
    const weather = await axios.get(
      process.env.WEATHER_URL_ONECALL + `?lat=${req.query.lat}&lon=${req.query.lon}&exclude=current,daily,minutely,alerts&appid=${process.env.WEATHER_API_KEY}&units="metric"`
    );
    if (weather.data) {
      res.send(weather.data.hourly);
    } else {
      const error = new Error();
      error.httpStatusCode = 401;
      res.send(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
weatherRouter.get("/city/:location", authorize, async (req, res, next) => {
  try {
    const weather = await axios.get(process.env.WEATHER_URL_CURRENT + `?q=${req.params.location}&appid=${process.env.WEATHER_API_KEY}&units="metric"`);
    const image = await axios.get(process.env.LOCATION_IMAGE_URL + req.params.location);
    if (weather.data) {
      res.send({
        weather: weather.data,
        image: image.data.results[0].urls.full || "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?cs=srgb&dl=pexels-quang-nguyen-vinh-2166711.jpg&fm=jpg",
      });
    } else {
      const error = new Error();
      error.httpStatusCode = 401;
      res.send(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
weatherRouter.get("/coordinates", authorize, async (req, res, next) => {
  try {
    const response = await axios.get(process.env.REVERSE_LOCATION_URL + `lat=${req.query.lat}&lon=${req.query.lon}`);
    console.log("RESPONSE:" + response.data.address);
    const location = response.data.address.city;
    console.log("LOCATION:" + location);
    if (typeof location === "string") {
      const weather = await axios.get(process.env.WEATHER_URL_CURRENT + `?q=${location}&appid=${process.env.WEATHER_API_KEY}&units="metric"`);
      const image = await axios.get(process.env.LOCATION_IMAGE_URL + location);
      if (weather.data) {
        res.send({
          weather: weather.data,
          image: image.data.results[0].urls.full || "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?cs=srgb&dl=pexels-quang-nguyen-vinh-2166711.jpg&fm=jpg",
        });
      }
    } else {
      res.status(404).send("Location Not Found");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
module.exports = weatherRouter;
