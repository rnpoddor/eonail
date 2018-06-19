import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import logo from './logo.png';
import './App.css';

import CouchDBLogin from './components/CouchDBLogin';
import { DocView } from './components/DocsView';
import CatClrs from './components/CatClrs';
import DocCalcOrder from './components/DocCalcOrder';
import ExpertMode from './components/ExpertMode';

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  logo: {
    marginLeft: 0,
    marginRight: 20,
  },
  imageLogo: {
    height: 50,
  },
  title: {
    fontSize: '1.8em',
    flex: 1,
  },
  info: {
    fontSize: '1.0em',
  },
  buttonLogout: {
    marginLeft: 10,
  },
});

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

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
      tabs: this.getDefaultTabsState(),
      tab: 0
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

  handleTabChange = (event, tab) => {
    this.setState({ tab });
  };

  render() {
    const { classes } = this.props;
    const { couchDB, couchDB: { login, address, db, area, prefix }, mounted, logged, tab } = this.state;

    return (
      <div className="App">
        <header className={classes.root}>
          <AppBar position="static">
            <Toolbar>
              <div className={classes.logo}>
                <a href="https://www.ecookna.ru">
                  <img src={logo} className={classes.imageLogo} alt="logo" />
                </a>
              </div>
              <Typography variant="title" color="inherit" className={classes.title}>
                Прибить
              </Typography>
              {logged &&
                <Typography variant="title" color="inherit" className={classes.info}>
                  {address + '/' + db + area + '_[тип]' + (prefix ? ('_' + prefix) : '')}<br />
                  {login}
                </Typography>
              }
              {logged &&
                <Button color="inherit" variant="raised" className={classes.buttonLogout} onClick={this.handleLogout}>ВЫХОД</Button>
              }
            </Toolbar>
          </AppBar>
        </header>
        {mounted &&
          <div className="App-couLogin">
            <CSSTransitionGroup
              transitionName="fade"
              transitionAppear={true}
              transitionAppearTimeout={500}
              transitionEnter={false}
              transitionLeaveTimeout={300}>
              {!logged &&
                <div>
                  <CouchDBLogin
                    onUnmount={this.handleUnmount}
                    onLogin={this.handleLogin}
                    couchDB={couchDB} />
                  <br />
                  <DocView
                    doc={this.state.response} />
                </div>
              }
            </CSSTransitionGroup>
          </div>
        }
        {!mounted && logged &&
          <div>
            <AppBar position="static" color="default">
              <Tabs
                value={tab}
                onChange={this.handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                scrollable
                scrollButtons="auto"
              >
                <Tab label="Цвет" />
                <Tab label="Заказ" />
                <Tab label="Режим эксперта" />
              </Tabs>
            </AppBar>
            {tab === 0 && <TabContainer>
              <CatClrs
                couchDB={couchDB}
                getDBName={this.getDBName}
                state={this.state.tabs.catClrs}
                setState={this.setCatClrsState} />
            </TabContainer>}
            {tab === 1 && <TabContainer>
              <DocCalcOrder
                couchDB={couchDB}
                getDBName={this.getDBName}
                state={this.state.tabs.docCalcOrder}
                setState={this.setDocCalcOrderState} />
            </TabContainer>}
            {tab === 2 && <TabContainer>
              <ExpertMode
                couchDB={couchDB}
                getDBName={this.getDBName}
                state={this.state.tabs.expertMode}
                setState={this.setExpertModeState} />
            </TabContainer>}
          </div>
        }
      </div>
    );
  }
}

export default withStyles(styles)(App);
