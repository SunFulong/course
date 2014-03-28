exports.index = function(course) {
  return function(req, res) {
    var names = decodeURIComponent(req.url).substr(1).split('/');

    var query = function(p, name) {
      if (name) {
        course.findOne({parent: p, name: name}).on('success', function(doc) {
          query(doc._id, names.shift());
        });
      } else {
        course.find({parent: p}, {'sort': ['type', 'name']}).on('success', function(list) {
          res.render('index', {'list': list});
        });
      }
    };

    if (!names[names.length - 1]) {
      query(null, names.shift());
    } else {
      course.findOne({parent: null, name: names[0]}).on('success', function(doc) {
        res.redirect(doc.url + names.join('/'));
      });
    }
  };
};
