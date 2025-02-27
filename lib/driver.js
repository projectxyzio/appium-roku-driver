import {BaseDriver, errors} from 'appium/driver';
import LRU from 'lru-cache';
import {
  activateApp,
  getAttribute,
  getText,
  click,
  executeRoku,
  execute,
  findElOrEls,
  focus,
  focusElement,
  getCurrentContext,
  getPageSource,
  getScreenshot,
  installApp,
  makeNextFocusMove,
  performActions,
  performActionWithKeyboard,
  removeApp,
  rokuEcp,
  roku_activateApp,
  roku_appUI,
  roku_deviceInfo,
  roku_getApps,
  roku_activeApp,
  roku_installApp,
  roku_removeApp,
  roku_pressKey,
  roku_selectElement,
  roku_playerState,
  roku_ecpInput,
  roku_deepLink,
  setValue,
  setValueByEcp,
  setValueByKeyboard,
  _getElementFromNode,
  _getXPathNodes,
  _elementInteractionGuard,
} from './commands';
import log from './logger';

const MAX_ELEMENTS_CACHE = 2048;

/**
 * @implements {ExternalDriver}
 */
export default class RokuDriver extends BaseDriver {
  /**
   * @type {string|undefined}
   */
  _cachedSource;

  /**
   * @type {boolean}
   */
  _cachedSourceDirty = true;

  /** @type {LRU} */
  elCache;

  /**
   * @param {RokuDriverOpts} [opts]
   */
  constructor(opts = /** @type {RokuDriverOpts} */({})) {
    super(opts, false);
    this.elCache = new LRU({max: MAX_ELEMENTS_CACHE});
  }

  proxyActive() {
    return false;
  }

  getProxyAvoidList() {
    return [];
  }

  canProxy() {
    return false;
  }

  /**
   * @param {string} strategy
   * @returns {boolean}
   */
  validateLocatorStrategy(strategy) {
    return strategy === 'xpath';
  }

  /**
   *
   * @param {W3CDriverCaps} w3cCaps
   * @param {W3CDriverCaps} [w3cCaps2]
   * @param {W3CDriverCaps} [w3cCaps3]
   * @param {import('@appium/types').DriverData[]} [driverData]
   * @returns {Promise<[string, DriverCaps]>}
   */
  async createSession(w3cCaps, w3cCaps2, w3cCaps3, driverData) {
    let [sessionId, caps] = /** @type {[string, DriverCaps]} */(await super.createSession(w3cCaps, w3cCaps2, w3cCaps3, driverData));
    if (caps.app) {
      if (caps.app !== 'dev') {
        // if the user specifies 'dev' as the app, just assume it's installed and skip trying to
        // install it here
        try {
          await this.installApp(caps.app);
        } catch (err) {
          throw new errors.SessionNotCreatedError(`Failed to install the app ${caps.app}. Error: ${err}`);
        }
        }
      try {
        await this.roku_activateApp({appId: 'dev'});
      } catch (err) {
        throw new errors.SessionNotCreatedError(`Failed to activate the 'dev' app. Error: ${err}`);
      }
  } else {
      // in the case where we start without an app, just make sure we're at the home screen
      await this.roku_pressKey({key: 'Home'});
    }
    return [sessionId, caps];
  }

  async deleteSession() {
    log.info('Ending Roku session');
    // always press home to end
    await this.roku_pressKey({key: 'Home'});
    await super.deleteSession();
  }

  performActions = performActions;
  getAttribute = getAttribute;
  getText = getText;
  click = click;
  focus = focus;
  focusElement = focusElement;
  makeNextFocusMove = makeNextFocusMove;
  setValue = setValue;
  performActionWithKeyboard = performActionWithKeyboard;
  setValueByEcp = setValueByEcp;
  setValueByKeyboard = setValueByKeyboard;
  removeApp = removeApp.bind(this);
  activateApp = activateApp.bind(this);
  roku_activateApp = roku_activateApp;
  roku_appUI = roku_appUI;
  roku_deviceInfo = roku_deviceInfo;
  roku_getApps = roku_getApps;
  roku_installApp = roku_installApp;
  roku_removeApp = roku_removeApp;
  roku_pressKey = roku_pressKey;
  roku_activeApp = roku_activeApp;
  roku_selectElement = roku_selectElement;
  roku_playerState = roku_playerState;
  roku_ecpInput = roku_ecpInput;
  roku_deepLink = roku_deepLink;
  installApp = installApp.bind(this);
  getPageSource = getPageSource.bind(this);
  getScreenshot = getScreenshot;
  getCurrentContext = getCurrentContext;
  rokuEcp = rokuEcp;
  // @ts-expect-error would need to rewrite findElOrEls in typescript to allow for multiple
  // signatures
  findElOrEls = findElOrEls;
  _getXPathNodes = _getXPathNodes;
  _getElementFromNode = _getElementFromNode;
  execute = execute;
  executeRoku = executeRoku;
  _elementInteractionGuard = _elementInteractionGuard;
}

export {RokuDriver};

/**
 * @typedef {import('@appium/types').BaseDriverCapConstraints} BaseDriverCapConstraints
 * @typedef {import('@appium/types').ExternalDriver} ExternalDriver
 * @typedef {import('@appium/types').DriverCaps<BaseDriverCapConstraints>} DriverCaps
 * @typedef {import('@appium/types').W3CDriverCaps<BaseDriverCapConstraints>} W3CDriverCaps
 * @typedef {import('@appium/types').DriverOpts<BaseDriverCapConstraints>} RokuDriverOpts
 */
