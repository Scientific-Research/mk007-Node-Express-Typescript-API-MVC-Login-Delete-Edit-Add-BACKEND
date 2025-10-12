// import http from 'http';
// import * as http from 'http';

// import http from 'http';
import express from 'express';
import cors from 'cors';
// import { IncomingMessage, ServerResponse } from 'http';
// import { generateMainContent } from './content';
import {
  getApiInstructionsHtml,
  getJobs,
  getTodos,
  getTotaledSkills,
  getTest,
  deleteJob,
} from './model.js';

const app = express();
app.use(cors()); // erlaubt alle Origins

// oder spezifisch:
// app.use(cors({ origin: 'http://localhost:5173' }));

const port = 8000;

// const jobs = fs.readFileSync('./src/data/jobs.json', 'utf-8'); // in JSON Format => we can not use it => we have to use JSON.parse and then use it like following:

// const jobs: IJobs[] = JSON.parse(
//   fs.readFileSync('./src/data/jobs.json', 'utf-8')
// ); // in JS Object format => we can use it
// console.log(jobs);

// using http.createServer
// http
//   .createServer((req: IncomingMessage, res: ServerResponse) => {
//     // const html = await generateMainContent(); // HTML bei jedem Request neu generieren
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     // res.write('info site');
//     // res.write(html);
//     res.write(JSON.stringify(jobs));
//     res.end();
//   })
//   .listen(port);

// using express
app.get('/', (req: express.Request, res: express.Response) => {
  // res.send(
  //   'Job Site API. To see the complete list of Jobs, add "/jobs" at the END of URL => http://localhost:8000/jobs'
  // );

  res.send(getApiInstructionsHtml());
});

app.get('/jobs', (req: express.Request, res: express.Response) => {
  // res.send(jobs); // showing the jobs on the browser or test.rest or Postmann => http://localhost:8000/jobs
  // res.json(jobs);

  res.send(getJobs());
});

app.get('/todos', (req: express.Request, res: express.Response) => {
  // res.send(todos);

  res.send(getTodos());
});

app.get('/totaledSkills', (req: express.Request, res: express.Response) => {
  res.json(getTotaledSkills());
});

// NOTE Shows all the Jobs and SkillInfos together extracted from our Lowdb databank => db.json => only for test purposes => we can delete it.
app.get('/test', (req: express.Request, res: express.Response) => {
  res.json(getTest());
  // res.send('test from server');
});

app.delete('/jobs/:id', async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);

  // store the deleted Object came back from model.ts(deleteJob function) in deletedObject variable!
  const deletedObject = await deleteJob(id);

  // when there is not such an object(because it was already deleted or there is no such id) => we get undefined!
  if (deletedObject === undefined) {
    res.status(409).send({
      error: true,
      message: `job with id ${id} does not exist, `,
    });
  } else {
    // when deleted Object is not undefined and is available, we will display it at the output with success code => 200
    res.status(200).json(deletedObject);
  }
  // const nextId = id + 1;
  // res.send(`delete this job with id: ${id} and next id would be: ${nextId}`);
});

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
