const mongoose = require("mongoose");

const { atlas } = require("../config");

mongoose
    .connect(atlas, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Conectado a la base de datos"))
    .catch((err) => console.error("ERROR AL CONECTAR DB: ", err));
