function handleReverse(src) {
  console.log("this.query==>", this.query);
  // 从 webpack 5 开始，this.getOptions 可以获取到 loader 上下文对象。
  // 它用来替代来自 loader-utils 中的 getOptions 方法
  console.log("this.getOptions==>", this.getOptions());

  const callback = this.async();

  src = src.split("").reverse().join("");

  // return src;
  // this.callback(null, src);

  setTimeout(() => {
    callback(null, src);
  }, 1000)
}

module.exports = handleReverse;
