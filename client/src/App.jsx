import { useState, useEffect } from "react";
import { Container, Typography, Snackbar, Alert, Stack } from "@mui/material";
import axios from "axios";
import ImageUpload from "./components/ImageUpload";
import ImageList from "./components/ImageList";
import EditImageDialog from "./components/EditImageDialog";

function App() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editImageId, setEditImageId] = useState(null);
  const [newImageName, setNewImageName] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const fetchImages = async () => {
    try {
      const response = await axios.get("http://localhost:3001/images");
      if (Array.isArray(response.data)) {
        setImages(response.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      setSnackbarMessage("Failed to load images");
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/images/${id}`);
      setSnackbarMessage("Image deleted successfully");
      fetchImages();
    } catch (error) {
      setSnackbarMessage("Failed to delete image");
      setSnackbarOpen(true);
    }
  };

  const handleOpenEditDialog = (image) => {
    setEditImageId(image.id);
    setNewImageName(image.name);
    setEditImageFile(null);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditImageId(null);
    setNewImageName("");
  };

  const handleUpdate = async () => {
    if (!editImageFile && !newImageName) {
      setSnackbarMessage("Please provide an image or a new name.");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    if (editImageFile) {
      formData.append("image", editImageFile);
    }
    formData.append("name", newImageName);

    try {
      const response = await axios.put(
        `http://localhost:3001/images/${editImageId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSnackbarMessage(response.data.message);
      fetchImages();
    } catch (error) {
      setSnackbarMessage("Failed to update image");
    } finally {
      setSnackbarOpen(true);
      handleCloseEditDialog();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Start current date function
  const getCurrentDate = () => {
    const today = new Date();
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return today.toLocaleDateString("en-US", options);
  };

  return (
    <Container>
      <Stack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        py={4}
      >
        <Typography variant="h4" fontWeight="bold" color="secondary">
          AWS S3 - UPPLOAD IMAGE
        </Typography>

        <Typography variant="body2" color="secondary">{getCurrentDate()}</Typography>
      </Stack>

      <ImageUpload setMessage={setSnackbarMessage} fetchImages={fetchImages} />

      <Stack py={4}>
        <ImageList
          images={images}
          handleDelete={handleDelete}
          handleOpenEditDialog={handleOpenEditDialog}
        />

        <EditImageDialog
          open={openEditDialog}
          handleClose={handleCloseEditDialog}
          newImageName={newImageName}
          setNewImageName={setNewImageName}
          handleImageFileChange={(e) => setEditImageFile(e.target.files[0])}
          handleUpdate={handleUpdate}
        />
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarMessage.includes("Failed") ? "error" : "success"}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
