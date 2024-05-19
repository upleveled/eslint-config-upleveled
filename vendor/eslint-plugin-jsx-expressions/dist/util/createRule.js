// @ts-nocheck
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRule = void 0;
const utils_1 = require("@typescript-eslint/utils");
// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const version = require("../../package.json").version;
exports.createRule = utils_1.ESLintUtils.RuleCreator((name) => `https://github.com/hluisson/eslint-plugin-jsx-expressions/blob/v${version}/lib/rules/${name}.md`);
//# sourceMappingURL=createRule.js.map