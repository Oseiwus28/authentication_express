const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const dbConnect = require("./dbConnect");
const User = require("./user");

// encrypt the password using bcrypt
const bcrypt = require("bcrypt")

// package for cookies
const expressSession = require ("express-session")

const port = process.env.PORT || 2000;
const APP_SECRET = process.env.APP_SECRET

const app = express();

// creating the cookies
app.use(expressSession({
  secret:APP_SECRET,
  resave:false,
  saveuninitialized: true,
  cookie: {}
}))

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("server is working");
});

// user registration
app.post("/register", async(req, res) => {
try{
  // assessing the user input
  const {user_name,password} = req.body;
  const hashpassword = await bcrypt.hash(password,10)
  console.log(hashpassword);
  const result =  await User.create({'userName':user_name,"password":hashpassword})
  console.log(result);
  if(result)
    return res.send("user crested successfully")

    res.send("unable to create user")
 } catch(error)
{
  res.send("unable to handle request now")
}
});

// user login
app.post("/login",async(req,res)=>{
  const {user_name,password}= req.body

  const result = await User.findOne({where:{"userName":user_name}})
  if(!result)
    return res.send("invalid credentia;, try again")
  
    //checking password  
  const userCorrectPassword = result.password
  // compare hashed password with provided password
  const IsPasswordCorrect = await bcrypt.compare(password, userCorrectPassword)
  if(!IsPasswordCorrect)
    return res.send("Invalid crendential, try again")

  req.session.User = result.id
  res.send("Login successfully!!!")
});

// credentials authentication
const IsUserAuthenticated = (req,res,next)=>{
  if(req.session.User)
    return next()

    res.send("Kindly login, first")
}

// Home page
app.get("/home-page",IsUserAuthenticated,async(req,res)=>{
 try{
  const userID= req.session.User
  const userInfo= await User.findOne({where:{id:userID}})
  res.send(`Welcome ${userInfo.userName}`)

 }catch(error){
  res.send("Unable to handle request")
 }
});

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
  dbConnect.authenticate()
});
