const express = require("express");
const { User, Thread } = require("../persist/model");
const setUpAuth = require("./auth");
const setUpSession = require("./session");
const app = express();

// tel your server to understand how to handle json
app.use(express.json());

// allow serving of UI code
app.use(express.static(`${__dirname}/../public/`));

setUpSession(app);
setUpAuth(app);
// 9
app.post("/users", async (req, res) => {
  try {
    let user = await User.create({
      username: req.body.username,
      fullname: req.body.fullname,
      password: req.body.password,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({
      message: `post request failed to create user`,
      error: err,
    });
  }
});

app.get("/thread/:id", (req, res) => {
  // implement me :)
  // no authentication needed a.k.a. authorization is public/open
  // get the thread
  // get the user
  // get the posts (we don't have posts yet so just put a comment)
  // return the thread
});

app.get("/threads", async (req, res) => {
  // no authentication needed a.k.a. authorization is public/open

  // get the threads (extra points for omitting the posts)
  try {
    threads = await Thread.find({}, "-posts");
  } catch (err) {
    res.status(500).json({
      message: "list request failed to get threads",
      error: err,
    });
  }

  // get all the users for all the threads
  for (let k in threads) {
    try {
      threads[k] = threads[k].toObject();
      let user = await User.findById(threads[k].user_id, "-password"); // how would you omit the pasword?
      threads[k].user = user;
    } catch (err) {
      console.log(
        `unable to get user ${threads[k].user_id} when getting thread ${threads[k]._id}: ${err}`
      );
    }
  }

  // return the threads (extra points for getting the users to show up in the response)
  res.status(200).json(threads);
});

app.post("/thread", async (req, res) => {
  // auth
  if (!req.user) {
    res.status(401).json({ message: "unauthed" });
    return;
  }
  // create with await + try/catch
  try {
    let thread = await Thread.create({
      user_id: req.user.id,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
    });
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({
      message: "could not create thread",
      error: err,
    });
  }
});

app.delete("/thread/:id", (req, res) => {});

app.post("/post", (req, res) => {});

app.delete("/thread/:thread_id/post/:post_id", (req, res) => {});

module.exports = app;
