const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router(); // Manejador de rutas de express
const userSchema = require("../models/user");
const jwt = require("jsonwebtoken");
const verifyToken = require("./validate_token");

router.post("/signup", async (req, res) => {
  const { usuario, correo, clave, tipo_de_usuario } = req.body;

  // Validar que se reciban todos los campos requeridos
  if (!usuario || !correo || !clave || !tipo_de_usuario) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  // Validar el tipo de usuario
  const tiposValidos = ["gestor", "usuario"];
  if (!tiposValidos.includes(tipo_de_usuario)) {
    return res.status(400).json({ error: "Tipo de usuario no válido" });
  }

  // Crear un nuevo usuario
  const user = new userSchema({
    usuario: usuario,
    correo: correo,
    clave: clave,
    tipo_de_usuario: tipo_de_usuario,
  });

  // Guardar el usuario en la base de datos
  await user.save(); // save es un método de mongoose para guardar datos en MongoDB

  // Generar un token JWT
  const token = jwt.sign({ id: user._id }, process.env.SECRET, {
    expiresIn: 60 * 60 * 24, // un día en segundos
  });

  res.json({
    auth: true,
    token: token,
    user,
  });
});

// Inicio de sesión
router.post("/login", async (req, res) => {
  const { correo, clave } = req.body;

  // Validar que se reciban todos los campos requeridos
  if (!correo || !clave) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  // Buscar el usuario por su dirección de correo
  const user = await userSchema.findOne({ correo: correo });

  // Validar si no se encuentra el usuario
  if (!user) {
    return res.status(400).json({ error: "Usuario o clave incorrectos" });
  }

  // Comparar la clave ingresada con la clave almacenada en la base de datos
  const validPassword = await bcrypt.compare(clave, user.clave);
  if (!validPassword) {
    return res.status(400).json({ error: "Usuario o clave incorrectos" });
  }

  // Generar un token JWT
  const expiresIn = 24 * 60 * 60;
  const accessToken = jwt.sign(
    { id: user.id }, 
    process.env.SECRET, {
      expiresIn: expiresIn
    }
  );

  res.json({ accessToken });
});

module.exports = router;
