import browser from 'webextension-polyfill';
import { API_VERSION, CLIENT_ID, QUERY_PACKAGE2_VERSIONS } from './constants';
import { AuthInfo, MessageAction, NULL, Package2Version, QueryResults, UserIdentity } from './types';
import { isString } from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const doNothing = NULL;

let loginInfo: AuthInfo | null = null;
let userInfo: UserIdentity | null = null;

browser.storage.local.get(['loginInfo', 'userInfo']).then((storage) => {
  console.log('[BG]', '[STORAGE] existing storage', storage);
  loginInfo = storage?.loginInfo || null;
  userInfo = storage?.userInfo || null;
});

function setLoginInfo(_loginInfo: AuthInfo | null) {
  loginInfo = _loginInfo;
  browser.storage.local.set({ loginInfo });
  console.log('[BG]', '[STORAGE][SET] loginInfo', loginInfo);
}

function setUserInfo(_userInfo: UserIdentity | null) {
  userInfo = _userInfo;
  browser.storage.local.set({ userInfo });
  console.log('[BG]', '[STORAGE][SET] userInfo', userInfo);
}

browser.runtime.onInstalled.addListener(() => {
  console.log('[BG]', 'Extension installed');
});

browser.runtime.onSuspend.addListener(() => {
  console.log('[BG]', 'Extension suspended');
});

// Listen for messages sent from other parts of the extension
browser.runtime.onMessage.addListener(async (request: MessageAction) => {
  try {
    // Log statement if request.popupMounted is true
    // NOTE: this request is sent in `popup/component.tsx`
    console.log('[BG]', 'MESSAGE', request);
    switch (request.type) {
      case 'LOGOUT': {
        setLoginInfo(null);
        setUserInfo(null);
        sendMessage({ type: 'LOGIN_STATE_CHANGE', payload: { loggedIn: false } });
        break;
      }
      case 'GET_LOGIN_STATE': {
        if (loginInfo && userInfo) {
          sendMessage({ type: 'LOGIN_STATE_CHANGE', payload: { loggedIn: true, loginInfo, userInfo } });
        } else {
          sendMessage({ type: 'LOGIN_STATE_CHANGE', payload: { loggedIn: false } });
        }
        break;
      }
      case 'LOGIN_TO_SALESFORCE': {
        if (!loginInfo) {
          return;
        }
        browser.tabs.create({
          url: `${loginInfo.instance_url}/secur/frontdoor.jsp?${new URLSearchParams({
            sid: loginInfo.access_token,
            retUrl: '/lightning/o/sfLma__Package_Version__c/list',
          }).toString()}`,
          active: true,
        });
        break;
      }
      case 'API_LIST_PACKAGES': {
        if (!loginInfo) {
          sendMessage({ type: 'API_ERROR_RESPONSE', payload: { error: 'Unauthorized' } });
          return;
        }
        try {
          const records = await salesforceQuery<Package2Version>(loginInfo, QUERY_PACKAGE2_VERSIONS, true);
          sendMessage({ type: 'API_LIST_PACKAGES_RESPONSE', payload: { records } });
        } catch (ex: any) {
          sendMessage({ type: 'API_ERROR_RESPONSE', payload: { error: ex.message } });
        }
        break;
      }
      default:
        console.log('[BG]', 'MESSAGE IGNORED');
        break;
    }
  } catch (ex) {
    console.error('[BG] onMessage', ex);
  }
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    if (changeInfo.url && changeInfo.url.startsWith('http://localhost:1234/oauth/callback')) {
      console.log('changeInfo.url', changeInfo.url);
      const url = new URL(changeInfo.url);
      const params: Partial<AuthInfo> = {};
      // TODO: detect error state
      new URLSearchParams(url.hash.replace('#', '')).forEach((value, key) => {
        params[key as keyof AuthInfo] = value as string;
      });
      console.log('LOGGED IN!', params);
      browser.tabs.remove(tabId);
      loginInfo = params as AuthInfo;
      setLoginInfo(params as AuthInfo);
      try {
        userInfo = await fetchJson<UserIdentity>(loginInfo.id, loginInfo);
        setUserInfo(userInfo);
        console.log('Identity', userInfo);
        sendMessage({ type: 'LOGIN_STATE_CHANGE', payload: { loggedIn: true, loginInfo, userInfo } });
      } catch (ex) {
        console.log('ERROR', ex);
        sendMessage({ type: 'LOGIN_STATE_CHANGE', payload: { loggedIn: false } });
      }
    }
  } catch (ex) {
    console.error('[BG] tabs.onUpdated.addListener', ex);
  }
});

function sendMessage(request: MessageAction) {
  console.log('[BG] sending message', request);
  browser.runtime.sendMessage(request);
}

async function fetchJson<T = any>(url: string, loginInfo: AuthInfo, skipRefreshAttempt?: boolean): Promise<T> {
  const fetchResult = await fetch(url, {
    headers: new Headers({
      Authorization: `Bearer ${loginInfo.access_token}`,
    }),
  });

  // Handle errors and auto-refresh once if needed
  if (!fetchResult.ok && fetchResult.status === 401 && !skipRefreshAttempt) {
    // attempt to refresh token
    // TODO: add in PKCE
    console.log('[BG]', '[AUTH]', 'Token expired, attempting to refresh');
    const refreshResult = await fetch(`${loginInfo.instance_url}/services/oauth2/token`, {
      method: 'POST',
      body: JSON.stringify({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: loginInfo.refresh_token,
      }),
    });
    if (refreshResult.ok) {
      console.log('[BG]', '[AUTH]', 'Refresh successful');
      const refreshResponse = await refreshResult.json();
      setLoginInfo({ ...loginInfo, ...refreshResponse });
      return fetchJson(url, loginInfo, true);
    } else {
      console.log('[BG]', '[AUTH]', 'Refresh failed');
      // setLoginInfo(null);
      // setUserInfo(null);
      throw new Error('Unauthorized');
    }
  } else if (!fetchResult.ok) {
    // throw error
    let error = `An unknown error has occurred: ${fetchResult.status}`;
    try {
      error = await fetchResult.json();
    } catch (ex) {
      // could not parse error
    }
    let message = error;
    if (Array.isArray(error)) {
      message = error
        .map((err) => {
          if (isString(err)) {
            return err;
          } else if (err.message) {
            return err.message;
          }
          return JSON.stringify(err);
        })
        .join(', ');
    }
    throw new Error(message);
  } else {
    return fetchResult.json();
  }
}

async function salesforceQuery<T = any>(loginInfo: AuthInfo, query: string, tooling?: boolean) {
  let done = false;
  let output: T[] = [];
  let queryUrl = `${loginInfo.instance_url}/services/data/v${API_VERSION}/${
    tooling ? 'tooling/' : ''
  }query?q=${encodeURIComponent(query.replace('\n', ' '))}`;
  while (!done) {
    const results = await fetchJson<QueryResults<T>>(queryUrl, loginInfo);
    output = output.concat(results.records);
    done = results.done;
    if (!done) {
      queryUrl = `${loginInfo.instance_url}/services/data/v${API_VERSION}/query/${results.queryLocator}`;
    }
  }
  return output;
}
