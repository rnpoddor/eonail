import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Portal from '@material-ui/core/Portal';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import './Modal.css';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: theme.mixins.gutters({
        margin: theme.spacing.unit,
        padding: theme.spacing.unit * 2,
    }),
    children: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 300,
        height: 200
    },
    buttonYes: {
        width: 100,
        margin: theme.spacing.unit
    },
    buttonNo: {
        width: 100,
        margin: theme.spacing.unit,
        float: 'right'
    }
});

class ModalYesNo extends Component {
    componentWillMount() {
        this.root = document.createElement('div');
        document.body.appendChild(this.root);
    }

    componentWillUnmount() {
        document.body.removeChild(this.root);
    }

    getHeight() {
        return "innerHeight" in window ?
            window.innerHeight :
            document.documentElement.offsetHeight;
    }

    render() {
        const { classes, onYes, onNo } = this.props;

        // задаем размер и расположение
        let modal = { height : document.body.clientHeight };
        let paper = { marginTop: this.getHeight() / 3 };
        if (document.body.clientHeight < this.getHeight()) {
            modal = { height : this.getHeight(), alignItems: 'center' };
            paper = {};
        }

        return (<Portal container={this.root}>
            <div className="modal" style={modal}>
                <div>
                    <Paper className={classes.paper} style={paper} elevation={4}>
                        <div className={classes.children}>
                            {this.props.children}
                        </div>
                        <div>
                            <Button variant="raised" className={classes.buttonYes} onClick={onYes}>
                                Да
                            </Button>
                            <Button variant="raised" className={classes.buttonNo} onClick={onNo}>
                                Нет
                            </Button>
                        </div>
                    </Paper>
                </div>
            </div>
        </Portal>);
    }
}

export default withStyles(styles)(ModalYesNo);