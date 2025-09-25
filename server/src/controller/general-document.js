import { Document } from "../models/index.js";
import path from "path";
import fs from "fs";
import multer from "multer";

const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const orgId =
      req.body?.organizationProfile ||
      req.params?.organizationProfile ||
      "default-folder";
    const uploadPath = path.join(process.cwd(), "./uploads", orgId);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});

const upload = multer({ storage });

export const uploadFileAndAddDocument = async (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload failed", details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    try {
      const {
        organizationProfile,
        label,
        revisionNotes,
        isPinned,
        logs,
        status,
      } = req.body;

      const document = new Document({
        organizationProfile,
        label,
        fileName: req.file.filename,
        revisionNotes,
        isPinned: isPinned === "true" || isPinned === true,
        logs: Array.isArray(logs) ? logs : logs ? [logs] : [],
        status: status || "Pending",
      });

      await document.save();

      res.locals.documentId = document._id;
      res.locals.fileName = req.file.filename;

      next();
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });
};

export const uploadFilesAndAddDocuments = async (req, res, next) => {
  upload.array("files", 10)(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload failed", details: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one file is required" });
    }

    try {
      const {
        organizationProfile,
        label,
        revisionNotes,
        isPinned,
        logs,
        status,
      } = req.body;

      // Create multiple documents (one per file)
      const documents = await Promise.all(
        req.files.map((file) => {
          const document = new Document({
            organizationProfile,
            label,
            fileName: file.filename,
            revisionNotes,
            isPinned: isPinned === "true" || isPinned === true,
            logs: Array.isArray(logs) ? logs : logs ? [logs] : [],
            status: status || "Pending",
          });

          return document.save();
        })
      );

      res.locals.documentIds = documents.map((doc) => doc._id);
      res.locals.fileNames = req.files.map((file) => file.filename);

      next();
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }
  });
};

export const getDocumentById = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.status(200).json(document);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch document", details: error.message });
  }
};

export const getDocuments = async (req, res) => {
  const { organizationProfile } = req.params;

  try {
    const query = organizationProfile ? { organizationProfile } : {};
    const documents = await Document.find(query).sort({ createdAt: -1 });

    return res.status(200).json(documents);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the document first
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Build the file path
    const uploadPath = path.join(
      process.cwd(),
      "./uploads",
      document.organizationProfile || "default-folder",
      document.fileName
    );

    // Delete the file if it exists
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }

    // Delete the document from MongoDB
    await Document.findByIdAndDelete(id);

    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete document",
      details: error.message,
    });
  }
};

export const uploadFileAndUpdateDocument = async (req, res, next) => {
  const { id } = req.params;

  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload failed", details: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    try {
      // Find existing document
      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Build old file path
      const oldFilePath = path.join(
        process.cwd(),
        "./uploads",
        String(document.organizationProfile) || "default-folder",
        document.fileName
      );

      // Delete old file if it exists
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Update with new file info
      res.locals.fileName = document.fileName;

      document.fileName = req.file.filename;

      await document.save();

      next();
    } catch (error) {
      return res.status(500).json({
        error: "Failed to replace document file",
        details: error.message,
      });
    }
  });
};
