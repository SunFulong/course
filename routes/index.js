exports.index = function (course) {
  return function (request, response) {
    var names = decodeURIComponent(request.url).substr(1).split('/'),
      rootUrl;

    function query(p, name) {
      if (!name) {
        course.find({parent: p}, {sort: ['type', 'name']}).on('success', function (list) {
          response.render('index', {'list': list});
        });
      } else {
        course.findOne({parent: p, name: name}).on('success', function (doc) {
          if (!doc) {
            response.status(404);
            response.send('404 Not Found');

            return;
          }

          if (!p) {
            rootUrl = doc.url;
          }
          if (!doc.type) {
            query(doc._id, names.shift());
          } else {
            response.redirect(rootUrl + request.url.substr(1));
          }
        });
      }
    };

    query(null, names.shift());
  };
};

exports.search = function (course) {
  return function (request, response) {
    var keyword = request.body.course;

    course.find({name: new RegExp(keyword)}, {sort: ['type', 'name']}).on('success', function (list) {
      response.render('index', {'list': list});
    });
  }
}
