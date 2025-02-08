import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "../utils/dbConnect.js";

// Driver Registration
export const registerDriver = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    var {
      first_name,
      last_name,
      email,
      phone_number,
      password,
      address,
      license_number,
      license_expiry_date,
      certification = "",
    } = req.body;

    console.log(
      first_name,
      last_name,
      email,
      phone_number,
      password,
      address,
      license_number,
      license_expiry_date,
      (certification = "")
    );

    // Validate required fields
    if (
      !first_name ||
      !last_name ||
      !email ||
      !phone_number ||
      !password ||
      !address ||
      !license_number ||
      !license_expiry_date
    ) {
      return resp.status(400).json({
        message: "All fields except certification are required",
        success: false,
      });
    }

    // Check for duplicate email, phone number, or license number
    const [existing] = await conn.execute(
      `SELECT * FROM driver WHERE email = ? OR phone_number = ? OR license_number = ?`,
      [email, phone_number, license_number]
    );
    if (existing.length > 0) {
      return resp.status(400).json({
        message: "Email, phone number, or license number already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the driver with password
    const [result] = await conn.execute(
      `INSERT INTO driver (first_name, last_name, email, phone_number, password, 
        address, license_number, license_expiry_date, certification) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone_number,
        hashedPassword,
        address,
        license_number,
        license_expiry_date,
        certification,
      ]
    );

    if (result.affectedRows === 1) {
      return resp.status(201).json({
        message: "Driver account created successfully",
        success: true,
      });
    }
    return resp.status(500).json({
      message: "Failed to create driver account",
      success: false,
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  } finally {
    if (conn) await conn.end();
  }
};

// Driver Login
export const loginDriver = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { email, password } = req.body;

    if (!email || !password) {
      return resp.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    const [rows] = await conn.execute(`SELECT * FROM driver WHERE email = ?`, [
      email,
    ]);
    const driver = rows[0];

    if (!driver) {
      return resp.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, driver.password);
    if (!isPasswordMatch) {
      return resp.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const tokenData = {
      driverId: driver.id,
      role: "driver",
    };

    const token = await jwt.sign(tokenData, process.env.SECRETE_KEY, {
      expiresIn: "30d",
    });

    // Remove sensitive information from driver object
    const driverInfo = {
      first_name: driver.first_name,
      last_name: driver.last_name,
      email: driver.email,
      phone_number: driver.phone_number,
      address: driver.address,
      license_number: driver.license_number,
      license_expiry_date: driver.license_expiry_date,
      certification: driver.certification,
    };

    return resp.status(200).json({
      message: "Welcome back " + driver.first_name,
      driver: driverInfo,
      success: true,
      token: token,
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//forgot password
export const forgotPassword = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { email, otp, password } = req.body;

    // Validate input
    if (!email || !otp || !password) {
      return resp.status(400).json({
        message: "Missing required fields",
        success: false,
      });
    }

    // Check if OTP is correct (fixed OTP: 123456)
    if (otp !== "123456") {
      return resp.status(400).json({
        message: "Invalid OTP",
        success: false,
      });
    }

    // Check if driver exists
    const [rows] = await conn.execute(`SELECT * FROM driver WHERE email=?`, [
      email,
    ]);
    const driver = rows[0];
    if (!driver) {
      return resp.status(404).json({
        message: "Driver not found",
        success: false,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in database
    const [result] = await conn.execute(
      `UPDATE driver SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    // Check if update was successful
    if (result.affectedRows === 1) {
      return resp.status(200).json({
        message: "Password reset successfully",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to reset password",
        success: false,
      });
    }
  } catch (err) {
    console.error(err);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//get driver profile
export const getDriverProfile = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const id = req.id;
    console.log(id, " get driver profile");

    const [rows] = await conn.execute(
      `SELECT id, first_name, last_name, email, phone_number, 
              address, license_number, license_expiry_date, certification 
       FROM driver 
       WHERE id = ?`,
      [id]
    );

    if (rows.length > 0) {
      console.log(rows);
      return resp.status(200).json({
        driverData: rows,
        success: true,
      });
    } else {
      return resp.status(200).json({
        message: "Driver data not found",
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      success: false,
      message: "An error occurred while fetching the Driver profile.",
    });
  } finally {
    if (conn) await conn.end();
  }
};

//edit driver
export const editDriver = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const driverId = req.id; // Get driver ID from authenticated request
    var {
      first_name,
      last_name,
      email,
      phone_number,
      address,
      license_number,
      license_expiry_date,
      certification = "",
    } = req.body;

    // Validate required fields
    if (
      !first_name ||
      !last_name ||
      !email ||
      !phone_number ||
      !address ||
      !license_number ||
      !license_expiry_date
    ) {
      return resp.status(400).json({
        message: "All fields except certification are required",
        success: false,
      });
    }

    // Check if the driver exists
    const [driverExists] = await conn.execute(
      "SELECT * FROM driver WHERE id = ?",
      [driverId]
    );

    if (driverExists.length === 0) {
      return resp.status(404).json({
        message: "Driver not found",
        success: false,
      });
    }

    // Check for duplicate email, phone number, or license number excluding current driver
    const [existing] = await conn.execute(
      `SELECT * FROM driver 
       WHERE (email = ? OR phone_number = ? OR license_number = ?) 
       AND id != ?`,
      [email, phone_number, license_number, driverId]
    );

    if (existing.length > 0) {
      const duplicateField = existing
        .map((record) => {
          let fields = [];
          if (record.email === email) fields.push("email");
          if (record.phone_number === phone_number) fields.push("phone number");
          if (record.license_number === license_number)
            fields.push("license number");
          return fields;
        })
        .flat();

      return resp.status(400).json({
        message: `The following field(s) already exist: ${duplicateField.join(
          ", "
        )}`,
        success: false,
      });
    }

    // Update driver information
    const [result] = await conn.execute(
      `UPDATE driver 
       SET first_name = ?, 
           last_name = ?, 
           email = ?, 
           phone_number = ?, 
           address = ?, 
           license_number = ?, 
           license_expiry_date = ?, 
           certification = ?
       WHERE id = ?`,
      [
        first_name,
        last_name,
        email,
        phone_number,
        address,
        license_number,
        license_expiry_date,
        certification,
        driverId,
      ]
    );

    if (result.affectedRows === 1) {
      // Fetch updated driver data
      const [updatedDriver] = await conn.execute(
        `SELECT id, first_name, last_name, email, phone_number, 
                address, license_number, license_expiry_date, certification 
         FROM driver 
         WHERE id = ?`,
        [driverId]
      );

      return resp.status(200).json({
        message: "Driver profile updated successfully",
        success: true,
        driver: updatedDriver[0],
      });
    }

    return resp.status(500).json({
      message: "Failed to update driver profile",
      success: false,
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//getTodaysTrip
export const getTodaysTrip = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const id = req.id; // Driver ID from middleware
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    const [rides] = await conn.execute(
      `SELECT r.*, 
          c.first_name AS child_first_name, 
          c.last_name AS child_last_name, 
          c.school_address
       FROM rides r
       LEFT JOIN children c ON r.child_id = c.id
       WHERE r.driver_id = ? AND r.ride_date = ?`,
      [id, today]
    );

    if (rides.length === 0) {
      return resp.status(404).json({
        message: "No rides found for today",
        success: false,
      });
    }

    return resp.status(200).json({
      message: "Rides fetched successfully",
      success: true,
      data: rides,
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//get single ride by id
export const getSingleRide = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { id } = req.params; // Ride ID from request params

    const [ride] = await conn.execute("SELECT * FROM rides WHERE id = ?", [id]);

    if (ride.length === 0) {
      return resp.status(404).json({
        message: "Ride not found",
        success: false,
      });
    }

    return resp.status(200).json({
      message: "Ride fetched successfully",
      success: true,
      data: ride[0],
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};
