import React, { Component } from 'react';
import moment from 'moment';
import 'moment/locale/ru';

function Row({ name, value, bgcolor }) {
    let val = typeof(value) === "object" ?
      <DocView
        doc={value} /> :
      value;

    if (name === 'moment' || name === 'date') {
      var datetime = moment(val.replace(' ', ''));
      val = datetime.locale('ru').format('DD MMMM YYYY, HH:mm:ss');
    }

    return (
        <tr bgcolor={bgcolor} valign="top">
            <td>{name}</td>
            <td>{val}</td>
        </tr>
    );
}

class DocView extends Component {
  render() {
      const { doc } = this.props;
      const deleted = doc && doc.deleted;

      let rows = [];
      for (let key in doc) {
        rows.push(
          <Row
              key={key}
              name={key}
              value={doc[key]}
              bgcolor={(rows.length + 1) % 2 ? "#eeeeee" : "#eeeeaa"}
          />
        );
      }

      return (
        <table style={{backgroundColor: deleted ? "red" : "white"}}>
          <tbody>
            {rows}
          </tbody>
        </table>
      );
  }
}

export default class DocsView extends Component {
  render() {
      const { docs } = this.props;

      let num = 1;
      return (
        <div>
        {
          docs.map(function (doc) {
            return <div key={doc._id}>
              <b>#{num++}</b> {doc.deleted && <b>- ПРИБИТ</b>}
              <DocView
                doc={doc} />
            </div>;
          })
        }
        </div>
      );
  }
}

export { DocsView, DocView };