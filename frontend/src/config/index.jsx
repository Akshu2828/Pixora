const { default: axios } = require("axios");

export const BASE_URL = "http://https://pixora-65rs.onrender.com";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
