const num = 1;
let a = 'str';
console.log(a.substr(0));

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

b();

c();

const d = { e: { f: 1 } };

console.log(d?.e?.f);

function Component() {}
Component();

const OtherComponent = (x, y) => {};

const PascalCaseVar = 1;
const snake_case_var = 1;

OtherComponent(PascalCaseVar, snake_case_var);
