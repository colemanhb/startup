import React from 'react';

import Button from 'react-bootstrap/Button';
import {MessageDialog} from './messageDialog';

export function Unauthenticated(props) {
    const [username, setUsername] = React.useState(props.username);
    const [password, setPassword] = React.useState('');
    const [displayError, setDisplayError] = React.useState(null);

    async function loginUser() {
        loginOrCreate(`/api/auth/login`);
    }

    async function createUser() {
        loginOrCreate(`/api/auth/create`);
    }

    async function loginOrCreate(endpoint) {
        const response = await fetch(endpoint, {
        method: 'post',
        body: JSON.stringify({ username: username, password: password }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        });
        if (response?.status === 200) {
        localStorage.setItem('username', username);
        props.onLogin(username);
        } else {
        const body = await response.json();
        setDisplayError(`⚠ Error: ${body.msg}`);
        }
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
                <Button type="button" variant="light" onClick={() => loginUser()} disabled={!(username && password)}>Log In</Button>
                <Button type="button" variant="light" onClick={() => createUser()} disabled={!(username && password)}>Create Account</Button>
            </form>   

            <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
        </>
    )
}

