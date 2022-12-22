import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import cors from 'cors'

import { registerValidation, loginValidation, postCreateValidation } from './validations.js'
import { UserController, PostController } from './controllers/index.js'
import { checkAuth, handleValidationErrors } from './utils/index.js'

mongoose
  .connect('mongodb+srv://alex:06071994@cluster0.dlkdcaa.mongodb.net/blog?retryWrites=true&w=majority')
  .then(() => {
    console.log('DB, ok!')
  })
  .catch(err => {
    console.log('DB error!', err)
  })

const app = express()

const storage = multer.diskStorage({
  destination: (_, __, cd) => {
    cd(null, 'uploads')
  },
  filename: (_, file, cd) => {
    cd(null, file.originalname)
  }
})

const upload = multer({ storage })

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))

app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)
app.get('/auth/me', checkAuth, UserController.getMe)

app.post('/uploads', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
})

app.get('/tags', PostController.getLastTags)
app.get('/posts', PostController.getAll)
app.get('/posts/:id', PostController.getOne)
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.delete('/posts/:id', checkAuth, PostController.remove)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update)

app.listen(4444, err => {
  if (err) {
    return console.log(err)
  }

  console.log('Server OK!')
})
