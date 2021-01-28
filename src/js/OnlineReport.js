import onlineReportHTML from '../html/online-report.html';
import HiddenTempEl from './utility';
import getEventsListItemEl from './getEventsListItemEl';

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

  async init(parentEl) {
    let htEl = new HiddenTempEl(onlineReportHTML).el;

    this.els.onlineReport = htEl.querySelector(this.selectors.onlineReport);
    this.els.eventList = this.els.onlineReport.querySelector(this.selectors.eventList);

    this.els.onlineReport.querySelector('[data-id="restart"]')
      .addEventListener('click', async () => {
        const response = await fetch(`${this.URL.root}/restart`);
        console.log('Restart click:', await response.text());
        this.createStreamSSE();
      });

    parentEl.append(this.els.onlineReport);
    htEl.remove();
    htEl = null;

    const events = await this.getEvents();
    const eventsEls = events.map(getEventsListItemEl);
    this.els.eventList.append(...eventsEls);

    if (events[events.length - 1].event === 'end') return 'Game over';
    this.createStreamSSE();
    return 'Stream started';
  }

  /* Получить все события от начала матча на данный момент.
  *  Так как это async функция, то все ошибки пробросятся на верхний уровень и отловятся
  *  в main.js */
  async getEvents() {
    const response = await fetch(this.URL.events);
    if (!response.ok) throw Error(`${response.status} (${response.statusText})`);
    const eventsText = await response.text();
    return JSON.parse(eventsText, ((key, value) => {
      if (key === 'created') return new Date(value);
      return value;
    }));
  }

  showEvent(eventSSE) {
    const event = {
      data: JSON.parse(eventSSE.data, ((key, value) => {
        if (key === 'created') return new Date(value);
        return value;
      })),
      type: eventSSE.type,
    };

    const eventEl = getEventsListItemEl(event);
    this.els.eventList.append(eventEl);
  }

  createStreamSSE() {
    const streamSSE = new EventSource(this.URL.streamSSE);
    streamSSE.addEventListener('start', (event) => this.showEvent(event));
    streamSSE.addEventListener('action', (event) => this.showEvent(event));
    streamSSE.addEventListener('freekick', (event) => this.showEvent(event));
    streamSSE.addEventListener('goal', (event) => this.showEvent(event));

    streamSSE.addEventListener('message', (event) => this.showEvent(event));

    streamSSE.addEventListener('end', (event) => {
      // eslint-disable-next-line no-console
      console.log('Stream closed on client');
      this.showEvent(event);
      // Приходится закрывать поток на стороне клиента, так как на сервере закрыть поток
      // без последующих переподключений не удается.
      streamSSE.close();
    });

    streamSSE.addEventListener('error', (event) => {
      if (event.eventPhase === EventSource.CLOSED) {
        // eslint-disable-next-line no-console
        console.error('⛔ Error: Connection closed!', event);
        // Если прописать закрытие потока здесь, то браузер перестанет переподключаться
        // при обрыве соединения.
        // streamSSE.close();
        return;
      }
      // eslint-disable-next-line no-console
      console.error('⛔ SSE Error!', event);
    });
  }
}
