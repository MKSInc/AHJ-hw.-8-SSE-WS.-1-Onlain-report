import OnlineReport from './OnlineReport';

const container = document.querySelector('[data-id="container"]');
// const rootURL = 'http://localhost:3000';
const rootURL = 'https://ahj-8-1-online-report.herokuapp.com';

const onlineReport = new OnlineReport(rootURL);
onlineReport.init(container)
  .then((r) => console.log(r))
  // eslint-disable-next-line no-console
  .catch((e) => console.error('⛔', e));
