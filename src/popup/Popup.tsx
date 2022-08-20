import { ErrorMessage } from '@src/components/errorMessage';
import { PackageList } from '@src/components/packageList/component';
import { Spinner } from '@src/components/spinner';
import { CLIENT_ID } from '@src/constants';
import { MessageAction, Package2Version, UserIdentity } from '@src/types';
import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import css from './styles.module.css';
import { ExternalLinkIcon, RefreshIcon } from '@heroicons/react/solid';
import { UserAvatar } from '@src/components/userAvatar';
import { EmptyState } from '@src/components/emptyState';

function initiateLogin() {
  browser.tabs.create({
    url: `https://login.salesforce.com/services/oauth2/authorize?${new URLSearchParams({
      response_type: 'token',
      client_id: CLIENT_ID,
      redirect_uri: 'http://localhost:1234/oauth/callback',
      prompt: 'select_account',
    }).toString()}`,
    active: true,
  });
}

function sendMessage(request: MessageAction) {
  browser.runtime.sendMessage(request);
}

export function Popup() {
  // Sends the `popupMounted` event

  const [userInfo, setUserInfo] = useState<UserIdentity | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [packages, setPackages] = useState<Package2Version[]>([]);

  useEffect(() => {
    sendMessage({ type: 'GET_LOGIN_STATE' });
    browser.runtime.onMessage.addListener(async (request: MessageAction) => {
      console.log('[POPUP]', 'MESSAGE', request);
      switch (request.type) {
        case 'API_ERROR_RESPONSE': {
          setLoading(false);
          setErrorMessage(request.payload.error);
          break;
        }
        case 'LOGIN_STATE_CHANGE': {
          if (request.payload.loggedIn) {
            setUserInfo(request.payload.userInfo);
            if (!packages?.length) {
              handleListPackages();
            }
          } else {
            setUserInfo(null);
            setLoading(false);
            setPackages([]);

            if (request.payload.error) {
              setErrorMessage(request.payload.error);
            }
          }
          break;
        }
        case 'API_LIST_PACKAGES_RESPONSE': {
          setLoading(false);
          setErrorMessage(undefined);
          setPackages(request.payload.records);
          break;
        }
        default:
          break;
      }
    });
  }, []);

  function handleListPackages() {
    setLoading(true);
    sendMessage({ type: 'API_LIST_PACKAGES' });
  }

  function handleLoginToSalesforce() {
    sendMessage({ type: 'LOGIN_TO_SALESFORCE' });
  }

  function handleLogout() {
    sendMessage({ type: 'LOGOUT' });
  }

  // Renders the component tree
  return (
    <div className={css.popupContainer}>
      <div className="px-4 py-4">
        {!userInfo && <EmptyState onClick={initiateLogin} />}
        {errorMessage && <ErrorMessage className="my-2" errorMessage={errorMessage} />}
        {userInfo && (
          <>
            <div className="flex justify-between">
              <UserAvatar user={userInfo} />
              <div className="flex flex-col">
                <div className="flex flex space-x-3">
                  <div className="">
                    {userInfo && (
                      <button
                        onClick={handleLoginToSalesforce}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Open Salesforce
                        <ExternalLinkIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div>
                    {userInfo && (
                      <button
                        onClick={handleLogout}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                </div>
                <div className="self-end mt-2">
                  {userInfo && (
                    <button
                      onClick={handleListPackages}
                      className="inline-flex items-center px-1 py-1 border border-transparent text-sm font-small rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <RefreshIcon className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Reload
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <PackageList packages={packages} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
