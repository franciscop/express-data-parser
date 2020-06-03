# express-file-upload

An easy way to handle file uploads on the server with express. The files will be part of the `req.files`, and these are located in your filesystem:

```js
const fileUpload = require('express-file-upload');

// Pass any options that you want here:
app.use(fileUpload());

app.post('/form', (req, res) => {
  // The key is the name="" in the original form
  console.log(req.files);
  // {
  //   profile: {
  //     path: '/tmp/69793b826f1c9685.png',  // Where the file is saved
  //     name: 'profile.png',                // The original file name
  //     type: 'image/png'                   // The MIME type of file
  //     size: 5940,                         // The bytes of the file
  //     modified: 2020-06-03T18:53:20.687Z  // The Date() the file was uploaded
  //   }
  // }

  // ...
});
```

> This module also parses the rest of the form, so `body-parser` is not needed 🎉



## Getting started

First install it with npm:

```bash
npm install express-file-upload
```

Then you have to import it and load it as an [express middleware](https://expressjs.com/en/guide/using-middleware.html) in your server:

```js
const express = require('express');
const fileUpload = require('express-file-upload');

const app = express();

app.use(fileUpload());

// ...
```



## Options

It uses `formidable` to parse the data, so [you can use any of formidable's configuration options](https://github.com/felixge/node-formidable#api). Pass the options with an object:

```js
app.use(fileUpload({
  uploadDir: './uploads',
  maxFileSize: 10 * 1024 * 1024   // ~10 MB
}));
```

These are all the available options:

- `encoding` **{string}** - default `'utf-8'`; sets encoding for
  incoming form fields,
- `uploadDir` **{string}** - default `os.tmpdir()`; the directory for
  placing file uploads in, which must exist previously. You can move them later by using `fs.rename()`
- `keepExtensions` **{boolean}** - default `true`; to include the
  extensions of the original files or not
- `maxFileSize` **{number}** - default `200 * 1024 * 1024` (200mb);
  limit the size of uploaded file.
- `maxFields` **{number}** - default `1000`; limit the number of fields
  that the Querystring parser will decode, set 0 for unlimited
- `maxFieldsSize` **{number}** - default `20 * 1024 * 1024` (20mb);
  limit the amount of memory all fields together (except files) can allocate in
  bytes.
- `hash` **{boolean}** - default `false`; include checksums calculated
  for incoming files, set this to some hash algorithm, see
  [crypto.createHash](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options)
  for available algorithms
- `multiples` **{boolean}** - default `false`; when you call the
  `.parse` method, the `files` argument (of the callback) will contain arrays of
  files for inputs which submit multiple files using the HTML5 `multiple`
  attribute. Also, the `fields` argument will contain arrays of values for
  fields that have names ending with '[]'.

> Note: the `keepExtensions` defaults to `true` instead of `false` as in formidable.



## Upload files to S3, GCS, Backblaze's B2

You likely want to upload your files to a 3rd party storage service, since most Node.js servers have [an ephemeral filesystem](https://help.heroku.com/K1PPS2WM/why-are-my-file-uploads-missing-deleted) so  all the data will be removed on the next deploy.

To keep our files we can upload these to S3, Backblaze's B2, Google's GCS, etc. We are using a fictitious service here `some-service`:

```js
const fileUpload = require('express-file-upload');
const service = require('some-service');

app.use(fileUpload());

// We made the callback async to be able to `await` on it inside
app.post('/form', async (req, res, next) => {
  try {
    // Still using the same form. Now we wait for the file to upload and keep
    // the resulting filename as a result. This workflow will be different
    // depending on which service you use:
    const localFile = req.files.profile.path;
    const name = await service.upload(localFile);

    // A full user profile example:
    const userData = { ...req.body, profile: `https://service.com/${name}` };

    // Now "userData" has all the data and the link to the image we want
    console.log(user);
    // {
    //   name: 'Francisco',
    //   profile: 'https://service.com/fkjfdinuaef.png'
    // }

    // ... Save in DB, respond, etc. here

  } catch (error) {
    next(error);
  }
});
```



## Upload image to MongoDB

While you cannot upload data straight to MongoDB, you can do the previous workflow and then upload the image reference to MongoDB or any other database that you prefer:

```js
// Using mongoose here
const User = mongoose.model('User', userSchema);

app.post('/form', async (req, res, next) => {
  try {
    // ... Same as before here

    const user = new User(userData);
    await user.save();

    return res.json(userData);
  } catch (error) {
    next(error);
  }
});
```



## Author & License

Made by [Francisco Presencia](http://francisco.io/) under the MIT License.
