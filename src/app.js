const express = require("express");
const app = express();
const flips = require("./data/flips-data");
const counts = require("./data/counts-data");
const res = require("express/lib/response");

app.use(express.json());

app.use(
  "/counts/:countId",
  (req, res, next) => {
    const { countId } = req.params;
    const foundCount = counts[countId];

    if(foundCount === undefined) {
      next({status: 404, message: `Count id not found: ${countId}`});
    } else {
      res.json({ data: foundCount });
    }
  }
);

app.use(
  "/counts",
  (req, res) => {
    res.json({ data: counts });
  }
);

app.use(
  "/flips/:flipId",
  (req, res, next) => {
    const { flipId } = req.params;
    const foundFlip = flips.find(flip => flip.id === Number(flipId));

    if(foundFlip){
      res.json({ data: foundFlip });
    } else {
      next({status: 404, message: `Flip id not found ${flipId}`});
    }
  }
);

app.get(
  "/flips",
  (req, res) => {
    res.json({ data: flips });
  }
);

//Ne middleware function to validate the request body
function bodyHasResultProperty(req, res, next){
  const { data: { result } = {} } = req.body;
  if(result){
    return next(); // Call next() without an error message if the result exists
  }
  next({
    status: 400,
    message: "A 'result' property is required."
  });
} 

//Variable to hold next ID
//Because some IDs may already be used, find the largest assigned ID
let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0);

app.post(
  "/flips",
  bodyHasResultProperty, // Add validation middleware function
  (req, res) => {
    // Route handler no longer has validation code.
    const { data: { result } = {} } = req.body;
    const newFlip = {
      id: ++lastFlipId, //increment last ID, then assign as the currentID
      result,
    };
    flips.push(newFlip);
    res.status(201).json({ data: newFlip });
  }
);

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, request, response, next) => {
  console.error(error);
  const { status = 500, message = "Something went wrong!" } = error;
  res.status(status).json({ error: message });
});

module.exports = app;
