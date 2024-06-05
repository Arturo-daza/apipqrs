const express = require("express");
const parser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;
const authRoutes = require("./routes/authentication");
const pqrsRoutes = require("./routes/pqrs");
const mongoose = require("mongoose");
require("dotenv").config();

// Habilitar CORS para todos los orígenes
app.use(cors());

app.use(parser.urlencoded({ extended: false })); // permite leer los datos que vienen en la petición
app.use(parser.json()); // transforma los datos a formato JSON

// Gestión de las rutas usando el middleware
app.use("/api", authRoutes);
app.use("/api", pqrsRoutes);
app.use(express.json()); // Conexión a la base de datos

// Conexión a la base de datos
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Conexión exitosa"))
  .catch((error) => console.log(error));

// Conexión al puerto
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
