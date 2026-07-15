import React from 'react';

import Button from 'react-bootstrap/Button';
import {MessageDialog} from './messageDialog';

export function Unauthenticated(props) {
    const [username, setUsername] = React.useState(props.username);
    const [password, setPassword] = React.useState('');
    const [displayError, setDisplayError] = React.useState(null);

    async function loginUser() {
        localStorage.setItem('username', username);
        props.onLogin(username);
    }

    async function createUser() {
        localStorage.setItem('username', username);
        props.onLogin(username);
    }

    return (
        <>
            <form>
                <div>
                <span>Username</span>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username"/>
                </div>
                <div>
                <span>Password</span>
                <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password" />
                </div>
                <Button variant="light" onClick={() => loginUser()} disabled={!(username && password)}>Log In</Button>
                <Button variant="light" onClick={() => createUser()} disabled={!(username && password)}>Create Account</Button>
            </form>   

            <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
        </>
    )
}

