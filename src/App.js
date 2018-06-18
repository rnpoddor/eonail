import React, { Component } from 'react';
import axios from 'axios';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import logo from './logo.png';
import './App.css';

import CouchDBLogin from './components/CouchDBLogin';
import { Tabs, Pane } from './components/Tabs';
import { DocView } from './components/DocsView';
import CatClrs from './components/CatClrs';
import DocCalcOrder from './components/DocCalcOrder';
import ExpertMode from './components/ExpertMode';

class App extends Component {
  constructor(props) {
    super(props);
    // Don't call this.setState() here!
    this.state = {
      couchDB: {
        login: '',
        password: '',
        address: 'https://zakaz.ecookna.ru/couchdb',
        db: 'wb_',
        area: '21',
        prefix: '',
        roles: ''
      },
      mounted: true,
      logged: false,
      tabs: this.getDefaultTabsState()
    };
  }

  getDefaultTabsState = function() {
    return {
      catClrs: {
        clr_name: '',
        data: {}
      },
      docCalcOrder: {
        number_doc: '',
        data: {}
      },
      expertMode: {
        selectedSet: 'doc',
        db_type: 'doc',
        selector: '',
        delay: 2000,
        data: {}
      }
    };
  }

  getDBName = (couchDB, type) => {
    const { db, area, prefix } = couchDB;

    return db + area + '_' + type + (prefix ? ('_' + prefix) : '');
  }

  setCatClrsState = (state) => {
    //this.setState({ tabs: { catClrs: state }});

    this.setState((prevState, props) => {
      prevState.tabs.catClrs = Object.assign(prevState.tabs.catClrs, state);

      return prevState;
    });
  }

  setDocCalcOrderState = (state) => {
    //this.setState({ tabs: { docCalcOrder: state }});

    this.setState((prevState, props) => {
      prevState.tabs.docCalcOrder = Object.assign(prevState.tabs.docCalcOrder, state);

      return prevState;
    });
  }

  setExpertModeState = (state) => {
    //this.setState({ tabs: { expertMode: state }});

    this.setState((prevState, props) => {
      prevState.tabs.expertMode = Object.assign(prevState.tabs.expertMode, state);

      return prevState;
    });
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

    const { login, password, address, area, prefix } = event.target;

    // выдергиваем название базы
    const reg_db_name = address.value.match(/\w+$/i);
    // избавляемся от названия базы в адресе
    const addr = address.value.replace('/' + reg_db_name[0], '');
    const couchDB = {
      login: login.value,
      password: password.value,
      address: addr,
      db: reg_db_name[0],
      area: area.value,
      prefix: prefix.value
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
          if (await this.checkDB(couchDB.address, this.getDBName(couchDB, 'doc'))) {
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
            logged,
            response: {
              error: 'bad DB input!'
            }
          });
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({
          couchDB,
          logged: false,
          response: error.response ? error.response.data : {
            error: error.message
          }
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
            logged: false,
            response: undefined,
            tabs: this.getDefaultTabsState()
          });
        }
      });
  }

  render() {
    const { couchDB: { db, area, prefix } } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <a href="https://www.ecookna.ru"><img src={logo} className="App-logo" alt="logo" /></a>
          <h1 className="App-title">Прибить</h1>
          <div className="App-info">
          {this.state.logged &&
            <div>
              {this.state.couchDB.address + '/' + db + area + (prefix ? (' (' + prefix + ')') : '')}<br />
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
                <div>
                  <CouchDBLogin
                    onUnmount={this.handleUnmount}
                    onLogin={this.handleLogin}
                    couchDB={this.state.couchDB} />
                  <DocView
                    doc={this.state.response} />
                </div>
              }
            </CSSTransitionGroup>
          </div>
        }
        {!this.state.mounted && this.state.logged &&
          <Tabs selected={0}>
            <Pane label="Цвет">
              <CatClrs
                couchDB={this.state.couchDB}
                getDBName={this.getDBName}
                state={this.state.tabs.catClrs}
                setState={this.setCatClrsState} />
            </Pane>
            <Pane label="Заказ">
              <DocCalcOrder
                couchDB={this.state.couchDB}
                getDBName={this.getDBName}
                state={this.state.tabs.docCalcOrder}
                setState={this.setDocCalcOrderState} />
            </Pane>
            <Pane label="Режим эксперта">
              <ExpertMode
                couchDB={this.state.couchDB}
                getDBName={this.getDBName}
                state={this.state.tabs.expertMode}
                setState={this.setExpertModeState} />
            </Pane>
          </Tabs>
        }
      </div>
    );
  }
}

export default App;
