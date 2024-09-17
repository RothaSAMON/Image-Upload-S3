import {
  Card,
  CardMedia,
  CardContent,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

function ImageList({ images, handleDelete, handleOpenEditDialog }) {
  return (
    <Grid container spacing={2}>
      {images.length > 0 ? (
        images.map((image) => (
          <Grid item xs={12} sm={6} md={4} key={image.id}>
            <Card>
              <CardMedia
                component="img"
                height="250"
                image={image.url}
                alt={image.name}
              />
              <CardContent>
                <Typography variant="h6">{image.name}</Typography>
                <IconButton
                  color="secondary"
                  onClick={() => handleDelete(image.id)}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => handleOpenEditDialog(image)}
                >
                  <EditIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        <Typography>No images found</Typography>
      )}
    </Grid>
  );
}

export default ImageList;
