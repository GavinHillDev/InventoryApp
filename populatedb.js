#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Powerholder = require('./models/powerholder')
var Genre = require('./models/genre')
// var BookInstance = require('./models/bookinstance')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var powerholders = []
var genres = []
var items = []

// var bookinstances = []

function powerholderCreate(charactername, anime, cb) {
    holderdetail = {charactername:charactername , anime: anime }
  
    var powerholder = new Powerholder(holderdetail);
         
  powerholder.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New PowerHolder: ' + powerholder);
    powerholders.push(powerholder)
    cb(null, powerholder)
  }  );
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });
       
  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre)
    cb(null, genre);
  }   );
}

function itemCreate(power, desc, price, powerholder, genre, cb) {
  itemdetail = { 
    power: power,
    desc: desc,
    price: price,
    powerholder: powerholder,
    //isbn for id?
  }
  if (genre != false) itemdetail.genre = genre
    
  var item = new Item(itemdetail);    
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Power: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}


// function bookInstanceCreate(book, imprint, due_back, status, cb) {
//   bookinstancedetail = { 
//     book: book,
//     imprint: imprint
//   }    
//   if (due_back != false) bookinstancedetail.due_back = due_back
//   if (status != false) bookinstancedetail.status = status
    
//   var bookinstance = new BookInstance(bookinstancedetail);    
//   bookinstance.save(function (err) {
//     if (err) {
//       console.log('ERROR CREATING BookInstance: ' + bookinstance);
//       cb(err, null)
//       return
//     }
//     console.log('New BookInstance: ' + bookinstance);
//     bookinstances.push(bookinstance)
//     cb(null, book)
//   }  );
// }


function createGenrePowerholders(cb) {
    async.series([
        function(callback) {
          powerholderCreate('Naruto Uzumaki', 'Naruto', callback);
        },
        function(callback) {
            powerholderCreate('Eren Yaeger', 'Attack On Titan', callback);
        },
        function(callback) {
            powerholderCreate('Ichigo Kurosaki', 'Bleack', callback);
        },
        function(callback) {
            powerholderCreate('Ken Kaneki', 'Tokyo Ghoul', callback);
        },
       
        function(callback) {
          genreCreate("Action", callback);
        },
        function(callback) {
          genreCreate("Adventure", callback);
        },
        function(callback) {
          genreCreate("Supernatural", callback);
        },
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Kcm Mode 2', 'You are able to harness the full power of Kurama', 'When using your power you have the risk of losing controal and causing devastating destruction around you' , powerholders[0], [genres[0, 1],], callback);
        },
        function(callback) {
            itemCreate('Attack Titan', 'You gain the ability to turn into the attack titan', 'You also have the penalty of only living 13 more years' , powerholders[1], [genres[0],], callback);
        },
        function(callback) {
            itemCreate("You gain all the powers of Ichigo","You become a Soul Reaper for the Soul Society", 'Every ghost you bring peace to gives you their entire life story and you have to listen to it ', powerholders[2], [genres[2],], callback);
        },
        function(callback) {
            itemCreate("You are now a ghoul or half ghoul",
            "You have all the powers of Kanaki with no worries of being hunted by ghoul investigators", "After becoming a ghoul you have to experience Kaneki's torture once a year randomly", powerholders[3], [genres[2],], callback);
        }
        ],
        // optional callback
        cb);
}


// function createBookInstances(cb) {
//     async.parallel([
//         function(callback) {
//           bookInstanceCreate(books[0], 'London Gollancz, 2014.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[1], ' Gollancz, 2011.', false, 'Loaned', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[2], ' Gollancz, 2015.', false, false, callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Available', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Maintenance', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Loaned', callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[0], 'Imprint XXX2', false, false, callback)
//         },
//         function(callback) {
//           bookInstanceCreate(books[1], 'Imprint XXX3', false, false, callback)
//         }
//         ],
//         // Optional callback
//         cb);
// }



async.series([
    createGenrePowerholders,
    createItems,
    
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



