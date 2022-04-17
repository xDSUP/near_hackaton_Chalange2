import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Big from "big.js";
import Form from "./components/Form";

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();

const App = ({ contract, currentUser, nearConfig, wallet }) => {
  const [status, setStatus] = useState(null);
  const [name, setName] = useState(null);

  useEffect(async () => {
    if (currentUser) {
      const info = await contract.get_info({
        account_id: currentUser.accountId
      });

      setStatus(info.status);
      setName(info.name);
    }
  });

  const onSubmitStatus = async event => {
    event.preventDefault();

    const { fieldset, message } = event.target.elements;
    fieldset.disabled = true;

    await contract.set_status(
      {
        message: message.value,
        account_id: currentUser.accountId
      },
      BOATLOAD_OF_GAS
    );

    const status = await contract.get_status({
      account_id: currentUser.accountId
    });

    setStatus(status);

    message.value = "";
    fieldset.disabled = false;
    message.focus();
  };

  const onSubmitName = async event => {
    event.preventDefault();

    const { fieldset, name } = event.target.elements;
    fieldset.disabled = true;

    await contract.set_name(
        {
          name: name.value,
          account_id: currentUser.accountId
        },
        BOATLOAD_OF_GAS
    );

    const newName = await contract.get_name({
      account_id: currentUser.accountId
    });

    setName(newName);

    name.value = "";
    fieldset.disabled = false;
    name.focus();
  };

  const signIn = () => {
    wallet.requestSignIn(
      {contractId: nearConfig.contractName, methodNames: ['set_status', "set_name"]},
      "NEAR Status Message"
    );
  };

  const signOut = () => {
    wallet.signOut();
    window.location.replace(window.location.origin + window.location.pathname);
  };

  return (
    <main>
      <header>
        <h1>NEAR Status Message</h1>

        {currentUser ?
          <p>Currently signed in as: <code>{currentUser.accountId}</code></p>
        :
          <p>Update or add a status message! Please login to continue.</p>
        }

        { currentUser
          ? <button onClick={signOut}>Log out</button>
          : <button onClick={signIn}>Log in</button>
        }
      </header>

      {currentUser &&
          <div>
            <form onSubmit={onSubmitStatus}>
              <fieldset id="fieldset">
                <p>Add or update your status message!</p>
                <p className="highlight">
                  <label htmlFor="message">Message:</label>
                  <input
                      autoComplete="off"
                      autoFocus
                      id="message"
                      required
                  />
                </p>
                <button type="submit">
                  Update
                </button>
              </fieldset>
            </form>
            <form onSubmit={onSubmitName}>
              <fieldset id="fieldset">
                <p>Add or update your name!</p>
                <p className="highlight">
                  <label htmlFor="message">Name:</label>
                  <input
                      autoComplete="off"
                      autoFocus
                      id="name"
                      required
                  />
                </p>
                <button type="submit">
                  Update
                </button>
              </fieldset>
            </form>
          </div>
      }

      {status ?
        <>
          <p>Your current status:</p>
          <p>
            <code>
              {status}
            </code>
          </p>
        </>
      :
        <p>No status message yet!</p>
      }

      {name &&
          <>
            <p>Hello <code>{name}</code>!</p>
          </>
      }
    </main>
  );
};

App.propTypes = {
  contract: PropTypes.shape({
    set_status: PropTypes.func.isRequired,
    set_name: PropTypes.func.isRequired,
    get_status: PropTypes.func.isRequired,
    get_name: PropTypes.func.isRequired,
    get_info: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    accountId: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired
  }),
  nearConfig: PropTypes.shape({
    contractName: PropTypes.string.isRequired
  }).isRequired,
  wallet: PropTypes.shape({
    requestSignIn: PropTypes.func.isRequired,
    signOut: PropTypes.func.isRequired
  }).isRequired
};

export default App;
