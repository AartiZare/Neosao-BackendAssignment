const productModel = require("../models/productModel");
const upload = require("../upload/upload");
const ObjectId = require('mongoose').Types.ObjectId


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}

//---------------------------------------------------Add Product----------------------------------------------------------//

const product = async function(req, res){
    try{
        if(Object.keys(req.body).length == 0){
            return res.status(400).send({status: false, msg: "Enter valid data in req body"});
        }
        let data  = req.body;
        const {name, description, sellingUnit, price, tag} = data;

        if(!isValid(name)){
            return res.status(400).send({status: false, msg: "Please Enter Product name"})
        }
        let uniqueName = await productModel.findOne({name: name})
        if(uniqueName){
            return res.status(400).send({status:false, msg: "This ProductName is already present"})
        }

        if(!isValid(description)){
            return res.status(400).send({status: false, msg: "Plese enter product description"})
        }

        if(!price){
            return res.status(400).send({status: false, msg: "Enter the product price"})
        }
        if(!Number(price)){
            return res.status(400).send({status: false, msg: "Price should be valid"})
        }
        if(Number(price) <= 0){
         return res.status(400).send({status:false,msg:'price is not valid'})
        }
        data.price = Number(price);

        if(!sellingUnit){
            return res.status(400).send({status: false, msg: "Enter the Selling Unit"})
        }
        if(!Number(sellingUnit)){
            return res.status(400).send({status: false, msg: "Selling unit should be valid"})
        }
        if(Number(sellingUnit) <= 0){
         return res.status(400).send({status:false,msg:'Selling unit is not valid'})
        }
        data.sellingUnit = Number(sellingUnit);

        if(tag) {
            if(Array.isArray(tag)) {
                data['tag'] = [...tag]
            }
            if(Object.prototype.toString.call(tag) === '[object String]') {
                data['tag'] = [ tag ]
            }
        }

        const newProduct = await productModel.create(data)
        return res.status(201).send({status: true, msg: "New product created successfully", data: newProduct})
    }
    catch(error){
        return res.status(500).send({status: false, msg: error.message})
    }
}
module.exports.product = product;



//------------------------------------------------------Add Images for the Product-----------------------------------------------//

const addImage = async function(req, res){
    try{
        let productId = req.params.productId;
        if(!ObjectId.isValid(productId)){
         return res.status(400).send({status:false,msg:'product Id is not valid'})
        }
        let product = await productModel.findOne({_id:productId, isDeleted : false})
        if(!product) {
        return res.status(404).send({status:false,msg:'no product found'})
        }

        let data = req.body;

        let files = req.files;

        if (!files || files.length == 0){
         return res.status(400).send({status:false,msg:'please add the file'})
        }
        //upload to s3 and get the uploaded link
        var uploadedFileURL = await upload.uploadFile(files[0]); 
        data.productImage = uploadedFileURL

        //   if product image is present
        if(req.files && req.files.length >0){
            //upload to s3 and get the uploaded link
            var uploadedFileURL = await upload.uploadFile(files[0]);
            data.productImage = uploadedFileURL
        }

        var maxfilesize = 512 * 512, 
        filesize = files[0].size
       
        if ( filesize > maxfilesize )
        {
            return res.status(400).send({status: false, msg: "File to large, Maximum size should be 512kb "})
        }
            let addProductImage = await productModel.findOneAndUpdate({_id:productId, isDeleted:false}, {$push:data},{new:true})
            return res.status(200).send({status:true,msg:'successfully updated', data : addProductImage})
        }
    catch(error){
        return res.status(500).send({status: false, msg: error.message})
    }
}
module.exports.addImage = addImage




//-----------------------------------------------Fetch Product By req.params-------------------------------------------------------------------//

const fetchProductById = async function(req,res){
    try{
         let productId = req.params.productId;
         if(!ObjectId.isValid(productId)){
            return res.status(400).send({status: false, msg: "Enter valid ProductId"});
         }
         let product = await productModel.findOne({_id: productId})
         if(!product){
            return res.status(404).send({status: false, msg: "No produts found"})
         }
         return res.status(200).send({status: false, msg: "Product details", data: product})
    }
    catch(error){
        return res.status(500).send({status: false, msg: error.message})
    }
}
module.exports.fetchProductById = fetchProductById




//----------------------------------------------------------fetch Product by req.query--------------------------------------------------------//

 const fetchProduct = async function(req, res){
    try{
         let filterQuery = {isDeleted: false}
         let query = req.query;
         let {name, tag} = query;

            if(Object.keys(req.query).length > 0){
            if(name){
                if(!isValid(name)) return res.status(400).send({status:false,msg:'enter the valid name in filter Query'})
                const regexName = new RegExp(name,"i")
                filterQuery.title = {$regex : regexName}
            }

            if(isValid(tag)) {
                const tagsArr = tag.trim().split(',').map(tag => tag.trim());
                filterQuery['tag'] = {$all : tagsArr}
            }
         }

         let products = await productModel.find(filterQuery);
         if(products.length == 0) {
         return res.status(404).send({status:false,msg:'No product found'})
         }
         return res.status(200).send({status:true,msg:'products found successfully', data:products})
    }
    catch(error){
        return res.status(500).send({status: false, msg: error.message})
    }
}
module.exports.fetchProduct = fetchProduct