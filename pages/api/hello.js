 function handler(req, res) {
  res.status(200).json({ name: 'My name is Srun' })
}

export const config = {
  api: {
    bodyParser:false
  }
}

export default handler