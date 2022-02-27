import fs from 'fs';
import { useState } from 'react';

const num = 1;
let a = 'str';
console.log(fs, a.substr(0));

function b(num) {
  if (true) {
    console.log(num);
  }
}

b();

c();

const d = { e: { f: 1 } };

console.log(d?.e?.f);

export function Component() {
  const [user, setUser] = useState(null);
  console.log(user, setUser);
  // New JSX transform: JSX does not throw an error when React not in scope
  // https://github.com/yannickcr/eslint-plugin-react/issues/2440#issuecomment-683433266
  return (
    <div class="abc">
      <div key="xx">1</div>
      <iframe key="xx" title="a" />
    </div>
  );
}
Component();

const OtherComponent = (x, y) => {};

const PascalCaseVar = 1;
const snake_case_var = 1;

OtherComponent(PascalCaseVar, snake_case_var);
