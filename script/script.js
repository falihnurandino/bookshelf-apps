const books = [];
const RENDER_EVENT = "render-books";
const STORAGE_KEY = "Books-apps";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");

  submitForm.addEventListener("submit", function (event) {
    addBooks();
    event.preventDefault();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBooks() {
  const idBook = +new Date();
  const inputBookTitle = document.getElementById("inputBookTitle").value;
  const inputBookAuthor = document.getElementById("inputBookAuthor").value;
  const inputBookYear = document.getElementById("inputBookYear").value;
  const inputBookIsComplete = document.getElementById(
    "inputBookIsComplete"
  ).checked;

  const booksObject = composeBooksObject(
    idBook,
    inputBookTitle,
    inputBookAuthor,
    inputBookYear,
    inputBookIsComplete
  );
  books.push(booksObject);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}
function composeBooksObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBooks = document.getElementById("uncompletedBookshelfList");
  uncompletedBooks.innerHTML = "";

  const completedBooks = document.getElementById("completedBookshelfList");
  completedBooks.innerHTML = "";

  for (book of books) {
    const bookElement = createBooks(book);

    if (book.isCompleted == false) {
      uncompletedBooks.append(bookElement);
    } else {
      completedBooks.append(bookElement);
    }
  }
});

function createBooks(booksObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = booksObject.title;

  const textAuthor = document.createElement("h4");
  textAuthor.innerText = booksObject.author;

  const textDate = document.createElement("p");
  textDate.innerText = booksObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textDate);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `books-${booksObject.id}`);

  if (booksObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(booksObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      let confirmation = confirm("Apakah anda yakin ingin menghapus buku?");

      if (confirmation) {
        removeBookFromCompleted(booksObject.id);
      }
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addBookToCompleted(booksObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      let confirmation = confirm("Apakah anda yakin ingin menghapus buku?");
      if (confirmation) {
        removeBookFromCompleted(booksObject.id);
      }
    });

    container.append(checkButton, trashButton);
  }

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBooks(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBooks(bookId) {
  for (book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBooks(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

const searchBar = document.forms["searchBook"].querySelector("input");
searchBar.addEventListener("keyup", function (e) {
  const term = e.target.value.toLowerCase();
  const bookItems = document.getElementsByClassName("item");
  Array.from(bookItems).forEach(function (book) {
    const title = book.firstElementChild.textContent;
    if (title.toLowerCase().indexOf(term) != -1) {
      book.style.display = "block";
    } else {
      book.style.display = "none";
    }
  });
});

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }

  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
