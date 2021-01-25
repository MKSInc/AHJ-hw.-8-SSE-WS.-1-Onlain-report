import onlineReportHTML from '../html/online-report.html';
import HiddenTempEl from './utility';

export default class OnlineReport {
  constructor(rootURL) {
    this.els = {
      onlineReport: null,
      eventList: null,
    };

    this.selectors = {
      onlineReport: '[data-widget="online-report"]',
      eventList: '[data-id="events-list"]',
    };

    this.URL = {
      root: rootURL,
      events: `${rootURL}/events`,
      streamSSE: `${rootURL}/sse`,
    };
  }

  init(parentEl) {
    let htEl = new HiddenTempEl(onlineReportHTML).el;

    this.els.onlineReport = htEl.querySelector(this.selectors.onlineReport);
    this.els.eventList = this.els.onlineReport.querySelector(this.selectors.eventList);

    parentEl.append(this.els.onlineReport);
    htEl.remove();
    htEl = null;

    // this.getEvents();
    this.createStreamSSE();
  }

  /* Получить все события от начала матча на данный момент. */
  async getEvents() {
    try {
      const response = await fetch(this.URL.events);
      if (!response.ok) throw Error(`${response.status} (${response.statusText})`);
      const events = await response.json();
      console.log(events);
    } catch (e) {
      console.error('⛔', e);
    }
  }

  createStreamSSE() {
    const streamSSE = new EventSource(this.URL.streamSSE);
    streamSSE.addEventListener('start', (event) => {
      console.log(event);
    });

    streamSSE.addEventListener('action', (event) => {
      console.log(event);
    });

    streamSSE.addEventListener('freekick', (event) => {
      console.log(event);
    });

    streamSSE.addEventListener('goal', (event) => {
      console.log(event);
    });

    streamSSE.addEventListener('end', (event) => {
      console.log('Stream closed on client');
      console.log(event);
      // Приходится закрывать поток на стороне клиента, так как на сервере закрыть поток
      // без последующих переподключений не удается.
      streamSSE.close();
    });

    streamSSE.addEventListener('error', (event) => {
      if (event.eventPhase === EventSource.CLOSED) {
        // eslint-disable-next-line no-console
        console.log('Connection closed', event);
        // Если прописать закрытие потока сдесь, то браузер перестанет переподключаться
        // при обрыве соединения.
        // streamSSE.close();
        return;
      }
      // eslint-disable-next-line no-console
      console.error('⛔ SSE Error!', event);
    });
  }
}
