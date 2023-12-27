const book = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = parseInt(document.getElementById('inputBookYear').value);
    const isCompleted = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isCompleted);

    book.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function generateId() {
    return +new Date();
}

function generateBookObject(id, bookTitle, bookAuthor, bookYear, isCompleted) {
    return {
        id,
        bookTitle,
        bookAuthor,
        bookYear,
        isCompleted
    };
}

document.addEventListener(RENDER_EVENT, function () {
    console.log(book);
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.bookTitle;

    const textbookAuthor = document.createElement('p');
    textbookAuthor.innerText = `Penulis: ${bookObject.bookAuthor}`;

    const textbookYear = document.createElement('p');
    textbookYear.innerText = `Tahun: ${bookObject.bookYear}`;

    const textbooklist = document.createElement('div');
    textbooklist.classList.add('inner');
    textbooklist.append(textTitle, textbookAuthor, textbookYear);

    const booklist = document.createElement('div');
    booklist.classList.add('item', 'shadow');
    booklist.append(textbooklist);
    booklist.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function () {
            showDeleteConfirmationDialog(bookObject.id);
        });

        booklist.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function () {
            showDeleteConfirmationDialog(bookObject.id);
        });

        booklist.append(checkButton, trashButton);
    }

    return booklist;
}

document.addEventListener(RENDER_EVENT, function () {
    const incompletedBookList = document.getElementById('book');
    incompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completed-book');
    completedBookList.innerHTML = '';

    for (const bookItem of book) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted)
            incompletedBookList.append(bookElement);
        else
            completedBookList.append(bookElement);
    }
});


function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of book) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    book.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in book) {
        if (book[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function searchBook() {
    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();

    const filteredBooks = book.filter(bookItem => bookItem.bookTitle.toLowerCase().includes(searchTitle));

    renderBooks(filteredBooks);
}

function renderBooks(filteredBooks) {
    const incompleteBookList = document.getElementById('incompleteBookshelfList');
    incompleteBookList.innerHTML = '';
    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';

    for (const bookItem of filteredBooks) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isCompleted) {
            completedBookList.appendChild(bookElement);
        } else {
            incompleteBookList.appendChild(bookElement);
        }
    }
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(book);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(serializedData);

    if (data !== null) {
        for (const bookItem of data) {
            book.push(bookItem);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


function showDeleteConfirmationDialog(bookId) {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
        removeBookFromCompleted(bookId);
    }
}

