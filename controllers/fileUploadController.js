exports.uploadPoster = (req, res) => {
  const posters = req.files.poster;
  if (!posters || posters.length === 0) {
    return res.status(400).json({ message: 'No posters uploaded' });
  }

  const posterPaths = posters.map(file => file.path.replace(/\\/g, '/'));
  res.status(200).json({ posters: posterPaths });
};

exports.uploadVideo = (req, res) => {
  const video = req.files.video?.[0];
  if (!video) {
    return res.status(400).json({ message: 'No video uploaded' });
  }

  const videoPath = video.path.replace(/\\/g, '/');
  res.status(200).json({ video: videoPath });
};
