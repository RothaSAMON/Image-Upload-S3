import { useState } from "react";
import { Input, Button, CircularProgress, Stack, Snackbar, Alert } from "@mui/material";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import axios from "axios";

function ImageUpload({ fetchImages }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setSnackbarMessage("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://localhost:3001/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.imageUrl) {
        setSnackbarMessage(response.data.message || "Image uploaded successfully");
        fetchImages();
      } else {
        setSnackbarMessage("Unexpected response format");
      }
    } catch (error) {
      setSnackbarMessage("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Stack flexDirection="row" gap={2}>
      <Input type="file" onChange={handleFileChange} />
      <Button
        variant="contained"
        color="secondary"
        endIcon={<CloudDownloadIcon />}
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? <CircularProgress size={24} /> : "Upload"}
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <Button color="inherit" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default ImageUpload;
