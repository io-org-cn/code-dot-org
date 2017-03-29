/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled using query parameters:
 *   enable:  http://foo.com/?enableExperiments=experimentOne,experimentTwo
 *   disable: http://foo.com/?disableExperiments=experimentOne,experimentTwo
 * Experiment state is persisted across page loads using local storage.
 */
import { trySetLocalStorage } from '../utils';

// trackEvent is provided by _analytics.html.haml in most cases. In those where
// it isn't, we still want experiments to work.
const trackEvent = window.trackEvent || (() => {});

const queryString = require('query-string');

const experiments = module.exports;
const STORAGE_KEY = 'experimentsList';
const GA_EVENT = 'experiments';
const EXPERIMENT_LIFESPAN_HOURS = 12;

/**
 * Get our query string. Provided as a method so that tests can mock this.
 */
experiments.getQueryString_ = function () {
  return window.location.search;
};

experiments.getStoredExperiments_ = function () {
  try {
    const jsonList = localStorage.getItem(STORAGE_KEY);
    const storedExperiments = jsonList ? JSON.parse(jsonList) : [];
    const now = Date.now();
    const enabledExperiments = storedExperiments.filter(
        experiment => experiment.expiration > now);
    if (enabledExperiments.length < storedExperiments.length) {
      trySetLocalStorage(STORAGE_KEY, JSON.stringify(enabledExperiments));
    }
    return enabledExperiments;
  } catch (e) {
    return [];
  }
};

experiments.getEnabledExperiments = function () {
  return this.getStoredExperiments_().map(experiment => experiment.key);
};

experiments.setEnabled = function (key, shouldEnable) {
  const allEnabled = this.getStoredExperiments_();
  const experimentIndex =
    allEnabled.findIndex(experiment => experiment.key === key);
  if (shouldEnable) {
    const expirationDate = new Date();
    expirationDate.setHours(
        expirationDate.getHours() + EXPERIMENT_LIFESPAN_HOURS);
    const expiration = expirationDate.getTime();
    if (experimentIndex < 0) {
      allEnabled.push({ key, expiration });
      trackEvent(GA_EVENT, 'enable', key);
    } else {
      allEnabled[experimentIndex].expiration = expiration;
    }
  } else if (experimentIndex >= 0) {
    allEnabled.splice(experimentIndex, 1);
    trackEvent(GA_EVENT, 'disable', key);
  } else {
    return;
  }
  trySetLocalStorage(STORAGE_KEY, JSON.stringify(allEnabled));
};

/**
 * Checks whether provided experiment is enabled or not
 * @param {string} key - Name of experiment in question
 * @returns {bool}
 */
experiments.isEnabled = function (key) {
  let enabled = this.getStoredExperiments_()
    .some(experiment => experiment.key === key);

  const query = queryString.parse(this.getQueryString_());
  const enableQuery = query['enableExperiments'];
  const disableQuery = query['disableExperiments'];

  if (enableQuery) {
    this.experimentsToEnable = enableQuery.split(',');
    if (this.experimentsToEnable.indexOf(key) >= 0) {
      enabled = true;
      this.setEnabled(key, true);
    }
  }

  if (disableQuery) {
    this.experimentsToDisable = disableQuery.split(',');
    if (this.experimentsToDisable.indexOf(key) >= 0) {
      enabled = false;
      this.setEnabled(key, false);
    }
  }

  return enabled;
};

experiments.postExperiment = function (key, url) {
  const req = new XMLHttpRequest();
  req.open('POST', url);
  req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  req.send(`key=${key}`);
};

experiments.loadExperiments = function (serverExperiments) {
  trySetLocalStorage(STORAGE_KEY, JSON.stringify(serverExperiments.enabled));
  if  (this.experimentsToEnable) {
    for (let experiment of this.experimentsToEnable) {
      experiments.postExperiment(experiment, serverExperiments.enableUrl);
    }
  }
  if (this.experimentsToDisable) {
    for (let experiment of this.experimentsToDisable) {
      experiments.postExperiment(experiment, serverExperiments.disableUrl);
    }
  }
};
