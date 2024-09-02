import multer from 'multer';
 // this middleware is used to upload files to the server and act as a middleware
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./Public/temp")
    },
    filename: function (req, file, cb) {
     
      cb(null, file.originalname)
    }
  })
  
  export  const upload = multer({ storage: storage })