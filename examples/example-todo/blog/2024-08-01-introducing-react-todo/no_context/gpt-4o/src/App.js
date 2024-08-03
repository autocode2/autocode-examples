const useState = React.useState;

const App = () => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    setTodos([...todos, { text: newTodo, completed: false }]);
    setNewTodo('');
  };

  const deleteTodo = (index) => {
    const newTodos = todos.filter((_, i) => i !== index);
    setTodos(newTodos);
  };

  const updateTodo = (index, text) => {
    const newTodos = todos.map((todo, i) => i === index ? { ...todo, text } : todo);
    setTodos(newTodos);
  };

  const toggleComplete = (index) => {
    const newTodos = todos.map((todo, i) => i === index ? { ...todo, completed: !todo.completed } : todo);
    setTodos(newTodos);
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'incomplete') return !todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const incompleteCount = todos.length - completedCount;

  return (
    <div>
      <h1>Todo App</h1>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add a new todo"
      />
      <button onClick={addTodo}>Add</button>
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
        <button onClick={() => setFilter('incomplete')}>Incomplete</button>
      </div>
      <ul>
        {filteredTodos.map((todo, index) => (
          <li key={index}>
            <input
              type="text"
              value={todo.text}
              onChange={(e) => updateTodo(index, e.target.value)}
            />
            <button onClick={() => toggleComplete(index)}>
              {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button onClick={() => deleteTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <p>Completed: {completedCount}</p>
        <p>Incomplete: {incompleteCount}</p>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
