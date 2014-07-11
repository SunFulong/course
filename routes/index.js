exports.index = function (db) {
  var request, response, names;
  var file_names, file_path, file_root, file_list;

  function query_file_list(p, name, callback) {
    if (!name) {
      db.get('course').find({parent: p}, {sort: ['type', 'name']}).on('success', function (results) {
        file_list = results;

        callback();
      });

      return;
    }

    db.get('course').findOne({parent: p, name: name}).on('success', function (result) {
      if (!result) {
        response.status(404);
        response.send('404 Not Found');

        return;
      }

      if (!p) {
        file_root = result.url;
      }
      if (!result.type) {
        query_file_list(result._id, file_names.shift(), callback);
        file_path.push({name: name, path: file_path[file_path.length - 1].path + name + '/'});
      } else {
        response.redirect(file_root + request.url.substr(1));
      }
    });
  }

  function init_query_file_list() {
    file_names = names;
    file_path = [{name: '课件发布系统', path: '/'}];

    query_file_list(null, file_names.shift(), function () {
      render_page(response);
    });
  }

  function render_page(response) {
    return response.render('list', {file_list: file_list, nav_list: file_path});
  }

  return function (req, res) {
    request = req;
    response = res;
    names = decodeURIComponent(request.url).substr(1).split('/');

    init_query_file_list();
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
