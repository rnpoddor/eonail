import React from 'react';

function Input({ id, type, placeholder, value }) {
    return (
        <div className="mdc-textfield">
            <input
                id={id}
                className="mdc-textfield__input"
                autoComplete="false"
                required
                type={type}
                placeholder={placeholder}
                defaultValue={value}
            />
        </div>
    );
}

export default Input;