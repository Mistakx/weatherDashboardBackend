import {
    collectionExistsInDatabase,
    queryAllCoordinatesReferenceSystems,
    queryRegionBordersFeatures,
} from "../utils/database.js";
<<<<<<< bb9fe8223ebc664432392fb89b00131405563d5c:app/src/handlers/map.js
import { DatabaseEngine } from "../configs/mongo.js";
=======
import {DatabaseEngine} from "../configs/mongo";
>>>>>>> Added Typescript interfaces for weather geojson:app/src/handlers/map.ts
import sendResponseWithGoBackLink from "../utils/response.js";
import {ObjectId} from "mongodb";

// Sends an array of geoJSONs with the border regions and its weather information on a certain date
export async function handleGetRegionBordersAndWeatherByDate(
    request,
    response
) {
    console.log(
        "Client requested region borders and weather (Date:" +
        request.params.weatherDateID +
        ")"
    );

    let message = "";

    //! Error handling

    //* Check if the region border collection exists
    let regionBordersCollectionName =
        DatabaseEngine.getRegionBordersCollectionName();
    let regionBordersCollectionExists = await collectionExistsInDatabase(
        regionBordersCollectionName,
        DatabaseEngine.getDashboardDatabase()
    );

    //* If the region borders collection doesn't exist, send error response to the client
    if (!regionBordersCollectionExists) {
        message +=
            "Couldn't get region borders because the collection doesn't exist.\n";
    }

    //* Check if the weather collection exists
    let weatherCollectionName = DatabaseEngine.getWeatherCollectionName();
    let weatherCollectionExists = await collectionExistsInDatabase(
        weatherCollectionName,
        DatabaseEngine.getDashboardDatabase()
    );

    //* If the weather collection doesn't exist, send error response to the client
    if (!regionBordersCollectionExists) {
        message +=
            "Couldn't get weather borders because the collection doesn't exist.";
    }

    if (!regionBordersCollectionExists || !weatherCollectionExists) {
        console.log(message);
        sendResponseWithGoBackLink(response, message);
    }

    //! End of error handling

    //* If the region borders collection and the weather collection exists, send the various database geoJSONs to the client
    //* If the region borders collection exists, so does the coordinates reference systems collection
    //* If the weather collection exists, so does the weather data collection
    if (regionBordersCollectionExists && weatherCollectionExists) {
        console.log("Started sending geoJSONs to the client.");
        let geoJSONs = [];

        //* Query the region borders collection for the various CRSs
        //* The _id and the crs of the CRS document, is going to be used to return a geoJSON with the crs, and the associated region border features
        console.log(
            "Started querying coordinates reference systems collection for all CRSs."
        );
        let crsQueryProjection = {_id: 1, crs: 1};
        let crsQueryResults = await queryAllCoordinatesReferenceSystems(
            crsQueryProjection
        );
        console.log(
            "Finished querying coordinates reference systems collection for all CRSs."
        );

        //* Query each CRS in the database for the associated border region features
        console.log(
            "Started query each CRS in the database for the associated border region features."
        );
        for (const crs of crsQueryResults) {
            let geoJSON = {
                type: "FeatureCollection",
                crs: crs.crs,
                features: [],
            };

            // Query for all the features that have the same crsObjectId field as the current CRS _id
            // The features also need to have had their center calculated, otherwise they don't have a weather associated
            let featuresQuery = {
                crsObjectId: crs._id,
                center: {$exists: true, $ne: null},
            };
            // We are going to use the returning query parameters to build the geoJSON
            // As such, the feature center coordinates, and crsObjectId aren't needed
            // We only need the type, properties and geometry to build the geoJSONs
            // We need the feature _id to query for the corresponding weathers
            let regionBordersQueryProjection = {
                _id: 1,
                type: 1,
                properties: 1,
                geometry: 1,
            };
            let regionBordersFeaturesArray = await queryRegionBordersFeatures(
                featuresQuery,
                regionBordersQueryProjection
            );

            //* Query for the weather information of each feature in the regionBordersFeaturesArray, at a given date, and save it to the feature
            console.log("Started query for the weather of each feature.");
            for (const currentFeature of regionBordersFeaturesArray) {
                let weatherCollection = DatabaseEngine.getWeatherCollection();
                // EJS is used to dynamically create a button for each date that the regions weather information the were saved
                // Each button makes a POST request to the getRegionBordersAndWeather/:weatherDateID
                let weatherDateID = request.params.weatherDateID; //https://stackoverflow.com/questions/20089582/how-to-get-a-url-parameter-in-express

                let weatherOfCurrentFeatureQuery = {
                    weatherDateObjectId: new ObjectId(weatherDateID),
                    regionBorderFeatureObjectId: currentFeature._id,
                }; // Query for the weather that has the same regionBorderFeatureObjectId field as the current feature _id
                // We are going to use the returning query parameters to add the weather information to the current geoJSON
                // As such, the _id, regionBorderFeatureObjectId, weatherDateObjectId aren't needed
                // We only need the weatherInformation.current field
                let weatherOfCurrentFeatureQueryProjection = {
                    _id: 0,
                    weatherDateObjectId: 0,
                    regionBorderFeatureObjectId: 0,
                };
                let weatherOfCurrentFeatureQueryOptions = {
                    projection: weatherOfCurrentFeatureQueryProjection,
                };

                let currentFeatureWeatherDocument = await weatherCollection.findOne(
                    weatherOfCurrentFeatureQuery,
                    weatherOfCurrentFeatureQueryOptions
                );

                //* If the current feature had its weather saved at the given date, add the current feature weather information to the feature, and push the feature to the geoJSON
                if (currentFeatureWeatherDocument != null) {
                    let currentFeatureWeatherInformation = currentFeatureWeatherDocument.weatherInformation
                    // console.log(currentFeature._id.toHexString());
                    currentFeature.weather = {};
                    currentFeature.weather.location =
                        currentFeatureWeatherInformation.location;
                    currentFeature.weather.current =
                        currentFeatureWeatherInformation.current;
                    geoJSON.features.push(currentFeature);
                }


            }

            //* Add the geoJSON to the geoJSONs array
            geoJSONs.push(geoJSON);
        }
        console.log(
            "Finished query each CRS in the database for the associated border region features."
        );

        console.log("Started sending geoJSONs to the client.");
        response.send(geoJSONs);
        console.log("Finished sending geoJSONs to the client.\n");
    }
}
