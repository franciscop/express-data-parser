var formidable = require('formidable');

module.exports = function(options = {}){

  return function(req, res, next){
    if (req.method === 'GET') return next();
    if (!req.headers['Content-Type'].includes('multipart/form-data')) next();

    var form = new formidable.IncomingForm();

    for (var key in options) {
      form[key] = options[key];
    }

    form.parse(req, function(err, fields, files){
      if (err) next(err);
      req.body = fields;
      req.files = files;
      next();
    });
  }
}
