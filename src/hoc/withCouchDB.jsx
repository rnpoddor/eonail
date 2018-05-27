import React from 'react';
import axios from 'axios';

function withCouchDB(Component) {
  class WithCouchDB extends React.Component {
    state = {
      url: '',
      db: '',
      data: {}
    };

    apiUrl = (url) => {
      this.setState({ url });
    }

    dbName = (db) => {
      this.setState({ db });
    }

    get = id => {
      axios.get(`${this.state.url}/${this.state.db}/${id}`, { withCredentials: true })
        .then(response => {
          console.log(response.data);
          if (response.status === 200) {
            const { data } = response;
            this.setState({ data });
          }
        });
    }

    post = (id, data) => {
      axios.post(`${this.state.url}/${this.state.db}/${id}`, data, { withCredentials: true })
        .then(response => {
          console.log(response.data);
          if (response.status === 200) {
            const { data } = response;
            this.setState({ data });
          }
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

    delete = id => {
      axios.delete(`${this.state.url}/${this.state.db}/${id}`, { withCredentials: true })
        .then(response => {
          console.log(response.data);
          if (response.status === 200) {
            const { data } = response;
            this.setState({ data });
          }
        })
        .catch(error => {
          console.log(error);
          this.setState({ data: error });
        });
    }

    render() {
      return <Component
        data={this.state.data}
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