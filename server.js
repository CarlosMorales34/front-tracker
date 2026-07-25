const { createServer } = require('http');
const next = require('next');

const port = process.env.PORT || 3002;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`Vitalis listo en el puerto ${port}`);
  });
});
