const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();
const DB = require('./database.js');

const authCookieName = 'token';

// Port configuration
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Middleware to verify authorization
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Express Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Router for API endpoints
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Authentication Endpoints
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('username', req.body.username)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.username, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ username: user.username });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('username', req.body.username);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      await DB.updateUser(user);
      setAuthCookie(res, user.token);
      res.send({ username: user.username });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    await DB.updateUserRemoveAuth(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Word Endpoints
apiRouter.post('/word', verifyAuth, async (req, res) => {
  const { word, definition } = req.body;
  if (!word || !definition) {
    return res.status(400).send({ msg: 'Missing word or definition' });
  }

  await DB.saveWord(req.user.username, word, definition);
  const myWords = await DB.getWordsForUser(req.user.username);
  res.send({ msg: 'Word saved', words: myWords });
});

apiRouter.get('/words', verifyAuth, async (req, res) => {
  const myWords = await DB.getWordsForUser(req.user.username);
  const friendsWords = await DB.getAllWordsExcept(req.user.username);
  res.send({ myWords, friendsWords });
});

// Book Progress Endpoints
apiRouter.post('/progress', verifyAuth, async (req, res) => {
  const { bookId, page } = req.body;
  if (!bookId || page === undefined) {
    return res.status(400).send({ msg: 'Missing bookId or page' });
  }

  await DB.saveBookProgress(req.user.username, bookId, page);
  res.send({ msg: 'Progress saved' });
});

apiRouter.get('/progress/:bookId', verifyAuth, async (req, res) => {
  const progress = await DB.getBookProgress(req.user.username, req.params.bookId);
  res.send({ progress });
});

// Last Book Endpoints
apiRouter.post('/lastBook', verifyAuth, async (req, res) => {
  const { bookId } = req.body;
  if (!bookId) {
    return res.status(400).send({ msg: 'Missing bookId' });
  }

  await DB.saveLastBook(req.user.username, bookId);
  res.send({ msg: 'Last book saved' });
});

apiRouter.get('/lastBook', verifyAuth, async (req, res) => {
  const lastBookId = await DB.getLastBook(req.user.username);
  res.send({ lastBookId });
});

// Settings Endpoints
apiRouter.post('/settings', verifyAuth, async (req, res) => {
  const { theme, fontSize } = req.body;
  const currentSettings = await DB.getSettings(req.user.username);

  if (theme) currentSettings.theme = theme;
  if (fontSize) currentSettings.fontSize = fontSize;

  await DB.saveSettings(req.user.username, currentSettings);
  res.send({ msg: 'Settings saved', settings: currentSettings });
});

apiRouter.get('/settings', verifyAuth, async (req, res) => {
  const settings = await DB.getSettings(req.user.username);
  res.send(settings);
});

// Gutenberg Proxy Endpoint
apiRouter.get('/gutenberg/:id', async (req, res) => {
  const id = req.params.id;
  const url = `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!response.ok) {
      return res.status(404).send({ msg: 'Book not found' });
    }
    const rawText = await response.text();
    res.send({ rawText });
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).send({ msg: 'Error fetching book' });
  }
});

// Score Endpoints
apiRouter.get('/scores', verifyAuth, async (_req, res) => {
  const scores = await DB.getHighScores();
  res.send(scores);
});

apiRouter.post('/score', verifyAuth, async (req, res) => {
  await DB.addScore(req.body);
  const scores = await DB.getHighScores();
  res.send(scores);
});

// Default Error Handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return Default Single Page App (SPA)
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// User Helper Functions
async function createUser(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    username: username,
    password: passwordHash,
    token: uuid.v4(),
  };
  await DB.addUser(user);
  return user;
}

async function findUser(field, value) {
  if (!value) return null;
  if (field === 'token') {
    return await DB.getUserByToken(value);
  }
  return await DB.getUser(value);
}

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Start Server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});