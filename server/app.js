require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const AWS = require("aws-sdk");
const sequelize = require("./database");
const Image = require("./models/Image");
const app = express();
const upload = multer();

app.use(cors());
// Parse JSON bodies
app.use(express.json());

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_BUCKET_REGION,
});

// Upload image handler
async function uploadImage(req, res) {
  try {
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, mimetype, buffer } = imageFile;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}_${originalname}`,
      Body: buffer,
      ContentType: mimetype,
    };

    s3.upload(params, async (err, data) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Upload failed", error: err.message });
      }

      const { Location: url, Key: key } = data;

      try {
        await Image.create({
          name: originalname,
          type: mimetype,
          url: url,
          public_id: key,
        });
        res.json({
          message: "Image uploaded successfully",
          imageUrl: url,
        });
      } catch (dbErr) {
        res
          .status(500)
          .json({ message: "Database error", error: dbErr.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Update image handler
async function updateImage(req, res) {
  const { id } = req.params;
  const imageFile = req.file;

  try {
    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // If a new image file is provided, update the image
    if (imageFile) {
      // Delete the old image from S3
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: image.public_id,
      };

      s3.deleteObject(deleteParams, (err, data) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to delete old image from S3",
            error: err.message,
          });
        }
      });

      // Upload the new image to S3
      const { originalname, mimetype, buffer } = imageFile;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Date.now()}_${originalname}`,
        Body: buffer,
        ContentType: mimetype,
      };

      s3.upload(uploadParams, async (err, data) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to upload new image to S3",
            error: err.message,
          });
        }

        const { Location: url, Key: key } = data;

        // Update image details in the database
        image.url = url;
        image.public_id = key;
        // Optionally update the name with the new image's name
        image.name = originalname;
        image.type = mimetype;
        await image.save();

        res.json({ message: "Image updated successfully", image });
      });
    } else {
      // If no new image file, only update metadata (like name)
      const { name } = req.body;
      image.name = name || image.name;
      await image.save();
      res.json({ message: "Image metadata updated successfully", image });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Delete image handler
async function deleteImage(req, res) {
  const { id } = req.params;

  try {
    const image = await Image.findByPk(id);

    if (!image) {
      console.log(`Image with ID ${id} not found`);
      return res.status(404).json({ message: "Image not found" });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: image.public_id,
    };

    console.log(`Deleting image with ID ${id} from S3: `, params);

    // Delete from S3
    s3.deleteObject(params, async (err, data) => {
      if (err) {
        console.error("Failed to delete image from S3", err);
        return res.status(500).json({
          message: "Failed to delete image from S3",
          error: err.message,
        });
      }

      // Delete from database
      await image.destroy();
      res.json({ message: "Image deleted successfully" });
    });
  } catch (error) {
    console.error("Server error during image deletion", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

app.post("/upload", upload.single("image"), uploadImage);
app.get("/images", (req, res) => {
  Image.findAll()
    .then((images) => res.json(images))
    .catch((err) =>
      res.status(500).json({ message: "Database error", error: err })
    );
});

// New routes for update and delete
// Allows updating with a new image file
app.put("/images/:id", upload.single("image"), updateImage);
app.delete("/images/:id", deleteImage);

const port = process.env.PORT || 3001;
app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port} !!!🎉`)
);
