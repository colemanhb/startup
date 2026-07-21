const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

// The scores and users are saved in memory and disappear whenever the service is restarted.
let users = [];
let scores = [];

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('username', req.body.username)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.username, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ username: user.username });
  }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('username', req.body.username);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ username: user.username });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

//Saving and storing words
let savedWords = {};
apiRouter.post('/word', verifyAuth, async (req, res) => {
  const {word, definition} = req.body;
  if (!word || !definition) {
    return res.status(400).send({ msg: 'Missing word or definition' });
  }
  const user = await findUser('token', req.cookies[authCookieName]);
  if (!user) {
    return res.status(401).send({ msg: 'Unauthorized' });
  }
  if (!savedWords[user.username]) {
    savedWords[user.username] = {};
  }
  savedWords[user.username][word] = definition;
  res.send({ msg: 'Word saved', words: savedWords });
});

apiRouter.get('/words', verifyAuth, async (req, res) => {
  const username = (await findUser('token', req.cookies[authCookieName]))?.username;
  const myWords = savedWords[username] || {};
  const friendsWords = {};
  for (const [user, words] of Object.entries(savedWords)) {
    if (user !== username) {
      friendsWords[user] = words;
    }
  }
  res.send({ myWords, friendsWords });
}) 

let bookProgress = {};
apiRouter.post('/progress', async (req, res) => {
  const { bookId, page } = req.body;
  if (!bookId || page === undefined) {
    return res.status(400).send({ msg: 'Missing bookId or page' });
  }
  const stringId = String(bookId);
  bookProgress[stringId] = page;
  res.send({ msg: 'Progress saved', progress: bookProgress });
});

let userSettings = {
  theme: 'light',
  fontSize: 1.0,
};

apiRouter.post('/settings', async (req, res) => {
  const { theme, fontSize } = req.body;
  if (theme) {
    userSettings.theme = theme;
  }
  if (fontSize) {
    userSettings.fontSize = fontSize;
  }
  res.send({ msg: 'Settings saved', settings: userSettings });
});

apiRouter.get('/settings', async (req, res) => {
  res.send(userSettings);
});

apiRouter.get('/progress/:bookId', async (req, res) => {
  const stringId = String(req.params.bookId);
  const progress = (stringId in bookProgress) ? bookProgress[stringId] : 0;
  res.send({ progress });
});

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
})
// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// GetScores
apiRouter.get('/scores', verifyAuth, (_req, res) => {
  res.send(scores);
});

// SubmitScore
apiRouter.post('/score', verifyAuth, (req, res) => {
  scores = updateScores(req.body);
  res.send(scores);
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// updateScores considers a new score for inclusion in the high scores.
function updateScores(newScore) {
  let found = false;
  for (const [i, prevScore] of scores.entries()) {
    if (newScore.score > prevScore.score) {
      scores.splice(i, 0, newScore);
      found = true;
      break;
    }
  }

  if (!found) {
    scores.push(newScore);
  }

  if (scores.length > 10) {
    scores.length = 10;
  }

  return scores;
}

async function createUser(username, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username: username,
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  return users.find((u) => u[field] === value);
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});