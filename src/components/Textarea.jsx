import React from 'react';

function Textarea({ id, placeholder, value }) {
    return (
        <div className="mdc-textfield">
            <textarea
                id={id}
                className="mdc-textfield__textarea"
                name={id}
                placeholder={placeholder}
                defaultValue={value}
            />
        </div>
    );
}

export default Textarea;