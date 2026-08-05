const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();
const DB = require('./database.js');
const { peerProxy } = require('./peerProxy.js');

const authCookieName = 'token';

// Port configuration
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Middleware to verify authorization
const verifyAuth = async (req, res, next) => {
  try {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).send({ msg: 'Unauthorized' });
    }
  } catch (err) {
    console.error('Error in verifyAuth:', err);
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
  try {
    if (await findUser('username', req.body.username)) {
      res.status(409).send({ msg: 'Existing user' });
    } else {
      const user = await createUser(req.body.username, req.body.password);
      setAuthCookie(res, user.token);
      res.send({ username: user.username });
    }
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).send({ msg: 'Error creating user' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
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
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send({ msg: 'Error during login' });
  }
});

apiRouter.get('/user/me', verifyAuth, async (req, res) => {
  res.send({ username: req.user.username });
});

apiRouter.delete('/auth/logout', async (req, res) => {
  try {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (user) {
      await DB.updateUserRemoveAuth(user);
    }
    res.clearCookie(authCookieName);
    res.status(204).end();
  } catch (err) {
    console.error('Error logging out:', err);
    res.status(500).send({ msg: 'Error logging out' });
  }
});

// Word Endpoints
apiRouter.post('/word', verifyAuth, async (req, res) => {
  try {
    const { word, definition } = req.body;
    if (!word || !definition) {
      return res.status(400).send({ msg: 'Missing word or definition' });
    }

    await DB.saveWord(req.user.username, word, definition);
    const myWords = await DB.getUserWords(req.user.username);
    res.send({ msg: 'Word saved', words: myWords });
  } catch (err) {
    console.error('Error saving word:', err);
    res.status(500).send({ msg: 'Error saving word' });
  }
});

apiRouter.get('/words', verifyAuth, async (req, res) => {
  try {
    const myWords = await DB.getUserWords(req.user.username);
    const friendsWords = await DB.getAllWordsExcept(req.user.username);
    res.send({ myWords, friendsWords });
  } catch (err) {
    console.error('Error getting words:', err);
    res.status(500).send({ msg: 'Error getting words' });
  }
});

// Book Progress Endpoints
apiRouter.post('/progress', verifyAuth, async (req, res) => {
  try {
    const { bookId, page } = req.body;
    if (!bookId || page === undefined) {
      return res.status(400).send({ msg: 'Missing bookId or page' });
    }

    await DB.saveBookProgress(req.user.username, bookId, page);
    res.send({ msg: 'Progress saved' });
  } catch (err) {
    console.error('Error saving progress:', err);
    res.status(500).send({ msg: 'Error saving progress' });
  }
});

// GET progress allows unauthenticated fallback to 0 page instead of crashing or rejecting with 401
apiRouter.get('/progress/:bookId', async (req, res) => {
  try {
    const user = await findUser('token', req.cookies[authCookieName]);
    if (!user) {
      return res.send({ progress: 0 });
    }
    const progress = await DB.getBookProgress(user.username, req.params.bookId);
    res.send({ progress });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).send({ msg: 'Error fetching progress' });
  }
});

// Last Book Endpoints
apiRouter.post('/lastBook', verifyAuth, async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!bookId) {
      return res.status(400).send({ msg: 'Missing bookId' });
    }

    await DB.saveLastBook(req.user.username, bookId);
    res.send({ msg: 'Last book saved' });
  } catch (err) {
    console.error('Error saving last book:', err);
    res.status(500).send({ msg: 'Error saving last book' });
  }
});

apiRouter.get('/lastBook', verifyAuth, async (req, res) => {
  try {
    const lastBookId = await DB.getLastBook(req.user.username);
    res.send({ lastBookId });
  } catch (err) {
    console.error('Error fetching last book:', err);
    res.status(500).send({ msg: 'Error fetching last book' });
  }
});

// Settings Endpoints
apiRouter.post('/settings', verifyAuth, async (req, res) => {
  try {
    const { theme, fontSize } = req.body;
    const currentSettings = await DB.getSettings(req.user.username);

    if (theme) currentSettings.theme = theme;
    if (fontSize) currentSettings.fontSize = fontSize;

    await DB.saveSettings(req.user.username, currentSettings);
    res.send({ msg: 'Settings saved', settings: currentSettings });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).send({ msg: 'Error saving settings' });
  }
});

apiRouter.get('/settings', verifyAuth, async (req, res) => {
  try {
    const settings = await DB.getSettings(req.user.username);
    res.send(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).send({ msg: 'Error fetching settings' });
  }
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
  try {
    const scores = await DB.getHighScores();
    res.send(scores);
  } catch (err) {
    console.error('Error getting scores:', err);
    res.status(500).send({ msg: 'Error getting scores' });
  }
});

apiRouter.post('/score', verifyAuth, async (req, res) => {
  try {
    await DB.addScore(req.body);
    const scores = await DB.getHighScores();
    res.send(scores);
  } catch (err) {
    console.error('Error adding score:', err);
    res.status(500).send({ msg: 'Error adding score' });
  }
});

// Default Error Handler
app.use(function (err, req, res, next) {
  console.error('Unhandled server error:', err);
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
const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

peerProxy(httpService);