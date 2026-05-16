import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export async function ask(question: string, defaultValue?: string): Promise<string> {
  const rl = createInterface({ input, output });
  const hint = defaultValue ? ` [${defaultValue}]` : '';
  const answer = (await rl.question(`${question}${hint}: `)).trim();
  rl.close();
  return answer || defaultValue || '';
}

export async function askChoice<T extends string>(
  question: string,
  choices: T[],
  defaultValue?: T,
): Promise<T> {
  const choiceStr = choices.map((c) => (c === defaultValue ? `[${c}]` : c)).join(' / ');
  const ans = await ask(`${question} (${choiceStr})`, defaultValue);
  if (!choices.includes(ans as T)) {
    console.warn(`⚠️  "${ans}" は不正、デフォルト "${defaultValue}" を採用`);
    return defaultValue as T;
  }
  return ans as T;
}
