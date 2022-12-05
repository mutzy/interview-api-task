import express, { Express } from "express";
import helmet from "helmet";
import dotenv from "dotenv";

const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");

import { generateToken, verifyToken } from "./auth";
import { addReading, getReading } from "./database";

dotenv.config();

const PORT = process.env.PORT || 3000;
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const app: Express = express();

app.use(helmet());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

app.post("/auth/login", async (req, res) => {
  // Retrieve and spread the request body to required fields
  const { username, password, role } = req.body;

  // Check if username and password exist in fake DB
  if (
    username === getReading(role)?.username &&
    password === getReading(role)?.password
  ) {
    // Generate authorization token and refresh token to be returned
    const _auth_token = await generateToken(
      username,
      "5m",
      "AUTH_TOKEN_SECRET"
    );
    const _refresh_token = await generateToken(
      username,
      "7d",
      "REFRESH_TOKEN_SECRET"
    );
    // set uathoriization header to auth token
    req.headers.authorization = _auth_token;
    // Store refresh token in cookies expiring in 7 days
    res.cookie("jwt", _refresh_token, { maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("role", role, { maxAge: 7 * 24 * 60 * 60 * 1000 });

    // update and add tokens to database
    addReading(role, {
      ...getReading(role),
      _refresh_token: _refresh_token,
      _auth_token: _auth_token,
    });

    // Return auth_token as response with status 200
    return res.status(200).json({
      auth_token: _auth_token,
    });
  } else {
    // Throw unanuthorized error message and 401 status
    return res.status(401).json({
      Error: "Invalid username or password!",
    });
  }
});

app.get("/auth/refresh", async (req, res) => {
  const refresh_token = req.cookies.jwt;
  const role = req.cookies.role;

  const username = await getReading(role)?.username;

  let payload: unknown;
  if (req.cookies?.jwt) {
    // verify refresh token
    try {
      // Parse the JWT string and store the result in `payload`.
      // Note that we are passing the key in this method as well. This method will throw an error
      // if the token is invalid (if it has expired according to the expiry time we set on sign in),
      // or if the signature does not match
      payload = await verifyToken(refresh_token, REFRESH_TOKEN_SECRET);
      if (payload) {
        // Regenerate both auth and refresh token anew if payload is verified
        const _auth_token = await generateToken(
          username,
          "5m",
          "AUTH_TOKEN_SECRET"
        );
        const _refresh_token = await generateToken(
          username,
          "7d",
          "REFRESH_TOKEN_SECRET"
        );

        req.headers.authorization = _auth_token;

        // Store refresh token in cookies expiring in 7 days
        res.cookie("jwt", _refresh_token, { maxAge: 7 * 24 * 60 * 60 * 1000 });

        // update and add tokens to database
        addReading(role, {
          ...getReading(role),
          _refresh_token: _refresh_token,
          _auth_token: _auth_token,
        });

        return res.status(200).json({ auth_token: _auth_token });
      }
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        // if the error thrown is because the JWT is unauthorized, return a 401 error
        return res.status(401).json({ error: e });
      }
      // otherwise, return a bad request error
      return res.status(400).json({ error: e });
    }
  }

  return res.status(401).json({ message: "Authorization error" });
});

app.get("/api/whoami", async (req, res) => {
  const role = req.cookies.role;

  // get auth token from header authorization
  let auth_token = (<string>req.headers.authorization).split(" ")[1];

  try {
    // verify authorization token
    let payload = await verifyToken(auth_token, AUTH_TOKEN_SECRET);
    const username = await getReading(role)?.username;
    // If verified return username object as a response
    if (payload) {
      return res.status(200).json({ username: username });
    }
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      // if the error thrown is because the JWT is unauthorized, return a 401 error
      return res.status(401).json({ error: e });
    }
    // If token not verified return error
    return res.status(401).json({ error: e });
  }
});

app.post("/data", async (req, res) => {
  // TODO: parse incoming data, and save it to the database
  // data is of the form:
  //  {timestamp} {name} {value}

  // addReading(...)

  return res.json({ success: false });
});

app.get("/data", async (req, res) => {
  // TODO: check what dates have been requested, and retrieve all data within the given range

  // getReading(...)

  return res.json({ success: false });
});

app.listen(PORT, () => console.log(`Running on port ${PORT} ⚡`));
