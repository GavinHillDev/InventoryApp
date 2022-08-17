const Item = require('../models/item');
var Powerholder = require('../models/powerholder');
var Genre = require('../models/genre');
const { body, validationResult } = require("express-validator");

var async = require('async');


exports.index = function(req, res) {

  async.parallel({
      item_count(callback) {
          Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      powerholder_count(callback) {
          Powerholder.countDocuments({}, callback);
      },
      genre_count(callback) {
          Genre.countDocuments({}, callback);
      }
  }, function(err, results) {
      res.render('index', { title: 'Anime Power Shop', error: err, data: results });
  });
};
exports.item_list = function(req, res, next) {

  Item.find({}, 'power powerholder price desc genre') // Shows Power and 
    .sort({title : 1})
    .populate('powerholder')
    .populate('genre')
    .exec(function (err, list_items) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('item_list', { title: 'Power List', item_list: list_items });
    });

};

// Display detail page for a specific book.
// Display detail page for a specific book.
exports.item_detail = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id)
          .populate("powerholder")
          .populate("genre")
          .exec(callback);
      },
      items(callback) {
        Item.find({ item: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        const err = new Error("item not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("item_detail", {
        power: results.item_power,
        item: results.item,
        items: results.items
      });
    }
  );
};


// Display book create form on GET.
exports.item_create_get = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      powerholders(callback) {
        Powerholder.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("item_form", {
        title: "Create Power",
        powerholders: results.powerholders,
        genres: results.genres,
      });
    }
  );
};

// Handle book create on POST.
exports.item_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("power", "Power must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("powerholder", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("desc", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
    body("price", "Power price must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const item = new Item({
      power: req.body.power,
      powerholder: req.body.powerholder,
      desc: req.body.desc,
      price: req.body.price,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          powerholders(callback) {
            Powerholder.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (item.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("item_form", {
            title: "Create Power",
            powerholders: results.powerholders,
            genres: results.genres,
            item,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save book.
    item.save((err) => {
      if (err) {
        return next(err);
      }
      
      // Successful: redirect to new book record.
      res.redirect(item.url);
    });
  },
];


// Display Author delete form on GET.
exports.item_delete_get = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).exec(callback);
      },
      items(callback) {
        Item.find({ item: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        res.redirect("/inventory/items");
      }
      // Successful, so render.
      res.render("item_delete", {
        title: "Delete Item",
        item: results.item,
        items: results.items
      });
    }
  );
};


// Handle book delete on POST.
// Handle Author delete on POST.
exports.item_delete_post = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.body.itemid).exec(callback);
      },
      items(callback) {
        Item.find({ item: req.params.id }).exec(callback);
      },
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
      Item.findByIdAndRemove(req.body.itemid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to author list
        res.redirect("/inventory/items");
      });
    }
  );
};


// Display book update form on GET.
// Display book update form on GET.
exports.item_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id)
          .populate("powerholder")
          .populate("genre")
          .exec(callback);
      },
      powerholders(callback) {
        Powerholder.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (const genre of results.genres) {
        for (const itemGenre of results.item.genre) {
          if (genre._id.toString() === itemGenre._id.toString()) {
            genre.checked = "true";
          }
        }
      }
      res.render("item_form", {
        title: "Update Item",
        powerholders: results.powerholders,
        genres: results.genres,
        item: results.item,
      });
    }
  );
};

// Handle book update on POST.
// Handle book update on POST.
exports.item_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("power", "Power must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("powerholder", "Powerholder must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("desc", "desc must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const item = new Item({
      power: req.body.power,
      powerholders: req.body.powerholders,
      desc: req.body.desc,
      price: req.body.price,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          powerholders(callback) {
            Powerholder.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (item.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("item_form", {
            title: "Update Power",
            powerholders: results.powerholders,
            genres: results.genres,
            item,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
      if (err) {
        return next(err);
      }
      
      // Successful: redirect to book detail page.
      res.redirect(theitem.url);
    });
  },
];
