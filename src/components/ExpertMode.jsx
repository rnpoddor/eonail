import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';

import withCouchDB from '../hoc/withCouchDB';
import { DocsView, DocView } from './DocsView';

class ExpertMode extends Component {
  state = {
    searching: false,
    nailing: false
  }

  componentDidMount = () => {
    const { apiUrl, dbName, couchDB, couchDB: { address }, getDBName, state: { selectedSet, db_type, data } } = this.props;
    const set = this.getSets(selectedSet);

    // задаем URI с нужной базой
    apiUrl(address);
    dbName(getDBName(couchDB, db_type));

    this.props.setState({
      selectedSet: selectedSet,
      db_type: set.type,
      selector: set.selector,
      data
    });
  }

  getSetOptions = function() {
    return [
      { value: 'doc', label: 'Шаблон для doc' },
      { value: 'ram', label: 'Шаблон для ram' },
      { value: 'color', label: 'Цвет' },
      { value: 'order', label: 'Заказ' },
      { value: 'null_partner', label: 'Нулевой или не существующий контрагент' }
    ];
  }

  getSets = function(set) {
    const sets = {
      doc: {
        type: 'doc',
        selector: `{
  "selector": {
    "class_name": {
      "$eq": "doc.calc_order"
    },
    "number_doc": {
      "$eq": ""
    }
  },
  "fields": ["_id", "_rev", "number_doc", "partner", "timestamp"],
  "limit": 100
}`
      },
      ram: {
        type: 'ram',
        selector: `{
  "selector": {
    "name": {
      "$eq": ""
    }
  },
  "fields": ["_id", "_rev", "name", "timestamp"],
  "limit": 100
}`
      },
      color: {
        type: 'ram',
        selector: `{
  "selector": {
    "class_name": "cat.clrs",
    "name": {
      "$eq": ""
    }
  }
}`
      },
      order: {
        type: 'doc',
        selector: `{
  "selector": {
    "class_name": "doc.calc_order",
    "number_doc": {
      "$eq": ""
    }
  },
  "fields": ["_id", "_rev", "number_doc", "partner", "timestamp"]
}`
      },
      null_partner: {
        type: 'doc',
        selector: `{
  "selector": {
    "class_name": {
      "$eq": "doc.calc_order"
    },
    "partner": {
      "$or": [
        { "$eq": "00000000-0000-0000-0000-000000000000" },
        { "$exists": false }
      ]
    },
    "number_doc": {
      "$regex": "^[\\\\d]{4}[\\\\S]{1,2}[\\\\d]{5,}$"
    }
  },
  "fields": ["_id", "_rev", "number_doc", "partner", "timestamp"],
  "limit": 100
}`
      }
    };

    return sets[set];
  }

  handleChangeSet = (selectedSet) => {
    if (selectedSet) {
      const { value } = selectedSet;
      const set = this.getSets(value);
      //const { dbName, couchDB, getDBName, state: { db_type } } = this.props;

      //dbName(getDBName(couchDB, db_type));

      this.props.setState({
        selectedSet: value,
        db_type: set.type,
        selector: set.selector,
        data: {}
      });
    }
  };

  handleSubmit = event => {
    // предотвращаем передачу данных формой на сервер
    event.preventDefault();

    const { selector } = event.target;

    // проверка правильности ввода селектора
    try {
      var json = JSON.parse(selector.value);
    } catch (e) {
      this.setState({ badSelector: true });
      return;
    }

    // показываем процесс поиска
    this.setState({
      searching: true,
      badSelector: false
    });

    // задаем критерии поиска
    this.props.post('_find', json)
      .then(response => {
        //if (response.status === 200) {
          const { data } = response;
          this.props.setState({
            selector: selector.value,
            data
          });
          // скрываем процесс поиска
          this.setState({ searching: false });
        //}
      })
      .catch(error => {
        this.props.setState({
          selector: selector.value,
          data: error
        });
        // скрываем процесс поиска
        this.setState({ searching: false });
      });
  }

  handleRemove = () => {
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
      if (docs[i]._id && docs[i]._rev) {
        promises.push(this.props.delete(`${docs[i]._id}?rev=${docs[i]._rev}`)
          .then(funcThen)
          .catch(error => {
          })
        );
      }
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

  render() {
    const { couchDB: { roles } } = this.props;
    const { selectedSet, db_type, selector, data, data: { docs, deleted }} = this.props.state;
    const { searching, nailing, badSelector } = this.state;

    // проверяем права на редактирование
    const allow =
      roles.indexOf("_admin") !== -1 ||
      roles.indexOf(db_type + "_editor") !== -1;

    return (
      <div>
        <div className="tabs__content-title">
          Поиск
        </div>
        <br />
        <form
          className="tabs__content-form mdc-theme--light"
          onSubmit={this.handleSubmit}>
          <Select
            name="set"
            value={selectedSet}
            onChange={this.handleChangeSet}
            options={this.getSetOptions()} /><br />
          Тип базы данных: {db_type}<br />
          <br />
          <div className="App-comments">
            Для успешного прибития документов, поля "_id" и "_rev" должны присутствовать в параметрах отбора.
          </div>
          <TextField
            id="selector"
            label="Параметры отбора"
            className="mdc-textfield__textarea"
            value={selector}
            onChange={this.handleChange('selector')}
            margin="normal"
            multiline
          />
          <div>
            {searching ? (
              <Fade
                in={searching}
                style={{ transitionDelay: searching ? '800ms' : '0ms' }}
                unmountOnExit
              >
                <CircularProgress />
              </Fade>
            ) : (
              <button className="mdc-button mdc-button--primary mdc-button--raised">
                Найти
              </button>
            )}
          </div>
        </form>
        <br />
        {badSelector &&
          <div className="App-error">
            <b>Ошибка в параметрах отбора!</b>
          </div>
        }
        {badSelector && <br />}
        {docs && docs.length > 0 && deleted === undefined &&
          <div>
            Найдено документов: {docs.length} {docs.length === 100 && <b>(есть еще, после прибития, повторить операцию поиска)</b>}<br />
            <br />
            {allow ? (
              nailing ? (
                <Fade
                  in={nailing}
                  style={{ transitionDelay: nailing ? '800ms' : '0ms' }}
                  unmountOnExit
                >
                  <CircularProgress />
                </Fade>
              ) : ( docs[0]._id && docs[0]._rev &&
                <button
                  className="mdc-button mdc-button--primary mdc-button--raised"
                  onClick={this.handleRemove}>
                  Прибить
                </button>
              )
            ) : (
              <div>
                <b>Нет прав на удаление документов.</b>
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
            <b>{deleted} документов из {docs.length} успешно удалены!</b>
          </div>
        }
        {deleted === 0 &&
          <div>
            <b>Не удалось прибить документы.</b>
          </div>
        }
        {!docs && data &&
          <DocView
            doc={data} />
        }
      </div>
    );
  }
}

export default withCouchDB(ExpertMode);