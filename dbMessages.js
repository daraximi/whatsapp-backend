import mongoose from "mongoose";


//json requirements for the database
const whatsappSchema = mongoose.Schema(
    {
        message: String,
        name: String,
        timestamp: String,
        received: Boolean
    }
);

//collection
export default mongoose.model('messagecontents', whatsappSchema);
