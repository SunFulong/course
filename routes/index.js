exports.index = function (course) {
  return function (req, res) {
    var names = decodeURIComponent(req.url).substr(1).split('/'),
      rootUrl,

      query = function (p, name) {
        if (name) {
          course.findOne({parent: p, name: name}).on('success', function (doc) {
            if (!doc) {
              res.status(404);
              res.send('404 Not Found');

              return;
            }

            rootUrl = p ? rootUrl : doc.url;

            if (!doc.type) {
              query(doc._id, names.shift());
            } else {
              res.redirect(rootUrl + req.url.substr(1));
            }
          });
        } else {
          course.find({parent: p}, {'sort': ['type', 'name']}).on('success', function (list) {
            res.render('index', {'list': list});
          });
        }
      };

    query(null, names.shift());
  };
};
