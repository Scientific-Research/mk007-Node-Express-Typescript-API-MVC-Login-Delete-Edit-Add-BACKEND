// import fs from 'fs';

// import rawJobs from './data/jobs.json';
// import rawJobs from './data/jobs.json' assert { type: 'json' };

// prettier-ignore
// import rawJobs from './data/jobs.json' with { type: 'json' };
// OR using the following line of code instead of above line:

/* 
import fs from 'fs/promises';
const jobs = JSON.parse(await fs.readFile('./dist/data/jobs.json', 'utf-8'));
*/

// import skillInfos from './data/skillInfos.json';
// import skillInfos from './data/skillInfos.json' assert { type: 'json' };

// prettier-ignore
// import skillInfos from './data/skillInfos.json' with { type: 'json' };

import fs from 'fs/promises';
import path from 'path';

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

import {
  IJobs,
  IRawJob,
  ISkillInfos,
  nullObjectSkill,
  TotaledSkill,
} from './interface.js';

interface DataSchema {
  // test: string;
  jobs: IRawJob[];
  skillInfos: ISkillInfos[];
}

// const __dirname = dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = join(__dirname, `../src/data/db.json`);
const adapter = new JSONFile<DataSchema>(dbFile);
// const db = new Low(adapter, {});
const defaultData: DataSchema = { jobs: [], skillInfos: [] };
const db = new Low<DataSchema>(adapter, defaultData);
await db.read();

const filePath_jobs = path.join(__dirname, '../src/data/jobs.json');
const filePath_skillInfos = path.join(__dirname, '../src/data/skillInfos.json');
// const rawJobs = JSON.parse(await fs.readFile(filePath, 'utf-8'));

// const skillInfos = JSON.parse(await fs.readFile('./data/jobs.json', 'utf-8');
// const rawJobs = JSON.parse(await fs.readFile(filePath_jobs, 'utf-8'));

// NOTE: WE HAVE TO USE LowDB, that's why we use => const rawJobs = db.data.jobs;

// const skillInfos = JSON.parse(await fs.readFile('./data/skillInfos.json', 'utf-8');
// const skillInfos = JSON.parse(await fs.readFile(filePath_skillInfos, 'utf-8'));

// NOTE: WE HAVE TO USE LowDB, that's why we use => const skillInfos = db.data.skillInfos;

export const getApiDocumentationHtml = () => {
  return `<h1>GET A JOB API</h1> <ul>
  <li><a href="/jobs">/jobs</a>- returns an array of job objects</li>
  </ul>`;
};

export const getApiInstructionsHtml = () => {
  return `
<style>
a, h1 {
    background-color: #ddd;
    font-family: courier;
}
</style>
<h1>GETAJOB API</h1>
<ul>
    <li><a href="jobs">/jobs</a> - array of job listings will all fields</li>
    <li><a href="todos">/todos</a> - array of todos with todo/company/title fields</li>
    <li><a href="totaledSkills">/totaledSkills</a> - array of skills with totals how often they occur in job listings</li>
</ul>
    `;
};

export const getJobs = () => {
  const jobs: IJobs[] = [];

  const rawJobs = db.data.jobs; // we get the rawJobs from LowDB and not from fs.readSync() anymore.

  rawJobs.forEach((rawJob: IRawJob) => {
    const job: IJobs = {
      ...rawJob,
      // skills: [],
      skills: buildSkills(rawJob.skillList),
    };
    jobs.push(job);
  });
  return jobs;
};

export const buildSkills = (skillList: string) => {
  const skillIdCodes = skillList.split(',').map((s) => s.trim());
  // console.log(skillIdCodes); ["angular", "cicd", "testing", "hotjar", "piwik"]

  const skills: ISkillInfos[] = [];
  skillIdCodes.forEach((skillIdCode, i) => {
    // First Solution:
    const _skillIdCode = skillIdCodes[i];
    // console.log(_skillIdCode); //'angular','cicd','testing','hotjar','piwik',...

    // const skill = skillInfos.find( => using Lowdb as following:
    const skill = db.data.skillInfos.find(
      (info: ISkillInfos) => info.idCode === _skillIdCode
      // (info: ISkillInfos) => info.idCode === skillIdCode
    );

    // Second Solution:
    // const skill = skillInfos.find(
    //   // (info: ISkillInfos) => info.idCode === _skillIdCode
    //   (info: ISkillInfos) => info.idCode === skillIdCode
    // );

    /* skill : {
          idCode: 'angular',
          name: 'Angular',
          url: 'https://onespace.pages.dev/techItems?id=36',
          description: 'together with React and Vue.js one of the three most popular JavaScript frameworks'
      } */

    // let skill: ISkillInfos;
    // if (_skill !== undefined) {
    if (skill) {
      // skill = {
      //   // ...nullObjectSkill,
      //   // idCode: skillIdCode,
      // };
      // skill = {
      //   ..._skill,
      //   // idCode: skillIdCode,
      // };
      skills.push(skill);
      // skills.push(_skill);
    }
    // else {
    //   // skill = {
    //   //   ..._skill,
    //   //   // idCode: skillIdCode,
    //   // };
    // }
  });
  // console.log(skillList);
  // return [];
  return skills;
};

export const getTodos = () => {
  // const todos = rawJobs.map((job: IRawJob) => { using Lowdb as following:
  const todos = db.data.jobs.map((job: IRawJob) => {
    return {
      todo: job.todo,
      company: job.company,
      title: job.title,
      url: job.url,
    };
  });
  return todos;
};

export const getTotaledSkills = () => {
  const totaledSkills: TotaledSkill[] = [];
  getJobs().forEach((job) => {
    job.skills.forEach((skill) => {
      const existingTotaledSkill = totaledSkills.find(
        (totaledSkill) => totaledSkill.skill.idCode === skill.idCode
      );
      if (!existingTotaledSkill) {
        totaledSkills.push({
          skill,
          total: 1,
        });
      } else {
        existingTotaledSkill.total++;
      }
    });
  });
  return totaledSkills;
};

export const getSkillsWithList = (skillList: string) => {
  const skills: ISkillInfos[] = [];
  const skillIdCodes = skillList.split(',').map((m) => m.trim());
  skillIdCodes.forEach((skillIdCode) => {
    const skill: ISkillInfos = lookupSkill(skillIdCode);
    skills.push(skill);
  });
  return skills;
};

export const lookupSkill = (idCode: string): ISkillInfos => {
  // const _skill = (skillInfos as ISkillInfos[]).find(
  //   (info) => info.idCode === idCode
  // );

  // const _skill = (skillInfos as ISkillInfos[]).find( using Lowdb as following:
  const _skill = (db.data.skillInfos as ISkillInfos[]).find(
    (skill) => skill.idCode === idCode
  );

  if (_skill === undefined) {
    return {
      ...nullObjectSkill,
      idCode,
    };
  } else {
    return {
      ..._skill,
      idCode,
    };
  }
};

// NOTE Shows all the Jobs and SkillInfos together extracted from our Lowdb databank => db.json => only for test purposes => we can delete it.
export const getTest = () => {
  // return 'test from model';
  // const typedData = db.data as { jobs: string };
  const typedData = db.data as DataSchema;
  // return typedData.jobs;

  // return value as Object:
  return {
    jobs: db.data.jobs,
    skillInfos: db.data.skillInfos,
  };

  // return value as Array:
  // return [typedData.jobs, typedData.skillInfos];
};

export const deleteJob = async (id: number) => {
  // find the requested Object for delete in db.json
  const deletedObject = db.data.jobs.find((j) => j.id === id);

  // filter all the data except the one which is not intended to be deleted!
  db.data.jobs = db.data.jobs.filter((j) => j.id !== id);

  // write diese filtered data(not deleted ones) to the db.json
  await db.write();

  // send back the one which we want to delete(when is not available => undefined) to the deleteJob function in server.ts
  return deletedObject;
};
