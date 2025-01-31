import jwt from "jsonwebtoken"
const isAuthenticated= async (req, res, next)=>{
  try {
    const token =req.headers.authorization?.split(" ")[1]; 
    if(!token){
      return res.status(401).json({
        message:'user not authenticated',
        success:false
      })
    }
    const decode=await jwt.verify(token,process.env.SECRETE_KEY)
    // console.log(decode)
    if(!decode){
      return res.status(401).json({
        message:'invalid token',
        success:false
      })
    }
    req.id=decode.userId
    next()
  } catch (error) {
    console.log(error)
  }
}
export default isAuthenticated