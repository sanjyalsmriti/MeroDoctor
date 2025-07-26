/**
 * Multer middleware configuration for handling file uploads.
 * Sets up disk storage and custom filename logic for uploaded files.
 *
 * @module middlewares/multer
 */
import multer from "multer";

/**
 * Multer storage configuration for saving files to disk.
 * - Uses the current timestamp and original filename for uniqueness.
 *
 * @type {import('multer').StorageEngine}
 */
const storage = multer.diskStorage({
  /**
   * Sets the filename for the uploaded file.
   * @param {import('express').Request} req - Express request object
   * @param {Express.Multer.File} file - Uploaded file object
   * @param {function(Error, string): void} cb - Callback to set the filename
   */
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/**
 * Multer upload middleware instance using the configured storage.
 * Use this middleware in your routes to handle file uploads.
 *
 * @type {import('multer').Multer}
 */
const upload = multer({ storage });

export default upload;
