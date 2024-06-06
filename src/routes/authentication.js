const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router(); // Manejador de rutas de express
const userSchema = require("../models/user");
const jwt = require("jsonwebtoken");
const verifyToken = require("./validate_token");

router.post("/signup", async (req, res) => {
  const { usuario, correo, clave, tipo_de_usuario } = req.body;

  // Validar que se reciban todos los campos requeridos
  if (!usuario || !correo || !clave) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const existingUser = await userSchema.findOne({ correo: correo });
  if (existingUser) {
    return res.status(400).json({ error: "El correo ya está registrado" });
  }

  // Validar el tipo de usuario
  const tiposValidos = ["gestor", "usuario"];
  if (tipo_de_usuario & !tiposValidos.includes(tipo_de_usuario)) {
    return res.status(400).json({ error: "Tipo de usuario no válido" });
  }

  // Crear un nuevo usuario
  const user = new userSchema({
    usuario: usuario,
    correo: correo,
    clave: clave,
    tipo_de_usuario: tipo_de_usuario,
  });

  user.clave = await user.encryptClave(user.clave);

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
    return res
      .status(400)
      .json({ error: "Usuario no existe en la base de datos" });
  }

  // Comparar la clave ingresada con la clave almacenada en la base de datos
  const validPassword = await bcrypt.compare(req.body.clave, user.clave);
  let accessToken = null;
  if (!validPassword) {
    return res.status(400).json({ error: "Clave incorrecta" });
  } else {
    const expiresIn = 24 * 60 * 60;
    accessToken = jwt.sign({ id: user.id }, process.env.SECRET, {
      expiresIn: expiresIn,
    });
    res.json({ datosUsuario: {accessToken: accessToken,  usuario: user.usuario, tipo_de_usuario:user.tipo_de_usuario, id: user.id} });
  }
});

// Endpoint para obtener todos los usuarios
router.get("/users", async (req, res) => {
  try {
    const users = await userSchema.find(); // Excluir el campo 'clave' de los resultados
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
});

// Endpoint para eliminar un usuario por su ID
router.delete("/users/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Buscar y eliminar el usuario por su ID
    const deletedUser = await userSchema.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
});

module.exports = router;
