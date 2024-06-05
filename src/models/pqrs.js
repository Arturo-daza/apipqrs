const mongoose = require("mongoose");

const pqrsSchema = mongoose.Schema({
  fecha: {
    type: Date,
    default: Date.now,
  },
  tipo: {
    type: String,
    enum: ["Peticiones", "Quejas", "Reclamos", "Sugerencias"],
    required: true,
  },
  comentarios: {
    type: String,
    required: true,
  },
  anexo: {
    type: String,
    default: null,
  },
  estado: {
    type: String,
    enum: ["Creado", "En Atención", "Resuelto"],
    default: "Creado",
  },
  justificacion: {
    type: String,
    default: null,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

module.exports = mongoose.model("PQRS", pqrsSchema);
