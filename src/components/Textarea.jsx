import React from 'react';

function Textarea({ id, placeholder, value }) {
    return (
        <div className="mdc-textfield">
            <textarea
                id={id}
                className="mdc-textfield__textarea"
                name="textarea"
                placeholder={placeholder}
                value={value}>
            </textarea>
        </div>
    );
}

export default Textarea;