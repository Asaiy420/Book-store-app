import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/book.models.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !caption || !rating || !title)
      return res.status(400).json({ message: "Please provide all fields" });

    //uploading the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;
    //and save it to the DB
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user._id,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error when creating book", error);
    res.status(500).json({ message: error.message });
  }
});

// const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");
// pagination -> for infinite scrolling
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    //*?skips the already existing request i.e at first (1) it will be 0 so it wont skip anything but the next iteration 2 will skip the first 5 and return a new 5 request
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 }) //descending order i.e newest book -> oldest book
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const totalBooks = await Book.countDocuments(); //finds how many books we have in db
    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("Error in get all books", error);
    res.status(500).json({ message: "Internal server error " });
  }
});

//get recommended books for logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    console.error("Get user books error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    //check if user is the creator
    if (book.user.toString() !== req.users._id.toString())
      return res.status(401).json({ message: "Unauthorized access" });

    //delete image from cloudinary
    if (book.image && book.includes("cloudinary")) {
      try {
        // example wefuywefhwuefhwe.png
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.log("Error when deleting the image", deleteError);
        res.status(500).json({ message: "Internal server error" });
      }
    }

    await book.deleteOne();
    res.json({ message: "Book deleted sucessfully" });
  } catch (error) {
    console.log("Error deleting the book", error);
    res.status(500), json({ message: "Internal sever error" });
  }
});

export default router;
