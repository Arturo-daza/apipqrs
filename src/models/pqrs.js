const mongoose = require("mongoose");

const pqrSchema = mongoose.Schema({
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
    enum: ["Creado", "Resultado"],
    default: "Creado",
  },
  justificacion: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("PQR", pqrSchema);
