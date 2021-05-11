// import { a, double } from "@/a";
// import '@/App';
// import txt from "@/index.txt";

function asyncFunc() {
  return new Promise((resolve, reject) => {
    setTimeout(()=> {reject(1);}, 1000)
  })
}

async function func() {
  let a = null;
  let num = await asyncFunc();
  let num2 = await asyncFunc();
  await asyncFunc();
  a = await asyncFunc();

  try {
    console.log("enter")
    await asyncFunc();
  }catch(e) {
    console.log(e)
  }

  // return num;
  console.log(num)
  console.log(num2);
}

func();
// console.log(result);

// class Foo {
//   constructor() {
//     this.count = 1;
//   }

//   get double() {
//     return this.count * 2;
//   }

//   increment() {
//     this.count+=1;
//   }

//   decrement() {
//     this.count-=1;
//   }

//   async asyncIncrement() {
//     const count = await new Proimise((resolve) => {
//       setTimeout(() => resolve(1), 500);
//     });
    
//     this.count+=count;
//   }
// }
// const foo = new Foo();

// console.log(foo.count);
// foo.increment();
// console.log(foo.count);

// console.log(txt);