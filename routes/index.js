exports.index = function (course) {
  return function (request, response) {
    var names = decodeURIComponent(request.url).substr(1).split('/'),
      rootUrl;

    function query(p, name) {
      if (!name) {
        course.find({parent: p}, {sort: ['type', 'name']}).on('success', function (results) {
          console.log(results);
          response.render('list', {list: results});
        });

        return;
      }

      course.findOne({parent: p, name: name}).on('success', function (result) {
        if (!result) {
          response.status(404);
          response.send('404 Not Found');

          return;
        }

        if (!p) {
          rootUrl = result.url;
        }
        if (!result.type) {
          query(result._id, names.shift());
        } else {
          response.redirect(rootUrl + request.url.substr(1));
        }
      });
    }

    query(null, names.shift());
  };
};

exports.search = function (course) {
  return function (request, response) {
    var keyword = request.body.course,
      list, result,
      name, type, path;

    function query(item) {
      if (!item) {
        response.render('result', {list: result});

        return;
      }

      name = item.name;
      type = item.type;
      path = [];

      queryPath(item.parent);
    }

    function queryPath(p) {
      if (!p) {
        result.push({ name: name, type: type, path: path.reverse().join('/') });

        query(list.shift());
        return;
      }

      course.findOne({_id: p}).on('success', function (result) {
        path.push(result.name);

        queryPath(result.parent);
      });
    }

    keyword = keyword.replace('\\', '\\\\').replace('.', '\\.')
      .replace('^', '\\^').replace('$', '\\$')
      .replace('{', '\\{').replace('}', '\\}')
      .replace('[', '\\[').replace(']', '\\]')
      .replace('(', '\\(').replace(')', '\\)')
      .replace('*', '.*').replace('?', '.');

    course.find({name: new RegExp(keyword, 'i')}, {sort: ['type', 'name']}).on('success', function (results) {
      list = results;
      result = [];

      query(list.shift());
    });
  };
};
