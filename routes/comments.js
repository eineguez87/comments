var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const bodyParser = require("body-parser");

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'coding_challenge1',
})

connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')
})


/* Get all comments */
router.get('/', function(req, res, next) {
    connection.query('SELECT * FROM comments', function(err, results) {
        if (err) throw err
        
            var comments = getChildComments(results);
            res.jsonp(comments);
    })
  
});

/* Post a comment, add to DB */
router.post('/', function (req, res) {
    connection.query('INSERT INTO comments (name, comment, parent_id) VALUES (?, ?, ?)', 
        [req.body.name, req.body.comment, req.body.parent_id], function(err, result) {
        if (err) throw err
            console.log(result);
            connection.query('SELECT * FROM comments WHERE id = ?', [result.insertId], function(err, results) {
                if (err) throw err
                res.jsonp(results[0]);
            })
    })
})


function getChildComments(results, parent_id = 0, level = 0) 
{
    var comments = [];
    level++;
    for (var i in results) {
        var result = results[i];
        if(result.parent_id == parent_id) {
            result.level = level;
            var children = getChildComments(results, result.id, level);
            if(children) {
                result.children = children;
            }
            comments.push(result);
        }
    }
    return comments;
}

module.exports = router;