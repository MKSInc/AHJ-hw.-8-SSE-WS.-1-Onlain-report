import OnlineReport from './OnlineReport';

const container = document.querySelector('[data-id="container"]');
const rootURL = 'http://localhost:3000';

const onlineReport = new OnlineReport(rootURL);
onlineReport.init(container);
