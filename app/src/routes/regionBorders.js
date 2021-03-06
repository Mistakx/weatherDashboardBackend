//! Express
import express from "express";

//! Get region borders data route
//! Client sends a geoJSON to be saved to the database
//! Calculate centers of each feature in the database route
<<<<<<< bb9fe8223ebc664432392fb89b00131405563d5c:app/src/routes/regionBorders.js
import {handleCalculateCenters, handleGetRegionBorders, handleSaveRegionBorders} from "../handlers/regionBorders.js";
=======
import {handleCalculateCenters, handleGetRegionBorders, handleSaveRegionBorders} from "../handlers/regionBorders";
>>>>>>> Added Typescript interfaces for weather geojson:app/src/routes/regionBorders.ts
import multer from "multer";

export let regionBordersRouter = express.Router();

regionBordersRouter.get(
    "/getRegionBorders",
    async function (request, response) {
        await handleGetRegionBorders(request, response);
    }
);

const storage = multer.memoryStorage(); // Use RAM to temporarily store the received geoJSON, before parsing it and saving it to the database
const upload = multer({storage: storage});
// https://stackoverflow.com/questions/31530200/node-multer-unexpected-field
regionBordersRouter.post(
    "/saveRegionBorders",
    upload.single("geojson"),
    async function (request, response) {
        await handleSaveRegionBorders(request, response);
    }
);

// TODO: If the centers were already calculated, warn the client, and don't calculate them again
regionBordersRouter.post(
    "/calculateCenters",
    async function (request, response) {
        await handleCalculateCenters(request, response);
    }
);

