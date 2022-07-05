const app = require("./server/server");
const { connect, onConnect } = require("./persist/connect");
const config = require("./config");

onConnect(() => {
  app.listen(config.http_port, () => {
    console.log(`serving on port ${config.http_port}`);
  });
});

try {
  connect(
    config.mongo_user,
    config.mongo_pass,
    config.mongo_host,
    config.mongo_port,
    config.mongo_db
  );
} catch (err) {
  console.log(err);
  throw "couldn't start";
}
