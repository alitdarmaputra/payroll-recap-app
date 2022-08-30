const multer = require("multer");
const storage = require("../helpers/storageMulter.helper");
const ValidationError = require("../errors/ValidationError");

const fileFilter = (req, file, cb) => {
	if(file.mimetype == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
		cb(null, true);
	} else {
		cb(null, false);
		cb(new ValidationError('File type is not supported'));
	}
}

const upload = multer({ 
	storage: storage, 
	fileFilter: fileFilter, 
	onError: (err, next) => {
		next(err);
	}
});

module.exports = upload;
