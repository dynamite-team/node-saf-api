const { Schema, model } = require('mongoose');

const LoteSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true
    },
    estado: {
        type: Boolean,
        default: true,
        required: true
    },
    producto: {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    precio: {
        type: Number,
        required: true,
        default: 0
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
},
    { timestamps: true }
);


LoteSchema.methods.toJSON = function () {
    const { __v, estado, ...data } = this.toObject();
    return data;
}


module.exports = model('Lote', LoteSchema);