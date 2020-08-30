import React from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';

const GET_TODOS = gql `
  query getTodos {
    todos {
      done
      id
      text
    }
  }
`;

const TOGGLE_TODOS = gql `
  mutation toggleTodos($id: uuid!, $done: Boolean!) {
    update_todos(where: {id: {_eq: $id}}, _set: {done: $done}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODO = gql `
  mutation addTodos($text: String!) {
    insert_todos(objects: {text: $text}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const DELETE_TODO = gql `
  mutation MyMutation($id: uuid!) {
    delete_todos(where: {id: {_eq: $id}}) {
      returning {
        id
      }
    }
  }
`;

function App() {
  const [ todos, setTodos ] = React.useState('');
  const { data, loading, error } = useQuery(GET_TODOS);
  const [ toggleTodo ] = useMutation(TOGGLE_TODOS);
  const [ addTodo ] = useMutation(ADD_TODO, {
    onCompleted: () => setTodos('')
  });
  const [ deletTodos ] = useMutation(DELETE_TODO);


  if(error) return <div>Error Fetching todos. Try again later</div>
  if (loading) return <div>Loading...</div>

  const handleTodosChange = (event) => {
    setTodos(event.target.value);
  };

  const handleTodosSubmit = async (event) => {
    event.preventDefault();
    if(!todos.trim()) return;
    await addTodo({ variables: { text: todos }, 
      refetchQueries: [
        {
          query: GET_TODOS
        }
      ]
    });
  };

  const handleToggleTodos = async ({ id, done }) => {
    await toggleTodo({ variables: { id: id, done: !done }} );
  };

  const handleDeleteTodo = async ({ id }) => {
    await deletTodos({ variables: { id: id } ,
      update : (cache) => {
        const prevData = cache.readQuery({ query: GET_TODOS});
        const newData = prevData.todos.filter(todo => todo.id !== id);
        cache.writeQuery({ query: GET_TODOS, data : { todos: newData }});
      }
    });
  };
  
  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white">
      <h1>GraphQL sample Todos app</h1>
      <form className="mb3" onSubmit={handleTodosSubmit}>
        <input className="pa2 f4" type="text" onChange={handleTodosChange} placeholder="Enter your todo" 
          value={todos}/>
        <button className="ml2 f4 bg-green" type="submit">Create Todo</button>
      </form>
      <div className="flex-items-center justify-center flex-column">
        { data.todos.map(todo => (
          <p onDoubleClick={() => handleToggleTodos(todo)} key={todo.id}>
            <span className={ `pointer ${todo.done && 'strike'}` }>{todo.text}</span>
            <button onClick={() => handleDeleteTodo(todo)} className="ml2 bg-transparent bn">
              <span className="red">&times;</span>
            </button>
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
