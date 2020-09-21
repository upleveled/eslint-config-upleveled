import string from './CaseSensitive.js';
const num = 1;

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
