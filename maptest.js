import axios from "axios";
import dbConnect from "./utils/dbConnect.js";
import node_geocoder from "node-geocoder";

const options = {
  provider: "google",
  apiKey: "AIzaSyACiii2Kp1VXRckQoTy_MYZcLkS0wEKhBE", // for Mapquest, OpenCage, APlace, Google Premier
  formatter: null, // 'gpx', 'string', ...
};
const geocoder = node_geocoder(options);

async function getCoOrds(locationAddrFrom, locationAddrTo) {
  const res1 = await geocoder.geocode(locationAddrFrom);
  const res2 = await geocoder.geocode(locationAddrTo);
  // console.log(res1, res2, "this is initial result of geocode");
  const lat1 = res1[0].latitude;
  const lng1 = res1[0].longitude;
  const lat2 = res2[0].latitude;
  const lng2 = res2[0].longitude;
  // console.log(`from ${lat1} & ${lng1} to ${lat2} & ${lng2}`);
  return { lat1, lng1, lat2, lng2 };
}

const calculateDistance = async (lat1, lng1, lat2, lng2) => {
  const API_KEY = "AIzaSyACiii2Kp1VXRckQoTy_MYZcLkS0wEKhBE";
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${lat1},${lng1}&destinations=${lat2},${lng2}&key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status === "OK") {
      const element = data.rows[0].elements[0];
      if (element.status === "OK") {
        const distance = element.distance.text; 
        const duration = element.duration.text;
        return { distance, duration };
      } else {
        throw new Error(`Error: ${element.status}`);
      }
    } else {
      throw new Error(`Error: ${data.status}`);
    }
  } catch (error) {
    console.error("Error calculating distance:", error.message);
    return null;
  }
};

const calculateRate = async (childCount, rideCount, distance) => {
  let conn;
  try {
    conn = await dbConnect();

    // Fetch the base ride cost
    const [rows] = await conn.execute(
      `SELECT ${childCount} FROM rate_list1 WHERE id =?`,[rideCount]);
    const rideCost = Number(rows[0]?.single_child).toFixed(2); // Base ride cost
    console.log(rideCost, " initial rate");

    // Calculate additional cost for distances greater than 10 miles
    if (distance > 10.0) {
      const [extRows] = await conn.execute(
        `SELECT single_child FROM rate_list_ext WHERE id = 2`
      );
      // console.log(extRows);

      const extDistRate = Number(extRows[0]?.single_child); // Extract extra distance rate
      console.log(extDistRate + " extra distance rate from db");

      const remainingDist = distance - 10; // Calculate remaining distance
      console.log(remainingDist + " remain dist");

      const extraFare = remainingDist * extDistRate; // Calculate extra fare
      console.log(extraFare + " extra fare");

      const finalCost = Number(rideCost) + extraFare; // Add base cost and extra fare
      console.log(finalCost + " final ");
      return finalCost.toFixed(2); // Return final cost with 2 decimal places
    } else {
      console.log(rideCost + " final ");
      return rideCost; // Return base cost if distance <= 10
    }
  } catch (error) {
    console.error(error);
  } finally {
    if (conn) await conn.end();
  }
};



const calculatePackage = async (from, to, childCount, rideCount) => {
  const { lat1, lng1, lat2, lng2 } = await getCoOrds(from, to);
  const result = await calculateDistance(lat1, lng1, lat2, lng2);
  console.log(result);
  var dist = Number(result.distance.split(" ")[0]);
  calculateRate(childCount, rideCount, dist);
};

calculatePackage(
  "Sun Orbit, 1-1, 411051, 15, Sun City Rd, Anand Nagar, Pune, Maharashtra 411051",
  "Decathlon Sports Wakad, Vision One Mall, SR No 56, 4, Tathawade Rd, Pimpri-Chinchwad, Maharashtra 411033",
  "single_child",
  4
);
