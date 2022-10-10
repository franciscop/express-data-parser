const express = require("express");
const uploadFiles = require(".");

const app = express();

// Add it as a middleware to parse the incoming files
app.use(uploadFiles());

// A simple HTML form on the home
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head><meta charset="UTF-8"><title>File Upload Demo</title></head>
      <body>
        <form action="/form" method="POST" enctype="multipart/form-data">
          <input type="text" name="name" required />
          <input type="file" name="profile" required />
          <button>Send</button>
        </form>
      </body>
    </html>
  `);
});

// The file is already parsed and in `req.files`
app.post("/form", (req, res) => {
  console.log(req.body);
  // { name: 'Francisco' }

  // The key is the name="" in the original form:
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

  res.json(req.files.profile);
});

app.listen(3000);
