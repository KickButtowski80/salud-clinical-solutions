export default function handler(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'Test function works!',
    method: req.method
  });
}
