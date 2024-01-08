import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LandingPage.css'

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'incomplete' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');


  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    axios.get('http://localhost:5000/api/tasks')
      .then(response => setTasks(response.data))
      .catch(error => console.error(error));
  }, [token]);

  const handleAddTask = () => {
    axios.post('http://localhost:5000/api/tasks', newTask)
      .then(response => {
        setTasks([...tasks, response.data]);
        setNewTask({ title: '', description: '', status: 'incomplete' });
      })
      .catch(error => console.error(error));
  };

  const handleDeleteTask = (id) => {
    axios.delete(`http://localhost:5000/api/tasks/${id}`)
      .then(response => setTasks(tasks.filter(task => task._id !== response.data._id)))
      .catch(error => console.error(error));
  };

  const handleStatusChange = (id, newStatus) => {
    axios.put(`http://localhost:5000/api/tasks/${id}`, { status: newStatus })
      .then(response => setTasks(tasks.map(task => (task._id === response.data._id ? response.data : task))))
      .catch(error => console.error(error));
  };
  const handleLogin = (username, password) => {
    axios.post('http://localhost:5000/api/login', { username, password })
      .then(response => {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      })
      .catch(error => console.error(error));
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };


  return (
    <div className="App">
      <h1>Todo App</h1>
      {token ? (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <div>
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <input
              type="text"
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <button onClick={handleAddTask}>Add Task</button>
          </div>
          <ul>
            {tasks.map(task => (
              <li key={task._id}>
                <span>{task.title}</span>
                <span>{task.description}</span>
                <span>{task.status}</span>
                <button onClick={() => handleStatusChange(task._id, task.status === 'incomplete' ? 'completed' : 'incomplete')}>Toggle Status</button>
                <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button onClick={() => handleLogin('username', 'password')}>Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
