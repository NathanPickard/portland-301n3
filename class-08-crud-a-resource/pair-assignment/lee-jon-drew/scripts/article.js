(function(module) {
  function Article (opts) {
    // DONE: Convert property assignment to Functional Programming style. Now, ALL properties
    // of `opts` will be assigned as properies of the newly created article object.
    Object.keys(opts).forEach(function(e, index, keys) {
      this[e] = opts[e];
    },this);
  }

  Article.all = [];

  Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  // TODO: -DONE- Set up a DB table for articles.
  Article.createTable = function(callback) {
    webDB.execute(
    // what SQL command do we run here inside these quotes?
    'CREATE TABLE IF NOT EXISTS articles (' +
        'id INTEGER PRIMARY KEY, ' +
        'title VARCHAR(100) NOT NULL, ' +
        'category VARCHAR(100), ' +
        'author VARCHAR(255), ' +
        'authorUrl VARCHAR(2000) NOT NULL, ' +
        'publishedOn VARCHAR(255) NOT NULL, ' +
        'body TEXT NOT NULL);',
      function(result) {
        console.log('Successfully set up the articles table.', result);
        if (callback) {
            callback();
        }
      }
    );
  };

  // TODO: -DONE- Use correct SQL syntax to delete all records from the articles table.
  Article.truncateTable = function(callback) {
    webDB.execute(
      'DELETE FROM articles;', // <----finish the command here, inside the quotes.
      callback
    );
  };


  // TODO: -DONE- Insert an article instance into the database:
  Article.prototype.insertRecord = function(callback) {
    webDB.execute(
      [
        {
          sql: 'INSERT INTO articles (title, category, author, authorUrl, publishedOn, body) VALUES (?, ?, ?, ?, ?, ?)',
          data: [this.title, this.category, this.author, this.authorUrl, this.publishedOn, this.body],
        }
      ],
      callback
    );
  };

  // TODO: -DONE- Delete an article instance from the database:
  Article.prototype.deleteRecord = function(callback) {
    webDB.execute(
      [
        {
            sql: 'DELETE FROM articles WHERE id=?',
            data: [this.id]
        }
      ],
      callback
    );
  };

  // TODO: -DONE- Update an article instance, overwriting its properties into the corresponding record in the database:
  Article.prototype.updateRecord = function(callback) {
    webDB.execute(
      [
        {
            sql: 'UPDATE articles SET id=?, title=?, category=?, author=?, authorUrl=?, publishedOn=?, body=?',
            data: [this.id, this.title, this.category, this.author, this.authorUrl, this.publishedOn, this.body]
        }
      ],
      callback
    );
  };

  // DONE: Refactor to expect the raw data from the database, rather than localStorage.
  Article.loadAll = function(rows) {
    Article.all = rows.map(function(ele) {
      return new Article(ele);
    });
  };

  // TODO: -DONE- Refactor this to check if the database holds any records or not. If the DB is empty,
  // we need to retrieve the JSON and process it.
  // If the DB has data already, we'll load up the data (sorted!), and then hand off control to the View.
  Article.fetchAll = function(next) {
    webDB.execute('SELECT * FROM articles', function(rows) { // TODO: -DONE- fill these quotes to 'select' our table.
      if (rows.length) {
        // TODO: -DONE- Now, 1st - instanitate those rows with the .loadAll function,
        Article.loadAll(rows);
        // and 2nd - pass control to the view by calling whichever function argument was passed in to fetchAll.
        next();
      } else {
        $.getJSON('/data/hackerIpsum.json', function(rawData) {
          // Cache the json, so we don't need to request it next time:
          rawData.forEach(function(item) {
            var article = new Article(item); // Instantiate an article based on item from JSON
            // TODO: -Done- Cache the newly-instantiated article in the DB: (what can we call on each 'article'?)
            article.insertRecord();
            return article;
          });
          // Now get ALL the records out the DB, with their database IDs:
          webDB.execute('SELECT * FROM articles', function(rows) { // TODO: -DONE- select our now full table
            // TODO: -DONE- Now, 1st - instanitate those rows with the .loadAll function,
            Article.loadAll(rows);
            // and 2nd - pass control to the view by calling whichever function argument was passed in to fetchAll.
            next();
          });
        });
      }
    });
  };

  Article.allAuthors = function() {
    return Article.all.map(function(article) {
      return article.author;
    })
    .reduce(function(names, name) {
      if (names.indexOf(name) === -1) {
        names.push(name);
      }
      return names;
    }, []);
  };

  Article.numWordsAll = function() {
    return Article.all.map(function(article) {
      return article.body.match(/\b\w+/g).length;
    })
    .reduce(function(a, b) {
      return a + b;
    });
  };

  Article.numWordsByAuthor = function() {
    return Article.allAuthors().map(function(author) {
      return {
        name: author,
        numWords: Article.all.filter(function(a) {
          return a.author === author;
        })
        .map(function(a) {
          return a.body.match(/\b\w+/g).length;
        })
        .reduce(function(a, b) {
          return a + b;
        })
      }
    })
  };

  Article.stats = function() {
    return {
      numArticles: Article.all.length,
      numWords: Article.numwords(),
      Authors: Article.allAuthors(),
    };
  }

  module.Article = Article;
})(window);
