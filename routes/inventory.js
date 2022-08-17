
const express = require('express');
const router = express.Router();

// Require controller modules.
const item_controller = require('../controllers/itemController');
const powerholder_controller = require('../controllers/powerholderController');
const genre_controller = require('../controllers/genreController');


/// BOOK ROUTES ///

// GET catalog home page.
router.get('/', item_controller.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/item/create', item_controller.item_create_get);

// POST request for creating Book.
router.post('/item/create', item_controller.item_create_post);

// GET request to delete Book.
router.get('/item/:id/delete', item_controller.item_delete_get);

// POST request to delete Book.
router.post('/item/:id/delete', item_controller.item_delete_post);

// GET request to update Book.
router.get('/item/:id/update', item_controller.item_update_get);

// POST request to update Book.
router.post('/item/:id/update',item_controller.item_update_post);

// GET request for one Book.
router.get('/item/:id', item_controller.item_detail);

// GET request for list of all Book items.
router.get('/items', item_controller.item_list);

/// AUTHOR ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get('/powerholder/create', powerholder_controller.powerholder_create_get);

// POST request for creating Author.
router.post('/powerholder/create', powerholder_controller.powerholder_create_post);

// GET request to delete Author.
router.get('/powerholder/:id/delete', powerholder_controller.powerholder_delete_get);

// POST request to delete Author.
router.post('/powerholder/:id/delete', powerholder_controller.powerholder_delete_post);

// GET request to update Author.
router.get('/powerholder/:id/update', powerholder_controller.powerholder_update_get);

// POST request to update Author.
router.post('/powerholder/:id/update', powerholder_controller.powerholder_update_post);

// GET request for one Author.
router.get('/powerholder/:id', powerholder_controller.powerholder_detail);

// GET request for list of all Authors.
router.get('/powerholders', powerholder_controller.powerholder_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

//POST request for creating Genre.
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delete Genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET request to update Genre.
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre.
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);

/// BOOKINSTANCE ROUTES ///

// // GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
// router.get('/bookinstance/create', book_instance_controller.bookinstance_create_get);

// // POST request for creating BookInstance.
// router.post('/bookinstance/create', book_instance_controller.bookinstance_create_post);

// // GET request to delete BookInstance.
// router.get('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_get);

// // POST request to delete BookInstance.
// router.post('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_post);

// // GET request to update BookInstance.
// router.get('/bookinstance/:id/update', book_instance_controller.bookinstance_update_get);

// // POST request to update BookInstance.
// router.post('/bookinstance/:id/update', book_instance_controller.bookinstance_update_post);

// // GET request for one BookInstance.
// router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);

// // GET request for list of all BookInstance.
// router.get('/bookinstances', book_instance_controller.bookinstance_list);

module.exports = router;
