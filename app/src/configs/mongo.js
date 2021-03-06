//! Mongo database engine class
import {MongoClient} from "mongodb";

export class DatabaseEngine {

    private static databaseEngineConnection: MongoClient;
    private static crsCollectionName = "coordinatesReferenceSystems"; // Name of the collection that contains the various CRSs used by the features
    private static weatherCollectionName = "weather"; // Name of the collection that contains the weather data of the various features, and the id of the corresponding features
    private static regionBordersCollectionName = "regionBorders"; // Name of the collection that contains region borders information such as the coordinates that make the border on the map, the region name, and those coordinates reference system
    private static weatherDatesCollectionName = "weatherDates"; // Name of the collection that contains the dates that the various weather data documents were saved, and the id of the corresponding weather data documents

    //! Database engine connection
    static async connectToDatabaseEngine() {
        // Connect to the database engine
        let databaseConnectionString =
            "mongodb+srv://" +
            process.env.DB_USERNAME +
            ":" +
            process.env.DB_PASSWORD +
            "@" +
            process.env.DB_URL;
        this.databaseEngineConnection = new MongoClient(databaseConnectionString);
        await this.databaseEngineConnection.connect();

        // Verify connection
        await this.databaseEngineConnection.db("admin").command({ping: 1});
        console.log("Connected to MongoDB engine.");
    }

    static getConnection() {
        return this.databaseEngineConnection;
    }

    //! Dashboard database
    static getDashboardDatabase() {
        return this.databaseEngineConnection.db("weatherDashboard");
    }

    //! Weather dates collection
    static getWeatherDatesCollection() {
        return this.getDashboardDatabase().collection(
            this.weatherDatesCollectionName
        );
    }

    //! Weather collection
    static getWeatherCollectionName() {
        return this.weatherCollectionName
    }

    static getWeatherCollection() {
        return this.getDashboardDatabase().collection(this.weatherCollectionName);
    }

    //! Region borders collection
    static getRegionBordersCollectionName() {
        return this.regionBordersCollectionName;
    }

    static getRegionBordersCollection() {
        return this.getDashboardDatabase().collection(
            this.regionBordersCollectionName
        );
    }

    //! CRS collection
    static getCRScollection() {
        return this.getDashboardDatabase().collection(this.crsCollectionName);
    }
}
