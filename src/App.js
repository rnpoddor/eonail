import React, { Component } from 'react';
import axios from 'axios';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import logo from './logo.png';
import './App.css';

import CouchDBLogin from './components/CouchDBLogin';
import { Tabs, Pane } from './components/Tabs';
import CatClrs from './components/CatClrs';

class Hello extends Component {
  render() {
    return (
      <p>Hello World!</p>
    );
  }
}

class App extends Component {
  state = {
    couchDB: {
      login: '',
      password: '',
      address: 'https://develop.ecookna.ru/couchdb',
      db: 'wb_',
      area: '21',
      roles: ''
    },
    mounted: true,
    logged: false,
    tabs: {
      catClrs: {
        clr_name: '',
        data: {}
      }
    }
  }

  setCatClrsState = (state) => {
    this.setState({ tabs: { catClrs: state }});
  }

  handleUnmount = () => {
    this.setState({ mounted: false });
  }

  checkDB = async (addr, db) => {
    let res = false;
    await axios.get(addr + '/' + db, { withCredentials: true })
      .then(response => {
        res = response.data.db_name &&
          response.data.db_name === db;
      })
      .catch(error => {
        console.log(error);
      });
    
    return res;
  }

  handleLogin = event => {
    // предотвращаем передачу данных формой на сервер
    event.preventDefault();

    const { login, password, address, area } = event.target;

    // выдергиваем название базы
    const reg_db_name = address.value.match(/\w+$/i);
    // избавляемся от названия базы в адресе
    const addr = address.value.replace('/' + reg_db_name[0], '');
    const couchDB = {
      login: login.value,
      password: password.value,
      address: addr,
      db: reg_db_name[0],
      area: area.value
    };

    // настройка запроса
    const config = {
      headers: {
        // указываем тип передаваемого содержимого
        'Content-Type': 'application/json'
      },
      // чтобы браузер передал вместе с запросом куки и HTTP-авторизацию
      withCredentials: true
    }
    // передаваемые данные
    const data = {
      name: couchDB.login,
      password: couchDB.password     
    }
    axios.post(couchDB.address + '/_session', data, config)
      .then(async response => {
        console.log(response.data);
        if (response.status === 200 && response.data.ok) {
          let logged = false;
          // делаем проверку существования введенной базы
          if (await this.checkDB(couchDB.address, couchDB.db + couchDB.area + '_doc')) {
            logged = true;
            console.log('check DB successful!');
          }
          else {
            console.log('bad DB input!');
          }
          // сохраняем роли пользователя
          couchDB.roles = response.data.roles;
          // меняем состояние
          this.setState({
            couchDB,
            logged
          });
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({
          couchDB,
          logged: false
        });
      });
  }

  handleLogout = event => {
    const { address } = this.state.couchDB

    axios.delete(address + '/_session', { withCredentials: true })
      .then(response => {
        console.log(response.data);
        if (response.status === 200 && response.data.ok) {
          this.setState({
            mounted: true,
            logged: false
          });
        }
      });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <a href="https://www.ecookna.ru"><img src={logo} className="App-logo" alt="logo" /></a>
          <h1 className="App-title">Прибить</h1>
          <div className="App-info">
          {this.state.logged &&
            <div>
              {this.state.couchDB.address + '/' + this.state.couchDB.db + this.state.couchDB.area}<br />
              {this.state.couchDB.login} (<a href="#ВЫХОД" onClick={this.handleLogout}>ВЫХОД</a>)
            </div>
          }
          </div>
        </header>
        {this.state.mounted &&
          <div className="App-couLogin">
            <CSSTransitionGroup
              transitionName="fade"
              transitionAppear={true}
              transitionAppearTimeout={500}
              transitionEnter={false}
              transitionLeaveTimeout={300}>
              {!this.state.logged &&
                <CouchDBLogin
                  onUnmount={this.handleUnmount}
                  onLogin={this.handleLogin}
                  couchDB={this.state.couchDB} />
              }
            </CSSTransitionGroup>
          </div>
        }
        {!this.state.mounted && this.state.logged &&
          <Tabs selected={0}>
            <Pane label="Цвет">
              <CatClrs
                couchDB={this.state.couchDB}
                state={this.state.tabs.catClrs}
                setState={this.setCatClrsState} />
            </Pane>
            <Pane label="Режим эксперта">
              <div>В разработке.</div>
            </Pane>
          </Tabs>
        }
      </div>
    );
  }
}

export default App;
