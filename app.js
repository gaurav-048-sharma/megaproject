const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const Listing = require("./model/listing.js");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlusts";
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./model/review.js");
main().then(() => {
    console.log("connected to db");
}).catch(() => {
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_URL);
}




app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
    res.send("hey");
});


const validateListing = (req, res, next) => {
    let {error}= listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.datails.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }

}
const validateReview = (req, res, next) => {
    let {error}= reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.datails.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }

}

//index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }));
  
   
     //new route
     app.get("/listings/new", async(req, res) => {
        res.render("listings/new.ejs");
     })
//show route
    app.get("/listings/:id",wrapAsync( async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id).populate("reviews");
        res.render("listings/show.ejs", { listing });
      }));
     

      
      //Create Route
      app.post("/listings",
      validateListing,wrapAsync( async (req, res) => {
        
        const newListing = new Listing(req.body.listing);
        
        // if(!newListing.description) {
        //     throw new ExpressError(400, "Description is missing");
        // }
        // if(!newListing.location) {
        //     throw new ExpressError(400, "location is missing");
        // }
        await newListing.save();
        res.redirect("listings");
      })
      );
      
      //Edit Route
      app.get("/listings/:id/edit",wrapAsync  (async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit.ejs", { listing });
      }));
    
      //Update Route
      app.put("/listings/:id",validateListing,wrapAsync (async (req, res) => {
        // if(!req.body.listing) {
        //     throw new ExpressError(400, "send valid data" );
        // }
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
      }));
      
    //   //Delete Route
      app.delete("/listings/:id",wrapAsync (async (req, res) => {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        res.redirect("/listings");
      }));
//reveiws
//post
app.post("/listings/:id/reviews",validateReview, wrapAsync (async(req, res) => {

   let listing =  await Listing.findById(req.params.id);
   let newReview = new Review(req.body.rveiew);

   listing.reviews.push(newReview);
   await newReview.save();
   await listing.save();

   res.redirect(`/listings/${listing._id}`);
   
}));


      app.all("*", (req, res, next)=> {
        next(new ExpressError(404, "page not found"));
    });

      app.use((err, req, res, next) => {
        let{statusCode=500, message="something went wrong"} = err;
        res.render("error.ejs", {err});
        res.status(statusCode).send(message);
        //res.send("something went worng");
      });
app.listen(port, (req, res)=> {
    console.log(`Server is running on http://localhost:${port}`);
});