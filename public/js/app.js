(function() {

    'use strict';

    var ENTER_KEY = 13;
    var newTodoDom = document.getElementById('new-todo');
    var syncDom = document.getElementById('sync-wrapper');

    var db = new PouchDB('todos');
    var remoteCouch = 'http://localhost:5984/todolist';

    db.info(function(err, info) {
        db.changes({
            since: info.update_seq,
            live: true
        }).on('change', ShowTodos);
    });
    // We have to create a new todo document and enter it in the database
    
    function addTodo(text) {
        
        var todo = {
            _id: new Date().toISOString(),
            text: text,
            completed: false
        };
        // ложем-кладем
        db.put(todo).then(function(result) {
            console.log('OK');
            console.log(result);
            console.log(db.allDocs());
        }).catch(function(err) {
            console.log('NONOK');
            console.log(err);
        });
    }

    // демонстрируем что есть
    function ShowTodos() {
        db.allDocs({ include_docs: true, descending: true }, function(err, doc) {
            redrawTodosUI(doc.rows);
        });
    }

    // User pressed the delete button for a todo, delete it
    function deleteButtonPressed(todo) {
        db.remove(todo);
    }

    // The input box when editing a todo has blurred, we should save
    // the new title or delete the todo if the title is empty
    function todoBlurred(todo, event) {
        var trimmedText = event.target.value.trim();
        if (!trimmedText) {
            db.remove(todo);
        } else {
            todo.title = trimmedText;
            db.put(todo);
        }
    }

    // Initialise a sync with the remote server
    function sync() {
        syncDom.setAttribute('data-sync-state', 'syncing');
        var opts = { live: true };
        db.replicate.to(remoteCouch, opts, syncError);
        db.replicate.from(remoteCouch, opts, syncError);
    }

    // EDITING STARTS HERE (you dont need to edit anything below this line)

    // There was some form or error syncing
    function syncError() {
        syncDom.setAttribute('data-sync-state', 'error');
    }

    // User has double clicked a todo, display an input so they can edit the title
    function todoDblClicked(todo) {
        var div = document.getElementById('li_' + todo._id);
        var inputEditTodo = document.getElementById('input_' + todo._id);
        div.className = 'editing';
        inputEditTodo.focus();
    }

    // If they press enter while editing an entry, blur it to trigger save
    // (or delete)
    function todoKeyPressed(todo, event) {
        if (event.keyCode === ENTER_KEY) {
            var inputEditTodo = document.getElementById('input_' + todo._id);
            inputEditTodo.blur();
        }
    }

    // Given an object representing a todo, this will create a list item
    // to display it.
    function createTodoListItem(todo) {

        var label = document.createElement('label');
        label.appendChild(document.createTextNode(todo.text));
        label.addEventListener('dblclick', todoDblClicked.bind(this, todo));

        var deleteLink = document.createElement('button');
        deleteLink.appendChild(document.createTextNode(todo.text));
        deleteLink.className = 'destroy';
        deleteLink.addEventListener('click', deleteButtonPressed.bind(this, todo));

        var divDisplay = document.createElement('div');
        divDisplay.className = 'view';
        divDisplay.appendChild(deleteLink);

        var inputEditTodo = document.createElement('input');

        var li = document.createElement('li');
        li.id = 'li_' + todo._id;
        li.appendChild(divDisplay);

        return li;
    }

    function redrawTodosUI(todos) {
        var ul = document.getElementById('todo-list');
        ul.innerHTML = '';
        todos.forEach(function(todo) {
            ul.appendChild(createTodoListItem(todo.doc));
        });
    }

    function newTodoKeyPressHandler(event) {
        if (event.keyCode === ENTER_KEY) {
            addTodo(newTodoDom.value);
            newTodoDom.value = '';
        }
    }

    function addEventListeners() {
        newTodoDom.addEventListener('keypress', newTodoKeyPressHandler, false);
    }

    addEventListeners();
    ShowTodos();

    if (remoteCouch) {
        sync();
    }

})();