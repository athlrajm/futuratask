const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const secretKey = process.env.SECRET_KEY || 'fallback_secret_key';


app.use(cors());
app.use(bodyParser.json());


mongoose.connect(process.env.MongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });


const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
});

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);


app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email });
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const jwtMiddleware = expressJwt({
  secret: secretKey,
  algorithms: ['HS256']
}).unless({ path: ['/api/login', '/api/register'] });

app.use('/api/tasks', jwtMiddleware);

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(task);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    res.send(task);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
