import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Input,
  Button,
} from "@mui/material";

function EditImageDialog({
  open,
  handleClose,
  newImageName,
  setNewImageName,
  handleImageFileChange,
  handleUpdate,
}) {
  return (
    <Dialog open={open} onClose={handleClose}>
      {/* <DialogTitle>Edit Image</DialogTitle> */}
      <DialogContent sx={{ padding: 4 }}>
        <TextField
          label="Image Name"
          fullWidth
          value={newImageName}
          onChange={(e) => setNewImageName(e.target.value)}
        />
        <Input type="file" onChange={handleImageFileChange} sx={{ py: 2 }} />
      </DialogContent>
      <DialogActions sx={{ padding: 4 }}>
        <Button color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button color="secondary" variant="contained" onClick={handleUpdate}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditImageDialog;
