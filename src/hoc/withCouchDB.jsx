import React from 'react';
import axios from 'axios';

function withCouchDB(Component) {
  class WithCouchDB extends React.Component {
    state = {
      url: '',
      db: ''
    };

    apiUrl = (url) => {
      this.setState({ url });
    }

    dbName = (db) => {
      this.setState({ db });
    }

    get = (id, cbOK, cbError) => {
      axios.get(`${this.state.url}/${this.state.db}/${id}`, { withCredentials: true })
        .then(response => {
          console.log(response.data);
          cbOK(response);
        })
        .catch(error => {
          console.log(error);
          cbError(error);
        });
    }

    post = (id, data, cbOK, cbError) => {
      axios.post(`${this.state.url}/${this.state.db}/${id}`, data, { withCredentials: true })
        .then(response => {
          console.log(response.data);
          cbOK(response);
        })
        .catch(error => {
          console.log(error);
          cbError(error);
        });
    }

    update = id => {
      /*axios.patch(`${this.state.url}/${this.state.db}/${id}`, { withCredentials: true })
        .then(response => response.data)
        .then(updatedItem => {
          const data = this.state.data.map(item => {
            if (item.id !== updatedItem.id) return item;

            return {
              ...item,
              ...updatedItem
            };
          });

          this.setState({ data });
        });*/
    }

    delete = (id, cbOK, cbError) => {
      axios.delete(`${this.state.url}/${this.state.db}/${id}`, { withCredentials: true })
        .then(response => {
          console.log(response.data);
          cbOK(response);
        })
        .catch(error => {
          console.log(error);
          cbError(error);
        });
    }

    render() {
      return <Component
        apiUrl={this.apiUrl}
        dbName={this.dbName}
        get={this.get}
        post={this.post}
        update={this.update}
        delete={this.delete}
        {...this.props} />
    }
  }

  WithCouchDB.displayName = `WithCouchDB(${Component.displayName || Component.name || 'Component'})`;

  return WithCouchDB;
}

export default withCouchDB;