const path = require("path");
const fs = require("fs");

const EVN = process.env.NODE_ENV || "development";

const envFiles = [`.env.${EVN}.local`, `.env.${EVN}`, `.env.local`, `.env`];

envFiles.forEach((file) => {
  const envFilePath = path.resolve(process.cwd(), file);

  if (fs.existsSync(envFilePath)) {
    require("dotenv").config({ path: envFilePath });
    // console.log(`✅ Loaded env variables from ${file}`);
  }
});

const getEnv = (key, defaultValue = null) => {
  const value = process.env[key] || defaultValue;

  if (value === null || value === undefined || value === "") {
    throw new Error(`Missing env: ${key}`);
  }

  return value;
};

const getEnvNumber = (key, defaultValue = null) => {
  const value = process.env[key] || defaultValue;

  if (value === null || value === undefined || value === "") {
    throw new Error(`Missing env: ${key}`);
  }

  const num = Number(value);

  if (isNaN(num)) {
    throw new Error(`Invalid number for env: ${key}`);
  }

  return num;
};

const getEnvBoolean=(key,defaultValue=null)=>{
    const value = process.env[key] || defaultValue;

    if (value === null || value === undefined || value === "") {
      throw new Error(`Missing env: ${key}`);
    }   

    return value.toLowerCase() === "true" || value === "YES";
}

module.exports = {
  getEnv,
  getEnvNumber,
  getEnvBoolean
};
