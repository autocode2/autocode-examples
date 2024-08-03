const { useState } = React;

function App() {
    const [todos, setTodos] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [filter, setFilter] = useState('all');

    const addTodo = () => {
        if (inputValue) {
            setTodos([...todos, { text: inputValue, completed: false }]);
            setInputValue('');
        }
    };

    const deleteTodo = (index) => {
        const newTodos = todos.filter((_, i) => i !== index);
        setTodos(newTodos);
    };

    const toggleComplete = (index) => {
        const newTodos = todos.map((todo, i) => {
            if (i === index) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
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
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="Add a new todo" 
            />
            <button onClick={addTodo}>Add Todo</button>
            <div>
                <button onClick={() => setFilter('all')}>All</button>
                <button onClick={() => setFilter('completed')}>Completed</button>
                <button onClick={() => setFilter('incomplete')}>Incomplete</button>
            </div>
            <ul>
                {filteredTodos.map((todo, index) => (
                    <li key={index} style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                        {todo.text} 
                        <button onClick={() => toggleComplete(index)}>Toggle Complete</button>
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
}

ReactDOM.render(<App />, document.getElementById('root'));