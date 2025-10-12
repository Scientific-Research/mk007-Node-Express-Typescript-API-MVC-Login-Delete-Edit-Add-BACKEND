export interface ISkillInfos {
  idCode: string;
  name: string;
  url: string;
  description: string;
}

export const nullObjectSkill: ISkillInfos = {
  idCode: '',
  name: '',
  url: '',
  description: '',
};

export interface IRawJob {
  id: number;
  title: string;
  company: string;
  url: string;
  description: string;
  skillList: string;
  // skills: ISkillInfos[];
  todo: string;
}

export interface IJobs {
  id: number;
  title: string;
  company: string;
  url: string;
  description: string;
  skillList: string;
  skills: ISkillInfos[];
  todo: string;
}

export interface TotaledSkill {
  skill: ISkillInfos;
  total: number;
}
