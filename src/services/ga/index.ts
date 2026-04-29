import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize(process.env.GOOGLE_ANALYTICS ?? '');
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

export const logEvent = (category = '', action = '') => {
  if (category && action) {
    ReactGA.event({ category, action });
  }
};

export const logException = (description = '', fatal = false) => {
  if (description) {
    ReactGA.event('exception', { description, fatal });
  }
};
