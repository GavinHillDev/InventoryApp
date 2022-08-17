const Genre = require('../models/genre');
const { body, validationResult } = require("express-validator");
const Item = require("../models/item");
const async = require("async");


// Display list of all Genre.
exports.genre_list = function(req, res, next) {

  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
    });

};


// Display detail page for a specific Genre.
// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_items(callback) {
        Item.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_items: results.genre_items,
      });
    }
  );
};


// Display Genre create form on GET.
// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};


// Handle Genre create on POST.
// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];


// Display Genre delete form on GET.
exports.genre_delete_get = (req, res) => {
  async.parallel(
        {
          genre(callback) {
            Genre.findById(req.params.id).exec(callback);
          },
          
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          if (results.genre == null) {
            // No results.
            res.redirect("/inventory/genres");
          }
          // Successful, so render.
          res.render("genre_delete", {
            title: "Delete Genre",
            genre: results.genre,
            // items: results.items
          });
        }
      );
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res) => {
  async.parallel(
        {
          genres(callback) {
            Genre.findById(req.body.genreid).exec(callback);
          },
          // items(callback) {
          //   Item.find({ item: req.params.id }).exec(callback);
          // },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          // Success
          // if (results.authors_books.length > 0) {
          //   // Author has books. Render in same way as for GET route.
          //   res.render("item_delete", {
          //     title: "Delete Power",
          //     item: results.item,
          //     items: results.items
          //   });
          //   return;
          // }
          // Author has no books. Delete object and redirect to the list of authors.
          Genre.findByIdAndRemove(req.body.genreid, (err) => {
            if (err) {
              return next(err);
            }
            // Success - go to author list
            res.redirect("/inventory/genres");
          });
        }
      );
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id)
          .populate("name")
          .exec(callback);
       }
      //,
      // authors(callback) {
      //   Author.find(callback);
      // },
      // genres(callback) {
      //   Genre.find(callback);
      // },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      // for (const genre of results.genres) {
      //   for (const bookGenre of results.book.genre) {
      //     if (genre._id.toString() === bookGenre._id.toString()) {
      //       genre.checked = "true";
      //     }
      //   }
      // }
      res.render("genre_form", {
        title: "Update Genre",
        genres: results.genres,
        // genres: results.genres,
        // book: results.book,
      });
    }
  );
};

// Handle Genre update on POST.
exports.genre_update_post = [ 
 // Validate and sanitize fields.
 body("name", "Genre Name must not be empty.")
 .trim()
 .isLength({ min: 1 })
 .escape(),
// body("summary", "Summary must not be empty.")
//   .trim()
//   .isLength({ min: 1 })
//   .escape(),
// body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
// body("genre.*").escape(),

// Process request after validation and sanitization.
(req, res, next) => {
 // Extract the validation errors from a request.
 const errors = validationResult(req);

 // Create a Book object with escaped/trimmed data and old id.
 const genre = new Genre({
   name: req.body.name,
      // summary: req.body.summary,
   // isbn: req.body.isbn,
   // genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
   _id: req.params.id, //This is required, or a new ID will be assigned!
 });

 if (!errors.isEmpty()) {
   // There are errors. Render form again with sanitized values/error messages.

   // Get all authors and genres for form.
   async.parallel(
     {
       genres(callback) {
         Genre.find(callback);
       }
     },
     (err, results) => {
       if (err) {
         return next(err);
       }
    
       res.render("genre_form", {
         title: "Update Genre",
         genres: results.genres,
         // genres: results.genres,
         // book,
         errors: errors.array(),
       });
     }
   );
   return;
 }

 // Data from form is valid. Update the record.
 Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, thegenre) => {
   if (err) {
     return next(err);
   }
   
   // Successful: redirect to book detail page.
   res.redirect(thegenre.url);
 });
}
];
