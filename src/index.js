import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const apololloClient = new ApolloClient( {
  uri: 'https://selected-lacewing-63.hasura.app/v1/graphql',
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={apololloClient}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
