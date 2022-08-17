const Powerholder = require('../models/powerholder');
const { body, validationResult } = require("express-validator");
var async = require('async');
const Item = require("../models/item");

// Display list of all powerholders.
// Display list of all powerholders.
exports.powerholder_list = function(req, res, next) {

  Powerholder.find()
    .sort([['charactername', 'ascending']])
    .exec(function (err, list_powerholderss) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('powerholder_list', { title: 'Powerholder List', powerholder_list: list_powerholderss });
    });

};

// Display detail page for a specific Author.
// Display detail page for a specific Author.
exports.powerholder_detail = (req, res, next) => {
  async.parallel(
    {
      powerholder(callback) {
       Powerholder.findById(req.params.id).exec(callback);
      },
      powerholder_items(callback) {
        Item.find({ powerholder: req.params.id }, "title summary").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.powerholder == null) {
        // No results.
        const err = new Error("Author not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("powerholder_detail", {
        title: "Author Detail",
        powerholder: results.powerholder,
        powerholder_items: results.powerholder_items,
      });
    }
  );
};


// Display Author create form on GET.
// Display Author create form on GET.
exports.powerholder_create_get = (req, res, next) => {
  res.render("powerholder_form", { title: "Create Powerholder" });

};


// Handle Author create on POST.
exports.powerholder_create_post = [
  // Validate and sanitize fields.
  body("charactername")
    .trim()
    .isLength({ min: 1 })
    .escape()
    // .withMessage("First name must be specified.")
    // .isAlphanumeric()
    // .withMessage("First name has non-alphanumeric characters.")
    ,
  body("anime")
    .trim()
    .isLength({ min: 1 })
    .escape()
    // 
    ,
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("powerholder_form", {
        title: "Create PowerHolder",
        powerholder: req.body,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create an Author object with escaped and trimmed data.
    const powerholder = new Powerholder({
      charactername: req.body.charactername,
      anime: req.body.anime,
    });
    powerholder.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new author record.
      res.redirect(powerholder.url);
    });
  },
];


// Display Author delete form on GET.
// Display Author delete form on GET.
exports.powerholder_delete_get = (req, res, next) => {
  async.parallel(
    {
      powerholder(callback) {
        Powerholder.findById(req.params.id).exec(callback);
      },
      powerholders_items(callback) {
        Item.find({ powerholder: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.powerholder == null) {
        // No results.
        res.redirect("/inventory/powerholders");
      }
      // Successful, so render.
      res.render("powerholder_delete", {
        title: "Delete PowerHolder",
        powerholder: results.powerholder,
        powerholder_items: results.powerholders_items,
      });
    }
  );
};

// Handle Author delete on POST.
// Handle Author delete on POST.
exports.powerholder_delete_post = (req, res, next) => {
  async.parallel(
    {
      powerholder(callback) {
        Powerholder.findById(req.body.powerholderid).exec(callback);
      },
      powerholders_items(callback) {
        Item.find({ author: req.body.powerholderid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.powerholders_items.length > 0) {
        // Author has items. Render in same way as for GET route.
        res.render("powerholder_delete", {
          title: "Delete Author",
          powerholder: results.powerholder,
          powerholder_items: results.powerholders_items,
        });
        return;
      }
      // Author has no items. Delete object and redirect to the list of powerholders.
      Powerholder.findByIdAndRemove(req.body.powerholderid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect("/inventory/powerholders");
      });
    }
  );
};



// Display Author update form on GET.
// Display book update form on GET.
exports.powerholder_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      powerholder(callback) {
        Powerholder.findById(req.params.id)
          .populate("charactername")
          .populate("anime")
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
      if (results.powerholder == null) {
        // No results.
        const err = new Error("Powerholder not found");
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
      res.render("powerholder_form", {
        title: "Update PowerHolder",
        powerholders: results.powerholders,
        // genres: results.genres,
        // book: results.book,
      });
    }
  );
};


// Handle book update on POST.
exports.powerholder_update_post = [
  // Convert the genre to an array
  // (req, res, next) => {
  //   if (!Array.isArray(req.body.genre)) {
  //     req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre];
  //   }
  //   next();
  // },

  // Validate and sanitize fields.
  body("charactername", "Character Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("anime", "Anime must not be empty.")
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
    const powerholder = new Powerholder({
      charactername: req.body.charactername,
      anime: req.body.anime,
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
          powerholders(callback) {
            Powerholder.find(callback);
          }
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
       
      
          // // Mark our selected genres as checked.
          // for (const genre of results.genres) {
          //   if (book.genre.includes(genre._id)) {
          //     genre.checked = "true";
          //   }
          // }
          res.render("powerholder_form", {
            title: "Update Powerholder",
            powerholders: results.powerholders,
            // genres: results.genres,
            // book,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Powerholder.findByIdAndUpdate(req.params.id, powerholder, {}, (err, thepowerholder) => {
      if (err) {
        return next(err);
      }
      
      // Successful: redirect to book detail page.
      res.redirect(thepowerholder.url);
    });
  }
];
