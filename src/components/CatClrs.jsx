import React, { Component } from 'react';

import Input from './Input';
import withCouchDB from '../hoc/withCouchDB';
import { DocsView, DocView } from './DocsView';

class CatClrs extends Component {
  state = {
    clr_name: ''
  }

  componentDidMount = () => {
    const { apiUrl, dbName, couchDB: { address, db, area } } = this.props;

    // задаем URI с нужной базой
    apiUrl(address);
    dbName(db + area + '_ram');
  }

  handleSubmit = event => {
    // предотвращаем передачу данных формой на сервер
    event.preventDefault();

    const { clr_name } = event.target;
    
    this.setState({
      clr_name: clr_name.value
    });

    const data = {
      "selector": {
        "class_name": "cat.clrs",
        "name": {
          "$eq": clr_name.value
        }
      }
    };
    this.props.post('_find', data);
  }

  handleRemove = () => {
    const { data: { docs } } = this.props;

    this.props.delete(docs[0]._id);
  }

  render() {
    const { data, data: { docs }, couchDB: { roles } } = this.props;
    const { clr_name } = this.state;

    // проверяем права на редактирование
    const allow = roles.indexOf("ram_editor") !== -1;

    return (
      <div>
        <div className="tabs__content-title">
          Поиск
        </div>
        <br />
        <form
          className="tabs__content-form mdc-theme--light"
          onSubmit={this.handleSubmit}>
          <Input
            id="clr_name"
            type="text"
            placeholder="Название цвета"
            value={clr_name} />
          <div>
            <button className="mdc-button mdc-button--primary mdc-button--raised">
              Найти
            </button>
          </div>
        </form>
        <br />
        {docs && docs.length > 0 &&
          <div>
            Найдено документов: {docs.length}<br />
            <br />
            <DocsView
              docs={docs} />
            <br />
            {docs.length === 1 && allow &&
              <button
                  className="mdc-button mdc-button--primary mdc-button--raised"
                  onClick={this.handleRemove}>
                  Прибить
              </button>
            }
            {!allow &&
              <div>
                <b>Нет прав на удаление документа.</b>
              </div>
            }
          </div>
        }
        {docs && docs.length === 0 &&
          <div>
            Ничего не найдено!
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

export default withCouchDB(CatClrs);