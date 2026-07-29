const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('simon');

const userCollection = db.collection('user');
const scoreCollection = db.collection('score');
const wordCollection = db.collection('word');
const progressCollection = db.collection('progress');
const settingCollection = db.collection('setting');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

function getUser(username) {
  return userCollection.findOne({ username: username });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ username: user.username }, { $set: user });
}

async function updateUserRemoveAuth(user) {
  await userCollection.updateOne({ username: user.username }, { $unset: { token: 1 } });
}

async function saveWord(username, word, definition) {
  return wordCollection.updateOne(
    { username, word },
    { $set: { username, word, definition } },
    { upsert: true }
  );
}

async function getUserWords(username) {
  const words = await wordCollection.find({ username }).toArray();
  const wordMap = {};
  words.forEach(item => { wordMap[item.word] = item.definition; });
  return wordMap;
}

async function getAllWordsExcept(username) {
  const words = await wordCollection.find({ username: { $ne: username } }).toArray();
  const wordMap = {};
  words.forEach(item => { 
    if (!wordMap[item.username]) wordMap[item.username] = {};
    wordMap[item.username][item.word] = item.definition; });
  return wordMap;
}

async function saveBookProgress(username, bookId, page) {
  const stringId = String(bookId);
  await progressCollection.updateOne(
    { username, bookId: stringId },
    { $set: { username, bookId: stringId, page } },
    { upsert: true }
  );
}

async function getBookProgress(username, bookId) {
  const record = await progressCollection.findOne({ username, bookId: String(bookId) });
  return record ? record.page : 0;
}

async function saveLastBook(username, bookId) {
  await userCollection.updateOne(
    { username },
    { $set: { lastBookId: String(bookId) } },
  );
}

async function getLastBook(username) {
  const user = await userCollection.findOne({ username });
  return user?.lastBookId || null;
}

async function saveSettings(username, settings) {
  await settingCollection.updateOne(
    { username },
    { $set: { username, ...settings } },
    { upsert: true }
  );
}

async function getSettings(username) {
  const settings = await settingCollection.findOne({ username });
  if (!settings) return { theme: 'light', fontSize: 1.0 };
  const { _id, username: u, ...cleanSettings } = settings;
  return cleanSettings;
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  updateUserRemoveAuth,
  saveWord,
  getUserWords,
  getAllWordsExcept,
  saveBookProgress,
  getBookProgress,
  saveLastBook,
  getLastBook,
  saveSettings,
  getSettings
};
