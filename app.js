const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");

const { port } = require("./src/config");

//Database
require("./src/database");

const app = express();

//Path
const paths = {
  auth: "/api/v1/auth",
  buscar: "/api/v1/buscar",
  categorias: "/api/v1/categorias",
  productos: "/api/v1/productos",
  usuarios: "/api/v1/usuarios",
  uploads: "/api/v1/uploads",
};

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(morgan("dev"));

//Public directory
app.use(express.static("public"));

//Settings
app.set("port", port || 3000);

//Routes
app.use(paths.auth, require("./src/routes/auth"));
app.use(paths.buscar, require("./src/routes/buscar"));
app.use(paths.categorias, require("./src/routes/categorias"));
app.use(paths.productos, require("./src/routes/productos"));
app.use(paths.usuarios, require("./src/routes/usuarios"));
app.use(paths.uploads, require("./src/routes/uploads"));

app.listen(app.get("port"), () =>
  console.log(`Servidor corriendo en el puerto ${app.get("port")}`)
);
