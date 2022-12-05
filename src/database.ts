import { v4 as uuidv4 } from "uuid";

interface Reading {
  // TODO: change this to contain whatever information is needed
  _uuid?: string;
  username?: string;
  password?: string;
  _auth_token?: string;
  _refresh_token?: string;
}

// This is a fake database which stores data in-memory while the process is running
// Feel free to change the data structure to anything else you would like
const database: Record<string, Reading> = {
  'user': {
    _uuid: uuidv4(),
    username: "userone",
    password: "12345678",
    _auth_token: "",
    _refresh_token: "",
  },
  'admin': {
    _uuid: uuidv4(),
    username: "administrator",
    password: "12345678",
    _auth_token: "",
    _refresh_token: "",
  },
  'staff': {
    _uuid: uuidv4(),
    username: "staff",
    password: "12345678",
    _auth_token: "",
    _refresh_token: "",
  }
};

/**
 * Store a reading in the database using the given key
 */
export const addReading = (key: string, reading: Reading): Reading => {
  database[key] = reading;
  return reading;
};

/**
 * Retrieve a reading from the database using the given key
 */
export const getReading = (key: string): Reading | undefined => {
  return database[key];
};
