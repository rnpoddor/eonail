import React, { Component } from 'react';
import Select from 'react-select';

import Input from './Input';

class CouchDBLogin extends Component {
    /*handleChange = (selectedOption) => {
        this.setState({ selectedOption });
    };

    const { selectedOption } = this.state;
    const value = selectedOption && selectedOption.value;*/

    componentWillUnmount() {
        const { onUnmount } = this.props;

        onUnmount();
    }
    
    render() {
        const { onLogin, couchDB } = this.props;
        const { login, address, db, area } = couchDB;

        return (
            <div>
                <div className="couLogin-title">
                    ВХОД
                </div>
                <form
                    className="couLogin-form mdc-theme--light"
                    onSubmit={onLogin}>
                    <Input
                        id="login"
                        type="text"
                        placeholder="Логин"
                        value={login} />

                    <Input
                        id="password"
                        type="password"
                        placeholder="Пароль" />

                    <Input
                        id="address"
                        type="text"
                        placeholder="Адрес CouchDB"
                        value={address + '/' + db} />

                    <Input
                        id="area"
                        type="text"
                        placeholder="Область данных"
                        value={area} />

                    {/*<Select
                        name="server"
                        value={value}
                        onChange={this.handleChange}
                        options={[
                        { value: 'develop', label: 'develop' },
                        { value: 'zakaz', label: 'zakaz' },
                        ]}
                    />*/}

                    <button className="mdc-button mdc-button--primary mdc-button--raised">
                        Войти
                    </button>
                </form>
            </div>
        );
    }
}

export default CouchDBLogin;