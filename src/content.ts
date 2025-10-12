import { camelCase } from 'lodash';
import axios from 'axios';

interface Noun {
  article: string;
  singular: string;
  plural: string;
}

const url = 'https://edwardtanguay.vercel.app/share/germanNouns.json';

let nouns: Noun[] = [];

export const generateMainContent = async () => {
  try {
    nouns = (await axios.get(url)).data;
  } catch (error) {
    console.log('Fehler beim Laden der Nouns:', error);
  }

  const message = 'welcome to the Context.ts page!';
  const messageInCamelCase = camelCase(message);

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Info Site</title>
    <style>
      body {
        background-color: #333;
        color: #ddd;
        font-family: sans-serif;
        padding: 0 1rem;

        p {
          span {
            color: yellow;
            font-size: large;
          }
        }
      }
    </style>
  </head>
  <body>
    <h1>Info Site</h1>
    <p>Welcome to this info Site!</p>
    <p>Hi, <span> ${messageInCamelCase}</span></p>
    <h2>Nouns</h2>
    ${nouns
      .map((noun: Noun) => {
        return `
    <div class="noun">
      <div class="singular">${noun.article} ${noun.singular}</div>
    </div>
    `;
      })
      .join('')}
  </body>
</html>
`;
};
