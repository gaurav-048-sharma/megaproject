const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {//ternary operator
        url: String,
        // set: (v) => v === ""? "https://images.pexels.com/photos/236047/pexels-photo-236047.jpeg?cs=srgb&dl=clouds-cloudy-countryside-236047.jpg&fm=jpg" :
        //  v,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    // owner: {
    //     type: Schema.Types.ObjectId,
    //     ref: "User",
    // },
    // geometry: {
    //     type: {
    //         type: String, // Don't do `{ location: { type: String } }`
    //         enum: ["Point"], // 'location.type' must be 'Point'
    //         required: true,
    //       },
    //       coordinates: {
    //         type: [Number],
    //         required: true,
    //       },
    //     },
    });

// listingSchema.post("findOneAndDelete", async (listing) => {
//     if (listing){
//         await Review.deleteMany({_id : {$in: listing.reviews}});
//     }   
// });

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;