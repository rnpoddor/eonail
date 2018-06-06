import React, { Component } from 'react';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';

import Input from './Input';
import withCouchDB from '../hoc/withCouchDB';
import { DocsView, DocView } from './DocsView';

class DocCalcOrder extends Component {
  state = {
    searching: false,
    nailing: false
  }

  componentDidMount = () => {
    const { apiUrl, dbName, couchDB, couchDB: { address }, getDBName } = this.props;

    // задаем URI с нужной базой
    apiUrl(address);
    dbName(getDBName(couchDB, 'doc'));
  }

  handleSubmit = event => {
    // предотвращаем передачу данных формой на сервер
    event.preventDefault();

    const { number_doc } = event.target;

    // показываем процесс поиска
    this.setState({ searching: true });
    
    // задаем критерии поиска
    const data = {
      "selector": {
        "class_name": "doc.calc_order",
        "number_doc": {
          "$eq": number_doc.value
        }
      },
      "fields": ["_id", "_rev", "number_doc", "partner", "timestamp"]
    };
    this.props.post('_find', data)
      .then(response => {
        //if (response.status === 200) {
          const { data } = response;
          this.props.setState({
            number_doc: number_doc.value,
            data
          });
          // скрываем процесс поиска
          this.setState({ searching: false });
        //}
      })
      .catch(error => {
        this.props.setState({
          number_doc: number_doc.value,
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

  render() {
    const { couchDB: { roles } } = this.props;
    const { number_doc, data, data: { docs, deleted }} = this.props.state;
    const { searching, nailing } = this.state;

    // проверяем права на редактирование
    const allow =
      roles.indexOf("_admin") !== -1 ||
      roles.indexOf("doc_editor") !== -1;

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
            id="number_doc"
            type="text"
            placeholder="Номер заказа"
            value={number_doc}
            required={true} />
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
        {docs && docs.length > 0 && deleted === undefined &&
          <div>
            Найдено документов: {docs.length}<br />
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
            <b>Заказ "{docs[0].name}" успешно удален!</b>
          </div>
        }
        {deleted === 0 &&
          <div>
            <b>Не удалось удалить заказ "{docs[0].name}".</b>
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

export default withCouchDB(DocCalcOrder);