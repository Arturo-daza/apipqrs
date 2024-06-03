const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router(); //manejador de rutas de express
const userSchema = require("../models/user");
const jwt = require("jsonwebtoken");
const verifyToken = require("./validate_token");

//Revisar esta forma de autenticarse https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs
router.post("/signup", async (req, res) => {
  const { usuario, correo, clave } = req.body;
  const user = new userSchema({
    usuario: usuario,
    correo: correo,
    clave: clave,
  });
  user.clave = await user.encryptClave(user.clave);
  await user.save(); //save es un método de mongoose para guardar datos en MongoDB //segundo parámetro: un texto que hace que el código generado sea único //tercer parámetro: tiempo de expiración (en segundos, 24 horas en segundos)
  //primer parámetro: payload - un dato que se agrega para generar el token
  const token = jwt.sign({ id: user._id }, process.env.SECRET, {
    expiresIn: 60 * 60 * 24, //un día en segundos
  });
  res.json({
    auth: true,
    token: token,
    user,
  });
});

//inicio de sesión
router.post("/login", async (req, res) => {
  // validaciones
  const { error } = userSchema.validate(req.body.correo, req.body.clave);
  if (error) return res.status(400).json({ error: error.details[0].message });
  //Buscando el usuario por su dirección de correo
  const user = await userSchema.findOne({ correo: req.body.correo });

  //validando si no se encuentra
  if (!user)
    return res.status(400).json({ error: "Usuario o clave incorrectos" });

  //Transformando la contraseña a su valor original para
  //compararla con la clave que se ingresa en el inicio de sesión
  const validPassword = await bcrypt.compare(req.body.clave, user.clave);
  let accessToken = null;
  if (!validPassword) {
    return res.status(400).json({ error: "Usuario o clave incorrectos" });
  } else {
    const expiresIn = 24 * 60 * 60;
    accessToken = jwt.sign(
      { id: user.id }, 
      process.env.SECRET, {
      expiresIn: expiresIn
    });

   /*res.json({
      id: user._id,
      usuario: user.usuario,
      correo: user.correo,
      clave: user.clave,
      accessToken: accessToken,
      expiresIn: expiresIn,
    });*/
    res.json({accessToken});
  }
});
module.exports = router;
