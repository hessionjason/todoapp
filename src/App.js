import React, { useState, useEffect } from 'react';
import './App.css';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BsCheckLg } from 'react-icons/bs';
import axios from 'axios';

function App() {
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [allTodos, setTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [currentEdit, setCurrentEdit] = useState("");
  const [currentEditedItem, setCurrentEditedItem] = useState("");

  // Use environment variable for the API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/todos'; // Fallback to localhost for development

  // Fetch todos from the backend
  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // Add a new todo
  const handleAddTodo = async () => {
    if (!newTitle || !newDescription) {
      alert("Please enter both title and description.");
      return;
    }

    const newTodoItem = {
      title: newTitle,
      description: newDescription,
    };

    try {
      const response = await axios.post(API_URL, newTodoItem);
      setTodos([...allTodos, response.data]); // Add the new todo to state
      setNewTitle('');
      setNewDescription('');
      alert("Todo added successfully!"); // Feedback to user
    } catch (error) {
      console.error("Error adding todo:", error);
      alert("Failed to add todo. Please try again."); // User feedback
    }
  };

  // Delete a todo
  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(allTodos.filter(todo => todo._id !== id)); // Update state
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Handle completion of a todo
  const handleComplete = async (id) => {
    const completedTodo = allTodos.find(todo => todo._id === id);
    if (completedTodo) {
      setCompletedTodos([...completedTodos, completedTodo]);
      await handleDeleteTodo(id); // Remove from allTodos
    }
  };

  // Delete a completed todo
  const handleDeleteCompletedTodo = async (id) => {
    setCompletedTodos(completedTodos.filter(todo => todo._id !== id)); // Update state
  };

  // Load todos when the component mounts
  useEffect(() => {
    fetchTodos();
  }, []);

  // Edit functionality
  const handleEdit = (ind, item) => {
    setCurrentEdit(ind);
    setCurrentEditedItem(item);
  };

  const handleUpdateTitle = (value) => {
    setCurrentEditedItem((prev) => {
      return { ...prev, title: value };
    });
  };

  const handleUpdateDescription = (value) => {
    setCurrentEditedItem((prev) => {
      return { ...prev, description: value };
    });
  };

  const handleUpdateToDo = async () => {
    const updatedTodo = { ...currentEditedItem };
    try {
      await axios.put(`${API_URL}/${currentEditedItem._id}`, updatedTodo);
      const newToDoList = allTodos.map(todo =>
        todo._id === currentEditedItem._id ? updatedTodo : todo
      );
      setTodos(newToDoList);
      setCurrentEdit("");
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  return (
    <div className="App">
      <h1>To-Do</h1>

      <div className="todo-wrapper">
        <div className="todo-input">
          <div className="todo-input-item">
            <label>Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="What's the task title?"
            />
          </div>
          <div className="todo-input-item">
            <label>Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="What's the task description?"
            />
          </div>
          <div className="todo-input-item">
            <button
              type="button"
              onClick={handleAddTodo}
              className="primaryBtn"
            >
              Add
            </button>
          </div>
        </div>

        <div className="btn-area">
          <button
            className={`secondaryBtn ${isCompleteScreen === false && 'active'}`}
            onClick={() => setIsCompleteScreen(false)}
          >
            Todo
          </button>
          <button
            className={`secondaryBtn ${isCompleteScreen === true && 'active'}`}
            onClick={() => setIsCompleteScreen(true)}
          >
            Completed
          </button>
        </div>

        <div className="todo-list">
          {isCompleteScreen === false &&
            allTodos.map((item, index) => {
              if (currentEdit === index) {
                return (
                  <div className='edit__wrapper' key={index}>
                    <input
                      placeholder='Updated Title'
                      onChange={(e) => handleUpdateTitle(e.target.value)}
                      value={currentEditedItem.title}
                    />
                    <textarea
                      placeholder='Updated Description'
                      rows={4}
                      onChange={(e) => handleUpdateDescription(e.target.value)}
                      value={currentEditedItem.description}
                    />
                    <button
                      type="button"
                      onClick={handleUpdateToDo}
                      className="primaryBtn"
                    >
                      Update
                    </button>
                  </div>
                );
              } else {
                return (
                  <div className="todo-list-item" key={item._id}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                    <div>
                      <AiOutlineDelete
                        className="icon"
                        onClick={() => handleDeleteTodo(item._id)}
                        title="Delete?"
                      />
                      <BsCheckLg
                        className="check-icon"
                        onClick={() => handleComplete(item._id)}
                        title="Complete?"
                      />
                      <AiOutlineEdit
                        className="check-icon"
                        onClick={() => handleEdit(index, item)}
                        title="Edit?"
                      />
                    </div>
                  </div>
                );
              }
            })}

          {isCompleteScreen === true &&
            completedTodos.map((item, index) => {
              return (
                <div className="todo-list-item" key={item._id}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div>
                    <AiOutlineDelete
                      className="icon"
                      onClick={() => handleDeleteCompletedTodo(item._id)} // Add delete functionality for completed todos
                      title="Delete Completed?"
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default App;
