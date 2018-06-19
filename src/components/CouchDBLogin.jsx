import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: theme.mixins.gutters({
        paddingTop: 5,
        paddingBottom: 5,
        marginTop: theme.spacing.unit * 3,
    }),
    title: {
        padding: theme.spacing.unit
    },
    form: {
        margin: theme.spacing.unit,
        padding: theme.spacing.unit,
        width: 600,
        display: 'flex',
        flexDirection: 'column'
    },
    button: {
        //position: 'relative',
        float: 'right',
        width: 100,
        margin: theme.spacing.unit
    }
});

class CouchDBLogin extends Component {
    constructor(props) {
        super(props);

        const { couchDB } = props;
        const { login, address, db, area, prefix } = couchDB;

        this.state = {
            login,
            address: address + '/' + db,
            area,
            prefix
        };
    }

    componentWillUnmount() {
        const { onUnmount } = this.props;

        onUnmount();
    }

    handleChange = name => event => {
        let { value } = event.target;

        this.setState({
            [name]: value,
        });
    }
    
    render() {
        const { classes, onLogin } = this.props;
        const { login, address, area, prefix } = this.state;

        return (
            <div className={classes.root}>
                <Paper className={classes.paper} elevation={4}>
                    <div className={classes.title}>
                        ВХОД
                    </div>
                    <form
                        className={classes.form}
                        onSubmit={onLogin}>
                        <TextField
                            id="login"
                            label="Логин"
                            value={login}
                            onChange={this.handleChange('login')}
                            margin="normal"
                            required
                        />
                        <TextField
                            id="password"
                            type="password"
                            label="Пароль"
                            margin="normal"
                            required
                        />
                        <TextField
                            id="address"
                            label="Адрес CouchDB"
                            value={address}
                            onChange={this.handleChange('address')}
                            margin="normal"
                            required
                        />
                        <TextField
                            id="area"
                            label="Область данных"
                            value={area}
                            onChange={this.handleChange('area')}
                            margin="normal"
                            required
                        />
                        <TextField
                            id="prefix"
                            label="Префикс"
                            value={prefix}
                            onChange={this.handleChange('prefix')}
                            margin="normal"
                        />
                        <div>
                            <Button variant="raised" type="submit" className={classes.button}>
                                Войти
                            </Button>
                        </div>
                    </form>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(CouchDBLogin);