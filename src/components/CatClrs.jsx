import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import withCouchDB from '../hoc/withCouchDB';
import { DocsView, DocView } from './DocsView';
import ModalYesNo from './ModalYesNo';

const styles = theme => ({
  textField: {
    width: 300
  }
});

class CatClrs extends Component {
  state = {
    searching: false,
    nailing: false
  }

  componentWillMount = () => {
    const { apiUrl, dbName, couchDB: { address, db, area } } = this.props;

    // задаем URI с нужной базой
    apiUrl(address);
    dbName(db + area + '_ram');
  }

  handleSubmit = event => {
    // предотвращаем передачу данных формой на сервер
    event.preventDefault();

    const { clr_name } = event.target;

    // замена всех обратных слешей на двойной, если присутствуют в наименовании
    const clr = clr_name.value
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')

    // показываем процесс поиска
    this.setState({ searching: true });
    
    // задаем критерии поиска
    const data = {
      "selector": {
        "class_name": "cat.clrs",
        "name": {
          "$regex": clr
        }
      }
    };
    this.props.post('_find', data)
      .then(response => {
        //if (response.status === 200) {
          const { data } = response;
          this.props.setState({
            clr_name: clr_name.value,
            data
          });
          // скрываем процесс поиска
          this.setState({ searching: false });
        //}
      })
      .catch(error => {
        this.props.setState({
          clr_name: clr_name.value,
          data: error
        });
        // скрываем процесс поиска
        this.setState({ searching: false });
      });
  }

  handleRemove = () => {
    this.setState({
      wantNail: true
    });
  }
  
  asyncRemove = () => {
    const { data: { docs } } = this.props.state;

    // показываем процесс прибития
    this.setState({ nailing: true });

    let deleted = 0;
    const funcThen = response => {
      //if (response.status === 200) {
        const { data } = response;
        if (data.ok) {
          deleted++;
        }
      //}
    };
    let promises = [];
    for (var i = 0; i < docs.length; i++) {
      promises.push(this.props.delete(`${docs[i]._id}?rev=${docs[i]._rev}`)
        .then(funcThen)
        .catch(error => {
        })
      );
    }

    Promise.all(promises)
    .then(results => {
      this.props.setState({
        data: {
          docs,
          deleted: deleted //docs.length
        }
      });
      // скрываем процесс прибития
      this.setState({ nailing: false });
    });
  }

  handleChange = name => event => {
    this.props.setState({
      [name]: event.target.value,
    });
  };

  handleNailYes = () => {
    this.setState({ wantNail: undefined });
    
    this.asyncRemove();
  }

  handleNailNo = () => {
    this.setState({ wantNail: undefined });
  }

  render() {
    const { couchDB: { roles } } = this.props;
    const { clr_name, data, data: { docs, deleted }} = this.props.state;
    const { searching, nailing, wantNail } = this.state;

    // проверяем права на редактирование
    const allow =
      roles.indexOf("_admin") !== -1 ||
      roles.indexOf("ram_editor") !== -1;

    return (
      <div>
        {wantNail && (
          <ModalYesNo onYes={this.handleNailYes} onNo={this.handleNailNo}>
            <b>Прибить цвет?</b>
          </ModalYesNo>
        )}
        <div className="tabs__content-title">
          Поиск
        </div>
        <br />
        <form
          className="tabs__content-form"
          onSubmit={this.handleSubmit}>
          <TextField
            id="clr_name"
            type="text"
            label="Название цвета"
            value={clr_name}
            onChange={this.handleChange('clr_name')}
            required
          />
          <br />
          <div>
            {searching ? (
              <Fade
                in={searching}
                style={{ transitionDelay: searching ? '800ms' : '0ms' }}
                unmountOnExit>
                <CircularProgress />
              </Fade>
            ) : (nailing ?
              <Button variant="raised" type="submit" disabled>
                Найти
              </Button> :
              <Button variant="raised" type="submit">
                Найти
              </Button>
            )}
          </div>
        </form>
        <br />
        {docs && docs.length > 0 && deleted === undefined &&
          <div>
            Найдено документов: {docs.length}<br />
            <br />
            {allow ? (
              nailing ? (
                <Fade
                  in={nailing}
                  style={{ transitionDelay: nailing ? '800ms' : '0ms' }}
                  unmountOnExit>
                  <CircularProgress />
                </Fade>
              ) : ( docs[0]._id && docs[0]._rev &&
                <Button
                  variant="raised"
                  onClick={this.handleRemove}>
                  Прибить
                </Button>
              )
            ) : (
              <div>
                <b>Нет прав на прибитие документов.</b>
              </div>
            )}
            <br />
            <br />
            <DocsView
              docs={docs} />
          </div>
        }
        {docs && docs.length === 0 &&
          <div>
            <b>Ничего не найдено!</b>
          </div>
        }
        {deleted &&
          <div>
            <b>Цвет "{docs[0].name}" успешно прибит!</b>
          </div>
        }
        {deleted === 0 &&
          <div>
            <b>Не удалось прибить цвет "{docs[0].name}".</b>
          </div>
        }
        {!docs && data.message &&
          <DocView
            doc={data.response ? data.response.data : {
              error: data.message
            }} />
        }
      </div>
    );
  }
}

export default withCouchDB(withStyles(styles)(CatClrs));
