## 从0到1实现一个webpack loader

### 1. 思路
1. 用`@babel/parser`将文件转换为`AST`抽象语法树
2. 用`@babel/traverse`找到相应的语法树节点
3. 用`@babel/types`创建相应的节点

### 2. 示例
```javascript
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types"); // babel的lodash库

module.exports = function(source) {
  let ast = parser.parse(source, {
    sourceType: "module", // 支持 es6 module
    plugins: ["dynamicImport", "jsx"], // 支持动态 import
  });

  traverse(ast, {
    // 找到await节点
    AwaitExpression(path) {
      let tryCatchAst = t.tryStatement(
        t.blockStatement([t.expressionStatement(path.node)]),
        // catch子语句
        t.catchClause()
      );

      path.replaceWithMultiple([tryCatchAst]);
    }
  })
}
```

### 3. 参考资料
1. [嘿，不要给 async 函数写那么多 try/catch 了](https://juejin.cn/post/6844903886898069511#heading-3)