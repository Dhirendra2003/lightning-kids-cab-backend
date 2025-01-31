import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "../utils/dbConnect.js";

//register
export const adminRegister = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return resp.status(400).json({
        message: "something is missing",
        success: false,
      });
    }

    const [rows] = await conn.execute(`SELECT * FROM admin where email=?`, [
      email,
    ]);
    if (rows[0]) {
      return resp.status(400).json({
        message: "this email already exists",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await conn.execute(
      "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    console.log(user);
    const result = user[0];
    if (result.affectedRows === 1) {
      return resp.status(201).json({
        message: "Admin Account created successfully",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to create admin account",
        success: false,
      });
    }
    // resp.send(rows);
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) await conn.end();
  }
};

//login
export const adminLogin = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { email, password } = req.body;
    if (!email || !password) {
      return resp.status(400).json({
        message: "something is missing",
        success: false,
      });
    }
    const [rows] = await conn.execute(`SELECT * FROM admin where email=?`, [
      email,
    ]);
    console.log(rows);
    // console.log();
    var user = rows[0];
    if (!user) {
      // console.log(email, password)
      return resp.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return resp.status(400).json({
        message: "incorrect email or password",
        success: false,
      });
    }

    const tokenData = {
      userId: `${user.id} admin`,
    };
    const token = await jwt.sign(tokenData, process.env.SECRETE_KEY, {
      expiresIn: "30d",
    });
    user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return resp.status(200).json({
      message: "welcome back " + user.name,
      user,
      success: true,
      token: token,
    });
  } catch (error) {
    console.log(error);
  } finally {
    if (conn) await conn.end();
  }
};

//logout
export const logout = async (req, resp) => {
  try {
    return resp.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "logout success",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

//register schools
export const registerSchool = async (req, resp) => {
  var conn;
  try {
    //schoolName, schoolEmail ,schoolContactNo, schoolOpeningTime , schoolClosingTime, schoolPickUpWindow ,schoolDropOffWindow ,schoolAddress
    conn = await dbConnect();
    const {
      schoolName,
      schoolEmail,
      schoolContactNo,
      schoolOpeningTime,
      schoolClosingTime,
      schoolPickUpWindow,
      schoolDropOffWindow,
      schoolAddress,
    } = req.body;

    if (
      !schoolName ||
      !schoolEmail ||
      !schoolContactNo ||
      !schoolOpeningTime ||
      !schoolClosingTime ||
      !schoolPickUpWindow ||
      !schoolDropOffWindow ||
      !schoolAddress
    ) {
      return resp.status(400).json({
        message: "something is missing",
        success: false,
      });
    }

    const [rows] = await conn.execute(
      `SELECT * FROM school where school_name=?`,
      [schoolName]
    );
    if (rows[0]) {
      return resp.status(400).json({
        message: "this school already exists",
        success: false,
      });
    }
    const user = await conn.execute(
      "INSERT INTO  school  ( school_name ,  school_email ,  school_contact_number ,  school_opening_time ,  school_closing_time ,  school_pickup_window ,  school_dropoff_window ,  school_address ) VALUES ( ?, ?, ?, ?, ?,?, ?, ?);",
      [
        schoolName,
        schoolEmail,
        schoolContactNo,
        schoolOpeningTime,
        schoolClosingTime,
        schoolPickUpWindow,
        schoolDropOffWindow,
        schoolAddress,
      ]
    );
    console.log(user);
    const result = user[0];
    if (result.affectedRows === 1) {
      return resp.status(201).json({
        message: "school registered successfully",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to create school",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (conn) await conn.end();
  }
};

//deleteSchool
export const deleteSchool = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { schoolId } = req.body;

    const [rows] = await conn.execute(`SELECT * FROM school where id=?`, [
      schoolId,
    ]);
    if (rows[0]) {
      const [result] = await conn.execute("DELETE FROM school WHERE id = ?", [
        schoolId,
      ]);
      if (result.affectedRows) {
        return resp.status(200).json({
          message: `school ${schoolId} is deleted`,
          success: true,
        });
      } else {
        return resp.status(400).json({
          message: "school not found",
          success: false,
        });
      }
    } else {
      return resp.status(400).json({
        message: "this school does not exists",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    return resp.status(401).json(error);
  } finally {
    if (conn) await conn.end();
  }
};

//edit school
export const editSchool = async (req, resp) => {
  var conn;
  try {
    // Destructure required fields from the request body
    const {
      schoolId,
      schoolName,
      schoolEmail,
      schoolContactNo,
      schoolOpeningTime,
      schoolClosingTime,
      schoolPickUpWindow,
      schoolDropOffWindow,
      schoolAddress,
    } = req.body;

    // Connect to the database
    conn = await dbConnect();

    // Validate input
    if (
      !schoolId ||
      !schoolName ||
      !schoolEmail ||
      !schoolContactNo ||
      !schoolOpeningTime ||
      !schoolClosingTime ||
      !schoolPickUpWindow ||
      !schoolDropOffWindow ||
      !schoolAddress
    ) {
      return resp.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }

    // Check if the school exists
    const [rows] = await conn.execute(`SELECT * FROM school WHERE id = ?`, [
      schoolId,
    ]);
    if (!rows[0]) {
      return resp.status(404).json({
        message: "School not found.",
        success: false,
      });
    }

    // Update the school record
    const [result] = await conn.execute(
      `UPDATE school 
       SET 
         school_name = ?, 
         school_email = ?, 
         school_contact_number = ?, 
         school_opening_time = ?, 
         school_closing_time = ?, 
         school_pickup_window = ?, 
         school_dropoff_window = ?, 
         school_address = ? 
       WHERE id = ?`,
      [
        schoolName,
        schoolEmail,
        schoolContactNo,
        schoolOpeningTime,
        schoolClosingTime,
        schoolPickUpWindow,
        schoolDropOffWindow,
        schoolAddress,
        schoolId,
      ]
    );

    // Check if the update was successful
    if (result.affectedRows === 1) {
      return resp.status(200).json({
        message: "School updated successfully.",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to update school.",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "An error occurred while updating the school.",
      success: false,
      error,
    });
  } finally {
    if (conn) await conn.end();
  }
};

// get all schools
export const getAllSchools = async (req, resp) => {
  var conn;
  try {
    // Connect to the database
    conn = await dbConnect();

    // Fetch all school records
    const [rows] = await conn.execute(`SELECT * FROM school`);

    // Check if records are available
    if (rows.length === 0) {
      return resp.status(404).json({
        message: "No schools found.",
        success: false,
      });
    }

    // Return the school records
    return resp.status(200).json({
      message: "Schools fetched successfully.",
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "An error occurred while fetching the schools.",
      success: false,
      error,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//add holiday
export const addHoliday = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { schoolId, title, startDate, endDate } = req.body;

    // Validate input
    if (!schoolId || !title || !startDate) {
      return resp.status(400).json({
        message: "All fields are required.",
        success: false,
      });
    }
    if (endDate) {
      const date1 = new Date(startDate);
      const date2 = new Date(endDate);
      const diffTime = Math.abs(date2 - date1);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      var loopstartDate = new Date(startDate);
      // console.log(diffTime + " milliseconds");
      // console.log(diffDays + " days");
      for (let i = 0; i < diffDays; i++) {
        console.log(loopstartDate.toISOString().split("T")[0]); // Print the date in YYYY-MM-DD format
        await conn.execute(
          "INSERT INTO holiday (school_id, title, start_date) VALUES (?, ?, ?)",
          [schoolId, title, loopstartDate]
        );
        loopstartDate.setDate(loopstartDate.getDate() + 1);
        
      }
      return resp.status(201).json({
        message: `${diffDays} Holidays added successfully.`,
        success: true,
      });
    }
    // Insert the holiday record
    const [result] = await conn.execute(
      "INSERT INTO holiday (school_id, title, start_date) VALUES (?, ?, ?)",
      [schoolId, title, startDate]
    );

    if (result.affectedRows === 1) {
      return resp.status(201).json({
        message: "Holiday added successfully.",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to add holiday.",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "An error occurred while adding the holiday.",
      success: false,
      error,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//get all holidays for a school
export const getHolidays = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { schoolId } = req.query;

    // Validate input
    if (!schoolId) {
      return resp.status(400).json({
        message: "School ID is required.",
        success: false,
      });
    }

    // Fetch holidays for the given school
    const [rows] = await conn.execute(
      "SELECT * FROM holiday WHERE school_id = ?",
      [schoolId]
    );

    const [rows1] = await conn.execute("SELECT * from school WHERE id=? ", [
      schoolId,
    ]);

    if (rows.length === 0) {
      return resp.status(200).json({
        message: "No holidays found for the given school.",
        school_info: rows1[0],
        success: false,
      });
    }

    return resp.status(200).json({
      message: "Holidays fetched successfully.",
      success: true,
      data: rows,
      school_info: rows1[0],
    });
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "An error occurred while fetching holidays.",
      success: false,
      error,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//delete a holiday for a school
export const deleteHoliday = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { id } = req.body;

    // Validate input
    if (!id) {
      return resp.status(400).json({
        message: "Holiday ID is required.",
        success: false,
      });
    }

    // Delete the holiday
    const [result] = await conn.execute("DELETE FROM holiday WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 1) {
      return resp.status(200).json({
        message: `Holiday with ID ${id} deleted successfully.`,
        success: true,
      });
    } else {
      return resp.status(404).json({
        message: "Holiday not found.",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      message: "An error occurred while deleting the holiday.",
      success: false,
      error,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//memberships api

// Add new membership
export const addMembership = async (req, res) => {
  var conn;
  try {
    const { name, price, startDate, endDate, type } = req.body;

    // Validate required fields

    // use this date format only: dateFormat="yyyy-MM-dd"
    if (!name || !price || !startDate || !endDate || !type) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Validate date logic
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date must be greater than or equal to start date",
        success: false,
      });
    }

    conn = await dbConnect();

    // Check last membership's end date
    const [rows] = await conn.execute(
      "SELECT end_date FROM membership ORDER BY end_date DESC LIMIT 1"
    );
    if (rows.length > 0) {
      const lastEndDate = new Date(rows[0].end_date);
      if (new Date(startDate) <= lastEndDate) {
        return res.status(400).json({
          message: `Start date must be greater than the last membership's end date (${lastEndDate.toLocaleDateString()})`,
          success: false,
        });
      }
    }
    // Insert new membership
    const [result] = await conn.execute(
      "INSERT INTO membership (name, price, start_date, end_date, type) VALUES (?, ?, ?, ?, ?)",
      [name, price, startDate, endDate, type]
    );

    if (result.affectedRows === 1) {
      res.status(201).json({
        message: "Membership added successfully",
        success: true,
      });
    } else {
      res.status(500).json({
        message: "Failed to add membership",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  } finally {
    if (conn) await conn.end();
  }
};

// Get all memberships
export const getAllMemberships = async (req, res) => {
  var conn;
  try {
    conn = await dbConnect();
    const [rows] = await conn.execute("SELECT * FROM membership");

    res.status(200).json({
      message: "Memberships fetched successfully",
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  } finally {
    if (conn) await conn.end();
  }
};

// Edit membership
export const editMembership = async (req, res) => {
  var conn;
  try {
    const { id, name, price, startDate, endDate, type } = req.body;

    // Validate required fields
    if (!id || !name || !price || !startDate || !endDate || !type) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Validate date logic
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date must be greater than or equal to start date",
        success: false,
      });
    }

    conn = await dbConnect();

    // // Check last membership's end date excluding current entry
    // const [rows] = await conn.execute(
    //   "SELECT end_date FROM membership WHERE id != ? ORDER BY end_date DESC LIMIT 1",
    //   [id]
    // );

    // if (rows.length > 0) {
    //   const lastEndDate = new Date(rows[0].end_date);
    //   if (new Date(start_date) <= lastEndDate) {
    //     return res.status(400).json({
    //       message: `Start date must be greater than the last membership's end date (${lastEndDate.toISOString().split("T")[0]})`,
    //       success: false,
    //     });
    //   }
    // }

    // Update membership
    const [result] = await conn.execute(
      "UPDATE membership SET name = ?, price = ?, start_date = ?, end_date = ?, type = ? WHERE id = ?",
      [name, price, startDate, endDate, type, id]
    );

    if (result.affectedRows === 1) {
      res.status(200).json({
        message: "Membership updated successfully",
        success: true,
      });
    } else {
      res.status(404).json({
        message: "Membership not found",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  } finally {
    if (conn) await conn.end();
  }
};

// Delete membership
export const deleteMembership = async (req, res) => {
  var conn;
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "Membership ID is required",
        success: false,
      });
    }

    conn = await dbConnect();

    // Delete membership
    const [result] = await conn.execute(
      "DELETE FROM membership WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 1) {
      res.status(200).json({
        message: "Membership deleted successfully",
        success: true,
      });
    } else {
      res.status(404).json({
        message: "Membership not found",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  } finally {
    if (conn) await conn.end();
  }
};

// Create Vehicle API
export const createVehicle = async (req, res) => {
  var conn;
  try {
    conn = await dbConnect();
    const { type } = req.body;

    // Validation: Ensure type is provided
    if (!type) {
      return res.status(400).json({
        message: "Vehicle type is required.",
        success: false,
      });
    }

    // Check if the type already exists
    const [existingVehicle] = await conn.execute(
      "SELECT * FROM vehicles WHERE vehicle_type = ?",
      [type]
    );
    if (existingVehicle.length > 0) {
      return res.status(400).json({
        message: `Vehicle type ${type} already exists.`,
        success: false,
      });
    }

    // Insert the new vehicle type
    const [result] = await conn.execute(
      "INSERT INTO vehicles (vehicle_type) VALUES (?)",
      [type]
    );
    if (result.affectedRows === 1) {
      return res.status(201).json({
        message: `Vehicle type ${type} created successfully.`,
        success: true,
      });
    } else {
      return res.status(500).json({
        message: "Failed to create vehicle type.",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
      error: error.message,
    });
  } finally {
    if (conn) await conn.end();
  }
};

export const getAllVehicleTypes = async (req, resp) => {
  var conn;
  try {
    // Connect to the database
    conn = await dbConnect();

    // Query to get all vehicle types
    const [rows] = await conn.execute("SELECT * FROM vehicles");

    // Check if data exists
    if (rows.length === 0) {
      return resp.status(404).json({
        message: "No vehicle types found",
        success: false,
      });
    }

    // Return the data
    return resp.status(200).json({
      message: "Vehicle types retrieved successfully",
      success: true,
      data: rows,
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

// Delete Vehicle API
export const deleteVehicle = async (req, res) => {
  var conn;
  try {
    conn = await dbConnect();
    const { id } = req.body;

    // Validation: Ensure ID is provided
    if (!id) {
      return res.status(400).json({
        message: "Vehicle ID is required.",
        success: false,
      });
    }

    // Check if the vehicle exists
    const [vehicle] = await conn.execute(
      "SELECT * FROM vehicles WHERE id = ?",
      [id]
    );
    if (vehicle.length === 0) {
      return res.status(404).json({
        message: "Vehicle type not found.",
        success: false,
      });
    }

    // Delete the vehicle
    const [result] = await conn.execute("DELETE FROM vehicles WHERE id = ?", [
      id,
    ]);
    if (result.affectedRows === 1) {
      return res.status(200).json({
        message: `Vehicle type with ID ${id} deleted successfully.`,
        success: true,
      });
    } else {
      return res.status(500).json({
        message: "Failed to delete vehicle type.",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
      error: error.message,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//certificate api

// create certificate
export const createCertificate = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { certificate_name } = req.body;

    if (!certificate_name) {
      return resp.status(400).json({
        message: "Certificate name is required",
        success: false,
      });
    }

    // Check if the certificate already exists
    const [existing] = await conn.execute(
      "SELECT * FROM certificate WHERE certificate_name = ? ",
      [certificate_name]
    );
    if (existing.length > 0) {
      return resp.status(400).json({
        message: "Certificate already exists",
        success: false,
      });
    }

    // Insert the certificate
    const [result] = await conn.execute(
      "INSERT INTO certificate (certificate_name) VALUES (?)",
      [certificate_name]
    );

    if (result.affectedRows === 1) {
      return resp.status(201).json({
        message: "Certificate created successfully",
        success: true,
      });
    }
    return resp.status(500).json({
      message: "Failed to create certificate",
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

//delete certificate
export const deleteCertificate = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { id } = req.body;

    if (!id) {
      return resp.status(400).json({
        message: "Certificate ID is required",
        success: false,
      });
    }

    // Check if the certificate exists
    const [existing] = await conn.execute(
      "SELECT * FROM certificate WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return resp.status(404).json({
        message: "Certificate not found",
        success: false,
      });
    }

    // Delete the certificate
    const [result] = await conn.execute(
      "DELETE FROM certificate WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 1) {
      return resp.status(200).json({
        message: "Certificate deleted successfully",
        success: true,
      });
    }
    return resp.status(500).json({
      message: "Failed to delete certificate",
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

//get all certificate
export const getAllCertificates = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();

    // Fetch all certificates
    const [rows] = await conn.execute("SELECT * FROM certificate");

    if (rows.length === 0) {
      return resp.status(404).json({
        message: "No certificates found",
        success: false,
      });
    }

    return resp.status(200).json({
      message: "Certificates retrieved successfully",
      success: true,
      data: rows,
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

//create drive
export const createDriver = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const {
      first_name,
      last_name,
      email,
      phone_number,
      address,
      license_number,
      license_expiry_date,
      certification,
    } = req.body;

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

    // Insert the driver
    const [result] = await conn.execute(
      `INSERT INTO driver (first_name, last_name, email, phone_number, address, license_number, license_expiry_date, certification) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone_number,
        address,
        license_number,
        license_expiry_date,
        certification,
      ]
    );

    if (result.affectedRows === 1) {
      return resp.status(201).json({
        message: "Driver created successfully",
        success: true,
      });
    }
    return resp.status(500).json({
      message: "Failed to create driver",
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

// get all drivers
export const getAllDrivers = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();

    const [rows] = await conn.execute("SELECT * FROM driver");

    if (rows.length === 0) {
      return resp.status(404).json({
        message: "No drivers found",
        success: false,
      });
    }

    return resp.status(200).json({
      message: "Drivers retrieved successfully",
      success: true,
      data: rows,
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

// edit the driver
export const editDriver = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const {
      id,
      first_name,
      last_name,
      email,
      phone_number,
      address,
      license_number,
      license_expiry_date,
      certification,
    } = req.body;

    if (!id) {
      return resp.status(400).json({
        message: "Driver ID is required",
        success: false,
      });
    }

    const [result] = await conn.execute(
      `UPDATE driver 
       SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ?, license_number = ?, license_expiry_date = ?, certification = ? 
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
        id,
      ]
    );

    if (result.affectedRows === 1) {
      return resp.status(200).json({
        message: "Driver updated successfully",
        success: true,
      });
    }
    return resp.status(404).json({
      message: "Driver not found",
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

// Delete the driver
export const deleteDriver = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { id } = req.body;

    if (!id) {
      return resp.status(400).json({
        message: "Driver ID is required",
        success: false,
      });
    }

    const [result] = await conn.execute("DELETE FROM driver WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 1) {
      return resp.status(200).json({
        message: "Driver deleted successfully",
        success: true,
      });
    }
    return resp.status(404).json({
      message: "Driver not found",
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

export const createVehicleDetails = async (req, res) => {
  var conn;
  try {
    conn = await dbConnect();
    const {
      vehicle_name,
      vehicle_type,
      capacity,
      license_plate,
      area,
      vehicle_colour,
      vehicle_year,
      vehicle_model,
      driver,
      school_id,
    } = req.body;

    // Check if all fields are provided
    if (
      !vehicle_name ||
      !vehicle_type ||
      !capacity ||
      !license_plate ||
      !area ||
      !vehicle_colour ||
      !vehicle_year ||
      !vehicle_model ||
      !driver ||
      !school_id
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Check if the driver exists in the driver table
    const [driverExists] = await conn.execute(
      "SELECT id FROM driver WHERE id = ?",
      [driver]
    );

    if (!driverExists.length) {
      return res.status(400).json({
        message: "Driver does not exist",
        success: false,
      });
    }

    // Check if the driver is already assigned to another vehicle
    const [driverAssigned] = await conn.execute(
      "SELECT id FROM vehicles_details WHERE driver = ?",
      [driver]
    );

    if (driverAssigned.length) {
      return res.status(400).json({
        message: "Driver is already assigned to another vehicle",
        success: false,
      });
    }

    // Insert the new vehicle into the database
    const [result] = await conn.execute(
      "INSERT INTO vehicles_details (vehicle_name, vehicle_type, capacity, license_plate, area, vehicle_colour, vehicle_year, vehicle_model, driver,school_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
      [
        vehicle_name,
        vehicle_type,
        capacity,
        license_plate,
        area,
        vehicle_colour,
        vehicle_year,
        vehicle_model,
        driver,
        school_id,
      ]
    );

    if (result.affectedRows === 1) {
      return res.status(201).json({
        message: "Vehicle created successfully",
        success: true,
      });
    }

    return res.status(500).json({
      message: "Failed to create vehicle",
      success: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred",
      success: false,
      error: error.message,
    });
  } finally {
    if (conn) await conn.end();
  }
};

// Get All Vehicles API
export const getAllVehicleDetails = async (req, res) => {
  var conn;
  try {
    conn = await dbConnect();
    const [rows] = await conn.execute("SELECT * FROM vehicles_details");

    return res.status(200).json({
      data: rows,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred",
      success: false,
      error: error.message,
    });
  } finally {
    if (conn) await conn.end();
  }
};

// Edit Vehicle API
export const editVehicleDetails = async (req, res) => {
  var conn;
  try {
    conn = await dbConnect();
    const {
      id,
      vehicle_name,
      vehicle_type,
      capacity,
      license_plate,
      area,
      vehicle_colour,
      vehicle_year,
      vehicle_model,
      driver,
      school_id,
    } = req.body;

    // Check if the vehicle exists
    const [vehicleExists] = await conn.execute(
      "SELECT id FROM vehicles_details WHERE id = ?",
      [id]
    );

    if (!vehicleExists.length) {
      return res.status(400).json({
        message: "Vehicle does not exist",
        success: false,
      });
    }

    // Check if the driver exists in the driver table
    const [driverExists] = await conn.execute(
      "SELECT id FROM driver WHERE id = ?",
      [driver]
    );

    if (!driverExists.length) {
      return res.status(400).json({
        message: "Driver does not exist",
        success: false,
      });
    }

    // Check if the driver is already assigned to another vehicle
    const [driverAssigned] = await conn.execute(
      "SELECT id FROM vehicles_details WHERE driver = ? AND id != ?",
      [driver, id]
    );

    if (driverAssigned.length) {
      return res.status(400).json({
        message: "Driver is already assigned to another vehicle",
        success: false,
      });
    }

    // Update the vehicle details
    const [result] = await conn.execute(
      "UPDATE vehicles_details SET vehicle_name = ?, vehicle_type = ?, capacity = ?, license_plate = ?, area = ?, vehicle_colour = ?, vehicle_year = ?, vehicle_model = ?, driver = ? ,school_id=? WHERE id = ?",
      [
        vehicle_name,
        vehicle_type,
        capacity,
        license_plate,
        area,
        vehicle_colour,
        vehicle_year,
        vehicle_model,
        driver,
        school_id,
        id,
      ]
    );

    if (result.affectedRows === 1) {
      return res.status(200).json({
        message: "Vehicle updated successfully",
        success: true,
      });
    }

    return res.status(500).json({
      message: "Failed to update vehicle",
      success: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred",
      success: false,
      error: error.message,
    });
  } finally {
    if (conn) await conn.end();
  }
};

// Delete Vehicle API
export const deleteVehicleDetails = async (req, res) => {
  var conn;
  try {
    conn = await dbConnect();
    const { id } = req.body;

    // Check if the vehicle exists
    const [vehicleExists] = await conn.execute(
      "SELECT id FROM vehicles_details WHERE id = ?",
      [id]
    );

    if (!vehicleExists.length) {
      return res.status(400).json({
        message: "Vehicle does not exist",
        success: false,
      });
    }

    // Delete the vehicle
    const [result] = await conn.execute(
      "DELETE FROM vehicles_details WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 1) {
      return res.status(200).json({
        message: "Vehicle deleted successfully",
        success: true,
      });
    }

    return res.status(500).json({
      message: "Failed to delete vehicle",
      success: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred",
      success: false,
      error: error.message,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//get all parent
export const getAllParents = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();

    // Select all parents but exclude password field
    const [rows] = await conn.execute(
      "SELECT id, first_name, last_name, email ,phone_number FROM parent"
    );

    if (rows.length > 0) {
      return resp.status(200).json({
        parents: rows,
        success: true,
        total: rows.length,
      });
    } else {
      return resp.status(200).json({
        message: "No parents found",
        parents: [],
        success: true,
        total: 0,
      });
    }
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//get parent's all children
export const getParentChildren = async (req, resp) => {
  var conn;
  try {
    const id = req.query.id;
    if (!id) {
      return resp.status(404).json({
        message: "provide a parent ID",
        success: false,
      });
    }
    conn = await dbConnect();
    const [rows] = await conn.execute(
      "SELECT * FROM children where parent_id=?",
      [id]
    );
    if (rows.length > 0) {
      return resp.status(200).json({
        children: rows,
        success: true,
      });
    } else {
      return resp.status(200).json({
        message: "No children added",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (conn) await conn.end();
  }
};

// Get all prices from both tables
export const getAllPrices = async (req, resp) => {
  let conn;
  try {
    conn = await dbConnect();

    // Fetch data from both tables
    const [rateList1] = await conn.execute("SELECT * FROM rate_list1");
    const [rateListExt] = await conn.execute("SELECT * FROM rate_list_ext");

    return resp.status(200).json({
      success: true,
      data: {
        rateList1,
        rateListExt,
      },
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};

// Edit price in either table
export const editPrice = async (req, resp) => {
  let conn;
  try {
    conn = await dbConnect();
    const { id, singlePrice, morePrice } = req.body;

    // Validate required fields
    if (!id || !singlePrice || !morePrice) {
      return resp.status(400).json({
        message: "Missing required fields: id, table, and price are required",
        success: false,
      });
    }

    // // Validate table name
    // if (table !== 'rate_list1' && table !== 'rate_list_ext') {
    //   return resp.status(400).json({
    //     message: "Invalid table name. Must be 'rate_list1' or 'rate_list_ext'",
    //     success: false
    //   });
    // }

    // Update price in the specified table
    const result = await conn.execute(
      `UPDATE rate_list1 SET single_child	= ?,more_child=? WHERE id = ?`,
      [singlePrice, morePrice, id]
    );

    if (result[0].affectedRows === 0) {
      return resp.status(404).json({
        message: "Price record not found",
        success: false,
      });
    }

    return resp.status(200).json({
      message: "Price updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};

export const editSingleRidePrice = async (req, resp) => {
  let conn;
  try {
    conn = await dbConnect();
    const { id, singlePrice, morePrice } = req.body;

    // Validate required fields
    if (!id || !singlePrice || !morePrice) {
      return resp.status(400).json({
        message: "Missing required fields: id, table, and price are required",
        success: false,
      });
    }

    // // Validate table name
    // if (table !== 'rate_list1' && table !== 'rate_list_ext') {
    //   return resp.status(400).json({
    //     message: "Invalid table name. Must be 'rate_list1' or 'rate_list_ext'",
    //     success: false
    //   });
    // }

    // Update price in the specified table
    const result = await conn.execute(
      `UPDATE rate_list_ext SET single_child	= ?,more_child=? WHERE id = ?`,
      [singlePrice, morePrice, id]
    );

    if (result[0].affectedRows === 0) {
      return resp.status(404).json({
        message: "Price record not found",
        success: false,
      });
    }

    return resp.status(200).json({
      message: "Price updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};

export const editPerMilePrice = async (req, resp) => {
  let conn;
  try {
    conn = await dbConnect();
    const { id, perMile } = req.body;

    // Validate required fields
    if (!id || !perMile) {
      return resp.status(400).json({
        message: "Missing required fields: id, table, and price are required",
        success: false,
      });
    }

    // // Validate table name
    // if (table !== 'rate_list1' && table !== 'rate_list_ext') {
    //   return resp.status(400).json({
    //     message: "Invalid table name. Must be 'rate_list1' or 'rate_list_ext'",
    //     success: false
    //   });
    // }

    // Update price in the specified table
    const result = await conn.execute(
      `UPDATE rate_list_ext SET single_child	= ?  WHERE id = ?`,
      [perMile, id]
    );

    if (result[0].affectedRows === 0) {
      return resp.status(404).json({
        message: "Price record not found",
        success: false,
      });
    }

    return resp.status(200).json({
      message: "Price updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};


// create a ride
export const createRide = async (req, resp) => {
  let conn;
  try {
    conn = await dbConnect();
    const { driverId, vehicleId, schoolId, childId, pickupLocation, rideDate, rideTime } = req.body;

    if (!driverId || !vehicleId || !schoolId || !childId || !pickupLocation || !rideDate || !rideTime) {
      return resp.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const [rows] = await conn.execute(
      `INSERT INTO rides (driver_id, vehicle_id, school_id, child_id, pickup_location, ride_date, ride_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [driverId, vehicleId, schoolId, childId, pickupLocation, rideDate, rideTime]
    );

    if (rows.affectedRows === 1) {
      return resp.status(201).json({
        message: "Ride created successfully",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to create ride",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};