
/*
 * GET home page.
 */

exports.index = function(course){
  return function(req, res){
    url = req.url;

    if (url.charAt(url.length - 1) == '/') {
      if (url.length > 1) {
        id = url.substr(1, url.length - 2);
      } else {
        id = null;
      }
      course.find({parent: id}, {}, function(e, list) {
        res.render('index', {
          'list': list
        });
      });
    } else {
      root = url.split('/')[0]
      res.render('index', {
        'url': url
      });
    }
  };
};
