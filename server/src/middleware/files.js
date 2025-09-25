import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import multer from "multer";

// Ensure the target directory exists (using an absolute path)
const ensureDirExists = (dir) => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating directory:", error);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(
      process.cwd(),
      "../public",
      req.body.organization
    );

    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_]/g, "_");
    const finalFileName = `${sanitizedBaseName}_${timestamp}${ext}`;
    cb(null, finalFileName);
  },
});

const upload = multer({ storage });

const uploadFiles = upload.array("file", 200); // adjust maxCount as needed

export const ArchiveFile = (req, res, next) => {
  try {
    const organization = req.params.id;
    const { fileToDelete } = req.body;

    if (!organization || !fileToDelete) {
      return res.status(400).json({
        error: "Both 'organization' and 'fileToDelete' are required",
      });
    }

    const originalPath = path.join(
      process.cwd(),
      "../public",
      organization,
      fileToDelete
    );
    const archivePath = path.join(process.cwd(), "../archive", organization);

    fs.stat(originalPath, (err, stats) => {
      if (err || !stats.isFile()) {
        console.error("File not found or invalid:", err?.message);
        return res.status(404).json({ error: "Original file not found" });
      }

      // Ensure archive directory exists
      fs.mkdir(archivePath, { recursive: true }, (mkdirErr) => {
        if (mkdirErr) {
          console.error(
            "Failed to create archive directory:",
            mkdirErr.message
          );
          return res
            .status(500)
            .json({ error: "Failed to create archive folder" });
        }

        const archivedFilePath = path.join(archivePath, fileToDelete);

        fs.rename(originalPath, archivedFilePath, (renameErr) => {
          if (renameErr) {
            console.error("Archiving file failed:", renameErr.message);
            return res.status(500).json({
              error: "Failed to move file to archive",
              details: renameErr.message,
            });
          }

          console.log(`File archived: ${archivedFilePath}`);
          req.archivedFile = fileToDelete;
          next();
        });
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
};

// Middleware to accept a single file upload from the "file" field
export const UploadSingleFile = (req, res, next) => {
  try {
    upload.single("file")(req, res, (err) => {
      const document = req.file;

      console.log("there is a file here", req.file);
      if (!document) {
        return res.status(400).json({
          error: "file is required",
        });
      }

      if (err) {
        console.error("Multer error:", err);
        return res.status(500).json({
          error: "File upload failed",
          details: err.message,
        });
      }

      req.uploadData = { document };
      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
};

export const DeleteSingleFile = (req, res, next) => {
  try {
    const { organization, fileToDelete } = req.body;

    if (!organization || !fileToDelete) {
      return res.status(400).json({
        error: "Both 'organization' and 'fileToDelete' are required",
      });
    }

    const filePath = path.join(
      process.cwd(),
      "../public",
      organization,
      fileToDelete
    );

    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error("File stat error:", err);
        return res.status(404).json({ error: "File not found" });
      }

      if (!stats.isFile()) {
        return res
          .status(400)
          .json({ error: "The specified path is not a file" });
      }

      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("File deletion error:", unlinkErr);
          return res.status(500).json({
            error: "File deletion failed",
            details: unlinkErr.message,
          });
        }

        console.log(`File deleted: ${filePath}`);
        req.deletedFile = fileToDelete;
        next();
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      error: "Unexpected error occurred",
    });
  }
};

export const UploadMultipleFiles = (req, res, next) => {
  try {
    uploadFiles(req, res, (err) => {
      const { organization } = req.body;
      const file = req.files;

      console.log(file);
      if (!organization || !file || file.length === 0) {
        return res.status(400).json({
          error: "organization and at least one file are required",
        });
      }

      if (err) {
        console.error("Multer error:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unexpected error occurred" });
  }
};

export const GetAllFile = async (req, res) => {
  const baseDir = path.join(process.cwd(), "../public");

  async function getFilesRecursively(dir) {
    let results = [];
    const list = await fsPromises.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        results = results.concat(await getFilesRecursively(fullPath));
      } else {
        results.push(fullPath);
      }
    }
    return results;
  }

  try {
    const files = await getFilesRecursively(baseDir);
    return res.status(200).json({ files });
  } catch (error) {
    console.error("Error reading files:", error);
    return res.status(500).json({ error: "Could not read files" });
  }
};

export const GetAllImageFile = async (req, res) => {
  const baseDir = path.join(process.cwd(), "../public");

  if (!fs.existsSync(baseDir)) {
    console.error("Directory does not exist:", baseDir);
    return res.status(500).json({ error: "Public directory not found" });
  }

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
  ];

  async function getFilesRecursively(dir) {
    let results = [];
    const list = await fsPromises.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        results = results.concat(await getFilesRecursively(fullPath));
      } else {
        const ext = path.extname(file.name).toLowerCase();
        if (imageExtensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
    return results;
  }

  try {
    const files = await getFilesRecursively(baseDir);
    return res.status(200).json({ files });
  } catch (error) {
    console.error("Error reading files:", error);
    return res.status(500).json({ error: "Could not read files" });
  }
};

export const DownloadFile = (req, res) => {
  const { orgFolder, orgDocumentClassification, subDir, file } = req.body;

  // Corrected base directory path
  const filePath = path.join(
    process.cwd(),
    "public",
    orgFolder,
    orgDocumentClassification,
    subDir,
    file
  );

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("File not found:", filePath);
      return res.status(404).send("File not found");
    }

    res.download(filePath, file, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading file.");
      }
    });
  });
};

export const GetAllOrganizationFile = async (req, res) => {
  const baseDir = path.join(process.cwd(), "../public");

  async function getFilesGroupedByOrg(dir) {
    const orgs = await fsPromises.readdir(dir, { withFileTypes: true });
    const result = {};

    for (const org of orgs) {
      if (org.isDirectory()) {
        const orgName = org.name;
        const orgDir = path.join(dir, orgName);
        const allFiles = await getFilesRecursively(orgDir);
        result[orgName] = allFiles.map((file) =>
          path
            .relative(path.join(process.cwd(), "public"), file)
            .replace(/\\/g, "/")
        );
      }
    }

    return result;
  }

  async function getFilesRecursively(dir) {
    let results = [];
    const list = await fsPromises.readdir(dir, { withFileTypes: true });

    for (const file of list) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        results = results.concat(await getFilesRecursively(fullPath));
      } else {
        results.push(fullPath);
      }
    }

    return results;
  }

  try {
    const filesGrouped = await getFilesGroupedByOrg(baseDir);
    return res.status(200).json({ filesByOrganization: filesGrouped });
  } catch (error) {
    console.error("Error reading files:", error);
    return res.status(500).json({ error: "Could not read files" });
  }
};

export const GetOrganizationFiles = async (req, res) => {
  const { organization } = req.body;

  if (!organization) {
    return res
      .status(400)
      .json({ error: "Organization name is required in the request body." });
  }

  const orgDir = path.join(process.cwd(), "../public", organization);

  async function getFilesRecursively(dir) {
    let results = [];
    const list = await fsPromises.readdir(dir, { withFileTypes: true });

    for (const file of list) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        results = results.concat(await getFilesRecursively(fullPath));
      } else {
        results.push(fullPath);
      }
    }

    return results;
  }

  try {
    const allFiles = await getFilesRecursively(orgDir);
    const relativePaths = allFiles.map((file) =>
      path
        .relative(path.join(process.cwd(), "public"), file)
        .replace(/\\/g, "/")
    );

    return res.status(200).json({ [organization]: relativePaths });
  } catch (error) {
    console.error("Error reading files:", error);
    return res
      .status(500)
      .json({ error: "Could not read files for the specified organization." });
  }
};

export const GetAllStudentPostFiles = async (req, res) => {
  const baseDir = path.join(process.cwd(), "../public");

  const getFilesRecursively = async (dir) => {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory()
          ? await getFilesRecursively(fullPath)
          : fullPath;
      })
    );
    return files.flat();
  };

  const getStudentPostFilesInOrg = async (orgDir) => {
    const results = [];

    const walk = async (dir) => {
      const entries = await fsPromises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name === "StudentPost") {
            const files = await getFilesRecursively(fullPath);
            results.push(...files);
          } else {
            await walk(fullPath);
          }
        }
      }
    };

    await walk(orgDir);
    return results;
  };

  try {
    const orgs = await fsPromises.readdir(baseDir, { withFileTypes: true });
    const filesByOrganization = {};

    for (const org of orgs) {
      if (org.isDirectory()) {
        const orgDir = path.join(baseDir, org.name);
        const studentPostFiles = await getStudentPostFilesInOrg(orgDir);

        if (studentPostFiles.length > 0) {
          filesByOrganization[org.name] = studentPostFiles.map((filePath) =>
            path.relative(baseDir, filePath).replace(/\\/g, "/")
          );
        }
      }
    }

    return res.status(200).json({ StudentPosts: filesByOrganization });
  } catch (err) {
    console.error("Error retrieving StudentPost files:", err);
    return res
      .status(500)
      .json({ error: "Could not retrieve StudentPost files" });
  }
};

export const GetFilesByDirectory = async (req, res) => {
  const { orgFolder, orgDocumentClassification, subDir } = req.params;

  // Construct full path from params
  const targetDir = path.join(
    process.cwd(),
    "public",
    orgFolder,
    orgDocumentClassification,
    subDir || ""
  );

  if (!fs.existsSync(targetDir)) {
    return res.status(404).json({ error: "Directory does not exist" });
  }

  try {
    const files = await fsPromises.readdir(targetDir, {
      withFileTypes: true,
    });

    const fileList = files
      .filter((f) => f.isFile())
      .map((file) => ({
        name: file.name,
        path: path.join(
          "/",
          orgFolder,
          orgDocumentClassification,
          subDir || "",
          file.name
        ),
      }));

    return res.status(200).json({ files: fileList });
  } catch (error) {
    console.error("Error listing files:", error);
    return res.status(500).json({ error: "Could not list files" });
  }
};
