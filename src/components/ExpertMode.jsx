import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Fade from '@material-ui/core/Fade';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import MomentLocaleUtils from 'react-day-picker/moment';
import moment from 'moment';
import 'moment/locale/ru';

import withCouchDB from '../hoc/withCouchDB';
import { DocsView, DocView } from './DocsView';
import ModalYesNo from './ModalYesNo';

const styles = theme => ({
  formSearch: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: 0,
    width: 400,
    flexDirection: 'column'
  },
  formControl: {
    margin: 0,
    //minWidth: 120,
  },
  textField: {
    width: 300
  },
  textArea: {
    width: 750
  },
  error: {
    color: theme.palette.primary.red
  }
});

class ExpertMode extends Component {
  state = {
    searching: false,
    nailing: false,
    from: undefined,
    to: undefined
  }

  componentWillMount = () => {
    const { apiUrl, dbName, couchDB, couchDB: { address }, getDBName, state: { selectedSet, db_type, data } } = this.props;
    const set = this.getSets(selectedSet);

    // задаем URI с нужной базой
    apiUrl(address);
    dbName(getDBName(couchDB, db_type));

    this.props.setState({
      selectedSet: selectedSet,
      db_type: set.type,
      selector: JSON.stringify(set.selector, 0, 2),
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
        selector: {
          "selector": {
            "class_name": {
              "$eq": "doc.calc_order"
            },
            "number_doc": {
              "$regex": ""
            }
          },
          "fields": ["_id", "_rev", "number_doc", "partner", "date", "timestamp"],
          "limit": 100
        }
      },
      ram: {
        type: 'ram',
        selector: {
          "selector": {
            "name": {
              "$regex": ""
            }
          },
          "fields": ["_id", "_rev", "name", "date", "timestamp"],
          "limit": 100
        }
      },
      color: {
        type: 'ram',
        selector: {
          "selector": {
            "class_name": "cat.clrs",
            "name": {
              "$regex": ""
            }
          }
        }
      },
      order: {
        type: 'doc',
        selector: {
          "selector": {
            "class_name": "doc.calc_order",
            "number_doc": {
              "$regex": ""
            }
          },
          "fields": ["_id", "_rev", "number_doc", "partner", "date", "timestamp"]
        }
      },
      null_partner: {
        type: 'doc',
        selector: {
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
              "$regex": "^[\\d]{4}[\\S]{1,2}[\\d]{5,}$"
            }
          },
          "fields": ["_id", "_rev", "number_doc", "partner", "date", "timestamp"],
          "limit": 100
        }
      }
    };

    return sets[set];
  }

  handleChangeSet = event => {
    const { value } = event.target;
    const { type, selector } = this.getSets(value);
    const { dbName, couchDB, getDBName } = this.props;

    dbName(getDBName(couchDB, type));

    this.props.setState({
      selectedSet: value,
      db_type: type,
      selector: JSON.stringify(selector, 0, 2),
      data: {}
    });

    this.setState({
      [event.target.name]: value
    });
  };

  handleSubmit = event => {
    // предотвращаем передачу данных формой на сервер
    event.preventDefault();

    //const selector = event.target.selector.value;
    const { selector } = this.props.state;
    const { applyDate, from, to } = this.state;

    // проверка правильности ввода селектора
    try {
      var json = JSON.parse(selector);
    } catch (e) {
      this.setState({ badSelector: true });
      return;
    }

    // применяем временной интервал
    if (applyDate && from && to && !json.selector.date) {
      json.selector.date = {
        "$gte": moment(from).format('YYYY-MM-DD'),
        "$lt": moment(to).add(1, 'days').format('YYYY-MM-DD')
      };
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
            selector: selector,
            data
          });
          // скрываем процесс поиска
          this.setState({ searching: false });
        //}
      })
      .catch(error => {
        this.props.setState({
          selector: selector,
          data: error
        });
        // скрываем процесс поиска
        this.setState({ searching: false });
      });
  }

  /*handleRemove = () => {
    //this.asyncRemove();
    this.syncRemove();
  }*/

  handleRemove = event => {
    // предотвращаем передачу данных формой на сервер
    event.preventDefault();

    const { delay } = event.target;
    this.setState({
      delay: delay.value,
      wantNail: true
    });
  }

  stopRemove = () => {
    // скрываем процесс прибития
    this.setState({ nailing: false });
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
      if (docs[i]._id && docs[i]._rev) {
        promises.push(this.props.delete(`${docs[i]._id}?rev=${docs[i]._rev}`)
          .then(funcThen)
          .catch(error => {})
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

  tickRemove = async () => {
    const { data: { docs } } = this.props.state;
    const { nailing, delay } = this.state;

    let found = false;
    for (var i = 0; i < docs.length; i++) {
      if (docs[i]._id && docs[i]._rev && !docs[i].deleted) {
        const { data: { ok } } = await this.props.delete(`${docs[i]._id}?rev=${docs[i]._rev}`);
        if (ok) {
          docs[i].deleted = true;
        }
        found = true;
        break;
      }
    }

    if (nailing && found) {
      this.props.setState({
        data: {
          docs
        }
      });

      setTimeout(this.tickRemove, delay);
    }
    else {
      const filtered = docs.filter(value => value.deleted);
      this.props.setState({
        data: {
          docs,
          deleted: filtered.length //docs.length
        }
      });
      // скрываем процесс прибития
      this.setState({ nailing: false });
    }
  }

  syncRemove = () => {
    const { delay } = this.props.state;

    // показываем процесс прибития
    this.setState({ nailing: true });

    setTimeout(this.tickRemove, delay);
  }

  handleChange = name => event => {
    let { value } = event.target;

    this.props.setState({
      [name]: value,
    });
  };

  handleChecked = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  handleDayClick = day => {
    const range = DateUtils.addDayToRange(day, this.state);
    this.setState(range);
  }

  handleResetClick = () => {
    this.setState({
      from: undefined,
      to: undefined,
    });
  }

  handleNailYes = () => {
    this.setState({ wantNail: undefined });
    
    //this.asyncRemove();
    this.syncRemove();
  }

  handleNailNo = () => {
    this.setState({ wantNail: undefined });
  }

  render() {
    const { classes, couchDB: { roles } } = this.props;
    const { selectedSet, db_type, selector, delay, data, data: { docs, deleted }} = this.props.state;
    const { searching, nailing, wantNail, applyDate, from, to, showSelector, badSelector } = this.state;
    const modifiers = { start: from, end: to };

    // проверяем права на редактирование
    const allow =
      roles.indexOf("_admin") !== -1 ||
      roles.indexOf(db_type + "_editor") !== -1;

    return (
      <div>
        {wantNail && (
          <ModalYesNo onYes={this.handleNailYes} onNo={this.handleNailNo}>
            <b>Прибить документы?</b>
          </ModalYesNo>
        )}
        <div className="tabs__content-title">
          Поиск
        </div>
        <br />
        <form
          className={classes.formSearch}
          onSubmit={this.handleSubmit}>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="set">Наборы</InputLabel>
            <Select
              value={selectedSet}
              onChange={this.handleChangeSet}
              inputProps={{
                name: 'set',
                id: 'set',
              }}
            >
              {
                this.getSetOptions().map(function (item) {
                  return <MenuItem key={item.label} value={item.value}>
                    {item.label}
                  </MenuItem>;
                })
              }
            </Select>
          </FormControl>
          <br />
          <div>
            Тип базы данных: <b>{db_type}</b>
          </div>
          <br />
          <FormControlLabel
            control={
              <Checkbox
                checked={applyDate}
                onChange={this.handleChecked('applyDate')}
                value="applyDate"
                color="primary"
              />
            }
            label="Применить временной интервал к дате создания документа"
          />
          {applyDate &&
            <div>
              <p>
                {!from && !to && 'Пожалуйста выберите первый день.'}
                {from && !to && 'Пожалуйста выберите последний день.'}
                {from &&
                  to && (
                    <div>
                      Выбрано с <b>
                        {moment(from).locale('ru').format('DD MMMM YYYY')}
                      </b> по <b>
                        {moment(to).locale('ru').format('DD MMMM YYYY')}
                      </b>
                      <br />
                      <br />
                      <Button variant="raised" onClick={this.handleResetClick}>
                        Сброс
                      </Button>
                    </div>
                )}
              </p>
              <DayPicker
                className="Selectable"
                numberOfMonths={1}
                selectedDays={[from, { from, to }]}
                modifiers={modifiers}
                onDayClick={this.handleDayClick}
                locale={'ru'}
                localeUtils={MomentLocaleUtils}
              />
            </div>
          }
          <FormControlLabel
            control={
              <Checkbox
                checked={showSelector}
                onChange={this.handleChecked('showSelector')}
                value="showSelector"
                color="primary"
              />
            }
            label="Показать параметры отбора"
          />
          {showSelector &&
            <TextField
              id="selector"
              label="Параметры отбора"
              className={classes.textArea}
              value={selector}
              onChange={this.handleChange('selector')}
              margin="normal"
              helperText='Для успешного прибития документов, поля "_id" и "_rev" должны присутствовать в параметрах отбора.'
              multiline
              required
            />
          }
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
        {badSelector &&
          <div className={classes.error}>
            <b>Ошибка в параметрах отбора!</b>
          </div>
        }
        {badSelector && <br />}
        {docs && docs.length > 0 && deleted === undefined &&
          <div>
            Найдено документов: {docs.length} {docs.length > 0 && <b>(могут быть еще, после прибития, повторить операцию поиска)</b>}<br />
            <br />
            {allow ? (
              nailing ? (
                <div>
                  <Fade
                    in={nailing}
                    style={{ transitionDelay: nailing ? '800ms' : '0ms' }}
                    unmountOnExit>
                    <div>
                      <CircularProgress />
                      <br />
                      <Button
                        variant="outlined"
                        className={classes.button}
                        onClick={this.stopRemove}>
                        Остановить
                      </Button>
                    </div>
                  </Fade>
                </div>
              ) : ( docs[0]._id && docs[0]._rev &&
                <form onSubmit={this.handleRemove}>
                  <TextField
                    id="delay"
                    label="Задержка между прибитиями (мс)"
                    className={classes.textField}
                    value={delay}
                    onChange={this.handleChange('delay')}
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    margin="normal"
                    required
                  />
                  <br />
                  <Button variant="raised" type="submit">
                    Прибить
                  </Button>
                </form>
              )
            ) : (
              <b>Нет прав на прибитие документов.</b>
            )}
            <br /><br />
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
            <b>{deleted} документов из {docs.length} успешно прибиты!</b>
          </div>
        }
        {deleted === 0 &&
          <div>
            <b>Не удалось прибить документы.</b>
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

export default withCouchDB(withStyles(styles)(ExpertMode));