// 将文件转换为 AST 抽象语法树
const parser = require("@babel/parser");
// 找到相应的树节点
const traverse = require("@babel/traverse").default;
// babel的lodash库
const t = require("@babel/types");
const core = require("@babel/core");
// const loaderUtils = require("loader-utils");

const DEFAULT = {
  catchCode: (identifier) => `console.error(${identifier})`,
  identifier: "e",
  finallyCode: null,
};

module.exports = function(source) {
  let options = this.getOptions();

  let ast = parser.parse(source, {
    sourceType: "module", // 支持 es6 module
    plugins: ["dynamicImport", "jsx"], // 支持动态 import
  });

  options = {
    ...DEFAULT,
    ...options,
  };

  if (typeof options.catchCode === "function") {
    options.catchCode = options.catchCode(options.identifier);
  }
  let catchNode = parser.parse(options.catchCode).program.body;
  // let finallyNode = options.finallyCode && parser.parse(options.finallyCode).program.body;

  traverse(ast, {
    AwaitExpression(path) {
      // 如果 await 语句已经被 try/catch 包裹则不会再次注入
      if (path.findParent((path) => t.isTryStatement(path.node))) return;

      // let tryCatchAst = t.tryStatement(
      //   // try 子句（必需项）
      //   t.blockStatement[t.expressionStatement(path.node)],
      //   // catch子语句
      //   t
      //     .catchClause
      //     // t.blockStatement()
      //     ()
      // );

      // path.replaceWithMultiple([tryCatchAst]);

      // await 表达式可能是是作为一个声明语句
      // let res = await asyncFunc()
      // 也有可能是一个赋值语句
      // res = await asyncFunc()
      // 还有可能只是一个单纯的表达式
      // await asyncFunc()

      // 1. 变量声明
      if (t.isVariableDeclarator(path.parent)) {
        let variableDeclarationPath = path.parentPath.parentPath;
        let tryCatchAst = t.tryStatement(
          t.blockStatement([
            variableDeclarationPath.node, // Ast
          ]),
          t.catchClause(
            t.identifier(options.identifier),
            t.blockStatement(catchNode)
          )
        );
        variableDeclarationPath.replaceWithMultiple([tryCatchAst]);
        // 2. 赋值表达式
      } else if (t.isAssignmentExpression(path.parent)) {
        let expressionStatementPath = path.parentPath.parentPath;
        let tryCatchAst = t.tryStatement(
          t.blockStatement([
            expressionStatementPath.node, // Ast
          ]),
          t.catchClause(
            t.identifier(options.identifier),
            t.blockStatement(catchNode)
          )
        );

        expressionStatementPath.replaceWithMultiple([tryCatchAst]);
        // 3.await 表达式
      } else if (t.isAwaitExpression(path.node)) {
        let tryCatchAst = t.tryStatement(
          // try 子句（必需项）
          t.blockStatement([t.expressionStatement(path.node)]),
          // catch子语句
          t.catchClause(
            t.identifier(options.identifier),
            t.blockStatement(catchNode)
          )
        );

        path.replaceWithMultiple([tryCatchAst]);
      }
    },
  });

  // 拿到替换后的 AST 树后
  // 使用 @babel/core 包中的 transformFromAstSync 方法将 AST 树重新转为对应的代码字符串返回
  return core.transformFromAstSync(ast).code;
}