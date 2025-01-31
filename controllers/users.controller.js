import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "../utils/dbConnect.js";

//register
export const register = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { firstName, lastName, email, phoneNumber, password } = req.body;
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return resp.status(400).json({
        message: "something is missing",
        success: false,
      });
    }

    const [rows] = await conn.execute(`SELECT * FROM parent where email=?`, [email]);
    if (rows[0]) {
      return resp.status(400).json({
        message: "this email already exists",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await conn.execute(
      "INSERT INTO parent (first_name, last_name, email, phone_number, password) VALUES (?,?, ?, ?, ?)",
      [firstName, lastName, email, phoneNumber, hashedPassword]
    );
    console.log(user);
    const result = user[0];
    if (result.affectedRows === 1) {
      return resp.status(201).json({
        message: "Account created successfully",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to create account",
        success: false,
      });
    }
  } catch (err) {
    console.log(err);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//login
export const login = async (req, resp) => {
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
    const [rows] = await conn.execute(`SELECT * FROM parent where email=?`, [email]);
    var user = rows[0];
    if (!user) {
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
      userId: user.id,
    };
    const token = await jwt.sign(tokenData, process.env.SECRETE_KEY, {
      expiresIn: "30d",
    });
    user = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
    };

    return resp.status(200).json({
      message: "welcome back " + user.first_name,
      user,
      success: true,
      token: token,
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

    // Check if user exists
    const [rows] = await conn.execute(`SELECT * FROM parent WHERE email=?`, [email]);
    const user = rows[0];
    if (!user) {
      return resp.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in database
    const [result] = await conn.execute(
      `UPDATE parent SET password = ? WHERE email = ?`,
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

//logout
export const logout = async (req, resp) => {
  try {
    return resp.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "logout success",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//add child
export const addChild = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { firstName, lastName, grade, dob, teacher, allergies, pickupAddr, school, childSeat } = req.body;
    if (!firstName || !lastName || !grade || !dob || !teacher || !allergies || !pickupAddr || !school ) {
      console.log(firstName, lastName, grade, dob, teacher, allergies, pickupAddr, school, childSeat);
      return resp.status(400).json({
        message: "something is missing",
        success: false,
      });
    }

    const userId = req.id; //middleware auth
    console.log(userId);

    const child = await conn.execute(
      "INSERT INTO children (first_name, last_name, grade, dob, teacher, allergies, pickup_address, school_address, child_seat, parent_id) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [firstName, lastName, grade, dob, teacher, allergies, pickupAddr, school, childSeat, userId]
    );

    var result = child[0];
    if (result.affectedRows === 1) {
      return resp.status(201).json({
        message: "Child added successfully",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to create account",
        success: false,
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

//getAllChild
export const getAllChild = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const id = req.id;
    const [rows] = await conn.execute(
      "SELECT * FROM children where parent_id=?", [id]
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
    return resp.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (conn) await conn.end();
  }
};

//get single child
export const getSingleChild = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const id = req.id;
    const childId = req.query.child;
    console.log(childId, id)
    
    const [rows] = await conn.execute(
      "SELECT * FROM children where parent_id=? and id=?", [id, childId]
    );
    console.log(rows)
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
    console.error(error);
    return resp.status(500).json({
      success: false,
      message: 'An error occurred while fetching the child.',
    });
  } finally {
    if (conn) await conn.end();
  }
};

//Edit child
export const editChild = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { childId, firstName, lastName, grade, dob, teacher, allergies, pickupAddr, school, childSeat } = req.body;
    console.log(childId, firstName, lastName, grade, dob, teacher, allergies, pickupAddr, school, childSeat)
    if (!firstName || !lastName || !grade || !dob || !teacher || !allergies || !pickupAddr || !school  || !childId) {
      console.log(firstName, lastName, grade, dob, teacher, allergies, pickupAddr, school, childSeat, childId);
      return resp.status(400).json({
        message: "something is missing",
        success: false,
      });
    }

    const result = await conn.execute(
      "UPDATE children SET first_name = ?, last_name = ?, grade = ?, dob = ?, teacher = ?, allergies = ?, pickup_address = ?, school_address = ?, child_seat = ? WHERE id = ?",
      [firstName, lastName, grade, dob, teacher, allergies, pickupAddr, school, childSeat, childId]
    );
    if (result[0].affectedRows === 1) {
      return resp.status(201).json({
        message: "Child edited successfully",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to edit child",
        success: false,
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

//delete child
export const deleteChild = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const { childId } = req.body;

    if (!childId) {
      return resp.status(400).json({
        message: "Child ID is missing",
        success: false,
      });
    }

    const [childRows] = await conn.execute(
      "SELECT * FROM children WHERE id = ? AND parent_id = ?",
      [childId, req.id]
    );

    if (childRows.length === 0) {
      return resp.status(400).json({
        message: "Child not found or you don't have permission to delete this child",
        success: false,
      });
    }

    const result = await conn.execute(
      "DELETE FROM children WHERE id = ?",
      [childId]
    );

    if (result[0].affectedRows === 1) {
      return resp.status(200).json({
        message: "Child deleted successfully",
        success: true,
      });
    } else {
      return resp.status(500).json({
        message: "Failed to delete child",
        success: false,
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

//get user profile
export const getProfile = async (req, resp) => {
  var conn;
  try {
    conn = await dbConnect();
    const id = req.id;
    console.log( id," get profile")
    
    const [rows] = await conn.execute(
      "SELECT id,first_name,last_name,phone_number,email FROM parent where  id=?", [id]
    );
    console.log(rows)
    if (rows.length > 0) {
      console.log(rows)
      return resp.status(200).json({
        userData: rows,
        success: true,
      });
    } else {
      return resp.status(200).json({
        message: "user data not found",
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    return resp.status(500).json({
      success: false,
      message: 'An error occurred while fetching the User.',
    });
  } finally {
    if (conn) await conn.end();
  }
};