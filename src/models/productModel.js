const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            unique: true
        },
        description:{
            type: String,
            required: true
        },
        price:{
            type: Number,
            required: true
        },
        sellingUnit:{
            type: Number,
            default: 1
        },
        productImage:[  String  ],
        isDeleted:{
            type: Boolean,
            default: false
        },
        tag: [
              { 
                type: String, 
                required: [
                    true,
                     'tags are required'
                    ] 
                } 
            ]
    }, {timestamps: true})
module.exports = mongoose.model('products', productSchema)
