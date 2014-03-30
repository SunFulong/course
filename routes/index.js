exports.index = function (course) {
  return function (req, res) {
    var names = decodeURIComponent(req.url).substr(1).split('/'),
      rootUrl,

      query = function (p, name) {
        if (!name) {
          course.find({parent: p}, {'sort': ['type', 'name']}).on('success', function (list) {
            res.render('index', {'list': list});
          });
        } else {
          course.findOne({parent: p, name: name}).on('success', function (doc) {
            if (!doc) {
              res.status(404);
              res.send('404 Not Found');

              return;
            }

            if (!p) {
              rootUrl = doc.url;
            }
            if (!doc.type) {
              query(doc._id, names.shift());
            } else {
              res.redirect(rootUrl + req.url.substr(1));
            }
          });
        }
      };

    query(null, names.shift());
  };
};
