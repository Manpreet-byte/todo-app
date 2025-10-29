import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = `${import.meta.env.VITE_API_URL}/api/todos` || 'http://localhost:5000/api/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch todos from MongoDB on component mount
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL)
      setTodos(response.data)
      setError('')
    } catch (err) {
      setError('Failed to fetch todos. Make sure backend is running!')
      console.error('Error fetching todos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async () => {
    if (inputValue.trim() === '') return
    
    try {
      const response = await axios.post(API_URL, { text: inputValue })
      setTodos([response.data, ...todos])
      setInputValue('')
      setError('')
    } catch (err) {
      setError('Failed to add todo')
      console.error('Error adding todo:', err)
    }
  }

  const handleToggleDone = async (id, currentDone) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, { done: !currentDone })
      setTodos(todos.map(todo => 
        todo._id === id ? response.data : todo
      ))
      setError('')
    } catch (err) {
      setError('Failed to update todo')
      console.error('Error updating todo:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`)
      setTodos(todos.filter(todo => todo._id !== id))
      setError('')
    } catch (err) {
      setError('Failed to delete todo')
      console.error('Error deleting todo:', err)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTodo()
    }
  }

  return (
    <div className="app">
      <div className="todo-container">
        <h1>📝 My Todo List</h1>
        <p className="subtitle">Connected to MongoDB Atlas</p>
        
        {error && <div className="error-banner">{error}</div>}
        
        <div className="input-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a new task..."
            className="todo-input"
          />
          <button onClick={handleAddTodo} className="add-btn">
            Add Task
          </button>
        </div>

        <div className="todos-list">
          {loading ? (
            <p className="empty-message">Loading todos...</p>
          ) : todos.length === 0 ? (
            <p className="empty-message">No tasks yet. Add one above!</p>
          ) : (
            todos.map(todo => (
              <div key={todo._id} className="todo-item">
                <div className="todo-content">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => handleToggleDone(todo._id, todo.done)}
                    className="todo-checkbox"
                  />
                  <span className={todo.done ? 'todo-text done' : 'todo-text'}>
                    {todo.text}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(todo._id)} 
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <div className="stats">
          <p>Total: {todos.length} | Done: {todos.filter(t => t.done).length} | Pending: {todos.filter(t => !t.done).length}</p>
        </div>
      </div>
    </div>
  )
}

export default App
