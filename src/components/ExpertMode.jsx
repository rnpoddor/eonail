import React, { Component } from 'react';

import Input from './Input';
import withCouchDB from '../hoc/withCouchDB';
import { DocsView, DocView } from './DocsView';

class ExpertMode extends Component {
  componentDidMount = () => {
    const { apiUrl, dbName, couchDB: { address, db, area, postfix } } = this.props;

    // задаем URI с нужной базой
    apiUrl(address);
    dbName(db + area + '_doc' + '_' + postfix);
  }

  handleSubmit = event => {
    // предотвращаем передачу данных формой на сервер
    event.preventDefault();

    const { clr_name } = event.target;
    
    // задаем критерии поиска
    /*const data = {
      "selector": {
        "class_name": "cat.clrs",
        "name": {
          "$eq": clr_name.value
        }
      }
    };*/

    // задаем критерии поиска
    const data = {
      "selector": {
        "class_name": {
          "$eq": "doc.calc_order"
        },
        "partner": {
          "$eq": "00000000-0000-0000-0000-000000000000"
        },
        "number_doc": {
          "$regex": "^[\\d]{4}[\\S]{1,2}[\\d]{5,}$"
        }
      },
      "fields": ["_id", "number_doc", "partner", "timestamp"]
    };
    this.props.post('_find', data,
      response => {
        //if (response.status === 200) {
          const { data } = response;
          this.props.setState({
            clr_name: clr_name.value,
            data
          });
        //}
      },
      error => {
        this.props.setState({
          clr_name: clr_name.value,
          data: error
        });
      });
  }

  handleRemove = () => {
    const { data: { docs } } = this.props.state;

    let deleted = 0;
    for (let i = 0; i < docs.length; i++) {
      if (docs[i]._id && docs[i]._rev) {
        this.props.delete(`${docs[i]._id}?rev=${docs[i]._rev}`,
          response => {
            //if (response.status === 200) {
              const { data } = response;
              if (data.ok) {
                deleted++;
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
        deleted: docs.length //deleted
      }
    });
  }

  render() {
    const { couchDB: { roles } } = this.props;
    const { clr_name, data, data: { docs, deleted }} = this.props.state;

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
        {docs && docs.length > 0 && deleted === undefined &&
          <div>
            Найдено документов: {docs.length}<br />
            <br />
            <DocsView
              docs={docs} />
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
                <b>Нет прав на удаление документа.</b>
              </div>
            }
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