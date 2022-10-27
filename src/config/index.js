const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT,
  atlas: process.env.ATLAS,
  secret_key: process.env.SECRET_KEY,
  cloudinary_key: process.env.CLOUDINARY_URL,
};
