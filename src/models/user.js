const mongoose = require("mongoose"); // importando el componente mongoose
const bcrypt = require("bcrypt"); // importando el componente bcrypt

// Definición del esquema de usuario
const userSchema = mongoose.Schema({
  usuario: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
    unique: true, // Asegura que no haya correos duplicados
  },
  clave: {
    type: String,
    required: true,
  },
  tipo_de_usuario: {
    type: String,
    enum: ["gestor", "usuario"], 
    default: "usuario"
  },
});

userSchema.methods.encryptClave = async (clave) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(clave, salt);
};
module.exports = mongoose.model("User", userSchema);
