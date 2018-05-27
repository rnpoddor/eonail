import React, { Component } from 'react';

function Row({ name, value, bgcolor }) {
    const val = typeof(value) === "object" ?
      <DocView
        doc={value} /> :
      value;

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
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
      );
  }
}

class DocsView extends Component {
  render() {
      const { docs } = this.props;

      let num = 1;
      return (
        <div>
        {
          docs.map(function (doc) {
            return <div key={doc._id}>
              <b>#{num++}</b>
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
export default DocsView;