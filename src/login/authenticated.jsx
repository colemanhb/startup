import React from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

export function Authenticated(props) {
  const navigate = useNavigate();

  function logout() {
    fetch(`/api/auth/logout`, {
      method: 'delete',
    })
      .catch(() => {
        // Logout failed. Assuming offline
      })
      .finally(() => {
        props.onLogout();
      });
  }

  return (
    <div>
        <form>
            <h2 className="playerName">{props.username}</h2>
            <Button variant="light" onClick={() => logout()}>
            Log Out
            </Button>
        </form>

    </div>
  );
}