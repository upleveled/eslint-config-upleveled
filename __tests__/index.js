import string from './CaseSensitive.js';
const num = 1;
let a = 'str';
console.log(a);

function b(num) {
  if (true) {
    console.log(num);

    // JSX does not throw an error when React is
    // not in scope because of the new JSX transform
    // https://github.com/yannickcr/eslint-plugin-react/issues/2440#issuecomment-683433266
    const jsx = <div />;
    console.log(jsx);
  }
}

import str2 from './caseSensitive.js';

b();

c();

function Component() {}
Component();

const OtherComponent = (a, b) => {};

const PascalCaseVar = 1;
const snake_case_var = 1;

OtherComponent(PascalCaseVar, snake_case_var);
