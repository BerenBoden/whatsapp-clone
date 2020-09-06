import mongoose from 'mongoose';

//Declaring data schema
const whatsappSchema = mongoose.Schema({
    message: String, 
    name: String,
    timestamp: String, 
    received: Boolean
})

//Collection
export default mongoose.model('messagecontents', whatsappSchema)