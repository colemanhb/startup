import React from 'react';

export function Login() {
  return (
    <main>
      <h1>Welcome to LibreBoox</h1>
      <form method="get" action="page.html">
        <div>
          <span>Username</span>
          <input type="text" placeholder="username" />
        </div>
        <div>
          <span>Password</span>
          <input type="password" placeholder="password" />
        </div>
        <button type="submit" className="btn btn-light">Log In</button>
        <button type="submit" className="btn btn-light">Create Account</button>
      </form>
    </main>
  );
}