## 从0到1实现一个webpack loader

### 1. 思路
1. 用`@babel/parser`将文件转换为`AST`抽象语法树
2. 用`@babel/traverse`找到相应的语法树节点
3. 用`@babel/types`创建相应的节点

### 2. 示例
1. 本地开发
```javascript
async function func() {
  let num = await asyncFunc();
  console.log(num)
}

func();
```

2. 打包后自动加上`try catch`
```javascript
async function func() {
  try{
    let num = await asyncFunc();
    console.log(num)
  }catch(e) {
    console.log(e)
  }
}

func();
```
3. `async-catch-loader.js`
```javascript
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types"); // babel的lodash库
const core = require("@babel/core");

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
  });

  // 将AST树重新转为代码字符串返回
  return core.transformFromAstSync(ast).code;
}
```
4. `webpack`中这样使用
> **注意：** `async-catch-loader`要在`babel-loader`之前使用
```javascript
modules.exports = {
  resolveLoader: {
    modules: ["node_modules", "./loaders"],
    extensions: [".js"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "async-catch-loader",
            options: {
              catchCode: `alert(e)`,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ]
  }
}
```

### 3. 参考资料
1. [嘿，不要给 async 函数写那么多 try/catch 了](https://juejin.cn/post/6844903886898069511#heading-3)
2. [AST explorer](https://astexplorer.net/)