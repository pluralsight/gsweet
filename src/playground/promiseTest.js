// const delay = (ms) => {
//   return new Promise(resolve => setTimeout(resolve, ms))
// };

const delay = require("util").promisify(setTimeout);
const logger = require("../utils/logger");
// const promiseTimeout = new Promise((resolve) => {
//   setTimeout(async (books) => {
//     books[i].details = details;
//     console.log(books[i]);
//   }, 2000);
// })

(async function bookList() {
  const books = [
    {bookId: 656, bookTitle: "Test 1"},
    {bookId: 242, bookTitle: "Test 2"}
  ];

  const details = {url: "url", description: "good book"}

  for (let i = 0; i < books.length; i++) {
    await delay(2000);
    books[i].details = details;
    logger.info(JSON.stringify(books[i]));

    // await result = setTimeout(async (books) => {
    //   books[i].details = details;
    //   console.log(books[i]);
    // }, 2000);
    // await promiseTimeout();

  }

  // how do I make this wait on the for loop?
  logger.info(JSON.stringify(books));
}());