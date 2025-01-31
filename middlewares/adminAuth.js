import jwt from "jsonwebtoken";
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "user not authenticated",
        success: false,
      });
    }
    const decode = await jwt.verify(token, process.env.SECRETE_KEY);
    // console.log(decode)
    if (!decode) {
      return res.status(401).json({
        message: "invalid token",
        success: false,
      });
    }
    const admintoken = decode.userId.split(" ");
    console.log(admintoken);
    req.id = admintoken[0];
    if (admintoken[1] === "admin") {
      console.log("yes its from admin");
      next();
    }
    else{
      console.log('else ran')
      return res.status(401).json({
        message: "Unauthorized request",
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json(
     error
    );
  }
};
export default isAdmin;
