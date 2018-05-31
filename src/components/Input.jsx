import React from 'react';

function Input({ id, type, placeholder, value, required }) {
    return (
        <div className="mdc-textfield">
            {required ?
                <input
                    id={id}
                    className="mdc-textfield__input"
                    autoComplete="false"
                    required
                    type={type}
                    placeholder={placeholder}
                    defaultValue={value}
                /> :
                <input
                    id={id}
                    className="mdc-textfield__input"
                    autoComplete="false"
                    type={type}
                    placeholder={placeholder}
                    defaultValue={value}
                />
            }
        </div>
    );
}

export default Input;