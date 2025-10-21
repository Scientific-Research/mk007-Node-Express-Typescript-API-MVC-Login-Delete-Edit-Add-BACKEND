// import http from 'http';
// import * as http from 'http';

// import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import requestIp from 'request-ip';

dotenv.config();

// import { IncomingMessage, ServerResponse } from 'http';
// import { generateMainContent } from './content';

import {
  getApiInstructionsHtml,
  getJobs,
  getTodos,
  getTotaledSkills,
  getTest,
  deleteJob,
  saveEditedJob,
  saveAddedJob,
} from './model.js';

import { IEditedJob, IJobs, IRawJob } from './interface.js';

const app = express();
app.use(cors()); // erlaubt alle Origins
app.use(express.json());

// oder spezifisch:
// app.use(cors({ origin: 'http://localhost:5173' }));

// const port = 8000;
const port = process.env.PORT;
const loginPin = process.env.LoginPIN;

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
  res.send(getTotaledSkills());
});

// NOTE Shows all the Jobs and SkillInfos together extracted from our Lowdb databank => db.json => only for test purposes => we can delete it.
app.get('/test', (req: express.Request, res: express.Response) => {
  res.json(getTest());
  // res.send('test from server');
});

app.delete('/jobs/:id', async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  const pin = req.body.pin;
  // store the deleted Object came back from model.ts(deleteJob function) in deletedObject variable!
  if (pin !== loginPin) {
    res.status(401).send({
      error: true,
      statusIdCode: 'badPin',
      message: `Bad pin.`,
    });
  } else {
    const deletedObject = await deleteJob(id);

    // when there is not such an object(because it was already deleted or there is no such id) => we get undefined!
    if (deletedObject === undefined) {
      res.status(409).send({
        error: true,
        statusIdCode: 'recordDoesNotExist',
        message: `job with id ${id} does not exist, deletion failed`,
      });
    } else {
      // when deleted Object is not undefined and is available, we will display it at the output with success code => 200
      res.status(200).json(deletedObject);
    }
  }

  // const nextId = id + 1;
  // res.send(`delete this job with id: ${id} and next id would be: ${nextId}`);
});

app.patch('/job', async (req: express.Request, res: express.Response) => {
  const editedJob: IEditedJob = req.body;
  // The following Code will not work - we have to use try-catch():
  // const job = await saveEditedJob(editedJob);
  // if (job) {
  //   res.status(200).send('ok');
  // } else {
  //   res.status(500).send('job did not save');
  // }

  try {
    await saveEditedJob(editedJob);
    res.status(200).send('ok');
  } catch (error) {
    res.status(500).send('job did not save');
  }
});

app.post('/job', async (req: express.Request, res: express.Response) => {
  const addedJob: IEditedJob = req.body.job;
  const pin: string = req.body.pin;
  if (pin !== loginPin) {
    res.status(401).send({
      error: true,
      statusIdCode: 'badPin',
      message: `Bad pin.`,
    });
  } else {
    const success = await saveAddedJob(addedJob);
    if (success) {
      res.status(200).send('ok');
    } else {
      res.status(500).send('job did not save');
    }
  }
});

app.post(
  '/identify-as-admin',
  (req: express.Request, res: express.Response) => {
    const pin = req.body.pin;
    console.log(pin);
    if (pin !== loginPin) {
      res.status(401).send({
        error: true,
        statusIdCode: 'badPin',
        message: `Bad pin.`,
      });
    } else {
      res.status(200).send('ok');
    }
  }
);

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
