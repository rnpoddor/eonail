import React, { Component } from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import Textarea from './Textarea';
import withCouchDB from '../hoc/withCouchDB';
import { DocsView, DocView } from './DocsView';

class ExpertMode extends Component {
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
      { value: 'null_partner', label: 'Нулевой контрагент или не существует' }
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
    const { selectedSet, db_type } = this.props.state;

    // задаем критерии поиска
    this.props.post('_find', JSON.parse(selector.value),
      response => {
        //if (response.status === 200) {
          const { data } = response;
          this.props.setState({
            selectedSet,
            db_type,
            selector: selector.value,
            data
          });
        //}
      },
      error => {
        this.props.setState({
          selectedSet,
          db_type,
          selector: selector.value,
          data: error
        });
      });
  }

  handleRemove = () => {
    const { data: { docs } } = this.props.state;

    for (let i = 0; i < docs.length; i++) {
      if (docs[i]._id && docs[i]._rev) {
        this.props.delete(`${docs[i]._id}?rev=${docs[i]._rev}`,
          response => {
            //if (response.status === 200) {
              const { data } = response;
              if (data.ok) {
                
              }
            //}
          },
          error => {
          });
      }
    }

    this.props.setState({
      data: {
        docs,
        deleted: docs.length
      }
    });
  }

  render() {
    const { couchDB: { roles } } = this.props;
    const { selectedSet, db_type, selector, data, data: { docs, deleted }} = this.props.state;

    // проверяем права на редактирование
    const allow =
      roles.indexOf("_admin") !== -1 ||
      roles.indexOf("ram_editor") !== -1;

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
          <Textarea
            id="selector"
            value={selector}
            placeholder="Параметры отбора" />
          <div>
            <button className="mdc-button mdc-button--primary mdc-button--raised">
              Найти
            </button>
          </div>
        </form>
        <br />
        {docs && docs.length > 0 && deleted === undefined &&
          <div>
            Найдено документов: {docs.length} {docs.length == 100 && <b>(есть еще, после прибивания, повторить операцию)</b>}<br />
            <br />
            {/*docs.length === 1 &&*/ allow &&
              <button
                  className="mdc-button mdc-button--primary mdc-button--raised"
                  onClick={this.handleRemove}>
                  Прибить
              </button>
            }
            {!allow &&
              <div>
                <b>Нет прав на удаление документов.</b>
              </div>
            }
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
            <b>Цвет "{docs[0].name}" успешно удален!</b>
          </div>
        }
        {deleted === 0 &&
          <div>
            <b>Не удалось удалить цвет "{docs[0].name}".</b>
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