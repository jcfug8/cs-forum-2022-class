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

app.get("/thread/:id", async (req, res) => {
  // implement me :)
  // no authentication needed a.k.a. authorization is public/open
  let thread;

  // get the thread
  try {
    thread = await Thread.findById(req.params.id);
    if (!thread) {
      res.status(404).json({
        message: "thread not found",
      });
      return;
    }
  } catch (err) {
    res.status(500).json({
      message: `get request failed to get thread`,
      error: err,
    });
    return;
  }

  // get the user
  try {
    thread = thread.toObject();
    let user = await User.findById(thread.user_id, "-password"); // how would you omit the pasword?
    thread.user = user;
  } catch (err) {
    console.log(
      `unable to get user ${thread.user_id} when getting thread ${thread._id}: ${err}`
    );
  }

  // get the posts users
  for (let k in thread.posts) {
    try {
      let user = await User.findById(thread.posts[k].user_id, "-password");
      thread.posts[k].user = user;
    } catch (err) {
      console.log(
        `unable to get user ${thread.posts[k].user_id} for post ${thread.posts[k]._id} when getting thread ${thread._id}: ${err}`
      );
    }
  }

  // return the thread
  res.status(200).json(thread);
});

app.get("/threads", async (req, res) => {
  // no authentication needed a.k.a. authorization is public/open
  let threads;
  // get the threads and omit the posts)
  try {
    threads = await Thread.find({}, "-posts");
  } catch (err) {
    res.status(500).json({
      message: "list request failed to get threads",
      error: err,
    });
    return;
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

  // return the threads
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
    return;
  }
});

app.delete("/thread/:id", async (req, res) => {
  // check if authed
  if (!req.user) {
    res.status(401).json({ mesage: "unauthenticated" });
    return;
  }
  console.log(`request to delete a single thread with id ${req.params.id}`);

  let thread;

  // get the thread to check if the current user is allow to delete it
  try {
    thread = await Thread.findById(req.params.id);
  } catch (err) {
    res.status(500).json({
      message: `failed to delete thread`,
      error: err,
    });
    return;
  }

  // check if we found it
  if (thread === null) {
    res.status(404).json({
      message: `thread not found`,
      thread_id: req.params.thread_id,
    });
    return;
  }

  // check if the current user made the post
  if (thread.user_id != req.user.id) {
    res.status(403).json({ mesage: "unauthorized" });
    return;
  }

  // delete the post
  try {
    await Thread.findByIdAndDelete(req.params.id);
  } catch (err) {
    res.status(500).json({
      message: `failed to delete post`,
      error: err,
    });
    return;
  }

  // return
  res.status(200).json(thread);
});

app.post("/post", async (req, res) => {
  // check auth
  if (!req.user) {
    res.status(401).json({ message: "unauthed" });
    return;
  }

  let thread;

  // find the thread and update it with the new post
  try {
    thread = await Thread.findByIdAndUpdate(
      req.body.thread_id, // what is the id
      {
        // what to update
        $push: {
          // push update operator
          posts: {
            // what field are we pushing to and what are we pushing?
            user_id: req.user.id,
            body: req.body.body,
            thread_id: req.body.thread_id,
          },
        },
      },
      {
        new: true, // options
      }
    );
    if (!thread) {
      res.status(404).json({
        message: `thread not found`,
        id: req.body.thread_id,
      });
      return;
    }
  } catch (err) {
    res.status(500).json({
      message: `failed to insert post`,
      error: err,
    });
    return;
  }

  // return the post
  res.status(201).json(thread.posts[thread.posts.length - 1]);
});

app.delete("/thread/:thread_id/post/:post_id", (req, res) => {
  // check auth
  // pull thread
  thread = await Thread.findOne({
    _id: req.params.thread_id,
    "posts._id": req.params.post_id,
  });
  // check that the post on the thread is "owned" by the requesting user (authorization)
  // for loop over thread.posts to find the post you're looking for so you can check the user_id
  // delete the post
  await Thread.findByIdAndUpdate(req.params.thread_id, {
    $pull: {
      posts: {
        _id: req.params.post_id,
      },
    },
  });
  // return the deleted post
});

module.exports = app;
