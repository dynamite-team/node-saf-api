const { Schema, model } = require('mongoose');

const AlmaceneSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true
    },
    departamento: {
        type: String
    },
    barrio: {
        type: String
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    descripcion: { type: String },
    ubicacion: {
        lat: {
            type: String
        },
        lon: {
            type: String
        }
    }, inventario: [
        {
            producto: {
                type: Schema.Types.ObjectId,
                ref: 'Lote',
                required: true
            },
            cantidad: {
                type: Number,
                default: 0
            }
        }
    ]
},
    { timestamps: true }
);


AlmaceneSchema.methods.toJSON = function () {
    const { __v, estado, ...data } = this.toObject();
    return data;
}


module.exports = model('Almacene', AlmaceneSchema);
