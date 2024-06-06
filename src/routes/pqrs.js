const express = require("express");
const router = express.Router(); //manejador de rutas de express
const pqrsSchema = require("../models/pqrs"); //Nuevo animal
const verifyToken = require("./validate_token");
const { verify } = require("jsonwebtoken");
const User = require("../models/user");

// Ruta POST para crear PQRS, solo los usuarios
router.post("/pqrs", verifyToken, async (req, res) => {
  try {
    // Buscar el usuario por su ID
    const usuario = await User.findById(req.user.id);

    // Verificar que el usuario exista y sea de tipo "usuario"
    if (!usuario || usuario.tipo_de_usuario !== "usuario") {
      return res
        .status(403)
        .json({ error: "Solo los usuarios pueden crear PQRS" });
    }

    // Crear una nueva PQRS utilizando los datos recibidos en la solicitud
    const nuevaPQRS = new pqrsSchema({
      tipo: req.body.tipo,
      comentarios: req.body.comentarios,
      anexo: req.body.anexo || null,
      usuario: req.user.id,
    });

    // Guardar la nueva PQRS en la base de datos
    await nuevaPQRS.save();

    // Responder con la PQRS creada
    res
      .status(201)
      .json({ message: "PQRS creada correctamente", pqr: nuevaPQRS });
  } catch (error) {
    // Manejar errores
    console.error("Error al crear la PQRS:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta GET para obtener todas las PQRS creadas
router.get("/pqrs", verifyToken, async (req, res) => {
  console.log("si esta solicitando");
  try {
    const usuario = await User.findById(req.user.id);
    if (usuario.tipo_de_usuario === "gestor") {
      // Si el usuario es tipo "gestor", obtener todas las PQRS sin restricciones
      const pqrs = await pqrsSchema.find();
      res.json(pqrs);
    } else {
      // Buscar todas las PQRS creadas por el usuario
      const pqrs = await pqrsSchema.find({ usuario: req.user.id });
      res.json(pqrs);
    }
  } catch (error) {
    // Manejar errores
    console.error("Error al obtener las PQRS del usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta GET para obtener una única PQRS creada por el usuario o todas las PQRS para usuarios de tipo "gestor"
router.get("/pqrs/:id", verifyToken, async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    // Verificar si el usuario es de tipo "gestor"
    if (usuario.tipo_de_usuario === "gestor") {
      // Si es de tipo "gestor", buscar la PQRS por ID sin verificar el usuario
      const pqrs = await pqrsSchema.findById(req.params.id);
      if (!pqrs) {
        return res.status(404).json({ error: "PQRS no encontrada" });
      }
      // Responder con la PQRS encontrada
      return res.json({ pqr: pqrs });
    }

    // Si el usuario no es de tipo "gestor", verificar si la PQRS con el ID especificado existe y pertenece al usuario
    const pqrs = await pqrsSchema.findOne({
      _id: req.params.id,
      usuario: req.user.id,
    });
    if (!pqrs) {
      return res
        .status(404)
        .json({ error: "PQRS no encontrada o no autorizada" });
    }

    // Responder con la PQRS encontrada
    res.json({ pqr: pqrs });
  } catch (error) {
    // Manejar errores
    console.error("Error al obtener la PQRS:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Ruta PUT para actualizar una PQRS creada por el usuario
router.put("/pqrs/:id", verifyToken, async (req, res) => {
  try {
    // Verificar si la PQRS con el ID especificado existe
    const pqrs = await pqrsSchema.findById(req.params.id);
    if (!pqrs) {
      return res.status(404).json({ error: "PQRS no encontrada" });
    }

    // Verificar si el usuario es de tipo "gestor"
    const usuario = await User.findById(req.user.id);
    if (usuario.tipo_de_usuario === "gestor") {
      // Si es de tipo "gestor", permitir modificar el estado y la justificación
      pqrs.estado = req.body.estado || pqrs.estado;
      pqrs.justificacion = req.body.justificacion || pqrs.justificacion;
    } else {
      // Si no es de tipo "gestor", verificar si la PQRS pertenece al usuario
      if (pqrs.usuario.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para actualizar esta PQRS" });
      }

      // Actualizar la PQRS con los datos proporcionados en la solicitud
      pqrs.tipo = req.body.tipo || pqrs.tipo;
      pqrs.comentarios = req.body.comentarios || pqrs.comentarios;
      pqrs.anexo = req.body.anexo || pqrs.anexo;
    }

    // Guardar la PQRS actualizada en la base de datos
    await pqrs.save();

    // Responder con la PQRS actualizada
    res.json({ message: "PQRS actualizada correctamente", pqr: pqrs });
  } catch (error) {
    // Manejar errores
    console.error("Error al actualizar la PQRS:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
// Ruta DELETE para eliminar una PQRS creada por el usuario
router.delete("/pqrs/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  pqrsSchema
    .findByIdAndDelete({ _id: id })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

module.exports = router;
