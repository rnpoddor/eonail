import React, { Component } from 'react';

import Input from './Input';

class CouchDBLogin extends Component {
    componentWillUnmount() {
        const { onUnmount } = this.props;

        onUnmount();
    }
    
    render() {
        const { onLogin, couchDB } = this.props;
        const { login, address, db, area, prefix } = couchDB;

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
                        value={login}
                        required={true} />

                    <Input
                        id="password"
                        type="password"
                        placeholder="Пароль"
                        required={true} />

                    <Input
                        id="address"
                        type="text"
                        placeholder="Адрес CouchDB"
                        value={address + '/' + db}
                        required={true} />

                    <Input
                        id="area"
                        type="text"
                        placeholder="Область данных"
                        value={area}
                        required={true} />

                    <Input
                        id="prefix"
                        type="text"
                        placeholder="Префикс"
                        value={prefix}
                        required={false} />

                    <button className="mdc-button mdc-button--primary mdc-button--raised">
                        Войти
                    </button>
                </form>
            </div>
        );
    }
}

export default CouchDBLogin;